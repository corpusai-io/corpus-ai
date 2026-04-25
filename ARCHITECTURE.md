# Corpus AI — Architecture & Infrastructure Reference

> Complete technical story of the project: what it is, how it works, where it runs, and how all the pieces connect.

---

## What Is Corpus AI

A SaaS platform that lets users build custom AI chatbots trained on their own content (documents, websites, databases). Users manage bots via a dashboard, embed them on any website as a widget, and connect them to Slack, WhatsApp, or Telegram. Monetised via Stripe subscriptions across four tiers (Free → Starter → Standard → Business).

---

## Repository Layout

```
corpus-ai/                        ← pnpm monorepo root (Turborepo)
├── apps/
│   ├── backend/                  Express REST API         (port 8001)
│   ├── dashboard/                Next.js admin UI         (port 8080)
│   ├── website/                  Next.js marketing site   (port 3002)
│   ├── docs/                     Next.js documentation    (port 3001)
│   ├── lambdaBuild/              AWS Lambda — chatbot indexing pipeline
│   └── lambdaChat/               AWS Lambda — chat query handler
├── packages/
│   ├── aws-common/               Shared DB models, RAG pipeline, AWS utils
│   └── ui/                       Shared component library (Radix + Tailwind v4)
├── infra/terraform/              AWS infrastructure as code
├── docker/                       Dockerfiles + Nginx config template
├── scripts/                      push-secrets.js, etc.
├── proxy-server.js               Dev routing proxy (port 3000)
├── docker-compose.yaml           Base compose (all services)
├── docker-compose.staging.yml    Staging env overrides
└── docker-compose.production.yml Production env overrides
```

**Toolchain**: pnpm >=9, Node >=18, Turborepo 2.x, TypeScript 5.x

---

## Apps in Detail

### `apps/backend` — Express API

The central REST API. All browser clients and widgets talk only to this service (or directly to Lambda in production chat).

**Entry point**: `src/index.ts` (port `$PORT`, default 8001)

**Controllers / Routes** (15 pairs):

| Controller | Responsibility |
|---|---|
| `auth` | Register, login, logout, token refresh via Cognito SDK |
| `chatbots` | CRUD, file upload to S3, trigger SQS build job |
| `chat` | Local-dev chat proxy (replaces Lambda in dev) |
| `customize` | Bot UI branding settings |
| `datastore` | Vector data source management |
| `leads` | Lead capture, intent classification (hot/warm/cold) |
| `querylog` | Analytics for chat queries |
| `access` | Whitelist / API key management |
| `user` | User profile management |
| `quota` | Tier-based usage enforcement |
| `payment` | Stripe checkout, portal, subscription, webhook |
| `integrations` | Slack OAuth, Google Drive, Telegram, WhatsApp |
| `ai-actions` | Custom AI tool/button definitions |
| `builtin-integrations` | Pre-built integration config |
| `database` | Multi-DB connections, NL-to-SQL queries |

**Middleware**:
- `auth.middleware.ts` — JWT validation against Cognito, API key auth
- `rateLimit.middleware.ts` — custom in-memory limiter (no Redis dep):
  - auth: 5 req / 15 min
  - api: 100 req / 15 min
  - chat: 20 msg / min
  - passwordReset: 3 req / hr
- `validation.middleware.ts` — input validation, error normalisation

**Services**:
- `email.service.ts` — SES transactional email (welcome, password reset)
- `database.service.ts` — connects to MySQL, PostgreSQL, MongoDB, MSSQL
- `encryption.ts` — AES encryption for stored DB passwords (`DATABASE_ENCRYPTION_KEY`)

**Local dev note**: `DYNAMODB_ENDPOINT=http://localhost:8000` points to Docker DynamoDB Local. `ensure-local-tables.ts` auto-creates tables on startup.

---

### `apps/dashboard` — Next.js Admin UI

**Pages** (Next.js 15 App Router):

