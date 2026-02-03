# Start Only Frontend Apps (Website, Docs, Dashboard)

This guide helps you run only the frontend applications **without** Lambda services.

## Quick Start

```bash
# Stop any running processes first (press Ctrl+C in terminal)

# Run only frontend apps
pnpm dev:frontend
```

This starts:
- ✅ Website (port 3000)
- ✅ Docs (port 3001)
- ✅ Dashboard (port 8080)
- ✅ Backend API (port 8001)
- ✅ UI package (development mode)

**Skips** (you don't need these now):
- ❌ Lambda services (Slack, Telegram, WhatsApp integrations)
- ❌ Chat service

## If Website Still Crashes

If you see "Next.js package not found" error for website:

### Solution 1: Clean Website Cache
```bash
# Stop all running processes (Ctrl+C)

# Remove website cache
rd /s /q apps\website\.next
rd /s /q apps\website\node_modules

# Reinstall
pnpm install

# Try again
pnpm dev:frontend
```

### Solution 2: Run Without Website
```bash
# Just run docs and dashboard (skip website for now)
pnpm dev --filter=docs --filter=dashboard --filter=backend
```

## Access Your Apps

Once running:
- **Dashboard**: http://localhost:8080/dashboard
- **Docs**: http://localhost:3001
- **Website**: http://localhost:3000 (if working)
- **Backend API**: http://localhost:8001/api

## Troubleshooting

### Port Already in Use
Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :3000
taskkill //F //PID <PID_NUMBER>
```

### Clean Everything
```bash
pnpm clean
pnpm install
pnpm dev:frontend
```
