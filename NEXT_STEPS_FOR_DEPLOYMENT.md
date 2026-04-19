# Next Steps to Deploy Corpus AI

AWS infrastructure is done for both staging and prod. Now deploy the apps.

## 1. Deploy Backend to Railway

- Create Railway project → connect GitHub repo
- Create two services (one per environment):
  - **Staging:** branch `staging`, root `apps/backend`
  - **Production:** branch `production`, root `apps/backend`
- Build command: `pnpm install && pnpm build`
- Start command: `pnpm start`
- Env vars: copy from `infra/terraform/STAGING_SETUP.md` and `PRODUCTION_SETUP.md` (Railway section)
- Add custom domain:
  - Staging → `api-staging.corpusai.io`
  - Production → `api.corpusai.io`

## 2. Deploy Frontends to Vercel

Four Vercel projects (2 apps × 2 envs):

| Vercel project | Root | Branch | Custom domain |
|---|---|---|---|
| website-staging | `apps/website` | `staging` | `staging.corpusai.io` |
| website-prod | `apps/website` | `production` | `corpusai.io` |
| dashboard-staging | `apps/dashboard` | `staging` | `app-staging.corpusai.io` |
| dashboard-prod | `apps/dashboard` | `production` | `app.corpusai.io` |

Env vars: copy from the respective SETUP.md files.

## 3. Add DNS records in Spaceship

After Railway/Vercel give you target hostnames, add CNAMEs in Spaceship DNS:

| Host | CNAME target |
|---|---|
| `api-staging.corpusai.io` | (from Railway staging) |
| `api.corpusai.io` | (from Railway production) |
| `staging.corpusai.io` | (from Vercel website-staging) |
| `corpusai.io` | (from Vercel website-prod) |
| `app-staging.corpusai.io` | (from Vercel dashboard-staging) |
| `app.corpusai.io` | (from Vercel dashboard-prod) |

## 4. Request SES production access

AWS Console → SES → "Request production access".
Until approved, emails only work for verified addresses. Takes ~24h.

## 5. Smoke test

For each env hit `/health`, sign up, sign in, create chatbot, upload file, chat.

See `infra/terraform/STAGING_SETUP.md` and `PRODUCTION_SETUP.md` for all env vars and IDs.