```
app/
  page.tsx                              Home / chatbot list
  chatbots/
    create/                             New chatbot wizard
    [id]/
      chat/                             In-browser test chat
      analytics/                        Query metrics
      datastores/                       Data sources (files, URLs)
      deploy/                           Embed script + widget settings
      leads/                            Lead CRM
      settings/
        customization/                  Branding (colours, logo, name)
        integrations/                   Slack, WhatsApp, Telegram, Google Drive
        api-keys/                       API key management
        security/                       Whitelist / access control
      tools/
        databases/                      Database connection + NL queries
        ai-actions/                     Custom action buttons
  settings/
    billing/                            Stripe subscription management
  widget/[chatbotId]/                   Embeddable widget preview / iframe
```

**State management**: Zustand stores in `src/stores/` (`chatbot-store`, `data-store`, `header-store`, `preview-store`)

**Auth**: `AuthContext` (`src/contexts/AuthContext.tsx`) — reads tokens from localStorage, refreshes every 60s, handles cross-domain token handoff from website via URL hash.

**API client**: `src/lib/api.ts` (~940 lines) — typed namespace wrappers for every backend endpoint.

---

### `apps/website` — Next.js Marketing Site

Public landing page + authentication entry point.

```
app/
  (home)/                    Marketing homepage
  (auth)/Sign-In/            Cognito login/signup/verify/forgot-password
  (main)/legal/              Privacy policy, Terms of service
```

Marketing components: `Hero`, `FeatureBento`, `AgenticShowcase`, `DatabaseSection`, `IntegrationsOrbit`, `DashboardPreview`, `FAQ`, `FinalCTA`, `LogoBar`, `MetricsBanner`

Animations: Framer Motion + AOS. Booking: React-Calendly.

---

### `apps/lambdaBuild` — Chatbot Indexing Pipeline

Triggered by SQS message. Processes documents → embeddings → Pinecone.

**Message schema**:
```typescript
{ chatbotId, username, type?: 'files'|'web'|'rebuild', files?: string[], origin?: string, language?: string, timestamp }
```

**Pipeline**:
1. Download files from S3 / crawl URLs via Firecrawl
2. Parse: PDF (pdfjs-dist), DOCX (mammoth), CSV/XLSX, plain text, HTML (Cheerio)
3. Chunk: parent-child strategy for small-to-big retrieval
4. Contextualise chunks via GPT-4o-mini
5. Generate embeddings (OpenAI `text-embedding-3-large`)
6. Upsert to Pinecone (namespace = chatbotId)
7. Update chatbot status in DynamoDB
8. Invalidate response cache

**Deployment**: Serverless Framework (`pnpm deploy:dev` / `pnpm deploy:prod` from app dir)

---

### `apps/lambdaChat` — Chat Query Handler

Handles all channels. In production, the widget and integrations call Lambda directly. In local dev, the backend's `/api/chat` controller runs the same logic.

**Handlers** (`src/handlers/`):

| File | Purpose |
|---|---|
| `rest.ts` | REST endpoint — JSON or SSE streaming |
| `ws-connect.ts` | WebSocket $connect |
| `ws-disconnect.ts` | WebSocket $disconnect |
| `ws-chat.ts` | WebSocket chat message |
| `ws-message.ts` | WebSocket message routing |
| `slack-events.ts` | Slack Event Subscriptions |
| `slack-oauth.ts` | Slack OAuth install flow |
| `telegram.ts` | Telegram bot webhook |
| `whatsapp.ts` | WhatsApp Cloud API webhook |

**Query processing** (via `@corpusai/aws-common` `processQuery()`):
1. Intent detection → classify complexity
2. Retrieve vectors from Pinecone (namespace per chatbot)
3. Rerank with Cohere (if needed)
4. Build prompt with conversation history
5. Stream response via OpenAI
6. Extract citations
7. Save to DynamoDB chat history
8. Log to query log table

---

### `packages/aws-common` — Shared Library

Used by backend, lambdaBuild, and lambdaChat.

**`dynamo-models/`** — Dynamoose ORM models (one table each):

