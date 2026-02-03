# Corpus AI

> AI-powered chatbot platform for building, deploying, and managing intelligent conversational agents with RAG (Retrieval-Augmented Generation) capabilities.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features & Modules](#features--modules)
- [Getting Started](#getting-started)
- [Running Locally](#running-locally)
- [Running Tests](#running-tests)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)

---

## 🎯 Overview

**Corpus AI** is a monorepo-based web platform for creating and deploying AI chatbots. It combines RAG (Retrieval-Augmented Generation) with vector search to provide accurate, context-aware responses based on your own data sources.

### Key Capabilities
- ✅ Build chatbots from websites, files, or manual data
- ✅ Customize chatbot appearance and behavior
- ✅ Lead generation with custom forms
- ✅ Multi-language support
- ✅ Query analytics and feedback tracking
- ✅ Access control (public/private/whitelist)
- ✅ Integration with Slack, Zapier, Google Drive
- ✅ Subscription management with Stripe

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.4 (App Router)
- **UI Library:** React 19.1
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x
- **Build Tool:** Turbopack

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Express.js
- **Language:** TypeScript 5.x
- **Testing:** Jest + ts-jest

### Infrastructure
- **Database:** AWS DynamoDB (with local dev support)
- **Storage:** AWS S3
- **Queue:** AWS SQS
- **Authentication:** AWS Cognito
- **Payments:** Stripe
- **AI:** OpenAI GPT-4
- **Vector DB:** Pinecone

### DevOps
- **Monorepo:** Turborepo + pnpm workspaces
- **Containerization:** Docker + Docker Compose
- **Serverless:** AWS Lambda (chat service)
- **CI/CD:** GitHub Actions (recommended)

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Website     │  Dashboard    │  Docs    │  Chat Widget     │
│  (Next.js)   │  (Next.js)    │ (Next.js)│  (Embedded)      │
└──────────────┴───────────────┴──────────┴──────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Reverse Proxy                            │
│              (Express - Route Distribution)                 │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        ▼                                   ▼
┌───────────────────┐            ┌──────────────────┐
│  Backend API      │            │  Chat Service    │
│  (Express)        │            │  (AWS Lambda)    │
│                   │            │                  │
│  - Auth           │            │  - WebSocket     │
│  - CRUD           │            │  - OpenAI        │
│  - Business Logic │            │  - RAG           │
└───────────────────┘            └──────────────────┘
        │                                   │
        └─────────────────┬─────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS Services                             │
├─────────────────────────────────────────────────────────────┤
│  DynamoDB  │  S3  │  SQS  │  Cognito  │  CloudWatch       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Request** → Frontend (Next.js)
2. **API Call** → Backend (Express) or Chat Service (Lambda)
3. **Authentication** → AWS Cognito validates JWT
4. **Business Logic** → Controllers process request
5. **Data Access** → DynamoDB/S3 via ElectroDB/Dynamoose
6. **AI Processing** → OpenAI GPT + Pinecone vector search
7. **Response** → JSON returned to frontend

---

## 📁 Project Structure

```
corpus-ai/
├── apps/                          # Applications
│   ├── backend/                   # Express API server
│   │   ├── src/
│   │   │   ├── controllers/       # Business logic
│   │   │   ├── routes/            # API routes
│   │   │   ├── middleware/        # Auth, validation
│   │   │   ├── __tests__/         # Integration tests
│   │   │   └── index.ts           # Server entry
│   │   ├── .env.development       # Local config
│   │   └── package.json
│   │
│   ├── dashboard/                 # Main web app
│   │   ├── src/
│   │   │   ├── app/               # Next.js pages
│   │   │   ├── components/        # React components
│   │   │   ├── contexts/          # React contexts
│   │   │   └── lib/               # Utilities
│   │   └── package.json
│   │
│   ├── website/                   # Marketing site
│   ├── docs/                      # Documentation site
│   └── chat_service/              # Serverless chat (Lambda)
│
├── packages/                      # Shared packages
│   ├── aws-common/                # AWS utilities
│   │   ├── src/
│   │   │   ├── dynamo-models/     # DynamoDB entities
│   │   │   ├── s3/                # S3 utilities
│   │   │   └── sqs/               # SQS utilities
│   │   └── package.json
│   │
│   └── ui/                        # Shared UI components
│
├── docker/                        # Dockerfiles
├── docker-compose.yaml            # Local dev orchestration
├── proxy-server.js                # Reverse proxy
├── turbo.json                     # Turborepo config
├── pnpm-workspace.yaml            # Workspace config
└── package.json                   # Root package
```

---

## ✨ Features & Modules

### 1. Authentication Module
- User registration with email verification (AWS Cognito)
- JWT-based authentication
- Session management
- Password reset (future)

### 2. Chatbot Management
- **Create:** From website, files, or Google Drive
- **Read:** List all chatbots, get single chatbot
- **Update:** Modify chatbot settings
- **Delete:** Remove chatbot and associated data
- **Rebuild:** Trigger re-indexing of data sources
- **Status:** Check build progress

### 3. Customization Module
- Theme colors (primary, secondary, accent)
- Welcome message
- System prompt configuration
- GPT version selection (3.5, 4, 4-turbo)
- Avatar/icon upload
- Show/hide citations

### 4. Data Store Module
- **Manual Entry:** Add text content directly
- **File Upload:** PDF, TXT, DOCX support
- **Web Crawling:** Scrape website content
- **Google Drive:** Sync files from Drive
- **CRUD Operations:** Create, read, update, delete data records
- **Batch Operations:** Bulk add/delete

### 5. Lead Generation Module
- **Custom Forms:** Drag-drop form builder
- **Field Types:** Text, email, phone, select
- **Lead Capture:** Store submissions in DynamoDB
- **Export:** Download leads as CSV
- **Notifications:** Email alerts on new leads
- **Zapier Integration:** Webhook triggers

### 6. Query Log & Analytics
- **Query History:** Track all chatbot interactions
- **Feedback:** Thumbs up/down on responses
- **Search:** Full-text search through logs
- **Analytics:** Usage stats, top queries
- **Export:** Download logs as CSV

### 7. Access Control
- **Access Modes:** Public, private, whitelist
- **Whitelist:** Email-based access control
- **API Keys:** Generate keys for programmatic access
- **Invitations:** Send email invites

### 8. Integrations
- **Slack:** Post bot responses to channels
- **Zapier:** Trigger workflows on events
- **Google Drive:** Sync files automatically
- **Telegram:** Deploy bot to Telegram
- **WhatsApp:** Deploy bot to WhatsApp (future)

### 9. User Profile
- View/update profile information
- Account statistics
- Usage tracking

### 10. Quota Management
- **Free:** 20 chats, 1 bot, 10MB
- **Starter:** 1500 chats, 2 bots, 100MB
- **Standard:** 7500 chats, 4 bots, 500MB
- **Business:** 15000 chats, 8 bots, 2GB
- Real-time usage monitoring

### 11. Payment & Subscriptions
- **Stripe Integration:** Secure payments
- **Plans:** Free, Starter ($19), Standard ($99), Business ($399)
- **Billing Portal:** Manage subscriptions
- **Webhooks:** Handle payment events
- **Invoices:** Download payment history

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** 20.x or higher
- **pnpm:** 9.0.0 or higher (required)
- **Docker:** For DynamoDB Local
- **AWS Account:** For Cognito, S3, SQS
- **OpenAI API Key:** For GPT models
- **Stripe Account:** For payments (optional)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/corpusai-io/corpus-ai.git
cd corpus-ai
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Set up environment variables:**
```bash
# Backend
cp apps/backend/.env.example apps/backend/.env.development
# Edit .env.development with your credentials

# Dashboard (optional)
cp apps/dashboard/.env.local.example apps/dashboard/.env.local
```

4. **Start DynamoDB Local:**
```bash
docker-compose up -d dynamodb-local
```

5. **Create required tables:**
```bash
cd apps/backend
node create-table.js          # Creates main tables
node create-leads-table.js     # Creates leads table
```

---

## 💻 Running Locally

### Option 1: Start All Services
```bash
pnpm dev
```

This starts:
- Website (http://localhost:3000)
- Dashboard (http://localhost:8080)
- Docs (http://localhost:3001)
- Backend API (http://localhost:8001)
- Chat Service (http://localhost:8002)

### Option 2: Start Individual Services
```bash
# Backend only
pnpm dev --filter=backend

# Dashboard only
pnpm dev --filter=dashboard

# With proxy
pnpm dev:with-proxy
```

### Development Workflow

1. **Start DynamoDB Local:**
```bash
docker-compose up -d dynamodb-local
```

2. **Start backend:**
```bash
cd apps/backend
pnpm dev
```

3. **Start dashboard (in new terminal):**
```bash
cd apps/dashboard
pnpm dev
```

4. **Access:**
- Dashboard: http://localhost:8080
- API: http://localhost:8001
- Health: http://localhost:8001/health

---

## 🧪 Running Tests

### Backend API Tests

**Prerequisites:**
1. DynamoDB Local running in Docker
2. Backend server running (`pnpm dev`)

**Run all tests:**
```bash
cd apps/backend
pnpm test:all
```

**Run specific test suites:**
```bash
# Phase 2: Core API tests (9 tests)
pnpm test

# Phase 3: Additional endpoints (8 tests)
pnpm test:phase3
```

**Test coverage:**
```bash
pnpm test:coverage
```

**What's tested:**
- ✅ Authentication (5 endpoints)
- ✅ Chatbot CRUD (3 endpoints)
- ✅ Customization (2 endpoints)
- ✅ Data Store (4 endpoints)
- ✅ Leads (4 endpoints)
- ✅ User Profile (2 endpoints)
- ✅ Quota (1 endpoint)
- ✅ Pricing Plans (1 endpoint)

**Total: 17 endpoints tested with 100% pass rate**

See [TESTING_SUMMARY.md](./TESTING_SUMMARY.md) for detailed test documentation.

---

## 🚢 Production Deployment

### Docker Deployment

1. **Build all services:**
```bash
pnpm docker:rebuild
```

2. **Start containers:**
```bash
pnpm docker:up
```

3. **Access:**
- Application: http://localhost
- Proxy handles routing automatically

### AWS Lambda Deployment (Chat Service)

```bash
cd apps/chat_service
serverless deploy --stage production
```

### Environment-Specific Builds

```bash
# Production build
pnpm build

# Start production servers
pnpm start
```

### Production Checklist

- [ ] Configure production environment variables
- [ ] Set up AWS DynamoDB tables (not local)
- [ ] Configure AWS Cognito user pool
- [ ] Set up S3 bucket for file storage
- [ ] Configure SQS queue for build jobs
- [ ] Add Stripe API keys for payments
- [ ] Set up SSL/TLS certificates
- [ ] Configure domain and DNS
- [ ] Set up monitoring and logging
- [ ] Configure CORS for production domains
- [ ] Enable rate limiting
- [ ] Set up backup strategy

---

## 🔐 Environment Variables

### Backend (`apps/backend/.env.development`)

```bash
# AWS Configuration
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# DynamoDB Local (for development)
DYNAMODB_ENDPOINT=http://localhost:8000

# DynamoDB Tables
AWS_DYNAMO_CHATBOT_TABLE=corpus-chatbots-dev
AWS_DYNAMO_USER_TABLE=corpus-users-dev
AWS_DYNAMO_CUSTOMIZATION_TABLE=corpus-customization-dev
AWS_DYNAMO_MAIN_TABLE=corpus-main-dev
AWS_DYNAMO_LEAD_GENERATION_TABLE=corpus-lead-generation-dev

# S3
S3_BUCKET_NAME=corpus-ai-files-dev
S3_REGION=eu-north-1

# SQS
SQS_BUILD_QUEUE_URL=https://sqs.eu-north-1.amazonaws.com/xxx/corpus-ai-queue
SQS_REGION=eu-north-1

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# AWS Cognito
AWS_COGNITO_USER_POOL_ID=eu-north-1_xxxxx
AWS_COGNITO_CLIENT_ID=xxxxx
AWS_COGNITO_REGION=eu-north-1

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_STANDARD=price_...
STRIPE_PRICE_ID_BUSINESS=price_...

# Server
PORT=8001
NODE_ENV=development
```

### Dashboard (`apps/dashboard/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 📚 API Documentation

### Base URL
- **Local:** http://localhost:8001
- **Production:** https://api.corpus-ai.com

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### API Modules

**Authentication** (`/api/auth`)
- POST `/register` - Register new user
- POST `/login` - Login user
- POST `/logout` - Logout user
- POST `/confirm` - Confirm email (dev only)
- GET `/me` - Get current user
- GET `/verify` - Verify JWT token

**Chatbots** (`/api/chatbots`)
- POST `/` - Create chatbot
- GET `/` - List chatbots
- GET `/:id` - Get chatbot
- PUT `/:id` - Update chatbot
- DELETE `/:id` - Delete chatbot
- POST `/:id/rebuild` - Rebuild chatbot
- GET `/:id/status` - Get build status

**Customization** (`/api/customize`)
- GET `/:chatbotId` - Get customization
- PUT `/:chatbotId` - Update customization
- POST `/:chatbotId/theme` - Update theme
- POST `/:chatbotId/prompt` - Update prompt

**Data Store** (`/api/data-store`)
- GET `/:chatbotId` - List records
- POST `/:chatbotId` - Add record
- PUT `/:chatbotId/:dataId` - Update record
- DELETE `/:chatbotId/:dataId` - Delete record
- POST `/:chatbotId/batch` - Batch add
- DELETE `/:chatbotId/batch` - Batch delete

**Leads** (`/api/leads`)
- GET `/:chatbotId` - List leads
- POST `/:chatbotId` - Add lead (public)
- GET `/:chatbotId/export` - Export CSV
- GET `/:chatbotId/fields` - Get form fields
- PUT `/:chatbotId/fields` - Update form fields

**Query Log** (`/api/query-log`)
- GET `/:chatbotId` - Get logs
- POST `/:chatbotId/search` - Search logs
- POST `/:chatbotId/feedback` - Record feedback
- GET `/:chatbotId/export` - Export logs
- GET `/:chatbotId/analytics` - Get analytics

**User** (`/api/user`)
- GET `/profile` - Get profile
- PUT `/profile` - Update profile
- PUT `/password` - Change password
- DELETE `/account` - Delete account
- GET `/stats` - Get statistics

**Quota** (`/api/quota`)
- GET `/` - Get user quota
- GET `/:chatbotId` - Check chatbot quota
- GET `/usage` - Get usage stats
- GET `/tiers` - Get available tiers

**Payment** (`/api/payment`)
- POST `/webhook` - Stripe webhook (public)
- GET `/plans` - Get pricing plans (public)
- POST `/checkout` - Create checkout
- POST `/portal` - Customer portal
- GET `/subscription` - Get subscription
- POST `/cancel` - Cancel subscription

---

## 📦 Package Scripts

### Root Level
```bash
pnpm dev              # Start all services
pnpm dev:with-proxy   # Start with proxy
pnpm build            # Build all apps
pnpm start            # Start production
pnpm lint             # Lint all code
pnpm lint:fix         # Lint and fix
pnpm format           # Format check
pnpm format:fix       # Format and fix
pnpm docker:up        # Start Docker
pnpm docker:rebuild   # Rebuild Docker
pnpm clean            # Clean node_modules
pnpm clean:ws         # Clean build artifacts
```

### Backend
```bash
pnpm dev              # Start dev server
pnpm build            # Build TypeScript
pnpm start            # Start production
pnpm test             # Run Phase 2 tests
pnpm test:phase3      # Run Phase 3 tests
pnpm test:all         # Run all tests
pnpm test:coverage    # Test with coverage
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🔗 Links

- **Website:** https://corpus-ai.com
- **Documentation:** https://docs.corpus-ai.com
- **GitHub:** https://github.com/corpusai-io/corpus-ai
- **Support:** support@corpus-ai.com

---

## 👥 Team

- **Backend:** Express + TypeScript + AWS
- **Frontend:** Next.js + React + Tailwind
- **AI/ML:** OpenAI GPT + Pinecone
- **Infrastructure:** Docker + AWS Lambda
- **Payments:** Stripe

---

**Built with ❤️ by the Corpus AI team**
