# Corpus AI — Staging Infrastructure

Reference doc for how the AWS staging environment was provisioned via Terraform, plus
all the env vars and DNS records needed to wire it up.

---

## Overview

All AWS staging infrastructure is managed by Terraform in `infra/terraform/`.
State is local (in `terraform.tfstate`) — treat that file as sensitive; it contains
resource IDs and is needed for any future `terraform apply`.

- **AWS account:** `934565990520`
- **Region:** `eu-north-1`
- **Domain:** `corpusai.io` (DNS on Spaceship, kept external)
- **Environment:** `staging` — suffix `-staging` on all resources

### Resources created

| Service | Resource | Notes |
|---|---|---|
| DynamoDB | 11 tables with `-staging` suffix | PAY_PER_REQUEST, SSE enabled, deletion protection off |
| S3 | `corpus-ai-files-staging` | block-public, CORS for widget, SSE-S3 |
| SQS | `corpus-ai-queue-staging` + DLQ | 15-min visibility timeout, max 3 retries to DLQ |
| Cognito | User pool `corpus-users-staging` | Google IdP federated, Hosted UI `corpus-staging.auth.eu-north-1.amazoncognito.com` |
| SES | Domain identity `corpusai.io` + DKIM | Shared across envs (created only in staging) |
| Secrets Manager | `corpus-ai/staging` | All app config + non-AWS keys, loaded by backend at boot |
| IAM | User `corpus-backend-staging` + least-priv policy | Access key is what Railway uses |

---

## Runtime values

These are the actual IDs Terraform produced. If you ever lose them, run
`terraform output` from `infra/terraform/`.

```
Cognito User Pool ID : eu-north-1_oh0D52g1o
Cognito Client ID    : b33ls5qkn2smbanr0pd9su50q
Cognito Hosted UI    : corpus-staging.auth.eu-north-1.amazoncognito.com
S3 bucket            : corpus-ai-files-staging
SQS queue URL        : https://sqs.eu-north-1.amazonaws.com/934565990520/corpus-ai-queue-staging
Secrets Manager name : corpus-ai/staging
Runtime IAM user     : corpus-backend-staging
```

---

## DNS records (Spaceship → `corpusai.io`)

### Already added (SES verification)

| Type | Host | Value |
|---|---|---|
| TXT | `_amazonses.corpusai.io` | `c/cbDGq1C51Rw2OHlEveQd83rtbP5xaGkTV/K6GFCCs=` |
| CNAME | `ffc62seiqsqa37mwsubeqbdzomph36zf._domainkey.corpusai.io` | `ffc62seiqsqa37mwsubeqbdzomph36zf.dkim.amazonses.com` |
| CNAME | `6tfigdbd5kc65fg5jg5jnk64am6cwgn5._domainkey.corpusai.io` | `6tfigdbd5kc65fg5jg5jnk64am6cwgn5.dkim.amazonses.com` |
| CNAME | `rxkkiemw223h4mrzqv3brrnbkycseo23._domainkey.corpusai.io` | `rxkkiemw223h4mrzqv3brrnbkycseo23.dkim.amazonses.com` |

SES verification typically completes within 15–60 min of DNS propagation. Check
status in AWS Console → SES → Verified identities.

### To add when frontends + backend are deployed

| Host | Points to | Notes |
|---|---|---|
| `staging.corpusai.io` | Vercel (website staging) | CNAME to Vercel-provided target |
| `app-staging.corpusai.io` | Vercel (dashboard staging) | CNAME to Vercel-provided target |
| `api-staging.corpusai.io` | Railway (backend staging) | CNAME to Railway-provided target |

---

## Railway — backend (`api-staging.corpusai.io`)

### Environment variables

```env
# AWS core — these are the only AWS creds Railway needs
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=AKIA5TGDZKB4FCJEOX53
AWS_SECRET_ACCESS_KEY=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

# Secrets Manager pointer — backend loads everything else from here
AWS_SM_SECRET_NAME=corpus-ai/staging

# Node
NODE_ENV=staging
PORT=8001

# Leave DYNAMODB_ENDPOINT unset so backend talks to real AWS DynamoDB
# (setting it to http://localhost:8000 switches to local Docker DynamoDB)
```

Everything else — OpenAI, Pinecone, Cohere, Firecrawl keys, Cognito IDs, table
names, S3 bucket, SQS URL, DB encryption key — is in Secrets Manager at
`corpus-ai/staging` and loaded automatically by `apps/backend/src/bootstrap.ts`.

