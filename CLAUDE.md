# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Corpus AI is a monorepo-based web platform for AI app building and deployment. The project uses **pnpm workspaces** and **Turborepo** for managing multiple applications and shared packages.

## Monorepo Structure

The repository contains 5 independent applications under `apps/`:

- **website** - Main marketing/user portal (Next.js on port 3000/3002)
- **dashboard** - Main web application (Next.js on port 8080/3004)
- **docs** - Documentation site (Next.js on port 3001/3003)
- **backend** - Express API server (port 8001)
- **chat_service** - Serverless Lambda functions for chat (port 8002)

Port numbers differ between development and production modes (see proxy configuration below).

## Development Commands

### Starting Services

```bash
# Install all dependencies
pnpm install

# Start all services concurrently
pnpm dev

# Start all services with proxy server (recommended for integrated testing)
pnpm dev:with-proxy

# Start individual applications
pnpm dev --filter=website
pnpm dev --filter=dashboard
pnpm dev --filter=docs
pnpm dev --filter=backend
pnpm dev --filter=chat_service
```

### Building and Production

```bash
# Build all apps
pnpm build

# Start production servers
pnpm start

# Build specific app
turbo build --filter=website
```

### Code Quality

```bash
# Lint all code
pnpm lint

# Lint and auto-fix
pnpm lint:fix

# Format code (check only)
pnpm format

# Format and auto-fix
pnpm format:fix
```

### Docker

```bash
# Start all services in Docker
pnpm docker:up

# Rebuild containers from scratch
pnpm docker:rebuild

# View container logs
pnpm docker:logs
```

### Workspace Management

```bash
# Clean all node_modules
pnpm clean

# Clean all build artifacts
pnpm clean:ws
```

## Architecture

### Frontend Applications (Next.js 15.4)

All three frontend apps (**website**, **dashboard**, **docs**) use:
- Next.js 15.4 with App Router
- React 19.1
- TypeScript 5.x
- Tailwind CSS 4.x
- Turbopack for fast development builds

The **website** app uses route groups:
- `(auth)/` - Authentication pages (Sign-In)
- `(main)/` - Main content pages (Platform features, Integrations, Legal, etc.)

The **docs** app has component-based documentation structure under `Components/chatbots-docs-pages/`.

### Backend Services

**backend** (Express + TypeScript):
- Simple Express API server with CORS enabled
- Uses `ts-node-dev` for hot reloading in development
- MongoDB support via Mongoose
- Health check endpoint at `/health`

**chat_service** (Serverless Framework):
- AWS Lambda functions using Serverless Framework
- Runs locally via `serverless-offline` plugin
- Uses OpenAI API and WebSocket support
- Configured for AWS Lambda deployment (Node.js 18.x runtime)

### Proxy Server Architecture

The project includes a custom Express-based reverse proxy (`proxy-server.js`) that routes requests to different services:

**Route mapping:**
- `/` → website
- `/dashboard` → dashboard app
- `/docs` → docs app
- `/api` → backend service
- `/chat` → chat_service
- `/health` → proxy health check

**Environment-based routing:**
- Development: Uses localhost ports (3000, 8080, 3001, 8001, 8002)
- Production: Uses localhost ports (3002, 3004, 3003, 8001, 8002)

The proxy handles path rewriting, WebSocket upgrades, and error handling. Start it with `pnpm dev:with-proxy` or manually with `node proxy-server.js`.

### Docker Deployment

The `docker-compose.yaml` defines containerized deployment for all 5 services plus the proxy. Each service has a dedicated Dockerfile in the `docker/` directory. The proxy container runs on port 80 and routes to internal service ports.

## Key Technical Details

### Package Manager

**MUST use pnpm** (>=9.0.0). The project explicitly blocks npm and yarn via engines field.

### Turborepo Configuration

- Build outputs cached: `dist/`, `.next/`, `build/`
- Global dependencies: `.env.*local` files
- Build tasks have dependency graph (via `^build`)
- Dev tasks run persistently without caching

### Testing

The **chat_service** includes Jest configuration. Run tests with:
```bash
cd apps/chat_service
pnpm test
```

### Environment Variables

Each app may have its own `.env` file. The monorepo root has `.env.local` for shared configuration.

## Development Workflow

1. **Initial setup**: Run `pnpm install` from root
2. **Development**: Use `pnpm dev` to start all services, or filter specific apps
3. **Testing integration**: Use `pnpm dev:with-proxy` to test services behind the proxy
4. **Production testing**: Use `pnpm docker:up` to test containerized deployment
5. **Code changes**: Turborepo automatically caches unchanged packages for faster rebuilds

## Important Notes

- All Next.js apps use `--no-lint` flag during build to skip linting (handle separately)
- Dashboard and docs use Turbopack in development (`--turbopack` flag)
- The chat_service requires `.env.development` file for local development
- Backend and chat_service use `cross-env` for Windows compatibility in production scripts