| Model | Table (suffix varies) | Key |
|---|---|---|
| `UserModel` | `corpus-users` | `username` (email) |
| `ChatbotModel` | `corpus-chatbots` | `chatbotId` |
| `CustomizationModel` | `corpus-customization` | `chatbotId` |
| `AccessControlModel` | `corpus-access-control` | `chatbotId` + `email` |
| `QueryLogModel` | `corpus-query-log` | `passageIndex` + `uniqueTimestamp` |
| `LeadGenerationModel` | `corpus-lead-generation` | `chatbotId` + `uniqueTimestamp` |
| `ApiKeyModel` | `corpus-api-keys` | `chatbotId` + `keyId` |
| `DatabaseConnectionModel` | `corpus-database-connections` | `id` |
| `ChatHistoryModel` | `corpus-chat-history` | `chatbotId` + `messageId` |
| `AiActionsModel` | `corpus-ai-actions` | — |
| `BuiltinIntegrationModel` | `corpus-builtin-integrations` | — |

**`entities/`** — ElectroDB entities (all in single table `corpus-main`):

| Entity | Purpose |
|---|---|
| `DataStore` | User-submitted structured/unstructured data sources |
| `Integrations` | Slack / Telegram / WhatsApp / GoogleDrive / Zapier config |
| `LeadGeneration` | Lead form field definitions and trigger config |

**`rag/`** — RAG pipeline:
- `document-processor.ts` — multi-format parsing
- `chunking.ts` — parent-child chunking
- `embeddings.ts` — OpenAI embeddings generation
- `retrieval.ts` — Pinecone vector search
- `reranker.ts` — Cohere reranking
- `query-processor.ts` — intent detection + adaptive retrieval strategy
- `response-cache.ts` — cache frequent queries in `corpus-response-cache` table

**Adaptive retrieval strategy**:
- Simple query → standard vector search
- Hybrid → vector + sparse + Cohere rerank
- Complex → multi-query + Reciprocal Rank Fusion (RRF)
- Vague → Hypothetical Document Embeddings (HyDE)

**Other modules**: `s3/`, `sqs/`, `pinecone/`, `secrets/`, `crypto/`, `text-to-sql/`, `firecrawl/`, `quota/`, `access-verification/`

---

### `packages/ui` — Component Library

Radix UI primitives + Tailwind v4 + CVA. Components: `button`, `input`, `card`, `dialog`, `sheet`, `select`, `checkbox`, `radio-group`, `textarea`, `label`, `toast`, `alert`, `progress`, `spinner`, `skeleton`, `pagination`, `data-table`, `avatar`, `badge`, `slider`, `switch`, `collapsible`.

> Tailwind v4 caveat: `data-[state=...]` variants from external packages are unreliable — switch styles live directly in the consuming app's `globals.css`.

---

## Authentication Flow

```
User visits website
       │
       ▼
  /Sign-In page  ──── Cognito Hosted UI (Google SSO path) ────┐
       │                                                       │
  AWS Cognito                                           Google OAuth
       │                                                       │
       ▼                                               Backend callback
  idToken + accessToken + refreshToken                        │
       │◄──────────────────────────────────────────────────────┘
       │
       ▼
  Redirect to Dashboard
  URL hash: #auth={idToken, accessToken, refreshToken, user}
       │
       ▼
  AuthContext extracts tokens → localStorage
  Token refresh loop every 60s
       │
       ▼
  API calls: Authorization: Bearer <idToken>
  OR: X-API-Key: <key>  (programmatic access)
```

---

## Chatbot Creation & Indexing Flow

```
Dashboard
  │  POST /api/chatbots          → DynamoDB record created
  │  POST /api/chatbots/:id/upload  → file → S3 (chatbots/{id}/files/)
  │  POST /api/chatbots/:id/build   → SQS message sent
  │
SQS Queue: corpus-ai-queue-{env}
  │
lambdaBuild (Lambda)
  ├── Download from S3 / crawl via Firecrawl
  ├── Parse documents (PDF, DOCX, CSV, XLSX, HTML, text)
  ├── Parent-child chunking
  ├── GPT-4o-mini contextualisation
  ├── OpenAI text-embedding-3-large
  ├── Pinecone upsert (namespace = chatbotId)
  └── DynamoDB status update → "ready"
```

