# CLAUDE.md

Guidance for Claude Code when working in this repository. Last refreshed against a full pass over `apps/`, `packages/`, `infra/`, `scripts/`, and root configs.

> Companion docs: `ARCHITECTURE.md` (deeper narrative), `README.md` (public/quickstart), `NEXT_STEPS_FOR_DEPLOYMENT.md` (remaining deploy work), `infra/terraform/STAGING_SETUP.md`, `infra/terraform/PRODUCTION_SETUP.md`.

---

## Project at a glance

CorpusAI is a multi-tenant SaaS that lets businesses build AI agents trained on their own content (files, URLs, databases) and deploy them as embeddable widgets or Slack / Telegram / WhatsApp bots. Monetised via Stripe across 4 tiers.

**Current branch state:** `staging`. The website is live; backend on Railway and dashboard/docs on Vercel are partially wired up (see "Deployment status" below).

---

## Build & Development

**Toolchain:** pnpm >=9, Node >=18, Turborepo 2.x, TypeScript 5.x.

```bash
pnpm install
pnpm dev              # All apps + dev proxy on port 3000
pnpm dev:frontend     # Same minus the lambdas
pnpm build            # Build all packages
pnpm lint:fix && pnpm format:fix

pnpm docker:up        # Start all services via docker compose (incl. DynamoDB Local)
pnpm docker:staging   # docker-compose.yaml + docker-compose.staging.yml overrides
pnpm docker:production
```

| App | Port (dev) | Port (`pnpm start`) | Stack |
|-----|------------|---------------------|-------|
| `apps/backend` | 8001 | 8001 | Express (tsx watch in dev, compiled `node dist/bootstrap.js` in prod) |
| `apps/dashboard` | 8080 | 3004 | Next.js 15 (React 19) |
| `apps/website` | 3002 | 3002 | Next.js 15 (React 19) |
| `apps/docs` | 3001 | 3003 | Next.js 15 + Turbopack |

Dev entry for backend goes through `src/bootstrap.ts` — it loads AWS Secrets Manager first (when `AWS_SM_SECRET_NAME` is set) and only then dynamically imports `src/index.ts`. Do NOT add static imports of `@corpusai/aws-common` to `bootstrap.ts`; the Dynamoose models read `env('AWS_DYNAMO_*_TABLE')` at module-load time and will throw if loaded before secrets land.

### Backend tests (run from `apps/backend`)

```bash
pnpm test              # runs only __tests__/debug.test.ts (default fast loop)
pnpm test:phase3       # phase3.test.ts
pnpm test:all          # everything in __tests__/
pnpm test:watch
pnpm test:coverage
```

Test files present: `auth`, `chatbot`, `payment`, `phase3`, `debug`, `setup`.

### DB / secrets helpers

```bash
pnpm db:setup:local                # creates tables in local DynamoDB (Docker)
pnpm db:setup:staging              # creates AWS tables (legacy; Terraform owns these now)

pnpm secrets:push:staging          # uploads apps/backend/.env.development → corpus-ai/staging
pnpm secrets:push:production       # uploads apps/backend/.env.production  → corpus-ai/production
```

---

## Monorepo layout

```
corpus-ai/
├── apps/
│   ├── backend/                 Express REST API (port 8001)
│   ├── dashboard/               Next.js admin UI
│   ├── website/                 Next.js marketing + auth entry
│   ├── docs/                    Next.js docs site
│   ├── lambdaBuild/             Serverless Framework Lambda (SQS-triggered indexing)
│   └── lambdaChat/              Serverless Framework Lambda (REST + WebSocket + messaging integrations)
├── packages/
│   ├── aws-common/              DynamoDB models, S3, SQS, Pinecone, RAG pipeline, Secrets Manager, Firecrawl, crypto, text-to-SQL
│   └── ui/                      shadcn/ui (Radix + Tailwind v4 + CVA)
├── infra/terraform/             AWS infra-as-code (single config, env-toggled)
├── docker/                      Dockerfiles + Nginx config template
├── scripts/push-secrets.js      Seed AWS Secrets Manager from a .env file
├── proxy-server.js              Dev (and Docker prod) proxy (port 3000)
├── docker-compose.yaml          Base compose
├── docker-compose.staging.yml   Staging overrides
├── docker-compose.production.yml Production overrides
└── .dockerignore                Keeps local node_modules, dist/, .turbo, .git out of Docker build context
```

### Dev routing (proxy port 3000)

| Path | Target |
|------|--------|
| `/api/*` | Backend :8001 |
| `/dashboard/*` | Dashboard :8080 (dev) / :3004 (prod) |
| `/docs/*` | Docs :3001 (dev) / :3003 (prod) |
| `/` | Website :3002 |