### Deploy settings

- **Root directory:** `apps/backend`
- **Build command:** `pnpm install && pnpm build`
- **Start command:** `pnpm start`
- **Port:** `8001`
- **Custom domain:** `api-staging.corpusai.io`
- **Branch:** `staging`

---

## Vercel — frontends

### Dashboard (`app-staging.corpusai.io`)

- **Root directory:** `apps/dashboard`
- **Framework:** Next.js (auto-detected)
- **Branch:** `staging`

```env
NEXT_PUBLIC_API_URL=https://api-staging.corpusai.io
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-north-1_oh0D52g1o
NEXT_PUBLIC_COGNITO_CLIENT_ID=b33ls5qkn2smbanr0pd9su50q
NEXT_PUBLIC_COGNITO_REGION=eu-north-1
NEXT_PUBLIC_COGNITO_DOMAIN=corpus-staging.auth.eu-north-1.amazoncognito.com
NEXT_PUBLIC_BASE_URL=https://app-staging.corpusai.io
```

### Website (`staging.corpusai.io`)

- **Root directory:** `apps/website`
- **Framework:** Next.js
- **Branch:** `staging`

```env
NEXT_PUBLIC_API_URL=https://api-staging.corpusai.io
NEXT_PUBLIC_DASHBOARD_URL=https://app-staging.corpusai.io
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-north-1_oh0D52g1o
NEXT_PUBLIC_COGNITO_CLIENT_ID=b33ls5qkn2smbanr0pd9su50q
NEXT_PUBLIC_COGNITO_REGION=eu-north-1
NEXT_PUBLIC_COGNITO_DOMAIN=corpus-staging.auth.eu-north-1.amazoncognito.com
```

---

## Pinecone

Created manually in Pinecone console (not AWS-managed):

| Index | Dimension | Metric | Type | Cloud / Region |
|---|---|---|---|---|
| `corpus-dense-staging` | 3072 | cosine | Dense serverless | AWS / us-east-1 |
| `corpus-sparse-staging` | — | dotproduct | Sparse serverless | AWS / us-east-1 |

Same Pinecone API key is reused for all envs (stored in `corpus-ai/staging` secret).

---

## Google OAuth (for Cognito Hosted UI Google sign-in)

Created in Google Cloud Console → APIs & Services → Credentials:

- **Client name:** Corpus AI - Staging
- **Type:** Web application
- **Authorized JavaScript origins:** `https://corpus-staging.auth.eu-north-1.amazoncognito.com`
- **Authorized redirect URIs:** `https://corpus-staging.auth.eu-north-1.amazoncognito.com/oauth2/idpresponse`
- **Client ID:** stored in `staging.tfvars` and Cognito IdP config
- **Client secret:** same

If you change this, re-run `terraform apply -var-file=staging.tfvars`.

---

## Re-running Terraform

From `infra/terraform/`:

```bash
# Review changes
terraform plan -var-file=staging.tfvars

# Apply
terraform apply -var-file=staging.tfvars
```

Terraform needs the admin AWS creds in env vars:

```bash
export AWS_ACCESS_KEY_ID=<admin key>
export AWS_SECRET_ACCESS_KEY=<admin secret>
export AWS_REGION=eu-north-1
```

(These are the `corpus-terraform-admin` creds, kept in `.secrets/aws-creds.txt`.
Not to be confused with the runtime key `AKIA5TGDZKB4FCJEOX53` which Railway uses.)

---

## Security notes

- `.secrets/` and `*.tfvars` are gitignored — never commit them
- `terraform.tfstate` is also gitignored; back it up separately (or move to S3 backend later)
- The runtime IAM user has least-privilege access (only to its own env's resources)
- The admin IAM user (`corpus-terraform-admin`) currently has `AdministratorAccess` — rotate / scope down after prod is live
- Secrets Manager encrypts at rest automatically

---

## Quick smoke test (after DNS + deploy)

1. Hit `https://api-staging.corpusai.io/health` — expect 200
2. Open `https://staging.corpusai.io` — sign up with email → confirm via code from `noreply@corpusai.io`
3. Sign in → should redirect to `app-staging.corpusai.io`
4. Create a chatbot → upload a small file → chat with it
5. Check Pinecone `corpus-dense-staging` — should have vectors
6. Check DynamoDB `corpus-chatbots-staging` — should have the record