---

## Chat Flow

### Production (direct Lambda)
```
Widget / Integration
  │
  ├── REST: POST https://api.corpusai.io/chat
  ├── WebSocket: wss://ws.corpusai.io
  ├── Slack Events API
  ├── Telegram webhook
  └── WhatsApp webhook
       │
  lambdaChat
  ├── Auth check (JWT or API key)
  ├── Load chatbot config from DynamoDB
  ├── processQuery():
  │   ├── Detect intent / complexity
  │   ├── Retrieve from Pinecone (namespace = chatbotId)
  │   ├── Rerank (Cohere, if complex)
  │   ├── Build prompt + conversation history
  │   └── Stream via OpenAI gpt-4o-mini
  ├── Save to chat history (DynamoDB)
  ├── Log to query log (DynamoDB)
  └── Return response + citations
```

### Local Dev (backend proxy)
```
Widget → Backend /api/chat → same processQuery() logic
```

---

## Widget Embedding

```javascript
// Injected by: GET /api/widget.js
// Creates bubble + iframe pointing to:
//   /dashboard/widget/{chatbotId}?embed=true
```

Public endpoints (no auth required):
- `GET  /api/chatbots/:id/public` — bot metadata
- `GET  /api/customize/:chatbotId/public` — branding config
- `POST /api/chat` — send message
- `POST /api/leads/:chatbotId` — submit lead form

---

## Lead Capture

**Trigger types**: `gated`, `after_messages`, `high_intent`, `cant_answer`, `exit_intent`

**Flow**: Widget trigger → lead form shown → `POST /api/leads/:chatbotId` → intent classified (hot / warm / cold) → saved to DynamoDB → email sent to bot owner via SES → Zapier webhook fired (if configured)

**Lead record fields**: `sessionId`, `intent`, `status` (`new`/`contacted`/`converted`/`archived`), `triggerType`, `sourcePage`, `notes`

---

## Pricing Tiers

| Tier | Value | Chat msgs/mo | Bots | Storage | Pages crawled |
|---|---|---|---|---|---|
| Free | 0 | 20 | 1 | 50 MB | 100 |
| Starter | 1 | 1,500 | 2 | 50 MB | 100 |
| Standard | 2 | 7,500 | 4 | 1 GB | 2,000 |
| Business | 3 | 15,000 | 8 | 50 GB | 10,000 |

Enforced via `user.tier` check in quota middleware. Free tier has a 10-day trial expiration.

---

## Infrastructure (Terraform)

**Location**: `infra/terraform/` — single config, `environment` variable toggles `staging` vs `prod`

**AWS Region**: `eu-north-1` (Stockholm)

**Domain**: `corpusai.io` — DNS managed externally on Spaceship

### Resources

| File | Resources |
|---|---|
| `cognito.tf` | User Pool, App Client, Google IdP, Hosted UI domain |
| `dynamodb.tf` | 11 tables (see note below) |
| `s3.tf` | Files bucket, CORS policy (presigned uploads ready) |
| `sqs.tf` | Build queue + Dead Letter Queue |
| `iam.tf` | Lambda execution roles, backend IAM user |
| `ses.tf` | Domain identity for `noreply@corpusai.io` |
| `secrets.tf` | Secrets Manager secret `corpus-ai/{env}` with all app secrets |
| `variables.tf` | All input variables |
| `outputs.tf` | Resource IDs output after apply |

**Resource naming**: `corpus-{resource}-{environment}` (e.g. `corpus-users-staging`)

### DynamoDB Tables in Terraform (11)

`users`, `chatbots`, `customization`, `access_control`, `query_log`, `lead_generation`, `main` (ElectroDB single-table), `integrations`, `api_keys`, `database_connections`, `chat_history`

