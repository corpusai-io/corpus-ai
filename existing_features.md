# Corpus AI — Existing Features Analysis

> Produced by a 6-agent deep-dive across every feature domain.
> Each feature is scored **X/10** for implementation completeness.
> Scores reflect: backend completeness + frontend completeness + enforcement/wiring.

---

## Table of Contents

1. [RAG Pipeline](#1-rag-pipeline)
2. [Chatbot Management & Customization](#2-chatbot-management--customization)
3. [Lead Capture System](#3-lead-capture-system)
4. [Analytics & Query Logging](#4-analytics--query-logging)
5. [Channel Integrations](#5-channel-integrations)
6. [Database Connections & Text-to-SQL](#6-database-connections--text-to-sql)
7. [Authentication & User Management](#7-authentication--user-management)
8. [Billing & Subscription](#8-billing--subscription)
9. [Quota & Rate Limiting](#9-quota--rate-limiting)
10. [API Keys & Access Control](#10-api-keys--access-control)
11. [Embeddable Widget](#11-embeddable-widget)
12. [Dashboard UI & Chat Interface](#12-dashboard-ui--chat-interface)
13. [Marketing Website](#13-marketing-website)
14. [Overall Platform Score](#14-overall-platform-score)
15. [Critical Gaps Summary](#15-critical-gaps-summary)
16. [Feature Ideas for Next Phase](#16-feature-ideas-for-next-phase)

---

## 1. RAG Pipeline

**Overall Score: 9/10** — Production-grade, multi-strategy retrieval system.

### 1.1 Document Ingestion

**Score: 10/10**

Supports 7 document types. Processing happens in `apps/lambdaBuild` (SQS-triggered) and locally in `apps/backend` for dev.

| Format | What's Implemented |
|--------|--------------------|
| **PDF** | pdfjs-dist text extraction, per-page bounding box annotations, image detection via operator list, GPT-4o Vision for image-heavy pages |
| **DOCX** | Mammoth.js, markdown table conversion, embedded image extraction via Vision |
| **CSV** | Header-preserving parser, large files sectioned at 50 rows, markdown table output |
| **XLSX** | Per-sheet processing, repeated headers per section, row limits |
| **Single URL** | Firecrawl (primary), fallback to axios + cheerio, metadata extraction |
| **Website Crawl** | Multi-page Firecrawl crawl, tier-based page quotas (Free: 10, Starter: 100, Standard: 500, Business: 2000) |
| **Plain Text** | Direct paste or S3 `.txt` file |

### 1.2 Chunking Strategy

**Score: 10/10**

All chunking lives in `packages/aws-common/src/rag/chunking.ts`.

- **Parent-Child Chunking**: Parents at 2,000 chars (for LLM context), children at 400 chars (for Pinecone search). Children carry `parentText` in metadata enabling "small-to-big" retrieval.
- **Contextual Enrichment**: GPT-4o-mini prepends a 1–2 sentence context summary to every child chunk at build time (~$0.02/100 chunks, one-time cost).
- **PDF Annotations**: Bounding box coordinates (x, y, width, height) attached to chunks for citation highlighting.
- **Merging**: Chunks under 100 chars are merged with neighbors.
- **Sanitization**: Chunk IDs sanitized to Pinecone-safe ASCII.

### 1.3 Embeddings

**Score: 9/10**

- Model: `text-embedding-3-large` (3072 dimensions, default)
- Also supports: `text-embedding-3-small` (1536d), `text-embedding-ada-002` (1536d)
- Batch size: 100 texts per OpenAI call (rate-limit safe)
- Truncation: Word-aware, max 28,000 chars

### 1.4 Vector Storage (Pinecone)

**Score: 8/10**

- **Dense search**: Fully implemented with retry logic (exponential backoff: 1s, 2s, 4s + jitter)
- **Namespace isolation**: Each chatbot gets its own namespace (`chatbotId`)
- **Metadata**: Stored per vector — `text` (parent for LLM), `childText` (for citation), source, page number, chunk index, document title
- **Metadata truncation**: Auto-truncates to <40KB (Pinecone limit)
- **Sparse/hybrid search**: Code exists (`querySparseVectors`, `hybridQuery`, RRF fusion) but **no sparse index configured** — never runs in practice

### 1.5 Retrieval Strategies

**Score: 9/10**

Queries are classified by `classifyQueryComplexity()` into three categories:

| Query Type | Strategy | Details |
|-----------|----------|---------|
| **Simple** (≥4 words, direct) | Hybrid dense + Cohere rerank | topK×4 candidates → rerank to topK |
| **Complex** (multi-part, "compare", "vs") | Multi-query + RRF fusion | GPT-4o-mini generates 3 query variants → 4 parallel Pinecone searches → Reciprocal Rank Fusion |
| **Vague** (≤3 words, open-ended) | HyDE | GPT-4o-mini writes a hypothetical answer → embed that → search |

Fallback chain: enhanced retrieval → basic retrieval (half min-score) → empty (LLM handles without context).

Diversity filter removes near-duplicate passages (Jaccard similarity > 0.75).

### 1.6 Reranking (Cohere)

**Score: 8/10**

- Model: `rerank-v3.5`
- Graceful fallback to keyword-overlap reranking if `COHERE_API_KEY` unset
- Skipped for <2 passages (cost not worth it)
- Latency: ~600ms; Cost: ~$2/1,000 searches

### 1.7 Response Caching

**Score: 9/10**

- Backend: DynamoDB table, key = SHA256(`chatbotId:query.lower()`)
- TTL: 1 hour (configurable)
- Cache invalidated on every rebuild (clears entire chatbot cache)
- Skipped for streaming mode
- Write is fire-and-forget (zero query latency overhead)

### 1.8 Build Pipeline (SQS → Lambda → Pinecone)

**Score: 9/10**

7-step pipeline in `apps/lambdaBuild/src/index.ts`:

```
Step 1: Initialize (fetch chatbot, clear cache, get user tier)
Step 2: Download files (S3 download or Firecrawl web crawl)
Step 3: Process documents (type detection, parent-child chunks, annotations)
Step 4: Contextual enrichment (GPT-4o-mini context prefix per chunk)
Step 5: Generate embeddings (text-embedding-3-large, batches of 100)
Step 6: Upsert to Pinecone (namespace = chatbotId, retry logic)
Step 7: Finalize (update DataStore to 'active', check for auto-retry)
```

Auto-retry: If new data sources are added while a build is in progress, another SQS message is queued automatically.

### 1.9 Chat/Query Pipeline

**Score: 9/10**

Unified `processQuery()` in `packages/aws-common/src/rag/query-processor.ts`. Handles all channels: REST, WebSocket, Slack, Telegram, WhatsApp.

```
1. Validate chatbot status
2. Check user chat quota
2.5a. Text-to-SQL intent detection (if DB connections exist)
2.5b. Response cache lookup (skip if streaming)
3. Retrieve RAG passages (adaptive strategy)
4. Load customization (LLM model, system prompt)
5. Build message array (system + history + RAG prompt)
6. Call OpenAI (streaming or batch)
7. Fire-and-forget: log to QueryLog, increment usage, write cache
8. Return QueryResult
```

**Known limitation**: REST streaming (`POST /api/chat/stream`) pre-collects the full response then sends SSE — not true token-by-token streaming due to Lambda 30s timeout constraints.

---

## 2. Chatbot Management & Customization

**Overall Score: 8.5/10**

### 2.1 Chatbot CRUD

| Operation | Score | Notes |
|-----------|-------|-------|
| Create | 9/10 | 4-step wizard, 3 origin types (URL/files/text), SQS build trigger |
| List | 9/10 | Search, filter by status, sort, pagination |
| Get | 9/10 | Ownership verified on every request |
| Update | 7/10 | Only title/description/language; LLM model not in PUT endpoint |
| Delete | 9/10 | Cascading cleanup: Pinecone vectors, S3 files, customization, leads, query logs, access control, API keys, integrations |

Chatbot quota enforced at creation: Tier 0=1, Tier 1=3, Tier 2=10, Tier 3=unlimited.

### 2.2 Chatbot Status Lifecycle

**Score: 9/10**

```
PENDING   → waiting for file upload (file-upload origin only)
BUILDING  → step 1-7 in progress
ACTIVE    → ready for chat
ERROR     → build failed (errorStep + errorMessage stored)
```

SSE endpoint (`GET /api/chatbots/:id/status/stream`) polls every 2s for up to 5 minutes. Sends delta events only when status or step changes.

### 2.3 Data Sources Management (DataStore)

**Score: 9/10**

- CRUD for file, URL, and text sources per chatbot
- View tokens for S3 files (one-time, 5-min expiry, no auth required after token issued)
- Batch add and batch delete
- Delete cleans up associated Pinecone vectors by ID pattern
- Status lifecycle: `processing` → `active` | `error`

### 2.4 UI Customization

**Score: 9/10**

Stored as flexible key-value pairs in DynamoDB (`CustomizationModel`).

**Common settings**: Chatbot icon (base64), LLM model (5 options), show/hide citations, support email list

**Textual settings**: Initial messages (max 4), suggested questions (max 8), message bubbles, message placeholder, system prompt with default template

**Theme settings**: 4 presets (Light, Dark, Ivory, Dracula), 10 individual color pickers (chat bg/border, send button, bot messages, action buttons, input area)

Live preview panel in customization page reflects changes in real-time before saving.

---

## 3. Lead Capture System

**Overall Score: 8.5/10**

### 3.1 Trigger Types

**Score: 9/10** — All 5 triggers fully implemented in `WidgetChat.tsx`.

| Trigger | How It Works |
|---------|-------------|
| **Gated** | Form blocks chat entirely until submitted |
| **After Messages** | Fires after N user messages (configurable threshold, default: 3) |
| **High Intent** | Regex scan of last 5 messages for: pricing, price, cost, buy, purchase, demo, trial, quote, subscribe, upgrade, etc. |
| **Can't Answer** | Regex on bot response for: "don't have that information", "unable to answer", "outside my scope", etc. |
| **Exit Intent** | `mouseleave` (clientY ≤ 0) or `visibilitychange` (tab switch) events |

### 3.2 Lead Form Configuration

**Score: 9/10**

- Supports: Name, Email, Phone, Company + up to 20 custom fields
- Form styles: `popup` (full overlay) or `inline` (embedded in chat)
- Per-field: required toggle, display name, description/placeholder
- Server-side + client-side validation (email format, field lengths)
- Public endpoint (`GET /api/leads/:chatbotId/fields`) for widget to load config without auth

### 3.3 Lead Data & Storage

**Score: 9/10**

Stored in ElectroDB single-table (`corpus-main`). Fields: `dataId`, `chatbotId`, `data` (form answers), `sessionId`, `intent`, `status`, `triggerType`, `sourcePage`, `notes`.

Public capture endpoint: `POST /api/leads/:chatbotId` — no auth required, for widget.

### 3.4 Intent Classification

**Score: 9/10**

Runs automatically when a lead with a `sessionId` is created. Fetches last 20 user messages from `ChatHistoryModel` and applies:

- **Hot**: pricing, buy, purchase, demo, trial, upgrade, payment keywords
- **Warm**: feature, compare, integrate, requirement, use case, alternative keywords
- **Cold**: default fallback

### 3.5 Lead Status Management

**Score: 9/10**

Manual status tracking: `new` → `contacted` → `converted` → `archived`. No auto-transitions. Dashboard shows color-coded badges with pulse animation on `new`.

### 3.6 Email Notifications (AWS SES)

**Score: 9/10**

Fire-and-forget email to chatbot owner on every new lead. Sends HTML + plaintext versions. Template includes lead name, email, chatbot name, and a "View Leads" CTA button.

### 3.7 Zapier Webhook

**Score: 4/10** — Critically incomplete.

- Connection management (subscribe/unsubscribe) works
- Sample payload endpoint exists
- **The webhook is never actually fired from the lead capture or chat pipeline** — the trigger code is missing from `leads.controller.ts`
- No delivery confirmation, retry logic, or webhook logs

---

## 4. Analytics & Query Logging

**Overall Score: 9/10**

### 4.1 Query Log Storage

**Score: 9/10**

`QueryLogModel` (Dynamoose) stores per chatbot: query, answer, sessionId, feedback (`thumb`: 1/-1), duration (ms), optional lead contact fields, TTL.

Sort key format: `YYYY-MM-DDTHH:mm:ss#<randomId>` — allows multiple entries per second, parseable by appending `Z`.

### 4.2 Query Log API

**Score: 9/10**

| Endpoint | Features |
|----------|---------|
| `GET /api/query-log/:chatbotId` | Date range, order, limit 1-200, feedback filter, DynamoDB cursor pagination |
| `POST /api/query-log/:chatbotId/search` | In-memory substring search across query + answer |
| `POST /api/query-log/:chatbotId/feedback` | Record thumbs up/down per log entry |
| `GET /api/query-log/:chatbotId/export` | CSV download with date range filter |
| `GET /api/query-log/:chatbotId/analytics` | Aggregated: total queries, thumbs up/down %, unique sessions, avg response time, daily volume, top 10 queries |

### 4.3 Analytics Dashboard UI

**Score: 9/10**

- 4 stat cards: Total Queries, Avg Response Time, Positive Feedback %, Unique Sessions
- Bar chart with 7d/30d/90d views, hover tooltips
- Query log table with expand-to-full-text rows, search, pagination
- Export to CSV button

### 4.4 Lead Analytics

**Score: 9/10**

- Intent breakdown (Hot/Warm/Cold counts + percentages)
- Status funnel (New/Contacted/Converted/Archived)
- 30-day lead volume trend chart
- Export to CSV with dynamic custom fields

---

## 5. Channel Integrations

**Overall Score: 6.8/10** — Significant variance by channel.

### 5.1 Slack

**Score: 8.5/10**

| Component | Status |
|-----------|--------|
| OAuth flow (Lambda) | Fully implemented — exchanges code, stores bot token, shows success HTML |
| `@mention` handler | Fully implemented — RAG query + Block Kit response with citations + feedback buttons |
| `/corpus` slash command | Fully implemented — same RAG pipeline, Slack Markdown formatting |
| Direct message handler | Basic — redirects to use @mention or slash command |
| Thread history | Not persisted — each message is stateless |
| Feedback button persistence | Buttons rendered but clicks only logged, not saved to DB |

### 5.2 Telegram

**Score: 7/10**

- `/start` and `/help` commands implemented
- Typing indicator sent before processing
- RAG pipeline with `topK: 3`, `maxTokens: 800`, Markdown formatting
- **Missing**: Webhook signature verification (secret key generated but never validated on incoming requests — security gap)
- **Missing**: Thread/session history, media messages, rich keyboard responses

### 5.3 WhatsApp Business

**Score: 7/10**

- Webhook verification (GET with `hub.verify_token`) fully implemented
- Text message processing via Meta Graph API
- RAG pipeline with `topK: 3`, `maxTokens: 500`, short-form response directive
- **Missing**: Read receipts, media messages (images, audio, documents), interactive message templates, 24-hour session window management

### 5.4 Google Drive

**Score: 3/10** — Connection management only, no actual file sync.

- Can store a refresh token per profile
- Can link a chatbot to a Drive profile
- **No OAuth flow** — requires pre-provided refresh token
- **No file sync mechanism** — no scheduled job, no Lambda, no folder traversal
- **No file format handling** for Drive documents

### 5.5 Zapier

**Score: 5/10** — Registration works, triggering does not.

- Subscribe/unsubscribe endpoints exist
- Sample payload endpoint for Zapier to infer schema
- Dashboard UI to enter webhook URL
- **Webhook never fires** — no code in lead or chat pipelines that POSTs to the stored hook URL

---

## 6. Database Connections & Text-to-SQL

**Overall Score: 8.5/10** — One of the most complete features.

### 6.1 Database Connection Management

**Score: 9/10**

Supports 4 database types: **PostgreSQL**, **MySQL**, **MS SQL Server**, **MongoDB**.

- Credentials encrypted before storage (host, database, username, password, SSL certs, connection strings)
- Test connection endpoint (10s timeout)
- Fire-and-forget schema introspection on save
- Manual schema refresh endpoint
- Credentials masked in all API responses (`"****"`)
- Full CRUD for connections

### 6.2 Schema Introspection

**Score: 9/10**

| Database | Method |
|----------|--------|
| PostgreSQL | `information_schema.columns` with SSL, primary key detection |
| MySQL | `information_schema.COLUMNS`, character sets |
| MS SQL Server | `INFORMATION_SCHEMA.COLUMNS` + primary key lookup |
| MongoDB | Samples 10 docs per collection, infers field types |

Output schema stored in DynamoDB `schemaDoc` field as JSON. Includes: connection ID, DB type, tables/collections, columns with types/nullable/primaryKey.

### 6.3 Text-to-SQL Pipeline

**Score: 8.5/10**

7-component pipeline in `packages/aws-common/src/text-to-sql/`:

| Component | Details |
|-----------|---------|
| **Intent Detection** | Two-tier: keyword scoring first (fast), LLM disambiguation only when ambiguous (0.3–0.7 confidence). Skips DB path if RAG keywords dominate. |
| **Query Generation** | GPT-4o-mini, temperature=0, database-specific system prompts. Enforces SELECT-only, auto-injects LIMIT 50. Returns confidence score. |
| **Validation** | Blocks INSERT/UPDATE/DELETE/DROP/TRUNCATE/ALTER, SQL injection patterns (`--`, `/* */`, `xp_cmdshell`), `INFORMATION_SCHEMA` probing. Enforces LIMIT ≤ 200. |
| **Execution** | Per-DB drivers (pg, mysql2, mssql, mongodb). 15s timeout, max 50 rows. MongoDB supports both aggregation pipelines and find(). |
| **Formatting** | LLM converts rows to natural language. Single aggregates bolded, 1-2 columns as bullet lists, 3+ columns as markdown tables. |
| **Error Retry** | On execution error: regenerates query with error context appended, retries once. |
| **Integration** | `processQuery()` checks for DB intent before cache lookup. Returns `queryType: 'database'`, `executedQuery`, `connectionName` in response. |

Minimum confidence threshold: 0.70 (below this, falls back to RAG).

### 6.4 Database Dashboard UI

**Score: 9/10** — Comprehensive 65KB page.

- Connection list with status indicators, last-synced timestamp
- Add connection modal: type selector, host/port/db/user/password, SSL options, MSSQL options, MongoDB connection string support
- Schema browser: table list, column viewer
- Test connection button (before save)
- Natural language query test panel: input, run button, results table, executed SQL display, row count, duration

---

## 7. Authentication & User Management

**Overall Score: 7.5/10**

### 7.1 Email/Password Auth (AWS Cognito)

**Score: 8.5/10**

- Registration with email, password, name → Cognito UserPool → DynamoDB `UserModel`
- Login returns IdToken + AccessToken + RefreshToken
- Auto-creates DynamoDB user on first successful Cognito auth (migration safety)
- Email verification flow (6-digit code from Cognito)
- Welcome email via AWS SES on first verification

### 7.2 Google SSO

**Score: 9/10**

- Backend redirects to Cognito Hosted UI → Google → Cognito callback
- Code exchange at `GET /api/auth/google/callback`
- Auto-creates DynamoDB user on first Google login
- Updates name + picture on subsequent logins
- Redirects to dashboard with tokens in URL hash

### 7.3 Token Management & Refresh

**Score: 7.5/10**

- Dashboard `AuthContext` extracts tokens from URL hash `#auth={...}` on first load
- Proactive refresh every 60s — refreshes if token expires within 5 minutes
- On refresh failure: clears tokens + redirects to sign-in
- **Gap**: No token rotation (Cognito doesn't issue new refresh token on refresh)
- **Gap**: No server-side session management (stateless JWT only)

### 7.4 Password Reset

**Score: 8/10**

- Cognito `ForgotPasswordCommand` → email with code
- `ConfirmForgotPasswordCommand` with code + new password
- Specific error handling: `CodeMismatchException`, `ExpiredCodeException`, `InvalidPasswordException`
- Generic success message (doesn't reveal if user exists — security best practice)

### 7.5 Multi-Tenancy (User Isolation)

**Score: 7/10**

- All DynamoDB queries scoped by `username` (email)
- Ownership check on every protected endpoint: `chatbot.username === req.user.email`
- `authenticateToken` middleware calls Cognito `GetUserCommand` on every request
- **Gap**: No organization/workspace concept — single-user only, no team collaboration
- **Gap**: No data residency controls

---

## 8. Billing & Subscription

**Overall Score: 8/10**

Stripe SDK integrated. 4 tiers:

| Tier | Name | Price | Chat Quota | Chatbots | Storage | Web Pages |
|------|------|-------|-----------|----------|---------|-----------|
| 0 | Free | $0 | 20/mo | 1 | 10 MB | 10 |
| 1 | Starter | $19/mo | 1,500/mo | 3 | 100 MB | 100 |
| 2 | Standard | $99/mo | 7,500/mo | 10 | 500 MB | 500 |
| 3 | Business | $399/mo | 15,000/mo | unlimited | 2 GB | 2,000 |

**Implemented:**
- Stripe checkout session creation → hosted checkout
- Webhook handler for: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Customer billing portal (view invoices, update payment method, cancel)
- Cancel at period end
- Billing page UI: current plan + usage bars, plan cards, upgrade/manage/cancel buttons

**Missing:**
- Payment failure grace period (`// TODO` exists in code)
- Annual billing option
- Coupon/discount codes
- Proration handling on mid-cycle upgrade
- Email templates for payment events are stubs

---

## 9. Quota & Rate Limiting

**Overall Score: 3.5/10** — Infrastructure built, enforcement missing.

### 9.1 Quota

**Score: 4/10**

- `GET /api/quota` and `GET /api/quota/:chatbotId` return detailed usage vs limits
- `GET /api/quota/usage` shows per-chatbot breakdown
- `UserModel` tracks `chat_usage`, `resetAt`, `expireAt`
- `ChatbotModel` tracks `fileSizeUsage`, `webCountUsage`
- **Chat quota is NOT enforced** on `POST /api/chat` (backend and lambda chat both skip the check by default)
- **Storage quota is NOT enforced** on file upload
- **Chatbot creation quota** IS enforced (only quota that actually blocks)

### 9.2 Rate Limiting

**Score: 3/10**

Rate limit middleware is fully built (`rateLimits.auth`, `rateLimits.api`, `rateLimits.chat`, `rateLimits.passwordReset`) but **never imported or applied to any route file**. Auth endpoints have no brute-force protection in production.

---

## 10. API Keys & Access Control

**Overall Score: 5.5/10** — Backend complete, frontend empty.

### 10.1 API Key Management

**Score: 6.5/10**

- PBKDF2-SHA512 hashing with per-key salt (10,000 iterations)
- Key format: `corpus_${nanoid(32)}` — displayed only once at creation
- Key prefix stored for UI display (never the full key)
- Metadata: label, createdAt, lastUsed (stored but never updated), createdBy
- Public validation endpoint: `POST /api/access-control/validate`
- **Frontend page exists but is empty** (`/chatbots/[id]/settings/api-keys/page.tsx`)

### 10.2 Chatbot Access Control

**Score: 5.5/10**

- `accessMode` field: `public`, `private`, `whitelist`
- Email-based whitelist per chatbot with invite email sent on grant
- Immediate grant/revoke (no approval workflow)
- **Access modes are NOT enforced** — all chatbot access still requires auth regardless of mode
- **Frontend security page exists but is empty** (`/chatbots/[id]/settings/security/page.tsx`)

---

## 11. Embeddable Widget

**Overall Score: 9/10**

### 11.1 Widget JavaScript

**Score: 9/10**

Served at `GET /api/widget.js` — pure vanilla JS IIFE, zero dependencies.

- Embed via: `<script src="/api/widget.js" data-chatbot-id="..." data-position="right"></script>`
- Creates chat bubble + iframe pointing to `/dashboard/widget/{chatbotId}?embed=true`
- Responsive: 400×600px desktop; full-screen minus padding on mobile (<480px)
- Toggle open/close; listens for `corpusai:close` message from iframe
- Z-index: 2,147,483,647 (maximum)

### 11.2 Widget Page

**Score: 9/10**

Dual mode based on `?embed=true`:
- `embed=true`: `WidgetChat` (fills parent iframe, no bubble)
- Direct URL: `ChatWidget` (with bubble, for preview)

Loads config from public endpoints (no auth): chatbot status, customization, lead fields.

### 11.3 Deploy Page

**Score: 8/10**

- Generates embed snippet with copy-to-clipboard
- Integration cards: Website, WordPress (instructions), Slack (OAuth), Telegram (BotFather steps), Shopify (coming soon)
- Filter by category (Website / Messaging / E-commerce)

---

## 12. Dashboard UI & Chat Interface

**Overall Score: 8/10**

### 12.1 Navigation & Layout

**Score: 9/10**

- Fixed 240px sidebar, 56px header with backdrop blur
- Dynamic nav: shows chatbot-specific sections only when on a chatbot detail page
- Real-time quota bars (Queries, Chatbots, Storage) with warning colors at >80%
- Upgrade button for tier < 3 users

### 12.2 Chatbot List

**Score: 9/10**

- Real-time search (title, description, origin)
- Status badges with pulse animation (Active=emerald, Building=amber, Error=red)
- Skeleton loaders, empty state with CTA
- Delete modal with confirmation

### 12.3 Chatbot Creation Wizard

**Score: 9/10**

4-step wizard: Basics → Source type → Configure source → Review & Create
Supports all 3 source types with per-type validation and file drag-and-drop.

### 12.4 Chat Testing Interface

**Score: 9/10**

- Loads full chat history on mount
- Markdown rendering (`react-markdown` + `remark-gfm`)
- Inline citation references `[1]` `[2]` with expandable source panels (auto-close after 2s)
- Database query indicator (badge showing connection name + expandable SQL)
- Thumbs up/down feedback, copy button
- Typing indicator (3 bouncing dots)
- Shift+Enter for newline, Enter to send

### 12.5 Data Sources Management

**Score: 9/10**

- Tabbed view: All, Documents, Web, Text
- Per-source status: Active, Processing (spinner), Error
- Processing banner when any source is still building
- 5-second polling while chatbot is in BUILDING state
- Add data modal: drag-and-drop files, URL list, text paste
- View (eye icon) opens source file or URL

### 12.6 Remaining Dashboard Pages

| Page | Score | Notes |
|------|-------|-------|
| General Settings | 9/10 | Title/desc/language, delete with name confirmation |
| Customization | 9/10 | 3 tabs, live preview, unsaved-changes warning |
| Analytics | 9/10 | Stats, chart, log table, export |
| Leads | 9/10 | List, detail dialog, trigger config, export |
| API Keys | 1/10 | Page file exists, content empty |
| Security/Access Control | 1/10 | Page file exists, content empty |
| Integrations | 7/10 | Connect/disconnect for Slack/Telegram/WhatsApp/Zapier |
| Database Tools | 9/10 | Full connection manager + NL query test panel |
| Deploy | 9/10 | Embed snippet, integration instructions |
| Billing | 9/10 | Plan cards, usage bars, upgrade/manage/cancel |

### 12.7 Infrastructure

| Concern | Implementation | Score |
|---------|---------------|-------|
| State management | Zustand + Immer (`chatbot-store`, `header-store`) | 9/10 |
| API client | 40+ typed endpoints, auto-token-refresh on 401 | 9/10 |
| Dark mode | ThemeContext, localStorage persistence, Tailwind `dark:` classes | 8/10 |
| Responsive design | Mobile sidebar hidden + hamburger, 1→2→3 column grids | 9/10 |
| Notifications | Raw `alert()` calls — no toast library | 2/10 |
| Real-time updates | Polling only (5s for build status) — no WebSocket in dashboard | 2/10 |

---

## 13. Marketing Website

**Overall Score: 8/10**

Full Next.js marketing site with 15 sections on home page:

NavbarV4 → HeroV4 → LogoBar → AgenticShowcase → DatabaseSection → FeatureBento → WorkflowTimeline → IntegrationsOrbit → MetricsBanner → UseCaseCards → TestimonialV4 → PricingV4 → FAQV4 → FinalCTAV4 → FooterV4

Dark-themed (`#08080A` background, `#BF56FF` purple accent). Sign-In page handles login, signup, email verification, forgot password, and Google SSO in a single-page multi-step flow.

---

## 14. Overall Platform Score

| Feature Domain | Score |
|----------------|-------|
| RAG Pipeline | **9/10** |
| Chatbot Management | **8.5/10** |
| Lead Capture | **8.5/10** |
| Analytics & Query Logging | **9/10** |
| Slack Integration | **8.5/10** |
| Telegram Integration | **7/10** |
| WhatsApp Integration | **7/10** |
| Google Drive Integration | **3/10** |
| Zapier Webhooks | **4/10** |
| Database Connections | **9/10** |
| Text-to-SQL | **8.5/10** |
| Email/Password Auth | **8.5/10** |
| Google SSO | **9/10** |
| Token Management | **7.5/10** |
| Billing (Stripe) | **8/10** |
| Quota Enforcement | **4/10** |
| Rate Limiting | **3/10** |
| API Keys | **6.5/10** |
| Access Control | **5.5/10** |
| Embeddable Widget | **9/10** |
| Dashboard UI | **8/10** |
| Marketing Website | **8/10** |
| **PLATFORM AVERAGE** | **7.4/10** |

---

## 15. Critical Gaps Summary

Issues that directly affect production correctness or security:

| Priority | Gap | Impact |
|----------|-----|--------|
| P0 | Rate limiting defined but never applied to any route | Auth endpoints vulnerable to brute force |
| P0 | Chat quota not enforced in `processQuery()` | Free users can make unlimited queries |
| P0 | Telegram/WhatsApp webhook signature not verified | Fake webhook injection possible |
| P1 | Zapier webhook never fires from lead or chat pipeline | Integration silently broken |
| P1 | API Keys + Security settings pages empty | Users can't manage keys or access from UI |
| P1 | Access modes (public/private/whitelist) not enforced | Mode toggle has no real effect |
| P1 | Google Drive: no file sync mechanism | Connection UI exists but does nothing |
| P2 | Stripe payment failure grace period not implemented (TODO) | Subscription may linger after failed payment |
| P2 | Slack feedback buttons not persisted to database | Feedback data lost |
| P2 | Integration tokens (Slack, Telegram, WhatsApp) stored plain text | Should be encrypted like DB credentials |
| P2 | `lastUsed` timestamp on API keys never updated | Key usage tracking non-functional |
| P3 | No toast/notification library — uses `alert()` | Poor UX for errors/success |
| P3 | Dashboard has no WebSocket — polling only for build status | 5s lag in build feedback |
| P3 | No incremental RAG indexing — always full rebuild | Slow rebuilds when only one source changes |
| P3 | Sparse/hybrid Pinecone search code exists but never runs | Dense-only search in practice |

---

## 16. Feature Ideas for Next Phase

Based on the existing architecture, high-leverage additions would be:

### Tier 1 — Fill Critical Gaps (Fix what's broken)
- Wire rate limiting to auth routes (5-line change per route file)
- Enforce chat quota inside `processQuery()` (already has the check stub)
- Build API Keys management UI (backend is 100% complete)
- Build Access Control UI (backend is 100% complete)
- Fire Zapier webhooks from `leads.controller.ts` (webhook call code exists, just not called)
- Add Telegram/WhatsApp signature verification

### Tier 2 — High-Value New Features
- **AI Agent Actions** — Let users define tool-calling actions (HTTP webhooks, database writes) the chatbot can invoke during chat
- **Conversation Memory** — Cross-session persistent memory per end-user identity (currently each session is stateless beyond chat history)
- **Knowledge Base Q&A Suggestions** — Auto-generate FAQ from indexed content using the RAG pipeline
- **Chatbot Inbox** — Unified inbox showing all active conversations across channels (Slack, WhatsApp, Telegram, widget) in one dashboard view
- **Proactive Messaging** — Schedule chatbot messages to users (WhatsApp/Telegram push)
- **Human Handoff** — Escalation flow where chatbot transfers conversation to human agent when confidence is low or user requests it
- **A/B Testing for Prompts** — Test two system prompts against each other and compare feedback scores
- **Custom Domain Widget** — Allow widget to be hosted on user's own domain (CNAME)

### Tier 3 — Platform Expansion
- **Team Workspaces** — Organization accounts with multiple users, roles (admin, editor, viewer)
- **Google Drive Sync** — Scheduled job to re-index changed Drive documents (backend connection model already exists)
- **Shopify Integration** — Product catalog ingestion + order lookup via Text-to-SQL
- **Voice Interface** — WebRTC/Whisper ASR + TTS for voice-enabled chatbot widget
- **White-Label Mode** — Remove Corpus AI branding for reseller plans
- **Usage-Based Billing** — Pay-per-query above plan quota instead of hard cutoff
- **Chatbot Marketplace** — Pre-built chatbot templates (Customer Support, HR Assistant, Legal Q&A) users can clone and customize