Production Docker uses Nginx with the same routing (`docker/default.conf.template`). Production cloud deployment uses **Vercel + Railway with their own domains** — the Nginx proxy is only for self-hosted/Docker deployments.

---

## Apps

### `apps/backend` — Express REST API

Entry: `src/bootstrap.ts` → `src/index.ts`. Hosted on Railway. Trust proxy is on (`app.set('trust proxy', 1)`) so `req.ip` reflects the real client through Railway's edge.

**Controllers + routes (15 pairs):**

| Domain | Controller / route file | Notes |
|---|---|---|
| Auth | `auth.controller.ts` / `auth.routes.ts` | Cognito SDK login/signup/verify/forgot-password, Google SSO callback |
| Chatbots | `chatbots.controller.ts` / `chatbots.routes.ts` | CRUD + file upload (multer, 10MB cap) + build trigger (SQS) |
| Chat (dev only) | `chat.controller.ts` | `/api/chat` proxy that runs the lambdaChat logic locally |
| Customize | `customize.controller.ts` / `customize.routes.ts` | Branding (colours, logo, name) |
| Datastores | `datastore.controller.ts` / `datastore.routes.ts` | Vector data source management (ElectroDB) |
| Leads | `leads.controller.ts` / `leads.routes.ts` | Lead capture + intent classifier (hot/warm/cold) |
| Query log | `querylog.controller.ts` / `querylog.routes.ts` | Analytics |
| Access | `access.controller.ts` / `access.routes.ts` | Whitelist + email invites |
| User | `user.controller.ts` / `user.routes.ts` | Profile |
| Quota | `quota.controller.ts` / `quota.routes.ts` | Tier-based usage enforcement |
| Payment | `payment.controller.ts` / `payment.routes.ts` | Stripe checkout, portal, webhook |
| Integrations | `integrations.controller.ts` / `integrations.routes.ts` | Slack / Google Drive / Telegram / WhatsApp config (Slack OAuth callback is **TODO** — handled instead by lambdaChat) |
| AI Actions | `ai-actions.controller.ts` / `ai-actions.routes.ts` | Custom tool/button definitions |
| Builtin Integrations | `builtin-integrations.controller.ts` / `builtin-integrations.routes.ts` | Pre-built integration config |
| Database | `database.controller.ts` / `database.routes.ts` | Multi-DB connections (MySQL/Postgres/MongoDB/MSSQL) + NL-to-SQL |

**Middleware:**
- `auth.middleware.ts` — JWT vs Cognito + API key auth (`authenticateToken`, `authenticateChat`)
- `rateLimit.middleware.ts` — `express-rate-limit` with **Redis-or-in-memory** store (auth 5/15min, api 100/15min, chat 20/min, passwordReset 3/hr). On boot, checks for `REDIS_URL`: if set, uses `rate-limit-redis` + `ioredis` (counters shared across replicas); if not, falls back to the default in-memory store and logs `[rate-limit] REDIS_URL not set — using in-memory store (single replica only)`. Staging currently runs without Redis — fine for one Railway replica.
- `validation.middleware.ts` — input validation + `errorHandler` at the end of the chain

**Services:** `email.service.ts` (SES), `database.service.ts` (multi-DB driver), `encryption.ts` (AES with `DATABASE_ENCRYPTION_KEY`).

**Special routes hard-coded in `index.ts`:** `/api/widget.js` (public widget loader), `/api/chatbots/:id/upload` (multer), `/api/chatbots/:id/build` (SQS send). Stripe webhook gets raw body parsing.

**Local table auto-create:** When `DYNAMODB_ENDPOINT` is set, `ensureLocalTables()` creates all 14 tables in DynamoDB Local. Skipped entirely against real AWS — Terraform owns those.

### `apps/dashboard` — Next.js 15 admin UI (React 19)

Pages live under `src/app/`:

```
app/
  page.tsx                              Home / chatbot list
  chatbots/[id]/
    analytics/  chat/  datastores/  deploy/  leads/
    settings/
      api-keys/  customization/  integrations/  security/  page.tsx
    tools/
      ai-actions/  databases/
  settings/billing/                     Stripe portal entry
  widget/[chatbotId]/                   Embeddable widget (embed=true) or preview
```