### DynamoDB Tables NOT Yet in Terraform (3)

`corpus-ai-actions`, `corpus-builtin-integrations`, `corpus-response-cache` — defined in `.env.example` and auto-created locally by `ensure-local-tables.ts` but **must be created manually** in staging/prod until added to `dynamodb.tf`.

### Secrets Manager (`corpus-ai/staging` or `corpus-ai/production`)

Stores all non-AWS secrets loaded at backend boot:
- OpenAI API key, model names
- Pinecone API key, region, index names
- Cohere API key
- Firecrawl API key
- Cognito pool ID, client ID, domain
- S3 bucket name, SQS URL
- All 14 DynamoDB table names
- `DATABASE_ENCRYPTION_KEY`

### Terraform State

`terraform.tfstate` is local and sensitive (contains resource ARNs/IDs). Not committed. `staging.tfvars` and `production.tfvars` hold secrets — not committed.

### Terraform Commands

```bash
cd infra/terraform
terraform init
terraform plan -var-file=staging.tfvars -out=staging.tfplan
terraform apply staging.tfplan

# Push secrets to Secrets Manager after apply:
pnpm secrets:push:staging   # reads apps/backend/.env.development
pnpm secrets:push:production
```

Setup guides: `infra/terraform/STAGING_SETUP.md`, `PRODUCTION_SETUP.md`

---

## Environment Variables

### Backend (`.env.local` / Secrets Manager)

```
NODE_ENV, PORT=8001
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
AWS_SM_SECRET_NAME                     # blank=local, corpus-ai/staging or corpus-ai/production
DYNAMODB_ENDPOINT                      # http://localhost:8000 for local Docker
AWS_DYNAMO_USER_TABLE
AWS_DYNAMO_CHATBOT_TABLE
AWS_DYNAMO_CUSTOMIZATION_TABLE
AWS_DYNAMO_ACCESS_CONTROL_TABLE
AWS_DYNAMO_QUERY_LOG_TABLE
AWS_DYNAMO_LEAD_GENERATION_TABLE
AWS_DYNAMO_MAIN_TABLE
AWS_DYNAMO_INTEGRATIONS_TABLE
AWS_DYNAMO_API_KEYS_TABLE
AWS_DYNAMO_DATABASE_CONNECTIONS_TABLE
AWS_DYNAMO_CHAT_HISTORY_TABLE
AWS_DYNAMO_AI_ACTIONS_TABLE
AWS_DYNAMO_BUILTIN_INTEGRATIONS_TABLE
AWS_DYNAMO_RESPONSE_CACHE_TABLE
S3_BUCKET_NAME, S3_REGION
SQS_BUILD_QUEUE_URL, SQS_REGION
AWS_COGNITO_USER_POOL_ID, AWS_COGNITO_CLIENT_ID, AWS_COGNITO_REGION, AWS_COGNITO_DOMAIN
GOOGLE_SSO_CALLBACK_URL, DASHBOARD_URL, WEBSITE_URL, ALLOWED_ORIGINS
SES_SENDER_EMAIL=noreply@corpusai.io, SES_REGION
OPENAI_API_KEY, OPENAI_MODEL=gpt-4o-mini, OPENAI_EMBEDDING_MODEL=text-embedding-3-large
PINECONE_API_KEY, PINECONE_REGION=us-east-1, PINECONE_INDEX=corpus-dense, PINECONE_SPARSE_INDEX=corpus-sparse
COHERE_API_KEY
FIRECRAWL_API_KEY
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID_STARTER, STRIPE_PRICE_ID_STANDARD, STRIPE_PRICE_ID_BUSINESS
DATABASE_ENCRYPTION_KEY                # 64-char hex, generate: openssl rand -hex 32
CHAT_QUOTA=[20,1500,7500,15000]
CRAWL_QUOTA=[100,100,2000,10000]
STORAGE_QUOTA=[52428800,52428800,1073741824,53687091200]
BOT_QUOTA=[1,2,4,8]
FREE_TRIAL_EXPIRATION_DAYS=10
SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_SIGNING_SECRET, SLACK_BOT_TOKEN
WHATSAPP_VERIFY_TOKEN, WHATSAPP_ACCESS_TOKEN
TELEGRAM_BOT_TOKEN
API_URL=http://localhost:8001, SUPPRESS_TEST_LOGS=false
```

