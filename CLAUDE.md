# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Build & Development

**pnpm (>=9), Node >=18**

```bash
pnpm dev              # All apps + proxy on port 3000
pnpm build            # Build all packages
pnpm lint:fix && pnpm format:fix
pnpm docker:up        # Start via docker-compose
```

| App | Port | Stack |
|-----|------|-------|
| `apps/backend` | 8001 | Express (tsx watch) |
| `apps/dashboard` | 8080 | Next.js |
| `apps/website` | 3002 | Next.js |
| `apps/docs` | 3001 | Next.js + Turbopack |

Backend tests (from `apps/backend`): `pnpm test`, `pnpm test:all`, `pnpm test:watch`, `pnpm test:coverage`.

## Architecture

**Monorepo**: pnpm workspaces + Turborepo. 6 apps, 2 shared packages.

### Routing (dev proxy port 3000 / prod Nginx)

| Path | Target |
|------|--------|
| `/api/*` | Backend (8001) |
| `/dashboard/*` | Dashboard (8080) |
| `/docs/*` | Docs (3001) |
| `/` | Website (3002) |

Prod routing: `docker/default.conf.template`.

### Shared Packages

- **`@corpusai/aws-common`** — DynamoDB models (Dynamoose + ElectroDB), S3, SQS, Pinecone, RAG pipeline, Firecrawl, Secrets Manager. Used by backend + lambdas.
- **`@corpusai/ui`** — shadcn/ui (Radix + Tailwind v4 + CVA). Switch styles live in `globals.css` (Tailwind v4 doesn't reliably scan `data-[state=...]` variants from external packages).

### Data Flow

- Backend (Express) → DynamoDB (CRUD), S3 (files), SQS (async jobs)
- SQS → `lambdaBuild`: chunk → OpenAI embeddings → Pinecone upsert
- `lambdaChat`: chat queries, WebSocket, Slack/Telegram/WhatsApp
- Adaptive retrieval: simple → hybrid + Cohere rerank; complex → multi-query + RRF; vague → HyDE

### Auth Flow

1. Website Sign-In handles login/signup/verify/forgot-password via Cognito
2. Redirect to Dashboard with tokens in URL hash: `#auth={idToken, accessToken, refreshToken, user}`
3. Dashboard `AuthContext` extracts + stores in localStorage
4. Google SSO: Backend → Cognito Hosted UI → Google → callback → dashboard
5. Token refresh runs every 60s

### Database Models

- **Dynamoose** (separate tables): `UserModel`, `ChatbotModel`, `CustomizationModel`, `AccessControlModel`, `QueryLogModel`, `LeadGenerationModel`, `ApiKeyModel`, `DatabaseConnectionModel`, `ChatHistoryModel`, `AiActionsModel`, `BuiltinIntegrationModel`
- **ElectroDB** (single table `corpus-main`): `DataStore`, `Integrations` (Slack/Telegram/WhatsApp/GoogleDrive/Zapier), `LeadGeneration`
- **Note**: `corpus-ai-actions`, `corpus-builtin-integrations`, `corpus-response-cache` tables exist in `.env.example` and local setup but are **not yet in Terraform** — must be created manually for staging/prod until added to `dynamodb.tf`.

### Key Patterns

- **State**: Zustand (dashboard) — stores in `apps/dashboard/src/stores/`
- **API client**: Typed namespaces in `apps/{dashboard,website}/src/lib/api.ts`
- **Rate limits**: auth 5/15min, api 100/15min, chat 20/min, passwordReset 3/hr
- **S3**: `chatbots/{chatbotId}/{files|raw|processed|index}/`
- **Pinecone**: one namespace per chatbot ID
- **uniqueTimestamp**: `YYYY-MM-DDTHH:mm:ss#<rand>`. Parse: append `'Z'` before `new Date()`.

### Lead Capture

Triggers: `gated`, `after_messages`, `high_intent`, `cant_answer`, `exit_intent` — per chatbot via `leadFields.triggerConfig`.

Flow: widget trigger → form → `POST /api/leads/:chatbotId` → intent classified (hot/warm/cold) → saved → email owner + Zapier webhook.

`LeadData`: `sessionId`, `intent`, `status` (new/contacted/converted/archived), `triggerType`, `sourcePage`, `notes`. Dashboard: `leads/page.tsx`.

### Pricing Tiers

0 Free, 1 Starter, 2 Standard, 3 Business — gates chat limits, chatbot count, storage, page limits. Checked via `user.tier`.

### Embeddable Widget

- `GET /api/widget.js` — script creating bubble + iframe → `/dashboard/widget/{chatbotId}?embed=true`
- Widget page has embed mode (iframe, no bubble) and standalone (preview)
- Public endpoints: `GET /api/chatbots/:id/public`, `GET /api/customize/:chatbotId/public`, `POST /api/chat`, `POST /api/leads/:chatbotId`
- Deploy page uses `NEXT_PUBLIC_APP_URL` (dashboard's own URL)

### Lambda Deployments

`apps/lambdaBuild` and `apps/lambdaChat` use Serverless Framework: `pnpm deploy:dev` / `pnpm deploy:prod`.

## Infrastructure (Terraform)

AWS infra for staging + prod lives in `infra/terraform/` (one config, `environment` var toggles `staging`/`prod`).

- **Region**: `eu-north-1` · **Domain**: `corpusai.io` (DNS external on Spaceship)
- **Resources**: DynamoDB tables, S3 files bucket, SQS + DLQ, Cognito user pool + Google IdP + Hosted UI, SES domain identity, Secrets Manager, IAM backend user
- **Resource naming**: `-staging` / `-prod` suffix via `locals.suffix`
- **State**: local `terraform.tfstate` (sensitive — contains resource IDs)
- **Tfvars**: `staging.tfvars`, `production.tfvars` (hold secrets — do not commit real values)
- **Secrets**: non-AWS keys (OpenAI, Pinecone, Cohere, Firecrawl, DB encryption key, Google OAuth) stored in AWS Secrets Manager at `corpus-ai/{env}`; backend loads at boot
- **Setup refs**: `infra/terraform/STAGING_SETUP.md`, `PRODUCTION_SETUP.md`
- **Push secrets helper**: `scripts/push-secrets.js`

### Environment Variables

Loaded from Secrets Manager in deployed envs; local dev uses `.env.local` per app (copy from `.env.example`). Never commit real credentials.

**Backend** (`apps/backend/.env.local`): AWS creds + region, `AWS_SM_SECRET_NAME` (blank for local, `corpus-ai/staging` or `corpus-ai/production` for deployed), `DYNAMODB_ENDPOINT` (local Docker), 14 `AWS_DYNAMO_*_TABLE` names, S3, SQS, Cognito, URLs (`GOOGLE_SSO_CALLBACK_URL`, `DASHBOARD_URL`, `WEBSITE_URL`, `ALLOWED_ORIGINS`), SES, OpenAI, Pinecone, Cohere, Firecrawl, Stripe, `DATABASE_ENCRYPTION_KEY`, quota arrays, Slack, WhatsApp, Telegram.

**Dashboard** (`apps/dashboard/.env.local`): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_WEBSITE_URL`.

**Website** (`apps/website/.env.local`): `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_DASHBOARD_URL`.

**Deployed URLs** (set in Vercel / docker-compose override):
- Staging: `api-staging.corpusai.io` / `app-staging.corpusai.io` / `staging.corpusai.io`
- Production: `api.corpusai.io` / `app.corpusai.io` / `corpusai.io`

## Future Improvements

- **S3 presigned upload**: direct browser → S3 (backend `generatePresignedUploadUrl()` + `chatbotApi.getUploadUrl()` exist but unused; needs S3 CORS — already provisioned in Terraform for staging).
