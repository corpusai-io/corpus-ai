# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

**Package manager: pnpm (>=9.0.0), Node >=18**

```bash
pnpm dev              # Full development (all apps + proxy on port 3000)
pnpm dev:frontend     # Frontend only (website + dashboard + docs + backend + proxy)
pnpm build            # Build all packages
pnpm lint && pnpm lint:fix && pnpm format:fix
pnpm docker:up        # Start all services
pnpm docker:rebuild   # Full rebuild from scratch
```

### Per-app commands (run from app directory or use turbo filters)

| App | Dev Port | Notes |
|-----|----------|-------|
| `apps/backend` | 8001 | `pnpm dev` (tsx watch) |
| `apps/dashboard` | 8080 | `pnpm dev` (Next.js) |
| `apps/website` | 3002 | `pnpm dev` (Next.js) |
| `apps/docs` | 3001 | `pnpm dev` (Next.js + Turbopack) |

### Backend tests
```bash
cd apps/backend
pnpm test              # Debug tests
pnpm test:all          # All suites
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

## Architecture

**Monorepo**: pnpm workspaces + Turborepo. 6 apps, 2 shared packages.

### Routing (Development Proxy on port 3000)

| Path | Target |
|------|--------|
| `/api/*` | Backend (8001) |
| `/dashboard/*` | Dashboard (8080) |
| `/docs/*` | Docs (3001) |
| `/` | Website (3002) |

Production uses Nginx with the same routing (see `docker/default.conf.template`).

### Shared Packages

- **`@corpusai/aws-common`** — DynamoDB models (Dynamoose + ElectroDB), S3, SQS, Pinecone, RAG pipeline, Firecrawl. Consumed by backend and lambdas.
- **`@corpusai/ui`** — shadcn/ui components (Radix UI + Tailwind CSS 4 + CVA). Consumed by dashboard and website. Switch component styles are enforced via CSS in `globals.css` (Tailwind v4 doesn't reliably scan `data-[state=...]` variants from external packages).

### Authentication Flow

1. Website Sign-In page handles login/signup/verification/forgot-password via Cognito
2. On success, redirects to Dashboard with tokens in URL hash: `#auth={idToken, accessToken, refreshToken, user}`
3. Dashboard AuthContext extracts tokens from hash, stores in localStorage
4. Google SSO: Backend → Cognito Hosted UI → Google → callback → dashboard with tokens
5. Token refresh runs proactively every 60s

### Data Flow

- Backend (Express.js) → DynamoDB for CRUD, S3 for files, SQS for async jobs
- SQS triggers `lambdaBuild` for RAG pipeline (chunking → OpenAI embeddings → Pinecone upsert)
- `lambdaChat` handles chat queries, WebSocket, Slack/Telegram/WhatsApp integrations
- Adaptive retrieval: simple → hybrid search + Cohere reranking; complex → multi-query + RRF fusion; vague → HyDE

### Database Models

**Dynamoose** (separate tables): UserModel, ChatbotModel, CustomizationModel, AccessControlModel, QueryLogModel, LeadGenerationModel, ApiKeyModel, DatabaseConnectionModel, ChatHistoryModel

**ElectroDB** (single table `corpus-main`): DataStore, SlackIntegration, TelegramIntegration, WhatsAppIntegration, GoogleDriveIntegration, ZapierIntegration, LeadData, LeadFields

### Key Patterns

- **State management**: Zustand + Immer in dashboard stores
- **API client**: Typed API layer with namespaces in `apps/dashboard/src/lib/api.ts` and `apps/website/src/lib/api.ts`
- **Rate limiting**: auth (5/15min), api (100/15min), chat (20/min), passwordReset (3/hr)
- **S3 structure**: `chatbots/{chatbotId}/{files|raw|processed|index}/`
- **Pinecone**: One namespace per chatbot ID
- **uniqueTimestamp format**: `YYYY-MM-DDTHH:mm:ss#<random>` sort key. Generate: `new Date().toISOString().slice(0, -5) + '#' + randomSuffix`. Parse back: append `'Z'` before `new Date()`.

### Lead Capture System

Configurable triggers capture leads during chat with auto intent classification.

**Triggers**: `gated` (before chat), `after_messages`, `high_intent` (pricing/purchase keywords), `cant_answer`, `exit_intent` (mouseleave/tab switch). Configured per chatbot via `leadFields.triggerConfig`.

**Flow**: Widget evaluates trigger → shows form (popup/inline) → `POST /api/leads/:chatbotId` (public) → backend classifies intent (Hot/Warm/Cold via keyword regex on ChatHistoryModel) → saves lead → emails owner → fires Zapier webhook.

**LeadData attributes**: `sessionId`, `intent` (hot/warm/cold), `status` (new/contacted/converted/archived), `triggerType`, `sourcePage`, `notes`

**Dashboard** (`leads/page.tsx`): analytics (intent/status breakdowns, 30-day chart), table with intent/status badges + filters, lead detail dialog with transcript, trigger configuration UI.

### Pricing Tiers

Tier 0 (Free), 1 (Starter/$19), 2 (Standard/$99), 3 (Business/$399) — controls chat limits, chatbot count, storage, and page limits. Tier checked via `user.tier` field.

### Environment Variables

Key groups: AWS credentials + Cognito config, OpenAI API key, Stripe keys, Pinecone config, Cohere API key, Firecrawl API key, S3 bucket names, SQS queue URLs. See `.env.development` files in each app.

### Lambda Deployments

`apps/lambdaBuild` and `apps/lambdaChat` use Serverless Framework. Deploy with `pnpm deploy:dev` or `pnpm deploy:prod` from the app directory.

### Embeddable Widget

- `widget.js` served at `GET /api/widget.js` — standalone script that creates a chat bubble + iframe pointing to `/dashboard/widget/{chatbotId}?embed=true`
- Widget page (`apps/dashboard/src/app/widget/[chatbotId]/page.tsx`) has two modes: `embed=true` (direct chat, no bubble) for iframe use, standalone (with bubble) for preview
- Public endpoints for widget: `GET /api/chatbots/:id/public`, `GET /api/customize/:chatbotId/public`, `POST /api/chat`, `POST /api/leads/:chatbotId`
- Deploy page (`chatbots/[id]/deploy`) provides embed snippet using `NEXT_PUBLIC_BASE_URL` (defaults to `http://localhost:3000`)

## Future Improvements

- **S3 presigned URL uploads**: Switch from backend-proxy to direct browser → S3. Requires S3 CORS config. Backend `generatePresignedUploadUrl()` and dashboard `chatbotApi.getUploadUrl()` already exist but are unused (S3 bucket lacks CORS).