- **State:** Zustand stores in `src/stores/` — `chatbot-store`, `data-store`, `header-store`, `preview-store`, plus `index.ts`.
- **API client:** `src/lib/api.ts` exposes typed namespaces — `authApi`, `chatbotApi`, `customizeApi`, `dataStoreApi`, `leadsApi`, `queryLogApi`, `quotaApi`, `paymentApi`, `integrationsApi`, `accessControlApi`, `chatHistoryApi`, `databaseApi`, `aiActionsApi`, `builtinIntegrationsApi`.
- **Auth:** `AuthContext` reads tokens from URL hash on landing (`#auth=...`), persists to localStorage, refreshes every 60s.
- **Design tokens:** `src/lib/design-tokens.ts`.

### `apps/website` — Next.js 15 marketing + auth

Route groups under `src/app/`: `(home)`, `(auth)/Sign-In`, `(main)/legal`. Marketing relies on `framer-motion`, `aos`, and `react-calendly`. The Sign-In flow drives Cognito (email/password + Google federated) and hands tokens back to the dashboard via a URL hash on `NEXT_PUBLIC_DASHBOARD_URL`.

### `apps/docs` — Next.js 15 + Turbopack

FontAwesome-based documentation site. Lightweight, no auth.

### `apps/lambdaBuild` — Serverless Framework Lambda (RAG indexing)

`serverless.yml` → service `corpus-lambda-build`, Node 20, 2 GB memory, 15 min timeout. Triggered by SQS messages. Pipeline:

1. Fetch from S3 (`chatbots/{id}/files/`) or crawl URLs via Firecrawl
2. Parse: PDF (`pdfjs-dist`), DOCX (`mammoth`), CSV/XLSX (`xlsx` / `csv-parse`), HTML (`cheerio`), plain text
3. Parent-child chunking
4. GPT-4o-mini contextualisation
5. Embeddings via `text-embedding-3-large`
6. Pinecone upsert (namespace = `chatbotId`)
7. Update chatbot status in DynamoDB
8. Invalidate response cache

Deploy: `pnpm deploy:dev` / `pnpm deploy:staging` / `pnpm deploy:prod` from `apps/lambdaBuild/`.

### `apps/lambdaChat` — Serverless Framework Lambda (chat)

`serverless.yml` → service `corpus-lambda-chat`, Node 20, 1 GB memory, 30s timeout. Handlers in `src/handlers/`:

| Handler | Route / event |
|---|---|
| `rest.ts` | HTTP `POST /chat`, `POST /chat/stream` (SSE) |
| `ws-connect.ts` / `ws-disconnect.ts` / `ws-chat.ts` / `ws-message.ts` | WebSocket lifecycle and routing |
| `slack-events.ts` | Slack Events API |
| `slack-oauth.ts` | Slack OAuth install (this is where Slack OAuth actually lives — the backend stub is unused) |
| `telegram.ts` | Telegram bot webhook |
| `whatsapp.ts` | WhatsApp Cloud API webhook |

Lambda has its own `WEBSOCKET_CONNECTION_TABLE = corpus-ws-connections-{stage}` and a separate `OPENAI_EMBEDDING_MODEL` default of `text-embedding-3-small` (note: `lambdaBuild` and the backend default to `text-embedding-3-large` — confirm both sides agree before changing).

In local dev, the backend `/api/chat` controller runs the exact same `processQuery()` logic so you can iterate without redeploying Lambda.

---

## Shared packages

### `@corpusai/aws-common` (`packages/aws-common`)

Used by `apps/backend`, `apps/lambdaBuild`, `apps/lambdaChat`. Exports everything from `src/index.ts`.

- **`dynamo-models/`** — Dynamoose ORM models (one table each):
  `UserModel`, `ChatbotModel`, `CustomizationModel`, `AccessControlModel`, `QueryLogModel`, `LeadGenerationModel`, `ApiKeyModel`, `DatabaseConnectionModel`, `ChatHistoryModel`, `AiActionsModel`, `BuiltinIntegrationModel`.
- **`dynamo-models/*.entity.ts`** — ElectroDB entities on the single `corpus-main-{env}` table: `DataStore`, `Integrations` (Slack / Telegram / WhatsApp / GoogleDrive / Zapier), `LeadGeneration`.
- **`rag/`** — `document-processor`, `chunking`, `embeddings`, `retrieval`, `reranker`, `query-processor`, `response-cache`.
- **`s3/`, `sqs/`, `pinecone/`, `secrets/`, `crypto/`, `firecrawl/`, `text-to-sql/`, `utils/`** — the rest.
- **Adaptive retrieval strategy** (in `rag/query-processor.ts`): simple → vector search; hybrid → vector + sparse + Cohere rerank; complex → multi-query + RRF; vague → HyDE.

