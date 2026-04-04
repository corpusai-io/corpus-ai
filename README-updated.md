# Corpus AI

> A multi-tenant SaaS platform for building AI-powered RAG (Retrieval-Augmented Generation) chatbots on custom knowledge bases. Create, customize, and deploy intelligent chatbots across multiple channels in minutes.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Applications](#applications)
  - [Backend API](#backend-api)
  - [Dashboard](#dashboard)
  - [Website](#website)
  - [Documentation Portal](#documentation-portal)
  - [Lambda Build Service](#lambda-build-service)
  - [Lambda Chat Service](#lambda-chat-service)
- [Shared Packages](#shared-packages)
  - [aws-common](#aws-common)
  - [UI Component Library](#ui-component-library)
- [Data Models](#data-models)
- [RAG Pipeline](#rag-pipeline)
- [Authentication Flow](#authentication-flow)
- [Payment & Billing](#payment--billing)
- [API Reference](#api-reference)
- [Integrations](#integrations)
- [Infrastructure](#infrastructure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Docker Setup](#docker-setup)
- [Testing](#testing)
- [Deployment](#deployment)
- [Current Project Status](#current-project-status)
- [Incomplete & Missing Features](#incomplete--missing-features)

---

## Overview

Corpus AI enables businesses to create AI chatbots trained on their own data (documents, websites, databases) and deploy them across multiple channels including web widgets, Slack, Telegram, WhatsApp, and more. The platform provides:

- **Knowledge Base Building** - Upload PDFs, DOCX, CSV, XLSX, crawl websites (via Firecrawl), or connect databases to create a searchable knowledge base
- **RAG-Powered Chat** - Retrieval-Augmented Generation using OpenAI + Pinecone with adaptive retrieval strategies for accurate, source-cited answers
- **Multi-Channel Deployment** - Deploy chatbots as website widgets, Slack bots, Telegram bots, WhatsApp integrations, or via REST/WebSocket APIs
- **Customization** - Full control over chatbot appearance, behavior, system prompts, and LLM model selection
- **Analytics & Leads** - Track conversations, collect user feedback, capture leads, and export data as CSV
- **Multi-Tenant SaaS** - Tiered pricing (Free, Starter, Standard, Business) with quota enforcement and Stripe billing
- **Database Connections** - Connect PostgreSQL, MySQL, MongoDB, MSSQL databases to chatbots
- **AI Actions** - Configurable button actions, form actions, and built-in integrations

---

## Architecture

```
                                    +------------------+
                                    |   Nginx Proxy    |
                                    |    (Port 80)     |
                                    +--------+---------+
                                             |
                    +------------------------+------------------------+
                    |            |            |                        |
              /api/*        /dashboard   /docs                    /
                    |            |            |                        |
           +-------v------+ +---v------+ +---v------+  +----------v---------+
           |   Backend    | | Dashboard| |   Docs   |  |     Website        |
           |  Express.js  | | Next.js  | | Next.js  |  |     Next.js        |
           |  (Port 8001) | | (P:8080) | | (P:3001) |  |    (Port 3002)     |
           +------+-------+ +----------+ +----------+  +--------------------+
                  |
      +-----------+-----------+-------------------+
      |           |           |                   |
+-----v----+ +---v-----+ +---v------+   +--------v--------+
| DynamoDB  | |   S3    | |   SQS   |   | AWS Cognito     |
| (12 Tables)| | (Files) | | (Queue) |   | (Auth + SSO)    |
+-----+-----+ +---------+ +----+----+   +-----------------+
      |                        |
      |                   +----v-----------+
      |                   | Lambda Build   |
      |                   | (RAG Pipeline) |
      |                   | 7-Step Process |
      |                   +----+-----------+
      |                        |
      |                   +----v-----------+
      +-------------------| Pinecone       |
                          | (Vector DB)    |
                          | 3072 dims      |
                          +----+-----------+
                               |
                          +----v-----------+
                          | Lambda Chat    |
                          | 9 Functions    |
                          | REST+WS+Integ |
                          +----------------+
```

### Request Flow

1. **User uploads documents** via Dashboard -> Backend stores files in S3 -> SQS message triggers Lambda Build
2. **Lambda Build** processes documents (PDF/DOCX/CSV/XLSX/URL) -> parent-child chunking -> contextual enrichment via GPT-4o-mini -> generates embeddings via OpenAI text-embedding-3-large -> indexes vectors in Pinecone (namespace per chatbot)
3. **User asks a question** via widget/Slack/Telegram/WhatsApp/API -> Lambda Chat classifies query complexity -> adaptive retrieval (hybrid/multi-query/HyDE) from Pinecone -> Cohere reranking -> OpenAI generates answer with context -> response returned with citations
4. **Stripe webhooks** handle subscription lifecycle -> Backend updates user tier in DynamoDB

### Data Flow Between Services

```
Website (Sign-In) ──tokens via URL hash──> Dashboard (AuthContext)
                                               │
                                          Bearer Token
                                               │
                                          Backend API
                                          ┌────┴────┐
                                     Cognito    DynamoDB
                                     (verify)   (CRUD)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15.4 (canary), React 19, TypeScript 5, Tailwind CSS 4 |
| **State Management** | Zustand + Immer (with localStorage persistence) |
| **UI Components** | Radix UI primitives, shadcn/ui pattern, Lucide icons, CVA variants |
| **Animations** | Framer Motion, AOS (Animate on Scroll), CSS keyframes |
| **Backend API** | Express.js 4.18, TypeScript, Node.js 20+ |
| **Authentication** | AWS Cognito (User Pool, JWT tokens, Google SSO via Hosted UI) |
| **Database** | AWS DynamoDB (Dynamoose ORM + ElectroDB single-table design) |
| **File Storage** | AWS S3 (presigned URLs for direct upload) |
| **Message Queue** | AWS SQS |
| **Vector Database** | Pinecone (cosine similarity, 3072 dimensions, namespace isolation per chatbot) |
| **AI/LLM** | OpenAI GPT-4o-mini (configurable), text-embedding-3-large (3072d) |
| **Reranking** | Cohere Rerank v3.5 API (~$2/1000 searches, with keyword fallback) |
| **Web Scraping** | Firecrawl (JS rendering, multi-page crawl) with Cheerio fallback |
| **Document Processing** | pdf-parse + pdfjs-dist (PDF), mammoth (DOCX), xlsx (Excel), csv-parse (CSV) |
| **Payments** | Stripe (Checkout, Customer Portal, Webhooks with signature verification) |
| **Serverless** | AWS Lambda (via Serverless Framework) |
| **Monorepo** | pnpm 9.1.4 workspaces + Turborepo 2.5.3 |
| **Containerization** | Docker + Docker Compose + Nginx reverse proxy |
| **Rate Limiting** | In-memory (REST API: auth/api/chat/passwordReset presets) + DynamoDB (WebSocket: 10 msgs/min) |

---

## Monorepo Structure

```
corpus-ai/
├── apps/
│   ├── backend/             # Express.js REST API (port 8001)
│   │   ├── src/
│   │   │   ├── controllers/ # 13 controllers (auth, chatbots, chat, access, customize, datastore,
│   │   │   │                #   database, integrations, leads, payment, querylog, quota, user)
│   │   │   ├── routes/      # 12 route files
│   │   │   ├── middleware/   # Auth, validation, rate limiting
│   │   │   ├── services/    # Database connection service
│   │   │   ├── utils/       # Error handling, encryption
│   │   │   ├── config/      # Pricing plans
│   │   │   ├── __tests__/   # Jest test suites (5 files)
│   │   │   └── index.ts     # Server entry point
│   │   └── package.json
│   ├── dashboard/           # Next.js admin dashboard (port 8080)
│   │   ├── src/
│   │   │   ├── app/         # 19 pages (chatbot CRUD, settings, analytics, billing, widget)
│   │   │   ├── components/  # DashboardShell, Sidebar, Header, UserDropdown, Widget components
│   │   │   ├── contexts/    # AuthContext (token management, cross-domain handoff)
│   │   │   ├── stores/      # 3 Zustand stores (chatbot, preview, data)
│   │   │   └── lib/         # API layer (12 API namespaces, 661 lines)
│   │   └── package.json
│   ├── website/             # Next.js marketing site (port 3002)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (main)/  # 23+ marketing pages (pricing, platform, solutions, integrations)
│   │   │   │   ├── (auth)/  # Sign-In page (login/signup/verify/forgot-password + Google SSO)
│   │   │   │   └── components/ # 23 reusable components (navbar, footer, pricing, FAQ, etc.)
│   │   │   └── lib/         # Auth API layer (7 methods)
│   │   └── package.json
│   ├── docs/                # Next.js documentation portal (port 3001)
│   │   ├── src/
│   │   │   └── app/         # Documentation pages with dark mode support
│   │   └── package.json
│   ├── lambdaBuild/         # AWS Lambda - RAG build pipeline
│   │   ├── src/
│   │   │   └── index.ts     # SQS handler, 7-step build process
│   │   └── serverless.yml   # SQS trigger, 15min timeout, 2048MB
│   └── lambdaChat/          # AWS Lambda - Chat engine + integrations
│       ├── src/
│       │   ├── handlers/    # 9 handlers (REST, WebSocket x4, Telegram, WhatsApp, Slack x2)
│       │   └── common/      # Types, session mgmt, WS utils, auth
│       └── serverless.yml   # HTTP + WebSocket + webhook triggers
├── packages/
│   ├── aws-common/          # Shared AWS utilities, DynamoDB models, RAG pipeline
│   │   ├── src/
│   │   │   ├── dynamo-models/ # 12 models (9 Dynamoose + 3 ElectroDB entity files)
│   │   │   ├── rag/         # 7 modules (chunking, embeddings, retrieval, reranker,
│   │   │   │                #   query-processor, document-processor, response-cache)
│   │   │   ├── pinecone/    # Vector DB with retry logic, RRF, namespace isolation
│   │   │   ├── s3/          # File operations with presigned URLs
│   │   │   ├── sqs/         # Build queue messaging
│   │   │   ├── firecrawl/   # Web scraping with timeout retry
│   │   │   └── utils/       # Env helper, timestamps, plan mapping
│   │   └── package.json
│   └── ui/                  # Shared React UI component library (@corpusai/ui)
│       ├── src/
│       │   ├── components/  # 22 shadcn/ui components (Button, Dialog, DataTable, Toast, etc.)
│       │   ├── lib/         # cn() utility (clsx + tailwind-merge)
│       │   └── index.tsx    # All exports
│       └── package.json
├── docker/
│   ├── Dockerfile.backend   # Multi-stage Node.js build
│   ├── Dockerfile.dashboard # Multi-stage Next.js standalone
│   ├── Dockerfile.website   # Multi-stage Next.js standalone
│   ├── Dockerfile.docs      # Multi-stage Next.js standalone
│   ├── Dockerfile.proxy     # Nginx Alpine
│   └── default.conf.template # Nginx routing rules
├── proxy-server.js          # Node.js development proxy (Express + http-proxy-middleware)
├── docker-compose.yaml      # 6 services + DynamoDB Local
├── turbo.json               # Turborepo pipeline config
├── pnpm-workspace.yaml      # Workspace: apps/* + packages/*
├── tsconfig.json            # Root TypeScript config (ES2020, strict, bundler resolution)
└── package.json             # Root scripts (dev, build, docker, lint, format)
```

---

## Applications

### Backend API

**Location**: `apps/backend/` | **Port**: 8001 | **Framework**: Express.js + TypeScript

The core REST API server handling all business logic, authentication, CRUD operations, file uploads, and webhook processing.

#### Middleware Chain

```
Request -> CORS -> Stripe Webhook (raw body) -> JSON Parser -> Multer (10MB) -> Rate Limiter -> Auth -> Validation -> Controller -> Response -> Error Handler
```

#### Key Middleware

| Middleware | File | Purpose |
|-----------|------|---------|
| `authenticateToken` | auth.middleware.ts | Validates Cognito JWT via GetUserCommand, attaches `req.user` with `{username, email, tier}` |
| `optionalAuth` | auth.middleware.ts | Same as above but allows unauthenticated requests |
| `requireTier(n)` | auth.middleware.ts | Enforces minimum subscription tier (returns 403) |
| `requireOwnership(field)` | auth.middleware.ts | Verifies resource ownership via username match |
| `sanitizeBody` | validation.middleware.ts | Removes HTML/XSS payloads from request body |
| `preventSqlInjection` | validation.middleware.ts | Pattern-matches SQL keywords in body/query params |
| `preventXss` | validation.middleware.ts | Blocks script tags, iframes, event handlers |
| `validateBodyLimits({field: maxLen})` | validation.middleware.ts | Enforces max string lengths per field |
| `rateLimit(preset)` | rateLimit.middleware.ts | In-memory rate limiting with 4 presets |

#### Rate Limiting Presets

| Preset | Limit | Window | Use Case |
|--------|-------|--------|----------|
| `auth` | 5 requests | 15 minutes | Login, registration |
| `api` | 100 requests | 15 minutes | General API calls |
| `chat` | 20 messages | 1 minute | Chat endpoints |
| `passwordReset` | 3 requests | 1 hour | Password recovery |

#### Controllers (13 Total)

| Controller | File | Endpoints | Key Functions |
|-----------|------|-----------|---------------|
| **Auth** | auth.controller.ts | 10 endpoints | register, login, logout, verify, confirmSignUp, forgotPassword, confirmForgotPassword, googleSSO, googleSSOCallback, getCurrentUser |
| **Chatbots** | chatbots.controller.ts | 11 endpoints | CRUD, rebuild, status/stream (SSE), uploadUrl, startBuild, localBuild, activate, 11-resource cascade delete |
| **Chat** | chat.controller.ts | 4 endpoints | chatProxy (local dev), getChatHistory, clearChatHistory, updateChatFeedback |
| **Access** | access.controller.ts | 8 endpoints | listAccess, grant, revoke, setMode, generateApiKey (PBKDF2), listApiKeys, deleteApiKey, validateApiKey |
| **Customize** | customize.controller.ts | 4 endpoints | get, update (flattened type/value pairs), updateTheme, updateSystemPrompt |
| **Datastore** | datastore.controller.ts | 6 endpoints | list, add, update, delete, batchAdd, batchDelete (with Pinecone cleanup) |
| **Database** | database.controller.ts | 5 endpoints | testConnection, fetchTables, saveConnection (encrypted), getConnections, deleteConnection |
| **Integrations** | integrations.controller.ts | 11 endpoints | Slack, Telegram, WhatsApp, Zapier, Google Drive connect/disconnect |
| **Leads** | leads.controller.ts | 5 endpoints | list (search+date filter), add (public), exportCSV, getFields, updateFields |
| **Payment** | payment.controller.ts | 6 endpoints | webhook (5 event types), plans, checkout, portal, subscription, cancel |
| **QueryLog** | querylog.controller.ts | 5 endpoints | getLogs, search (full-text), recordFeedback (thumb), exportCSV, analytics |
| **Quota** | quota.controller.ts | 4 endpoints | getUserQuota, checkChatbotQuota, getUsageStats, getAvailableTiers |
| **User** | user.controller.ts | 5 endpoints | getProfile, updateProfile, changePassword (Cognito), deleteAccount (cascade), getStats |

#### Error Handling

All errors use a standardized `AppError` class:

```json
{
  "error": true,
  "code": "QUOTA_EXCEEDED",
  "message": "Human-readable message",
  "details": {}
}
```

Error codes: `AUTH_REQUIRED`, `INVALID_TOKEN`, `ACCESS_DENIED`, `NOT_FOUND`, `VALIDATION_ERROR`, `QUOTA_EXCEEDED`, `INTERNAL_ERROR`, `STRIPE_NOT_CONFIGURED`, `DUPLICATE`, `RATE_LIMITED`

#### Chatbot Deletion Cleanup (11 Resources)

When a chatbot is deleted via `DELETE /api/chatbots/:id`, the following resources are cleaned up in parallel:

| # | Resource | Method |
|---|----------|--------|
| 1 | Pinecone vectors | Delete entire namespace (`chatbotId`) |
| 2 | S3 files | Delete all files under `chatbots/{chatbotId}/` |
| 3 | Customization records | Query + delete all by `chatbotId` |
| 4 | Query logs | Query + delete all by `chatbotId` |
| 5 | Lead generation records | Query + delete (Dynamoose + ElectroDB) |
| 6 | Access control records | Query + delete all by `chatbotId` |
| 7 | Data store records | Query + delete all by `username + chatbotId` |
| 8 | API keys | Query + delete all by `chatbotId` |
| 9 | Database connections | Query via GSI + delete by `id` |
| 10 | Chat history | Query + delete all by `chatbotId` |
| 11 | Integration records | Delete Slack, Zapier, Telegram, WhatsApp, Google Drive |

---

### Dashboard

**Location**: `apps/dashboard/` | **Port**: 8080 (dev) / 3004 (prod) | **Framework**: Next.js 15.4

The authenticated admin interface where users manage their chatbots, data sources, settings, analytics, and billing.

#### Route Map (19 Pages)

| Route | Purpose |
|-------|---------|
| `/` | Auth check -> redirect to chatbots or website sign-in |
| `/chatbots` | List all chatbots with search, filter, status badges, delete |
| `/chatbots/create` | 4-step wizard: name/language -> source type -> source config -> review/create |
| `/chatbots/[id]/chat` | Chat interface with markdown rendering, clickable citations, suggested questions, feedback |
| `/chatbots/[id]/analytics` | Query logs table, thumbs up/down metrics, daily volume bar chart (7/30/90d), CSV export |
| `/chatbots/[id]/datastores` | Manage data sources (URLs, files, text), rebuild index |
| `/chatbots/[id]/leads` | View captured leads, configure form fields (name/email/phone/company toggles), CSV export |
| `/chatbots/[id]/deploy` | Embed code, WordPress, Slack, Telegram, WhatsApp, Shopify (coming soon) |
| `/chatbots/[id]/settings` | Name, description, language, danger zone (delete with confirmation) |
| `/chatbots/[id]/settings/customization` | Theme colors (primary/secondary/accent), welcome message, system prompt, LLM model, avatar |
| `/chatbots/[id]/settings/api-keys` | Generate, list, delete API keys |
| `/chatbots/[id]/settings/security` | Access modes (public/private/whitelist), email whitelist management |
| `/chatbots/[id]/settings/integrations` | Connect/disconnect Slack, Telegram, WhatsApp, Zapier |
| `/chatbots/[id]/tools/databases` | 4-step wizard: select DB type -> credentials -> test/select tables -> save |
| `/chatbots/[id]/tools/ai-actions` | Button actions, form actions, built-in integrations (Zendesk, Google Calendar, Stripe, HubSpot) |
| `/settings/billing` | Plans comparison, usage quotas with progress bars, upgrade/downgrade, Stripe portal |
| `/widget/[chatbotId]` | Public embeddable chat widget (bypasses auth) with lead capture form |

#### State Management (Zustand + Immer)

| Store | Purpose | Persisted |
|-------|---------|-----------|
| `chatbot-store` | Selected chatbot, chatbot list, loading/error state | `selectedChatbot` only (localStorage) |
| `data-store` | Data records per chatbot (`recordsByChatbot` map), loading state | No |
| `preview-store` | Live customization preview config (colors, prompt, model, avatar) | No |

#### Authentication (AuthContext)

- Uses `AuthProvider` wrapping the entire app in `layout.tsx`
- **Cross-domain token handoff**: Parses URL hash `#auth={encodedJSON}` from website sign-in redirect
- **Dual initialization**: Shows cached user immediately, fetches fresh data from `/api/auth/me` in background
- **Token storage**: `idToken`, `accessToken`, `refreshToken`, `user` in localStorage
- **Auto-login**: After registration, automatically logs in and redirects
- **Protected routes**: Redirects to website sign-in if unauthenticated
- **Widget bypass**: Routes under `/widget/` skip authentication entirely

#### API Layer (12 Namespaces)

`apps/dashboard/src/lib/api.ts` (661 lines) provides typed API clients:

| Namespace | Methods | Key Operations |
|-----------|---------|----------------|
| `authApi` | 7 | register, login, logout, getCurrentUser, verifyToken, isAuthenticated, getStoredUser |
| `chatbotApi` | 9 | list, get, create, update, delete, getUploadUrl, startBuild, getStatus, rebuild |
| `customizeApi` | 2 | get, update |
| `dataStoreApi` | 3 | list, add, delete |
| `leadsApi` | 4 | list, export (CSV Blob), getFields, updateFields |
| `queryLogApi` | 3 | list, analytics, export (CSV Blob) |
| `quotaApi` | 2 | get, getTiers |
| `paymentApi` | 5 | getPlans, createCheckout, createPortalSession, getSubscription, cancel |
| `integrationsApi` | 10 | Slack/Google Drive/Telegram/WhatsApp/Zapier connect+disconnect |
| `accessControlApi` | 7 | list, grant, revoke, updateMode, generateApiKey, listApiKeys, deleteApiKey |
| `chatHistoryApi` | 3 | getHistory, clearHistory, updateFeedback |
| `databaseApi` | 5 | testConnection, fetchTables, saveConnection, getConnections, deleteConnection |

#### Component Architecture

| Component | Purpose |
|-----------|---------|
| `DashboardShell` | Responsive layout wrapper with desktop sidebar + mobile drawer |
| `Sidebar` | 240px fixed sidebar with workspace nav, chatbot sub-nav, quota progress bars, upgrade CTA |
| `Header` | Sticky 56px header with mobile menu, plan badge, docs link, user avatar dropdown |
| `UserDropdown` | User email/name, account settings link, logout button |
| `ChatWidget` | Embeddable chat container for widget page |
| `WidgetChat` | Chat interface component for widget |
| `LeadCaptureForm` | Lead collection form for widget |

#### Design System

- **Brand color**: `#BF56FF` (purple)
- **Gradient**: `#FC5990` -> `#AC5DE6` (pink to purple)
- **Font**: Geist Sans (primary), Geist Mono (code)
- **Component library**: `@corpusai/ui` (shared workspace package)
- **Light mode only** (no dark mode in dashboard)

---

### Website

**Location**: `apps/website/` | **Port**: 3002 (dev) / 3002 (prod) | **Framework**: Next.js 15.4

The public-facing marketing and landing site showcasing the platform's features, pricing, integrations, and solutions.

#### Route Map (23+ Pages)

| Route | Purpose |
|-------|---------|
| `/` | Homepage: hero + animated gradient, live demo, company logos, features, integrations, pricing, blog, FAQ, testimonials, CTA |
| `/Sign-In` | Full auth flow: login, signup, email verification, forgot password, Google SSO |
| `/Pricing` | Tiered pricing plans with monthly/yearly toggle |
| `/demo` | Calendly embed for scheduling 30-minute consultation |
| `/Platform/Corpus-ChatPage` | Core chatbot product page |
| `/Platform/B2B-ChatBot` | B2B chatbot use case |
| `/Platform/Chat-With-PDF-Page` | PDF chat feature showcase |
| `/Platform/ChatBot-On-WebPage` | Website widget feature |
| `/Platform/CustomerCare-Page` | Customer support automation |
| `/Platform/Chat-With-Bot-Page` | General chatbot feature |
| `/Integrations/Slack` | Slack integration guide |
| `/Integrations/Telegram` | Telegram bot setup |
| `/Integrations/Whatsapp` | WhatsApp integration |
| `/Integrations/Wordpress` | WordPress plugin |
| `/Integrations/Zapier` | Zapier automation |
| `/Solution/Education` | Education sector solution |
| `/Solution/Healthcare` | Healthcare sector solution |
| `/Solution/Legal` | Legal sector solution |
| `/Solution/Government` | Government sector solution |
| `/Solution/Workplace` | Workplace/HR sector solution |
| `/Resources/Blog` | Blog listing |
| `/Affiliates` | Affiliate program |
| `/legal/privacy` | Privacy policy |
| `/legal/terms` | Terms of service |

#### Sign-In Page Features

- **Login**: Email + password with Cognito `USER_PASSWORD_AUTH`
- **Signup**: Full name + email + password + confirm password with real-time validation
- **Password rules**: 8+ chars, uppercase, lowercase, number, special character (matches Cognito policy)
- **Email verification**: 6-digit code sent to email, auto-redirects to login after confirmation
- **Forgot password**: 2-step flow (enter email -> enter code + new password)
- **Google SSO**: Redirects to backend `/api/auth/google` which initiates Cognito Hosted UI flow
- **Token handoff**: On successful login, redirects to `{DASHBOARD_URL}#auth={encodedTokens}`

#### Shared Components (23)

Navigation: `Navbar` (614 lines, mega dropdown menus), `Footer` (social links, legal links)
Sections: `FeaturesSection`, `FAQsection`, `SolutionFAQ`, `Pricingg` (4-tier plans with toggle)
Cards: `FeatureCard`, `PricingCard`, `B2BFeatureCard`, `B2BReasonCard`, `EducationFeatureCard`
UI: `Loader`, `LogoSlider`, `Toggle`, `HeroLeftSide`, `HeroRightSide`
Blog: `ChatBotBlog`, `websiteFAQ`
Testimonials: `testimonalsSlider`, `testimonalsSliders`

#### Animations

- **Framer Motion**: Complex page transitions and interactive animations
- **AOS**: Scroll-triggered animations on marketing sections
- **CSS Keyframes**: Floating background blobs, blinking logos, SVG stroke animations, FAQ collapse transitions

---

### Documentation Portal

**Location**: `apps/docs/` | **Port**: 3001 (dev) / 3003 (prod) | **Framework**: Next.js 15.4 | **Base Path**: `/docs`

User-facing documentation built with React components (not MDX):

- **Chatbot Creation**: Website chatbot setup, file-based chatbot creation
- **Integrations**: Telegram, Slack setup guides
- **Features**: Access settings, FAQ
- **Administration**: Plan upgrades
- **Dark mode support**: Context-based theme toggle (`useTheme()` hook)
- **Layout**: Responsive two-column with sidebar navigation, "On this page" sections

---

### Lambda Build Service

**Location**: `apps/lambdaBuild/` | **Runtime**: Node.js 20 | **Trigger**: SQS | **Timeout**: 900s (15 min) | **Memory**: 2048 MB

Processes chatbot build jobs asynchronously via SQS. Implements the enhanced RAG indexing pipeline with parent-child chunking.

#### SQS Message Format

```json
{
  "chatbotId": "bot-abc123",
  "username": "user@example.com",
  "type": "files | web | rebuild",
  "origin": "https://example.com | files",
  "files": ["chatbots/bot-abc123/raw/doc.pdf"],
  "language": "en",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 7-Step Build Pipeline

```
Step 1: Initialize
  └─ Fetch chatbot from DynamoDB, validate existence, look up user tier

Step 2: Download/Collect Documents
  └─ Web: Firecrawl scrape/crawl (tier-based page limits: 10/100/500/2000)
  └─ Files: Download from S3
  └─ Text: Inline content

Step 3: Document Processing
  ├─ PDF: pdfjs-dist with per-page extraction + GPT-4o Vision for charts/tables
  ├─ DOCX: mammoth library
  ├─ CSV: csv-parse
  ├─ XLSX: xlsx library
  ├─ URL: Firecrawl or Cheerio fallback
  └─ Text: Direct processing

Step 4: Parent-Child Chunking
  ├─ Parent chunks: 2000 chars, 200 overlap (LLM context)
  ├─ Child chunks: 400 chars, 50 overlap (search/embedding)
  └─ Children reference parents via parentChunkId

Step 5: Contextual Enrichment (~$0.02/100 chunks)
  └─ GPT-4o-mini adds 1-2 sentence context prefix to each child chunk
  └─ Reduces failed retrievals by ~49% (Anthropic research)
  └─ Batch processing (10 at a time), graceful fallback on failure

Step 6: Embeddings + Vector Storage
  ├─ Model: text-embedding-3-large (3072 dimensions)
  ├─ Batch: 100 texts per API call
  ├─ Pinecone upsert with 40KB metadata limit enforcement
  ├─ Namespace: chatbotId (tenant isolation)
  └─ Metadata: text (parent), childText (child), chatbotId, source, pageNumber

Step 7: Completion
  └─ Update chatbot status: BUILDING -> ACTIVE
  └─ Update all dataStore records to "active"
```

#### Error Handling

- Sets chatbot status to `ERROR` with `errorStep` and `errorMessage`
- Updates dataStore records to "error" status
- Continues processing other SQS records even on individual failure

---

### Lambda Chat Service

**Location**: `apps/lambdaChat/` | **Runtime**: Node.js 20

Consolidated Lambda service handling real-time chat queries and third-party integrations. Contains 9 Lambda functions.

#### Functions

| Function | Trigger | Timeout | Memory | Purpose |
|----------|---------|---------|--------|---------|
| `restChat` | HTTP POST `/chat`, `/chat/stream` | 30s | 1024MB | REST chat (sync JSON + SSE streaming) |
| `wsConnect` | WebSocket `$connect` | 10s | 512MB | Auth (Cognito/API key/anon), create connection record with 2hr TTL |
| `wsDisconnect` | WebSocket `$disconnect` | 10s | 512MB | Clean up connection record |
| `wsMessage` | WebSocket `$default` | 30s | 512MB | Route messages, rate limiting (10/min), ping/pong |
| `wsChat` | WebSocket `chat` route | 300s | 1024MB | Stream responses token-by-token with session history |
| `telegramWebhook` | HTTP POST `/telegram/webhook` | 60s | 512MB | Handle Telegram bot messages with typing indicator |
| `whatsappWebhook` | HTTP GET/POST `/whatsapp/webhook` | 60s | 512MB | WhatsApp verification + message handling |
| `slackEvents` | HTTP POST `/slack/*` | 300s | 1024MB | Bolt framework: mentions, /corpus command, feedback buttons |
| `slackOAuth` | HTTP GET `/slack/oauth` | 30s | 512MB | Slack OAuth callback, workspace token storage |

#### Query Processing Pipeline

```
Input (REST/WebSocket/Slack/Telegram/WhatsApp)
    -> Validate chatbotId + query (max 5000 chars)
    -> Check response cache (SHA-256 key, 1hr TTL)
    -> Classify query complexity (simple/complex/vague)
    -> RAG Retrieval (adaptive strategy):
       - Simple: hybrid dense search + Cohere reranking
       - Complex: multi-query (3 LLM variations + RRF fusion)
       - Vague: HyDE (hypothetical document embedding)
    -> Diversity filter (Jaccard 0.75 threshold)
    -> Load per-chatbot LLM model + system prompt from customization table
    -> Assemble messages: system prompt + conversation history + RAG context + query
    -> OpenAI inference (streaming or one-shot, default temperature 0.7)
    -> Fire-and-forget: Log query + answer to QueryLog, save chat history, update cache
    -> Increment user chat_usage
    -> Return answer + citations + metadata
```

#### WebSocket Protocol

| Message Type | Direction | Purpose |
|-------------|-----------|---------|
| `ping` | Client -> Server | Heartbeat, returns remaining rate limit |
| `chat` | Client -> Server | Send query with chatbotId |
| `ready` | Server -> Client | Query processing started |
| `chunk` | Server -> Client | Streaming token (with chunkIndex) |
| `citations` | Server -> Client | Source citations array |
| `complete` | Server -> Client | Response finished |
| `error` | Server -> Client | Error with code and message |

#### Error Recovery

- **Stale connections**: 410 (Gone) errors trigger automatic DynamoDB cleanup
- **Rate limit failures**: Graceful fallthrough (allows message on check failure)
- **Connection TTL**: 7200 seconds (2 hours) automatic expiry

---

## Shared Packages

### aws-common

**Location**: `packages/aws-common/` | **Package**: `@corpusai/aws-common`

The backbone shared library providing all AWS integrations, DynamoDB models, and the complete RAG pipeline. Consumed by backend, Lambda Build, and Lambda Chat.

#### DynamoDB Models (12 Total)

**Dynamoose Models (9):**

| Model | Table | Hash Key | Sort Key | GSI | Purpose |
|-------|-------|----------|----------|-----|---------|
| `UserModel` | corpus-users | `username` (email) | `customer` | customer-index | Accounts, tiers, quotas |
| `ChatbotModel` | corpus-chatbots | `chatbotId` | - | username-index | Chatbot metadata, build status |
| `CustomizationModel` | corpus-customizations | `chatbotId` | `id` (UUID) | - | Theme, prompt, model per chatbot |
| `AccessControlModel` | corpus-access-control | `chatbotId` | `email` | email-index | Whitelist access grants |
| `QueryLogModel` | corpus-query-logs | `passageIndex` | `uniqueTimestamp` | sessionId-index | Chat history, feedback |
| `LeadGenerationModel` | corpus-leads | `chatbotId` | `uniqueTimestamp` | - | Lead data |
| `ApiKeyModel` | corpus-api-keys | `chatbotId` | `keyId` | - | Hashed API keys (PBKDF2) |
| `DatabaseConnectionModel` | corpus-db-connections | `id` | - | chatbotId-index | External DB credentials |
| `ChatHistoryModel` | corpus-chat-history | `chatbotId` | `messageId` | username-chatbotId-index | Per-chatbot chat messages |

**ElectroDB Entities (Single-Table Design):**

| Entity | Table | PK Composite | SK Composite | GSIs | Purpose |
|--------|-------|-------------|-------------|------|---------|
| `DataStore` | corpus-main | `username#chatbotId` | `dataSource` | chatbotId-index | File/URL inventory |
| `SlackIntegration` | corpus-integrations | `chatbotId` | - | byWorkspaceId | Slack workspace tokens |
| `ZapierIntegration` | corpus-integrations | `chatbotId` | `hookType` | - | Webhook subscriptions |
| `GoogleDriveIntegration` | corpus-integrations | `chatbotId` | `chatbotId` | - | Drive connections |
| `GoogleDriveRefreshToken` | corpus-integrations | `googleProfileId` | `googleProfileId` | byUsername | OAuth refresh tokens |
| `TelegramIntegration` | corpus-integrations | `chatbotId` | `chatbotId` | byBotId | Bot tokens |
| `WhatsAppIntegration` | corpus-integrations | `chatbotId` | `phoneNumberId` | byPhoneNumberId, byVerificationToken | WhatsApp Business |
| `LeadData` | corpus-leads | `chatbotId` | `dataId` | byChatbotId | Lead submissions |
| `LeadFields` | corpus-leads | `chatbotId` | `fieldsId` | - | Form field config |

#### RAG Pipeline Modules

| Module | File | Key Exports |
|--------|------|-------------|
| **Chunking** | rag/chunking.ts (449 lines) | `createParentChildChunks`, `contextualizeChunks`, `chunkText`, `chunkBySentences`, `chunkBySize`, `mergeSmallChunks`, `attachAnnotationsToChunks` |
| **Documents** | rag/document-processor.ts (~500 lines) | `processPDF` (with Vision), `processDOCX`, `processCSV`, `processXLSX`, `processURL`, `processPlainText`, `crawlWebsite`, `detectFileType` |
| **Embeddings** | rag/embeddings.ts (125 lines) | `generateEmbedding`, `generateEmbeddings` (batch 100), `getEmbeddingDimension`, `isValidEmbeddingModel` |
| **Retrieval** | rag/retrieval.ts (~400 lines) | `retrievePassages`, `hybridRetrievePassages`, `multiQueryRetrieve`, `hydeRetrieve`, `buildRAGPrompt`, `extractCitations`, `rerankPassages`, `getDiversePassages` |
| **Reranking** | rag/reranker.ts (137 lines) | `cohereRerank` (Cohere v3.5, ~$2/1000 searches), `keywordRerank` (heuristic fallback) |
| **Query Processor** | rag/query-processor.ts (~400 lines) | `processQuery` (unified pipeline), `fireAndForget`, `flushPendingWrites` (Lambda safety) |
| **Response Cache** | rag/response-cache.ts (153 lines) | `getCachedResponse`, `setCachedResponse`, `clearChatbotCache` (SHA-256 keyed, configurable TTL) |

#### Pinecone Vector DB

| Function | Purpose |
|----------|---------|
| `getPineconeClient()` | Lazy-load Pinecone client |
| `getOrCreateIndex(name, dim?)` | Get or create index with caching |
| `warmPineconeConnection(name)` | Pre-warm connection |
| `upsertVectors(index, vectors, ns?)` | Batch upsert (100/batch) with 40KB metadata truncation |
| `queryVectors(index, vector, topK?, filter?, ns?)` | Dense vector search |
| `deleteVectors(index, ids, ns?)` | Delete specific vectors |
| `deleteChatbotVectors(index, chatbotId)` | Delete entire namespace |
| `reciprocalRankFusion(...lists)` | Merge ranked lists with k=60 smoothing |
| `hybridQuery(index, dense, sparse, topK?, ns?)` | Combined dense+sparse search |
| `withRetry(fn, label, maxRetries?)` | Exponential backoff (1s, 2s, 4s + jitter) |

#### S3 File Management

| Function | Purpose |
|----------|---------|
| `uploadFileToS3(params)` | Upload with content type and metadata |
| `downloadFileFromS3(key)` | Stream to buffer |
| `deleteFileFromS3(key)` | Delete object |
| `fileExistsInS3(key)` | HeadObject check |
| `getPresignedUrl(key, expiresIn?)` | Temporary download URL (1hr default) |
| `generatePresignedUploadUrl(key, contentType, metadata?, expiresIn?)` | Direct browser upload URL |

**Path Convention**: `chatbots/{chatbotId}/files/`, `chatbots/{chatbotId}/raw/`, `chatbots/{chatbotId}/processed/`

#### SQS Queue

| Function | Purpose |
|----------|---------|
| `sendBuildMessage(params)` | Enqueue build job with chatbotId, username, type |
| `sendRebuildMessage(chatbotId)` | Enqueue rebuild |
| `receiveBuildMessages(maxMessages?)` | Long-poll receive (10s wait) |
| `deleteBuildMessage(receiptHandle)` | Acknowledge processed message |
| `getQueueStats()` | Queue depth and visibility stats |

#### Firecrawl Web Scraping

| Function | Purpose |
|----------|---------|
| `scrapeWithFirecrawl(url)` | Single URL to LLM-ready markdown (120s timeout, retry at 300s) |
| `crawlWithFirecrawl(url, options?)` | Multi-page crawl (default 10 pages, JS rendering) |

---

### UI Component Library

**Location**: `packages/ui/` | **Package**: `@corpusai/ui`

Shared React component library following the shadcn/ui pattern, built on Radix UI primitives with Tailwind CSS styling and Class Variance Authority (CVA) for variants.

#### Components (22)

| Category | Components |
|----------|-----------|
| **Form** | Button (6 variants, 4 sizes), Input, Textarea, Label, Select, Checkbox, RadioGroup, Switch, Slider |
| **Layout** | Card (6 sub-components), Dialog, Sheet, Collapsible |
| **Data** | DataTable (generic typed, sortable), Pagination (7 sub-components), Avatar |
| **Feedback** | Alert (5 variants), Badge (7 variants), Toast (with swipe gestures), Progress, Skeleton, Spinner (3 sizes) |

**Utility**: `cn()` - Merges conditional classes with `clsx` + resolves Tailwind conflicts with `tailwind-merge`.

**Peer Dependencies**: React 19, React DOM 19

---

## RAG Pipeline

### Document Processing

| Source | Library | Features |
|--------|---------|----------|
| **PDF** | pdfjs-dist + pdf-parse | Per-page extraction, character position tracking, GPT-4o Vision for charts/tables/images |
| **DOCX** | mammoth | Text + formatting preservation |
| **CSV** | csv-parse | Various delimiters |
| **XLSX** | xlsx | Multi-sheet support |
| **URL** | Firecrawl / Cheerio | JS rendering, `onlyMainContent`, 3s wait, multi-page crawl |
| **Text** | Native | Direct processing with word/character count |

### Chunking Strategy: Parent-Child (Small-to-Big)

```
Document Text
    │
    ├─── Parent Chunks (2000 chars, 200 overlap)
    │    └── Used as LLM context (richer answers)
    │
    └─── Child Chunks (400 chars, 50 overlap)
         ├── Contextual prefix added by GPT-4o-mini
         ├── Embedded with text-embedding-3-large (3072d)
         ├── Stored in Pinecone for similarity search
         └── Reference parent via parentChunkId
```

**Search with small, precise child chunks for accurate matching. Feed the larger parent chunk text to the LLM for richer, more complete answers.**

### Embedding

- **Model**: `text-embedding-3-large` (3072 dimensions, OpenAI)
- **Batch size**: 100 texts per API call
- **Max input**: 28,000 characters per text (auto-truncated)
- **Metadata safety**: Automatic truncation to stay under Pinecone's 40KB per-vector metadata limit

### Adaptive Retrieval Strategy

| Query Type | Detection | Strategy | Use Case |
|-----------|-----------|----------|----------|
| **Simple** | Straightforward factual queries | Hybrid dense search + Cohere reranking | "What is the return policy?" |
| **Complex** | Multi-part, comparisons, conjunctions | Multi-query (3 LLM-generated variations + RRF fusion) | "Compare plan A vs plan B features" |
| **Vague** | Short or ambiguous queries (<=3 words) | HyDE (hypothetical document embedding) | "pricing" |

### Retrieval Pipeline

```
1. Query Classification ─── Pattern-based complexity analysis
          │
2. Candidate Retrieval ──── Over-fetch 4x candidates for reranking
          │                  Namespace isolation (chatbotId)
          │
3. Cohere Reranking ─────── Neural cross-encoder scoring (v3.5)
          │                  ~600ms latency, ~$2/1000 searches
          │                  Keyword fallback if API unavailable
          │
4. Diversity Filtering ──── Jaccard similarity 0.75 threshold
          │                  Remove near-duplicate passages
          │
5. Fallback ─────────────── Basic dense retrieval if pipeline returns empty
```

### Key Parameters

| Parameter | Value |
|-----------|-------|
| Score filter | Minimum 0.3 similarity |
| Top-K | Default 5 results |
| Namespace isolation | Each chatbot in separate Pinecone namespace |
| Embedding dimension | 3072 (text-embedding-3-large) |
| Pinecone metric | Cosine similarity |
| RRF constant | k=60 |
| Response cache | SHA-256 keyed, 1hr TTL, DynamoDB-backed |
| Contextual enrichment cost | ~$0.02 per 100 chunks |
| Reranking cost | ~$2 per 1,000 searches |

---

## Authentication Flow

### AWS Cognito Integration

Two authentication methods:
1. **Email + Password** - Traditional Cognito user pool authentication
2. **Google SSO** - OAuth2 via Cognito Hosted UI with Google as federated identity provider

#### Email + Password Flow

```
              Website Sign-In                    Dashboard
              ┌──────────────┐                  ┌──────────────┐
              │  Email +     │    Tokens via     │  AuthContext  │
User -------->│  Password    │----URL hash------>│  Provider     │
              │  + Verify    │   #auth={...}     │  (Protected)  │
              └──────┬───────┘                  └──────┬───────┘
                     │                                  │
                POST /api/auth/login           Bearer token in
                     │                          Authorization header
                     v                                  │
              ┌──────────────┐                         v
              │   Backend    │                  ┌──────────────┐
              │  Cognito SDK │<-----------------│  Cognito     │
              │  Commands    │   GetUserCommand │  Validation  │
              └──────────────┘                  └──────────────┘
```

#### Google SSO Flow

```
User clicks "Sign in with Google" on Website
    │
    ▼
GET /api/auth/google
    │  Redirects to Cognito Hosted UI with identity_provider=Google
    ▼
Cognito Hosted UI → Google OAuth consent → Cognito callback
    │  Returns authorization code
    ▼
GET /api/auth/google/callback
    │  1. Exchanges code for tokens via Cognito /oauth2/token
    │  2. Decodes id_token JWT (base64url) for user info (email, name, picture)
    │  3. Upserts user in DynamoDB (auto-creates on first Google login, Free tier)
    │  4. Redirects to Dashboard with tokens in URL hash
    ▼
Dashboard /dashboard#auth={idToken,accessToken,refreshToken,user}
    │  AuthContext picks up tokens from URL hash
    ▼
Authenticated session (same as email+password flow)
```

#### Auth Endpoints

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/auth/register` | Public | Create Cognito user + DynamoDB record (Free tier, 10-day trial) |
| `POST /api/auth/login` | Public | Authenticate -> return IdToken, AccessToken, RefreshToken |
| `POST /api/auth/confirm-signup` | Public | Verify email with 6-digit code |
| `POST /api/auth/forgot-password` | Public | Initiate password reset (doesn't reveal user existence) |
| `POST /api/auth/confirm-forgot-password` | Public | Complete reset with code + new password |
| `POST /api/auth/logout` | Bearer | Sign out from Cognito (always returns success) |
| `GET /api/auth/me` | Bearer | Get current user from DynamoDB |
| `GET /api/auth/verify` | Bearer | Verify token validity + return user info |
| `GET /api/auth/google` | Public | Initiate Google SSO (redirects to Cognito Hosted UI) |
| `GET /api/auth/google/callback` | Public | Google SSO callback (exchange code, create user, redirect to dashboard) |

#### Password Requirements (Cognito)

8+ characters, uppercase, lowercase, number, special character.

#### Token Storage

Tokens (`idToken`, `accessToken`, `refreshToken`) stored in browser `localStorage`. Dashboard `AuthContext` manages auth state and protects routes.

---

## Payment & Billing

### Stripe Integration

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/payment/plans` | Public | List all pricing tiers with features |
| `POST /api/payment/checkout` | Bearer | Create Stripe Checkout session |
| `POST /api/payment/portal` | Bearer | Open Stripe Customer Portal |
| `GET /api/payment/subscription` | Bearer | Get current subscription details |
| `POST /api/payment/cancel` | Bearer | Cancel subscription (downgrade to Free at period end) |
| `POST /api/payment/webhook` | Stripe Signature | Handle Stripe lifecycle events (raw body + signature verification) |

### Pricing Tiers

| Tier | Name | Price/mo | Chats/mo | Chatbots | Storage | Web Pages |
|------|------|----------|----------|----------|---------|-----------|
| 0 | Free | $0 | 20 | 1 | 10 MB | 10 |
| 1 | Starter | $19 | 1,500 | 2 | 100 MB | 100 |
| 2 | Standard | $99 | 7,500 | 4 | 500 MB | 500 |
| 3 | Business | $399 | 15,000 | 8 | 2 GB | 2,000 |

### Webhook Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Upgrade user tier, set customer ID |
| `invoice.payment_succeeded` | Reset chat_usage to 0, extend expireAt +30 days |
| `invoice.payment_failed` | Log failure (email notification TODO) |
| `customer.subscription.updated` | Update user tier |
| `customer.subscription.deleted` | Downgrade to Free tier (tier=0) |

---

## API Reference

### Complete Endpoint Map

#### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create user |
| POST | `/api/auth/login` | Public | Authenticate |
| POST | `/api/auth/confirm-signup` | Public | Verify email |
| POST | `/api/auth/forgot-password` | Public | Initiate reset |
| POST | `/api/auth/confirm-forgot-password` | Public | Complete reset |
| POST | `/api/auth/logout` | Bearer | Sign out |
| GET | `/api/auth/me` | Bearer | Current user |
| GET | `/api/auth/verify` | Bearer | Verify token |
| GET | `/api/auth/google` | Public | Google SSO initiate |
| GET | `/api/auth/google/callback` | Public | Google SSO callback |

#### Chatbot CRUD (`/api/chatbots`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/chatbots` | Bearer | Create chatbot (title, origin, language, files) |
| GET | `/api/chatbots` | Bearer | List chatbots (search, status, sort, limit, offset) |
| GET | `/api/chatbots/:id` | Bearer | Get single chatbot (ownership verified) |
| PUT | `/api/chatbots/:id` | Bearer | Update chatbot (title, desc, accessMode, language) |
| DELETE | `/api/chatbots/:id` | Bearer | Delete chatbot + all 11 associated resources |
| POST | `/api/chatbots/:id/rebuild` | Bearer | Trigger rebuild via SQS |
| POST | `/api/chatbots/:id/activate` | Bearer | Force activate (dev only) |
| GET | `/api/chatbots/:id/status` | Bearer | Get build status |
| GET | `/api/chatbots/:id/status/stream` | Bearer | SSE stream of build status (polls 2s, max 5min) |
| POST | `/api/chatbots/:id/upload-url` | Bearer | Get presigned S3 upload URL |
| POST | `/api/chatbots/:id/build` | Bearer | Trigger build after file uploads |

#### Data Store (`/api/data-store`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/data-store/:chatbotId` | Bearer | List data records (paginated) |
| POST | `/api/data-store/:chatbotId` | Bearer | Add single record |
| PUT | `/api/data-store/:chatbotId/:dataId` | Bearer | Update record |
| DELETE | `/api/data-store/:chatbotId/:dataId` | Bearer | Delete record + Pinecone vectors |
| POST | `/api/data-store/:chatbotId/batch` | Bearer | Batch add records |
| DELETE | `/api/data-store/:chatbotId/batch` | Bearer | Batch delete records |

#### Leads (`/api/leads`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/leads/:chatbotId` | Bearer | List leads (search, date filter, pagination) |
| POST | `/api/leads/:chatbotId` | Public | Submit lead (chatbot form submission) |
| GET | `/api/leads/:chatbotId/export` | Bearer | Export leads as CSV |
| GET | `/api/leads/:chatbotId/fields` | Bearer | Get form field configuration |
| PUT | `/api/leads/:chatbotId/fields` | Bearer | Update form fields (max 20) |

#### Query Logs & Analytics (`/api/query-log`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/query-log/:chatbotId` | Bearer | Get logs (date range, thumb filter, pagination) |
| POST | `/api/query-log/:chatbotId/search` | Bearer | Full-text search in logs |
| POST | `/api/query-log/:chatbotId/feedback` | Bearer | Record thumbs up/down |
| GET | `/api/query-log/:chatbotId/export` | Bearer | Export logs as CSV |
| GET | `/api/query-log/:chatbotId/analytics` | Bearer | Aggregate analytics stats |

#### Customization (`/api/customize`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/customize/:chatbotId` | Bearer | Get customization settings |
| PUT | `/api/customize/:chatbotId` | Bearer | Update settings (colors, prompt, model, etc.) |
| POST | `/api/customize/:chatbotId/theme` | Bearer | Update theme colors |
| POST | `/api/customize/:chatbotId/prompt` | Bearer | Update system prompt |

#### Access Control & API Keys (`/api/access-control`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/access-control/:chatbotId` | Bearer | List users with access |
| POST | `/api/access-control/:chatbotId` | Bearer | Grant access (email whitelist) |
| DELETE | `/api/access-control/:chatbotId/:email` | Bearer | Revoke access |
| PUT | `/api/access-control/:chatbotId/mode` | Bearer | Set access mode (PUBLIC/PRIVATE/WHITELIST) |
| POST | `/api/access-control/:chatbotId/apikey` | Bearer | Generate API key (PBKDF2 hashed) |
| GET | `/api/access-control/:chatbotId/apikeys` | Bearer | List API keys (metadata only) |
| DELETE | `/api/access-control/:chatbotId/apikeys/:keyId` | Bearer | Delete API key |
| POST | `/api/access-control/validate` | Public | Validate an API key |

#### Integrations (`/api/integrations`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/integrations/:chatbotId` | Bearer | List all integration statuses |
| POST | `/api/integrations/slack/:chatbotId` | Bearer | Connect Slack |
| DELETE | `/api/integrations/slack/:chatbotId` | Bearer | Disconnect Slack |
| POST | `/api/integrations/telegram/:chatbotId` | Bearer | Connect Telegram |
| DELETE | `/api/integrations/telegram/:chatbotId` | Bearer | Disconnect Telegram |
| POST | `/api/integrations/whatsapp/:chatbotId` | Bearer | Connect WhatsApp |
| DELETE | `/api/integrations/whatsapp/:chatbotId` | Bearer | Disconnect WhatsApp |
| POST | `/api/integrations/zapier/subscribe` | Bearer | Subscribe Zapier webhook |
| DELETE | `/api/integrations/zapier/unsubscribe` | Bearer | Unsubscribe Zapier |

#### Quota & User (`/api/quota`, `/api/user`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/quota` | Bearer | Full quota breakdown (chat, chatbot, storage, webPages) |
| GET | `/api/quota/:chatbotId` | Bearer | Check chatbot-specific quota |
| GET | `/api/quota/usage` | Bearer | Detailed usage stats per chatbot |
| GET | `/api/quota/tiers` | Bearer | Available tiers with quotas |
| GET | `/api/user/profile` | Bearer | Get user profile |
| PUT | `/api/user/profile` | Bearer | Update profile (name, picture) |
| PUT | `/api/user/password` | Bearer | Change password (via Cognito) |
| DELETE | `/api/user/account` | Bearer | Delete account (requires password + "DELETE" confirmation) |
| GET | `/api/user/stats` | Bearer | User statistics |

#### Database Connections (`/api/databases`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/databases/test` | Bearer | Test DB connection (PostgreSQL/MySQL/MongoDB/MSSQL) |
| POST | `/api/databases/tables` | Bearer | Fetch tables from connected DB |
| POST | `/api/databases/save` | Bearer | Save connection config (encrypted credentials) |
| GET | `/api/databases/:chatbotId` | Bearer | List saved connections |
| DELETE | `/api/databases/:connectionId` | Bearer | Delete connection |

#### Chat (`/api/chat`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/chat` | Optional | Local dev chat proxy (replaces Lambda) |
| GET | `/api/chat/history/:chatbotId` | Bearer | Get chat history |
| DELETE | `/api/chat/history/:chatbotId` | Bearer | Clear chat history |
| PUT | `/api/chat/history/:chatbotId/:messageId/feedback` | Bearer | Update message feedback |

#### Payment (`/api/payment`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/payment/plans` | Public | List pricing plans |
| POST | `/api/payment/checkout` | Bearer | Create Stripe Checkout session |
| POST | `/api/payment/portal` | Bearer | Create Stripe Customer Portal session |
| GET | `/api/payment/subscription` | Bearer | Get subscription details |
| POST | `/api/payment/cancel` | Bearer | Cancel subscription |
| POST | `/api/payment/webhook` | Stripe Sig | Handle Stripe events |

#### Health Checks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | General health (DynamoDB, region) |
| GET | `/health/db` | DynamoDB connection test |
| GET | `/health/s3` | S3 connection test |
| GET | `/health/sqs` | SQS connection test |

---

## Integrations

### Slack (Fully Implemented)

- OAuth-based authentication flow (via lambdaChat slackOAuth handler)
- Bolt framework for event handling
- Event listener for @mentions, DMs, and `/corpus` slash command
- Threaded conversation support with history
- Block Kit formatted responses with source citations
- Feedback buttons (thumbs up/down)

### Telegram (Fully Implemented)

- Bot API webhook handler
- Supports `/start` and `/help` commands
- Typing indicators while processing
- Markdown formatted responses
- Integration lookup via `byBotId` GSI

### WhatsApp (Fully Implemented)

- WhatsApp Business API integration
- Webhook verification (GET) + message handling (POST)
- Phone number ID + access token authentication
- Integration lookup via `byPhoneNumberId` GSI
- Response limits: max 500 chars, 300 words

### Zapier

- Webhook-based triggers
- Subscribe/unsubscribe endpoints
- Sample data endpoint for Zapier testing

### Google Drive

- OAuth-based file sync
- Profile management with refresh tokens
- Per-chatbot Google Drive connections

---

## Infrastructure

### Docker Services

| Service | Image/Dockerfile | Port | Purpose |
|---------|-----------------|------|---------|
| `dynamodb-local` | `amazon/dynamodb-local` | 8000 | Local DynamoDB for development |
| `backend` | `docker/Dockerfile.backend` | 8001 | Express.js API server |
| `dashboard` | `docker/Dockerfile.dashboard` | 8080 | Next.js admin UI |
| `website` | `docker/Dockerfile.website` | 3000 | Next.js marketing site |
| `docs` | `docker/Dockerfile.docs` | 3001 | Next.js documentation |
| `proxy` | `docker/Dockerfile.proxy` | 80 | Nginx reverse proxy |

### Docker Build Strategy

All Dockerfiles use multi-stage builds with Turbo prune:
1. **Base** - Node 20-slim + pnpm
2. **Pruner** - Turbo prune to extract only required workspace dependencies
3. **Builder** - Install deps + build with Turbo (4GB max old space)
4. **Runner** - Lean production image with non-root user (UID 1001)

### Nginx Routing

| Path | Target |
|------|--------|
| `/api/*` | `http://backend:8001` |
| `/dashboard/*` | `http://dashboard:8080` |
| `/docs/*` | `http://docs:3001` |
| `/` | `http://website:3000` |

All routes support WebSocket upgrades, gzip compression, and proper proxy headers (X-Real-IP, X-Forwarded-For, X-Forwarded-Proto).

### Development Proxy

`proxy-server.js` mirrors Docker routing for local development:
- Express.js + `http-proxy-middleware`
- WebSocket support (`ws: true`)
- Request logging (excluding webpack-hmr, _next)
- Health check endpoint: `/health`
- Error handling with 502 responses

### S3 File Organization

```
S3 Bucket (corpus-ai-files-{env})/
└── chatbots/
    └── {chatbotId}/
        ├── files/        # Uploaded files
        ├── raw/          # Original uploaded files
        ├── processed/    # Post-processed documents
        └── index/        # Vector index metadata
```

### Pinecone Index Strategy

- **Single shared index**: `corpus-dense` (configurable via `PINECONE_INDEX`)
- **Namespace isolation**: Each chatbot in a separate namespace (`chatbotId`)
- **Dimension**: 3072 (matching `text-embedding-3-large`)
- **Metric**: Cosine similarity
- **Metadata limit**: 40KB per vector (automatic truncation)

---

## Environment Variables

### AWS Configuration

```env
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Cognito
AWS_COGNITO_REGION=eu-north-1
AWS_COGNITO_USER_POOL_ID=...
AWS_COGNITO_CLIENT_ID=...
AWS_COGNITO_CLIENT_SECRET=...                    # Optional, depends on app client config
AWS_COGNITO_DOMAIN=your-domain.auth.region.amazoncognito.com

# Google SSO
GOOGLE_SSO_CALLBACK_URL=http://localhost:8001/api/auth/google/callback
DASHBOARD_URL=http://localhost:8080
WEBSITE_URL=http://localhost:3000

# DynamoDB Tables (12 tables)
DYNAMODB_ENDPOINT=http://localhost:8000          # Local dev only
AWS_DYNAMO_USER_TABLE=corpus-users-dev
AWS_DYNAMO_CHATBOT_TABLE=corpus-chatbots-dev
AWS_DYNAMO_CUSTOMIZATION_TABLE=corpus-customizations-dev
AWS_DYNAMO_ACCESS_CONTROL_TABLE=corpus-access-control-dev
AWS_DYNAMO_QUERY_LOG_TABLE=corpus-query-logs-dev
AWS_DYNAMO_LEAD_GENERATION_TABLE=corpus-leads-dev
AWS_DYNAMO_API_KEYS_TABLE=corpus-api-keys-dev
AWS_DYNAMO_DATABASE_CONNECTIONS_TABLE=corpus-db-connections-dev
AWS_DYNAMO_CHAT_HISTORY_TABLE=corpus-chat-history-dev
AWS_DYNAMO_MAIN_TABLE=corpus-main-dev              # ElectroDB data store
AWS_DYNAMO_INTEGRATIONS_TABLE=corpus-integrations-dev
AWS_DYNAMO_RESPONSE_CACHE_TABLE=corpus-response-cache

# S3
S3_BUCKET_NAME=corpus-ai-files-dev
S3_REGION=eu-north-1

# SQS
SQS_BUILD_QUEUE_URL=https://sqs.eu-north-1.amazonaws.com/ACCOUNT_ID/corpus-ai-queue
SQS_REGION=eu-north-1
```

### AI / Vector DB

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-east-1
PINECONE_REGION=us-east-1
PINECONE_INDEX=corpus-dense
COHERE_API_KEY=...                               # Optional, for neural reranking
FIRECRAWL_API_KEY=...                            # Optional, for web scraping
```

### Stripe

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_STANDARD=price_...
STRIPE_PRICE_ID_BUSINESS=price_...
```

### Integration Tokens

```env
SLACK_SIGNING_SECRET=...
SLACK_BOT_TOKEN=xoxb-...
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_ACCESS_TOKEN=...
TELEGRAM_BOT_TOKEN=...
```

### Server

```env
PORT=8001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:9000
API_URL=http://localhost:8001
DB_ENCRYPTION_KEY=...                            # AES-256 key for database credentials
```

### Frontend Apps

```env
# Dashboard (apps/dashboard/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8001

# Website (apps/website/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8001
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0 (`npm install -g pnpm@9.1.4`)
- **AWS Account** with Cognito User Pool, DynamoDB, S3, SQS configured
- **OpenAI API Key**
- **Pinecone Account** with a project
- **Stripe Account** (optional, for payments)
- **Firecrawl API Key** (optional, for web scraping)
- **Cohere API Key** (optional, for neural reranking)

### Installation

```bash
# Clone the repository
git clone https://github.com/corpusai-io/corpus-ai.git
cd corpus-ai

# Install dependencies
pnpm install

# Build shared packages first
pnpm build --filter=@corpusai/aws-common --filter=@corpusai/ui
```

### Development

```bash
# Start all apps + proxy (recommended)
pnpm dev

# Or start only frontend apps + proxy
pnpm dev:frontend

# Start without proxy (direct port access)
pnpm dev:no-proxy
```

**Development URLs** (via proxy on port 3000):

| URL | App |
|-----|-----|
| http://localhost:3000 | Website (marketing site) |
| http://localhost:3000/dashboard | Dashboard (admin UI) |
| http://localhost:3000/docs | Documentation portal |
| http://localhost:3000/api | Backend API |
| http://localhost:3000/health | Proxy health check |

**Direct service ports** (for debugging):

| App | Direct URL |
|-----|-----------|
| Website | http://localhost:3002 |
| Dashboard | http://localhost:8080 |
| Docs | http://localhost:3001 |
| Backend | http://localhost:8001 |

### Environment Setup

1. Copy `apps/backend/.env.example` to `apps/backend/.env.development`
2. Create `.env.local` files in `apps/dashboard/` and `apps/website/` with `NEXT_PUBLIC_API_URL`
3. Run `node apps/backend/setup-aws-dynamodb.js` to create DynamoDB tables

---

## Docker Setup

### Full Stack with Docker Compose

```bash
# Start all services (includes DynamoDB Local)
pnpm docker:up

# Rebuild from scratch
pnpm docker:rebuild

# View logs
pnpm docker:logs
```

This starts: DynamoDB Local (8000), Backend (8001), Dashboard (8080), Website (3000), Docs (3001), and Nginx Proxy (80).

---

## Testing

### Backend Tests (Jest)

```bash
# Ensure backend is running first
cd apps/backend && pnpm dev

# Run tests (in another terminal)
pnpm test              # Default debug tests
pnpm test:all          # All test suites
pnpm test:phase3       # Integration tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

**Test Suites** (5 files in `apps/backend/src/__tests__/`):

| Suite | Coverage |
|-------|----------|
| `auth.test.ts` | Registration, login, token verification, error cases |
| `chatbot.test.ts` | CRUD operations, ownership checks, pagination |
| `payment.test.ts` | Pricing plans, checkout, webhook handling |
| `phase3.test.ts` | End-to-end integration workflows |
| `debug.test.ts` | Health checks, service connectivity |

**Requirements**: Backend server must be running. Tests use unique timestamped credentials. 30-second timeout per test.

---

## Deployment

### Docker (Apps)

Frontend apps and backend deploy via Docker with multi-stage builds. Use `docker compose` for full-stack containerized deployment.

### AWS Lambda (Serverless Functions)

```bash
# Deploy Lambda Build
cd apps/lambdaBuild
pnpm deploy:dev       # Development stage
pnpm deploy:prod      # Production stage

# Deploy Lambda Chat
cd apps/lambdaChat
pnpm deploy:dev
pnpm deploy:prod
```

Lambda functions deploy via Serverless Framework with:
- SQS triggers for build pipeline
- API Gateway + WebSocket API for chat
- HTTP endpoints for integration webhooks

### Build Commands

```bash
pnpm build            # Build all packages (Turbo-cached)
pnpm lint             # Lint all packages
pnpm lint:fix         # Auto-fix lint issues
pnpm format           # Check formatting
pnpm format:fix       # Fix formatting
pnpm clean:ws         # Clean Turbo caches
```

---

## Current Project Status

### What's Fully Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| User Authentication (Email + Password) | Complete | Cognito integration with signup, login, verify, password reset |
| Google SSO | Complete | Cognito Hosted UI -> Google OAuth -> auto-create DynamoDB user |
| Chatbot CRUD | Complete | Create, list, get, update, delete with 11-resource cascade cleanup |
| RAG Build Pipeline | Complete | 7-step process: download -> process -> chunk -> enrich -> embed -> upsert -> activate |
| Document Processing | Complete | PDF (with Vision), DOCX, CSV, XLSX, URL, plain text |
| Parent-Child Chunking | Complete | 2000/400 char strategy with contextual enrichment |
| Adaptive Retrieval | Complete | Simple (hybrid+rerank), Complex (multi-query+RRF), Vague (HyDE) |
| Cohere Reranking | Complete | Neural reranking with keyword fallback |
| Response Caching | Complete | SHA-256 keyed, DynamoDB-backed, 1hr TTL |
| REST Chat API | Complete | Sync JSON + SSE streaming |
| WebSocket Chat | Complete | Real-time streaming with rate limiting, auth, session history |
| Telegram Integration | Complete | Webhook handler with /start, /help, typing indicators |
| WhatsApp Integration | Complete | Webhook verification + message handling |
| Slack Integration | Complete | Bolt framework: mentions, /corpus command, feedback buttons, Block Kit, OAuth |
| Widget Embed | Complete | Public embeddable chat widget with lead capture |
| Customization | Complete | Theme colors, system prompt, LLM model, avatar, welcome message |
| Access Control | Complete | Public/private/whitelist modes, API key generation (PBKDF2) |
| Lead Generation | Complete | Form capture, field configuration, CSV export |
| Analytics | Complete | Query logs, feedback metrics, daily volume charts, CSV export |
| Stripe Billing | Complete | Checkout, portal, webhooks (5 event types), signature verification |
| Quota Enforcement | Complete | Tier-based limits on chats, chatbots, storage, web pages |
| Database Connections | Complete | PostgreSQL, MySQL, MongoDB, MSSQL with encrypted credentials |
| File Upload | Complete | Presigned S3 URLs for direct browser upload, 10MB limit |
| Rate Limiting | Complete | REST (4 presets) + WebSocket (10 msgs/min) |
| Security Middleware | Complete | XSS prevention, SQL injection prevention, body sanitization |
| Docker Setup | Complete | Multi-stage builds, Nginx proxy, DynamoDB Local |
| Dev Proxy | Complete | Express proxy mirroring Docker routing |
| Documentation Portal | Complete | React-based docs with dark mode |

### What's Partially Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| AI Actions (Dashboard) | Partial | Button actions + form actions work; built-in integrations (Google Calendar, Stripe, HubSpot) disabled with "Coming Soon" |
| Natural Language DB Queries | Stub | UI exists in dashboard database tools page but no backend execution - shows "Query results will appear here" |
| Slack OAuth (Backend) | Stub | `integrations.controller.ts` returns "Slack OAuth callback (not implemented)" - the Lambda-side OAuth works but backend-side is a placeholder |
| Zapier Integration | Partial | Subscribe/unsubscribe endpoints exist but no lead notification trigger implemented |
| Google Drive Sync | Partial | OAuth + profile management models exist but sync workflow incomplete |

---

## Incomplete & Missing Features

### 1. Email Notification System (NOT IMPLEMENTED)

No email service (SES, SendGrid, etc.) is integrated. The following email notifications are marked as TODO in the codebase:

| Location | TODO | File |
|----------|------|------|
| Checkout completed | Send confirmation email | payment.controller.ts:119 |
| Payment succeeded | Send payment confirmation | payment.controller.ts:171 |
| Payment failed | Send payment failed email | payment.controller.ts:193 |
| Subscription cancelled | Send cancellation email | payment.controller.ts:260 |
| New lead submitted | Notify chatbot owner | leads.controller.ts:150 |
| Lead submitted | Trigger Zapier webhook | leads.controller.ts:151 |
| Access granted | Send invitation email | access.controller.ts:77 |
| Access granted | Multi-language email templates | access.controller.ts:78 |

**Impact**: Users receive no email notifications for any platform events. No welcome email, no payment receipts, no lead alerts.

### 2. CI/CD Pipeline (NOT CONFIGURED)

- No GitHub Actions workflows
- No GitLab CI/CD
- No automated testing, linting, or deployment pipeline
- Docker files exist but no automated build/deploy triggers

**Recommendation**: Add GitHub Actions for: lint -> test -> build -> deploy (Docker + Lambda)

### 3. Frontend Testing (NOT IMPLEMENTED)

- **Backend**: 5 Jest test suites exist
- **Dashboard**: Zero tests
- **Website**: Zero tests
- **UI Package**: Zero tests
- **aws-common**: Zero tests

**Recommendation**: Add React Testing Library + Jest for dashboard components, Playwright/Cypress for E2E

### 4. Production Logging & Monitoring (NOT IMPLEMENTED)

- All logging uses `console.log()` / `console.error()`
- No structured logging framework (Winston, Pino, etc.)
- No error tracking (Sentry, Bugsnag)
- No APM (DataDog, New Relic)
- No CloudWatch dashboards or alarms for Lambda functions

**Recommendation**: Add Pino for structured JSON logs, Sentry for error tracking, CloudWatch alarms for Lambda errors/duration

### 5. Internationalization / i18n (NOT IMPLEMENTED)

- All UI text is hardcoded in English
- No i18n framework (next-i18next, react-i18next)
- No locales directory or translation files
- Chatbot `language` field exists but only affects chatbot metadata, not UI

**Recommendation**: Add next-i18next with locale files if multi-language UI is planned

### 6. Dark Mode (PARTIAL)

- **Docs app**: Fully implemented with ThemeContext and `useTheme()` hook
- **Dashboard**: Not implemented (light mode only)
- **Website**: Not implemented (light mode only)

### 7. Natural Language Database Queries (STUB)

The dashboard has a "Natural Language Query" section at `chatbots/[id]/tools/databases` with:
- Input field for natural queries
- Example queries (disabled)
- Results area showing "Query results will appear here"

**Missing**: No backend endpoint to execute NL-to-SQL conversion. No LLM integration for SQL generation.

### 8. Built-in AI Action Integrations (COMING SOON)

The AI Actions page shows 4 built-in integrations, only 1 may be functional:
- Google Calendar (OAuth) - **Coming Soon**
- Stripe (API Key) - **Coming Soon**
- HubSpot (OAuth) - **Coming Soon**
- Zendesk (API Key) - May be partially implemented

### 9. Shopify Integration (COMING SOON)

Listed on the Deploy page with a "Coming Soon" badge. No backend implementation exists.

### 10. Database Schema Migrations (NOT IMPLEMENTED)

- No versioned migration system
- Manual DynamoDB table setup via `setup-aws-dynamodb.js`
- No rollback capability
- Schema changes require manual intervention

### 11. Token Refresh Mechanism (NOT IMPLEMENTED)

- Cognito tokens stored in localStorage with no automatic refresh
- No refresh token rotation
- Users must re-login when tokens expire
- `RefreshToken` is stored but never used to get new `AccessToken`/`IdToken`

### 12. Payment Grace Period (TODO)

- `payment.controller.ts:194`: `// TODO: Optionally downgrade to free tier after grace period`
- Currently no grace period on payment failure - no automatic downgrade logic

### 13. User Onboarding Flow (NOT IMPLEMENTED)

- No guided onboarding after first login
- No tutorial or walkthrough
- Users land directly on empty dashboard

### 14. Search & Filtering Improvements

- Query log search and lead search use in-memory filtering (fetch all, filter in JS)
- Not scalable for large datasets
- No DynamoDB-native full-text search or ElasticSearch integration

### 15. File Type Validation (PARTIAL)

- Frontend enforces PDF/TXT/DOCX only on create wizard
- Backend accepts CSV/XLSX in Lambda Build but dashboard doesn't expose these options
- No virus scanning on uploaded files

### 16. Webhook Retry & Dead Letter Queue (NOT IMPLEMENTED)

- Stripe webhooks have no retry logic on handler failure
- No DLQ configured for SQS build queue failures
- Integration webhooks (Telegram/WhatsApp) have no retry on delivery failure

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps + proxy on port 3000 |
| `pnpm dev:no-proxy` | Start all apps without proxy (direct ports) |
| `pnpm dev:frontend` | Start frontend apps + backend + proxy |
| `pnpm build` | Build all packages with Turbo |
| `pnpm start` | Production start with proxy |
| `pnpm lint` | ESLint across all packages |
| `pnpm lint:fix` | ESLint with auto-fix |
| `pnpm format` | Prettier check |
| `pnpm format:fix` | Prettier fix |
| `pnpm docker:up` | Start Docker Compose |
| `pnpm docker:rebuild` | Rebuild Docker images and start |
| `pnpm docker:logs` | Follow Docker logs |
| `pnpm clean` | Git clean node_modules |
| `pnpm clean:ws` | Clean Turbo workspace caches |

---

## Key Constants & Limits

| Item | Value |
|------|-------|
| Max file upload | 10 MB |
| Max query length | 5,000 characters |
| Max embedding input | 28,000 characters |
| OpenAI batch size | 100 texts/call |
| Parent chunk size | 2,000 characters |
| Child chunk size | 400 characters |
| Pinecone batch size | 100 vectors |
| Pinecone metadata limit | 40 KB per vector |
| Response cache TTL | 1 hour |
| WebSocket connection TTL | 2 hours |
| WebSocket rate limit | 10 messages/minute |
| WebSocket session history | Last 20 messages |
| REST session history | Last 10 messages |
| Firecrawl timeout | 120s (retry: 300s) |
| SQS long poll wait | 10 seconds |
| SQS visibility timeout | 900 seconds |
| SQS message retention | 14 days |
| RRF smoothing constant | k=60 |
| Reranking cost | ~$2 per 1,000 searches |
| Contextual enrichment cost | ~$0.02 per 100 chunks |
| Lambda Build timeout | 15 minutes |
| Lambda Chat REST timeout | 30 seconds |
| Lambda Chat WS timeout | 5 minutes |
| Max lead form fields | 20 |
| SSE status poll interval | 2 seconds |
| SSE max poll duration | 5 minutes |