### Dashboard (`.env.local`)
```
NEXT_PUBLIC_API_URL       # Backend URL
NEXT_PUBLIC_APP_URL       # Dashboard's own URL
NEXT_PUBLIC_WEBSITE_URL   # Website URL (logout redirect)
NODE_OPTIONS=--no-warnings
```

### Website (`.env.local`)
```
NEXT_PUBLIC_APP_URL        # Website's own URL
NEXT_PUBLIC_API_URL        # Backend URL
NEXT_PUBLIC_DASHBOARD_URL  # Dashboard URL (post-login redirect, CTAs)
```

---

## Dev Routing (Proxy)

`proxy-server.js` runs on port 3000 in dev mode and routes:

| Path | Target |
|---|---|
| `/api/*` | Backend :8001 |
| `/dashboard/*` | Dashboard :8080 |
| `/docs/*` | Docs :3001 |
| `/*` | Website :3002 |

Production uses Nginx (`docker/default.conf.template`) with same routing rules.

---

## Local Development

```bash
# Prerequisites
pnpm install
pnpm docker:up           # starts DynamoDB Local on port 8000
pnpm db:setup:local      # creates all DynamoDB tables locally

# Copy and fill env files
cp apps/backend/.env.example apps/backend/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
cp apps/website/.env.example apps/website/.env.local

# Start all services + proxy
pnpm dev                 # everything on proxy :3000

# Or start individually
pnpm dev:frontend        # frontend apps only
```

The backend's `/api/chat` controller mirrors lambdaChat logic — no Lambda deployment needed for local dev.

To use **staging AWS resources** locally: set `AWS_SM_SECRET_NAME=corpus-ai/staging` and provide real `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` in `apps/backend/.env.local`. Leave `DYNAMODB_ENDPOINT` blank to hit real DynamoDB.

---

## Docker (Staging / Production)

```bash
pnpm docker:staging          # run with staging env overrides
pnpm docker:production       # run with production env overrides
pnpm docker:rebuild          # full rebuild from scratch
```

Services: `backend`, `dashboard`, `website`, `docs`, `proxy`, `dynamodb-local` (dev only).

---

## S3 Storage Layout

```
corpus-ai-files-{env}/
  chatbots/{chatbotId}/
    files/       ← raw uploaded files
    raw/         ← downloaded/crawled content
    processed/   ← parsed text
    index/       ← build metadata
```

Presigned upload (browser → S3 direct) is implemented (`generatePresignedUploadUrl()`, `chatbotApi.getUploadUrl()`) but not yet wired into the UI. S3 CORS is provisioned in Terraform.

---

## Key Technical Decisions

| Decision | Rationale |
|---|---|
| Dynamoose for most tables | Simple ORM, auto schema management |
| ElectroDB for `corpus-main` | Advanced querying patterns (GSI, access patterns) needed for integrations + data stores |
| Parent-child chunking | Small chunks for precise retrieval, parent chunks for full context |
| Namespace-per-chatbot in Pinecone | Complete isolation between tenants |
| SQS for indexing | Decouples upload from slow indexing process; Lambda retry on failure |
| Backend chat proxy in dev | Avoids Lambda deployment cycle during development |
| JWT in localStorage (not cookies) | Cross-subdomain token sharing without CORS cookie complexity |
| Custom rate limiter (no Redis) | Keeps backend stateless, simpler infra for current scale |

---

## Future Improvements (Tracked)

- **S3 presigned upload**: Wire `chatbotApi.getUploadUrl()` into the dashboard upload UI — infrastructure is ready
- **Terraform gap**: Add `ai-actions`, `builtin-integrations`, `response-cache` tables to `dynamodb.tf`