> When `process.env` is read at module-load time inside this package (which it is, via `env('AWS_DYNAMO_*_TABLE')` in every Dynamoose model), anything that statically imports `@corpusai/aws-common` MUST run after Secrets Manager has populated env. That's the whole reason for `apps/backend/src/bootstrap.ts`.

### `@corpusai/ui` (`packages/ui`)

shadcn/ui-flavoured components (Radix + Tailwind v4 + CVA). Both dashboard and website consume it via `"workspace:*"`.

> **Tailwind v4 caveat:** `data-[state=...]` variants from external packages are not always picked up by the consumer app's Tailwind scanner. If a switch / toggle from `@corpusai/ui` looks broken, define the `data-[state]` variants live in the consuming app's `globals.css`.

---

## Data flow

### Auth flow

1. User lands on `staging.corpusai.io` (website) → `/Sign-In` page handles email/password or Google SSO via Cognito.
2. On success, browser is redirected to `NEXT_PUBLIC_DASHBOARD_URL` with `#auth={idToken, accessToken, refreshToken, user}` in the URL hash.
3. Dashboard `AuthContext` extracts the hash, stores tokens in localStorage, scrubs the hash from the URL.
4. Token refresh loop runs every 60s.
5. Backend `auth.middleware.ts` accepts either `Authorization: Bearer <idToken>` (humans) or `X-API-Key: <key>` (programmatic).

### Chatbot creation + indexing

```
Dashboard
 ├─ POST /api/chatbots                      → DynamoDB record
 ├─ POST /api/chatbots/:id/upload (multer)  → S3 (chatbots/{id}/files/)
 └─ POST /api/chatbots/:id/build            → SQS enqueue
                                                   │
                                                   ▼
                                       corpus-ai-queue-{env}
                                                   │
                                                   ▼
                                            lambdaBuild
                                  (parse → chunk → embed → Pinecone upsert)
                                                   │
                                                   ▼
                                  Chatbot status → "ready" in DynamoDB
```

### Chat flow

- **Production:** widget / integration → Lambda directly (REST or WebSocket) → Pinecone retrieve → Cohere rerank (if needed) → OpenAI streaming → save to chat history + query log.
- **Local dev:** widget → backend `/api/chat` (same code path as lambdaChat, just hosted in the Express app).

### Lead capture

Trigger types: `gated`, `after_messages`, `high_intent`, `cant_answer`, `exit_intent` — configured per chatbot via `leadFields.triggerConfig`.

Flow: widget trigger → form → `POST /api/leads/:chatbotId` → intent classified (hot/warm/cold) → DynamoDB → SES email to bot owner → Zapier webhook (if configured).

Record shape: `sessionId`, `intent`, `status` (`new`/`contacted`/`converted`/`archived`), `triggerType`, `sourcePage`, `notes`. Dashboard CRM at `chatbots/[id]/leads/`.

### Embeddable widget

