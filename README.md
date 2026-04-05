# Corpus AI

> Agentic AI that acts, not just answers. Build AI agents that query databases, take actions, and resolve issues autonomously.

Multi-tenant SaaS platform for building AI-powered RAG chatbots on custom knowledge bases. Create, customize, and deploy intelligent chatbots across multiple channels in minutes.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), Tailwind CSS 4, Zustand, Framer Motion
- **Backend:** Express.js, AWS DynamoDB (Dynamoose + ElectroDB), S3, SQS
- **AI/ML:** OpenAI (GPT-4o, embeddings), Pinecone (vector search), Cohere (reranking)
- **Auth:** AWS Cognito (JWT), Google SSO
- **Infra:** Docker, Nginx, Serverless Framework (Lambda), Railway
- **Monorepo:** pnpm workspaces + Turborepo

## Project Structure

```
corpus-ai/
├── apps/
│   ├── backend/        Express API (port 8001)
│   ├── dashboard/      Next.js dashboard (port 8080)
│   ├── website/        Next.js marketing site (port 3002)
│   ├── docs/           Next.js documentation (port 3001)
│   ├── lambdaBuild/    SQS-triggered RAG pipeline
│   └── lambdaChat/     Chat + WebSocket + integrations
├── packages/
│   ├── aws-common/     DynamoDB models, S3, SQS, Pinecone, Secrets Manager
│   └── ui/             Shared component library (Radix UI + CVA)
├── docker/             Nginx config, Dockerfiles
├── scripts/            Deployment & setup utilities
└── proxy-server.js     Dev proxy (port 3000)
```

## Quick Start

```bash
# Prerequisites: Node >=18, pnpm >=9

pnpm install
pnpm dev              # All apps + proxy on port 3000
```

### Development URLs

| Path | Target |
|------|--------|
| `localhost:3000/` | Website |
| `localhost:3000/dashboard/*` | Dashboard |
| `localhost:3000/docs/*` | Documentation |
| `localhost:3000/api/*` | Backend API |

### Common Commands

```bash
pnpm dev:frontend     # Frontend only (website + dashboard + docs + backend + proxy)
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm docker:up        # Start all services via Docker
```

## Environment Setup

Copy `.env.example` files in each app directory and fill in your credentials:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/lambdaBuild/.env.example apps/lambdaBuild/.env
cp apps/lambdaChat/.env.example apps/lambdaChat/.env
```

For staging/production, secrets are loaded from AWS Secrets Manager at startup. See `CLAUDE.md` for full architecture details.

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Integration branch |
| `staging` | Staging deployment |
| `production` | Production deployment |

## License

Proprietary. All rights reserved.