- `GET /api/widget.js` — static script that injects bubble + iframe → `/dashboard/widget/{chatbotId}?embed=true`.
- Widget page has embed mode (iframe, no bubble) and standalone preview.
- Public endpoints (no auth): `GET /api/chatbots/:id/public`, `GET /api/customize/:chatbotId/public`, `POST /api/chat`, `POST /api/leads/:chatbotId`.
- Deploy page builds the embed snippet from `NEXT_PUBLIC_APP_URL` (dashboard's own URL).

### Pricing tiers (`user.tier`)

| Tier | Idx | Chat msgs/mo | Bots | Storage | Pages crawled |
|---|---|---|---|---|---|
| Free | 0 | 20 | 1 | 50 MB | 100 |
| Starter | 1 | 1 500 | 2 | 50 MB | 100 |
| Standard | 2 | 7 500 | 4 | 1 GB | 2 000 |
| Business | 3 | 15 000 | 8 | 50 GB | 10 000 |

Enforced in `quota.middleware`. Free has a 10-day trial expiration (`FREE_TRIAL_EXPIRATION_DAYS`).

### Key patterns

- **S3 layout:** `corpus-ai-files-{env}/chatbots/{chatbotId}/{files|raw|processed|index}/`
- **Pinecone:** one namespace per `chatbotId`.
- **uniqueTimestamp:** `YYYY-MM-DDTHH:mm:ss#<rand>` — when parsing back to Date, append `'Z'` before `new Date()`.
- **Rate limits:** see `rateLimit.middleware.ts`.

---

## Database models

### Dynamoose (one table each)

| Model | Table | Primary key | Notes |
|---|---|---|---|
| `UserModel` | `corpus-users-{env}` | `username` (email) | |
| `ChatbotModel` | `corpus-chatbots-{env}` | `chatbotId` | GSI `username-index` |
| `CustomizationModel` | `corpus-customization-{env}` | `chatbotId` + `id` | |
| `AccessControlModel` | `corpus-access-control-{env}` | `chatbotId` + `email` | GSI `email-index` |
| `QueryLogModel` | `corpus-query-log-{env}` | `passageIndex` + `uniqueTimestamp` | GSI `sessionId-uniqueTimestamp-index` |
| `LeadGenerationModel` | `corpus-lead-generation-{env}` | `chatbotId` + `uniqueTimestamp` | |
| `ApiKeyModel` | `corpus-api-keys-{env}` | `chatbotId` + `keyId` | |
| `DatabaseConnectionModel` | `corpus-database-connections-{env}` | `id` | GSI `chatbotId-index` |
| `ChatHistoryModel` | `corpus-chat-history-{env}` | `chatbotId` + `messageId` | GSI `username-chatbotId-index` |
| `AiActionsModel` | `corpus-ai-actions-{env}` | `chatbotId` | **Not in Terraform** |
| `BuiltinIntegrationModel` | `corpus-builtin-integrations-{env}` | `chatbotId` + `integrationKey` | **Not in Terraform** |

### ElectroDB (all on the single `corpus-main-{env}` table)

| Entity | Purpose |
|---|---|
| `DataStore` | User-submitted structured/unstructured sources |
| `Integrations` | Slack / Telegram / WhatsApp / GoogleDrive / Zapier per-bot config |
| `LeadGeneration` | Lead form field definitions + trigger config |

### Response cache

`corpus-response-cache-{env}` (TTL on `ttl`, GSI on `chatbotId`) — used by `rag/response-cache.ts`. **Not in Terraform.**

All **14 tables are defined and managed by Terraform** across `dynamodb.tf`, `iam.tf`, `secrets.tf`, `outputs.tf`. The auto-create logic in `apps/backend/src/utils/ensure-local-tables.ts` handles local Docker DynamoDB.

> 📜 **Historical note (resolved 2026-05-14):** staging once had `ai-actions`, `builtin-integrations`, `response-cache` created by hand in the AWS console before Terraform defined them, and the IAM policy had several `VisualEditor*` inline statements added through the console. We dropped the manual tables, reapplied Terraform, and the policy is now Terraform-managed. Production has never had this drift. If you find similar drift again, the playbook is: drop the manual resource → `terraform plan -var-file=staging.tfvars` → confirm only the expected adds → `apply`.

---

## Infrastructure (Terraform)

`infra/terraform/` is a single config; `var.environment` flips between `staging` and `prod` and drives `locals.suffix`.

| File | Resources |
|---|---|
| `main.tf` | AWS provider, default tags, region |
| `variables.tf` | All input vars (region, env, domain, OAuth IDs, API keys, etc.) |
| `cognito.tf` | User pool, app client, Google IdP, Hosted UI domain. Tokens: id/access = 60 min, refresh = 30 days. |
| `dynamodb.tf` | DynamoDB tables (see gap note above), PAY_PER_REQUEST, SSE on, deletion protection + PITR only in prod |
| `s3.tf` | `corpus-ai-files-{env}` bucket, public access blocked, AES-256 SSE, CORS for widget, versioning + 90-day non-current lifecycle in prod |
| `sqs.tf` | `corpus-ai-queue-{env}` (15-min visibility) + DLQ (14-day retention, maxReceiveCount=3) |
| `iam.tf` | Runtime IAM user `corpus-backend-{env}` with least-priv DynamoDB + S3 + SQS + Cognito + Secrets Manager + SES + CloudWatch Logs |
| `ses.tf` | Domain identity `corpusai.io` + DKIM (created once, shared across envs) |
| `secrets.tf` | `corpus-ai/{env}` secret bundling all app config (OpenAI, Pinecone, Cohere, Firecrawl, Cognito IDs, S3/SQS, DB table names, DB encryption key, SES) |
| `outputs.tf` | Resource IDs / runtime IAM access keys (sensitive) |

**Region:** `eu-north-1` (Stockholm). **Domain:** `corpusai.io` (DNS managed externally on Spaceship).

**State:** `terraform.tfstate` is local and gitignored. **tfvars:** `staging.tfvars`, `production.tfvars` are gitignored.

**Apply commands:**

```bash
cd infra/terraform
terraform init
terraform plan  -var-file=staging.tfvars   -out=staging.tfplan
terraform apply staging.tfplan

# Seed Secrets Manager (one-off, after first apply):
pnpm secrets:push:staging          # from repo root
pnpm secrets:push:production
```

Setup runbooks: `infra/terraform/STAGING_SETUP.md`, `infra/terraform/PRODUCTION_SETUP.md`.

### Pinecone (manual, not Terraform)

Created in the Pinecone console — one dense + one sparse index per env:

| Index | Dimension | Metric | Type |
|---|---|---|---|
| `corpus-dense-staging` / `corpus-dense-prod` | 3072 | cosine | Dense serverless |
| `corpus-sparse-staging` / `corpus-sparse-prod` | — | dotproduct | Sparse serverless |

Same API key is reused across envs (stored in Secrets Manager).

---

## Environment variables

In deployed envs, all non-AWS config is loaded from Secrets Manager at boot. Locally, each app has its own `.env.local` (copy from the `.env.example` files — never commit real values).

### Backend (`apps/backend/.env.local` or Secrets Manager)

Bare minimum on Railway: AWS creds + `AWS_SM_SECRET_NAME=corpus-ai/staging` (or production). Everything else is in the secret. Full list:

- `NODE_ENV`, `PORT=8001`
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `AWS_SM_SECRET_NAME` (blank for local; `corpus-ai/{staging|production}` for deployed)
- `DYNAMODB_ENDPOINT` (only `http://localhost:8000` for Docker DynamoDB Local)
- 14× `AWS_DYNAMO_*_TABLE` names
- `S3_BUCKET_NAME`, `S3_REGION`
- `SQS_BUILD_QUEUE_URL`, `SQS_REGION`
- `AWS_COGNITO_USER_POOL_ID`, `AWS_COGNITO_CLIENT_ID`, `AWS_COGNITO_REGION`, `AWS_COGNITO_DOMAIN`
- `GOOGLE_SSO_CALLBACK_URL`, `DASHBOARD_URL`, `WEBSITE_URL`, `ALLOWED_ORIGINS`
- `SES_SENDER_EMAIL=noreply@corpusai.io`, `SES_REGION`
- `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-4o-mini`, `OPENAI_EMBEDDING_MODEL=text-embedding-3-large`
- `PINECONE_API_KEY`, `PINECONE_REGION=us-east-1`, `PINECONE_INDEX`, `PINECONE_SPARSE_INDEX`
- `COHERE_API_KEY`, `FIRECRAWL_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_STARTER`, `STRIPE_PRICE_ID_STANDARD`, `STRIPE_PRICE_ID_BUSINESS`
- `DATABASE_ENCRYPTION_KEY` (64-char hex, `openssl rand -hex 32`)
- `CHAT_QUOTA`, `CRAWL_QUOTA`, `STORAGE_QUOTA`, `BOT_QUOTA` (JSON arrays), `FREE_TRIAL_EXPIRATION_DAYS=10`
- Slack: `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, `SLACK_SIGNING_SECRET`, `SLACK_BOT_TOKEN`
- WhatsApp: `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`
- Telegram: `TELEGRAM_BOT_TOKEN`

### Dashboard (`apps/dashboard/.env.local` or Vercel)

```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_APP_URL                 # dashboard's own URL (used by embed snippet)
NEXT_PUBLIC_WEBSITE_URL             # for logout redirect
NEXT_PUBLIC_COGNITO_USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID
NEXT_PUBLIC_COGNITO_REGION
NEXT_PUBLIC_COGNITO_DOMAIN
NEXT_PUBLIC_BASE_URL
```

### Website (`apps/website/.env.local` or Vercel)

```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_APP_URL                 # website's own URL
NEXT_PUBLIC_DASHBOARD_URL           # post-login redirect, CTAs
NEXT_PUBLIC_COGNITO_USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID
NEXT_PUBLIC_COGNITO_REGION
NEXT_PUBLIC_COGNITO_DOMAIN
```

### Deployed URLs

| Env | API | Dashboard | Website |
|---|---|---|---|
| Staging | `api-staging.corpusai.io` | `app-staging.corpusai.io` | `staging.corpusai.io` |
| Production | `api.corpusai.io` | `app.corpusai.io` | `corpusai.io` |

---

## Deployment status (as of branch `staging`)

| Component | Target | Status |
|---|---|---|
| AWS infra (staging) | Terraform — DynamoDB, S3, SQS, Cognito, SES, Secrets Manager, IAM | ✅ Applied (state in `infra/terraform/terraform.tfstate`) |
| AWS infra (production) | Same | ✅ Applied (separate state via `production.tfvars`) |
| Website (staging) | Vercel → `staging.corpusai.io` | ✅ Live |
| Dashboard (staging) | Vercel → `app-staging.corpusai.io` | ✅ Live (login + chatbot create/delete cycle verified end-to-end) |
| Docs (staging) | Vercel → `docs-staging.corpusai.io` | 🚧 In progress |
| Backend (staging) | Railway → `api-staging.corpusai.io` | ✅ Live (SSO + chatbots + S3 + DynamoDB + Pinecone delete cycle clean) |
| Lambda Build | Serverless (`pnpm deploy:staging`) | ⏳ Not yet deployed to AWS — uploads to S3 succeed but documents never index until this is up |
| Lambda Chat | Serverless (`pnpm deploy:staging`) | ⏳ Not yet deployed to AWS — backend's `/api/chat` proxy still serves prod traffic in the interim |
| Pinecone indexes (staging) | Manual | ✅ Created (`corpus-dense-staging`, `corpus-sparse-staging`) |
| SES domain identity | Terraform | ✅ Verified |
| SES production access | AWS Console | ⏳ Needs request — until granted, emails only deliver to verified addresses |
| DNS (Spaceship) | CNAMEs for all 3 staging hosts | ✅ All wired up (SES + website + dashboard + api) |
| Production env (everything above) | — | ⏳ Pending — same playbook once staging is green |

See `NEXT_STEPS_FOR_DEPLOYMENT.md` for the explicit remaining checklist.

### Railway deploy gotchas (learned the hard way)

The backend lives on Railway with a Dockerfile build. Two things that bit us:

1. **Watch paths default to `/apps/backend/**`** in Railway's service config. That means commits touching `packages/aws-common/**`, `docker/Dockerfile.backend`, `pnpm-lock.yaml`, `turbo.json`, or `.dockerignore` **do NOT trigger auto-deploy** even though they affect the backend image. Clicking "Redeploy" in Railway re-runs the existing image (it does not pull new commits). The fix is either: (a) update the watch paths in Railway → Settings → Source to include all those paths, or (b) make any token edit inside `apps/backend/` to force a trigger.

2. **BuildKit's content-hash layer cache will silently reuse a stale image** if the build context happens to match a cached one — every Dockerfile step will show `cached` in the log and the build will finish in <2 seconds without actually running anything. To force a real rebuild without changing app code, bump the `ARG BUILD_CACHE_BUST=...` value at the top of `docker/Dockerfile.backend`. Also note `--force` is already passed to `pnpm turbo run build` so turbo's own cache can't short-circuit a workspace-package rebuild.

3. **Boot fingerprints** — `apps/backend/src/index.ts` and `packages/aws-common/src/pinecone/index.ts` each `console.log` a build/version tag at module-load time. If those lines don't show up in the Railway deploy log after a push, the new code didn't actually get into the image — diagnose via the two issues above.

4. **`.gitignore` must stay in the Docker context.** `docker/Dockerfile.backend`'s builder stage does `COPY .gitignore .gitignore`, and `turbo prune --docker` (in the pruner stage) respects gitignore patterns. The repo `.dockerignore` excludes `.git/` and a lot of other VCS/build cruft, but **not** `.gitignore` itself.

5. **Secrets Manager is only read at boot.** After running `terraform apply` (which rotates the secret version) or any manual edit to `corpus-ai/staging`, restart the Railway service to pick up the new values — `bootstrap.ts` does not poll.

---

## Feature completeness

### Done end-to-end

- Cognito email/password + Google SSO + token refresh
- Chatbot CRUD + file upload (multer → S3) + SQS-triggered indexing
- RAG pipeline: parsing, parent-child chunking, contextualisation, embeddings, Pinecone upsert
- Adaptive retrieval (simple / hybrid + rerank / multi-query + RRF / HyDE)
- Chat: REST + SSE streaming + WebSocket; chat history + query log
- Customization (branding) per chatbot
- Lead capture with intent classification + email + Zapier
- Pricing tiers + Stripe checkout + portal + webhook
- Multi-DB connections (MySQL / Postgres / MongoDB / MSSQL) + NL-to-SQL
- AI actions + builtin integrations dashboards
- Embeddable widget (`/api/widget.js`)
- Slack / Telegram / WhatsApp integrations (handled in `lambdaChat`)
- Rate limiter: `express-rate-limit` with `rate-limit-redis` store when `REDIS_URL` is set, in-memory fallback otherwise
- AWS infra fully described in Terraform for both staging and prod — all 14 DynamoDB tables, IAM, S3, SQS, Cognito, SES, Secrets Manager
- AES encryption for stored DB passwords (`DATABASE_ENCRYPTION_KEY`)
- Backend bootstraps secrets from Secrets Manager at boot
- Staging end-to-end: SSO → create chatbot (file upload → S3, build msg → SQS) → delete chatbot (cleans Pinecone namespace, S3 prefix, every DynamoDB row) — verified clean on Railway

### Pending / partial

- **Lambdas not yet deployed to AWS** for staging — uploads land in S3 but never index into Pinecone until `lambdaBuild` is deployed. Chat in production still goes through the backend `/api/chat` proxy.
- **Backend Slack OAuth callback:** stubbed at `apps/backend/src/controllers/integrations.controller.ts:65`. The real flow runs in `lambdaChat/src/handlers/slack-oauth.ts`; remove the backend stub or wire it through.
- **Payment downgrade after grace period:** `apps/backend/src/controllers/payment.controller.ts:208` is a TODO.
- **Email templates:** `apps/backend/src/controllers/access.controller.ts:86` notes multi-language templates are not yet implemented.
- **S3 presigned upload (direct browser → S3):** backend `generatePresignedUploadUrl()` and `chatbotApi.getUploadUrl()` exist but aren't wired into the dashboard upload UI. S3 CORS is already provisioned in Terraform.
- **Redis on Railway:** not provisioned. The rate-limit code path supports Redis (`REDIS_URL` env var); add a Railway-managed Redis and set `REDIS_URL=${{Redis.REDIS_URL}}` when we scale beyond one backend replica.
- **SES still in sandbox** until production access is granted — emails only deliver to verified addresses until then.
- **Commit hygiene:** the staging branch carries a string of `dasdhbaord chatbor createion fail` commits (WIP fixes for an earlier dashboard regression). Squash or rewrite before merging to `main`.

---

## Branching

| Branch | Purpose |
|---|---|
| `main` | Integration / default branch |
| `staging` | Deployed to staging (Vercel + Railway pick up from here) |
| `production` | Deployed to prod |



---

## Key technical decisions (don't undo without a reason)

- **Dynamoose for most tables; ElectroDB for `corpus-main`** — Dynamoose is simple per-table CRUD; ElectroDB gives us access patterns / GSIs / single-table design for the integration/datastore/lead-form combo.
- **Parent-child chunking** — small chunks for retrieval precision, parent chunks for full answer context.
- **Namespace-per-chatbot in Pinecone** — clean tenant isolation.
- **SQS for indexing** — decouples upload from slow processing; built-in retry + DLQ.
- **Backend chat proxy in dev** — same code path as Lambda but no deploy cycle while iterating.
- **JWT in localStorage (not cookies)** — easy cross-subdomain token handoff (website → dashboard) without CORS-cookie complexity.
- **Custom in-memory rate limiter** — keeps backend stateless and avoids Redis until we actually need it.
- **`bootstrap.ts` dynamic import dance** — Secrets Manager must populate `process.env` *before* any module statically imports the Dynamoose models, since those read env vars at import time.

---

## Pointers for future Claude sessions

- **First read:** this file + `ARCHITECTURE.md` for the long-form story.
- **Adding a DynamoDB table:** update `apps/backend/setup-aws-dynamodb.js`, `apps/backend/src/utils/ensure-local-tables.ts`, `apps/backend/.env.example`, `infra/terraform/dynamodb.tf`, `infra/terraform/iam.tf`, `infra/terraform/secrets.tf`, `infra/terraform/outputs.tf`, and the Dynamoose/ElectroDB model in `packages/aws-common`.
- **Adding a backend route:** add controller + routes file + register in `apps/backend/src/index.ts`.
- **Lambda changes:** edit `apps/lambdaBuild` or `apps/lambdaChat`; redeploy with the corresponding `pnpm deploy:*` script.
- **Secrets:** never commit; push via `pnpm secrets:push:staging` / `pnpm secrets:push:production`. Always restart Railway after rotating a Secrets Manager version.
- **Don't bypass the bootstrap:** if you import from `@corpusai/aws-common`, you depend on env being populated first.
- **Changing anything outside `apps/backend/`** that affects the backend image (e.g., `packages/aws-common`, the Dockerfile, `.dockerignore`, root deps): the commit either needs to also touch a file inside `apps/backend/` or Railway's watch paths need to include the changed path — otherwise auto-deploy silently skips. See the "Railway deploy gotchas" section above.
- **Best-effort cleanup style:** the chatbot-delete path in `apps/backend/src/controllers/chatbots.controller.ts:442` wraps every external-system cleanup (Pinecone, S3, Dynamo rows, integrations) in its own try/catch so one failure doesn't block the rest. Helpers it calls in `@corpusai/aws-common` (e.g., `deleteChatbotVectors`) should also swallow their own failures and log diagnostically rather than throw — keeps the orchestrator simple and the user-facing delete always succeeds.
