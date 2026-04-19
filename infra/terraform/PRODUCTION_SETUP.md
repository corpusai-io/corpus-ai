# Corpus AI — Production Infrastructure

Reference doc for the AWS production environment. Same pattern as staging, with
isolated resources (`-prod` suffix) and a separate Terraform workspace.

---

## Overview

- **AWS account:** `934565990520`
- **Region:** `eu-north-1`
- **Domain:** `corpusai.io`
- **Environment:** `prod` — suffix `-prod` on all resources
- **Terraform workspace:** `prod` (staging lives in `default`)

### Resources created

Same 29 resources as staging, minus SES identity + DKIM (SES domain is shared;
only created once in the staging workspace). Every other resource is fully isolated
from staging.

Production differences vs. staging:

| Setting | Staging | Production |
|---|---|---|
| DynamoDB Point-in-Time Recovery | off | **on** |
| DynamoDB deletion protection | off | **on** |
| S3 versioning | suspended | **enabled** |
| S3 force_destroy | true (for easy teardown) | **false** |
| Cognito pool deletion protection | inactive | **active** |
| Secrets Manager recovery window | 0 days | **30 days** |

---

## Runtime values

```
Cognito User Pool ID : eu-north-1_GFnPqQBwd
Cognito Client ID    : 3gpknvcbqtlqe6lk1gshma00rs
Cognito Hosted UI    : corpus-prod.auth.eu-north-1.amazoncognito.com
S3 bucket            : corpus-ai-files-prod
SQS queue URL        : https://sqs.eu-north-1.amazonaws.com/934565990520/corpus-ai-queue-prod
SQS DLQ URL          : https://sqs.eu-north-1.amazonaws.com/934565990520/corpus-ai-queue-prod-dlq
Secrets Manager name : corpus-ai/production
Runtime IAM user     : corpus-backend-prod
```

---

## DNS records (Spaceship → `corpusai.io`)

**No new SES records needed** — production uses the same verified domain identity
as staging. Emails will send from the same verified `corpusai.io` sender.

### To add when frontends + backend are deployed

| Host | Points to | Record type |
|---|---|---|
| `corpusai.io` | Vercel (website prod) | A / CNAME (Vercel will specify) |
| `app.corpusai.io` | Vercel (dashboard prod) | CNAME to Vercel target |
| `api.corpusai.io` | Railway (backend prod) | CNAME to Railway target |

Get the exact target values from Vercel/Railway after you add the custom domain
in their dashboards. Then add the corresponding CNAME in Spaceship DNS.

---

## Railway — backend (`api.corpusai.io`)

### Environment variables

```env
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=AKIA5TGDZKB4EOL3WPUF
AWS_SECRET_ACCESS_KEY=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

AWS_SM_SECRET_NAME=corpus-ai/production

NODE_ENV=production
PORT=8001
```

Everything else is in Secrets Manager at `corpus-ai/production`.

### Deploy settings

- **Root directory:** `apps/backend`
- **Build command:** `pnpm install && pnpm build`
- **Start command:** `pnpm start`
- **Port:** `8001`
- **Custom domain:** `api.corpusai.io`
- **Branch:** `production`

---

## Vercel — frontends

### Dashboard (`app.corpusai.io`)

- **Root directory:** `apps/dashboard`
- **Branch:** `production`

```env
NEXT_PUBLIC_API_URL=https://api.corpusai.io
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-north-1_GFnPqQBwd
NEXT_PUBLIC_COGNITO_CLIENT_ID=3gpknvcbqtlqe6lk1gshma00rs
NEXT_PUBLIC_COGNITO_REGION=eu-north-1
NEXT_PUBLIC_COGNITO_DOMAIN=corpus-prod.auth.eu-north-1.amazoncognito.com
NEXT_PUBLIC_BASE_URL=https://app.corpusai.io
```

### Website (`corpusai.io`)

- **Root directory:** `apps/website`
- **Branch:** `production`

```env
NEXT_PUBLIC_API_URL=https://api.corpusai.io
NEXT_PUBLIC_DASHBOARD_URL=https://app.corpusai.io
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-north-1_GFnPqQBwd
NEXT_PUBLIC_COGNITO_CLIENT_ID=3gpknvcbqtlqe6lk1gshma00rs
NEXT_PUBLIC_COGNITO_REGION=eu-north-1
NEXT_PUBLIC_COGNITO_DOMAIN=corpus-prod.auth.eu-north-1.amazoncognito.com
```

---

## Pinecone (created manually)

| Index | Dimension | Metric | Type | Cloud / Region |
|---|---|---|---|---|
| `corpus-dense-prod` | 3072 | cosine | Dense serverless | AWS / us-east-1 |
| `corpus-sparse-prod` | — | dotproduct | Sparse serverless | AWS / us-east-1 |

Same Pinecone API key as staging (reused).

---

## Google OAuth (production client)

Separate Google OAuth client from staging:

- **Client name:** Corpus AI - Production
- **Authorized JavaScript origins:** `https://corpus-prod.auth.eu-north-1.amazoncognito.com`
- **Authorized redirect URIs:** `https://corpus-prod.auth.eu-north-1.amazoncognito.com/oauth2/idpresponse`
- **Client ID:** `364562587505-lq8kr9mj7l58tv37jkkbn5ht02jle6dm.apps.googleusercontent.com`

Client secret is stored in `production.tfvars` and in the Cognito IdP config.

---

## Re-running Terraform for production

Always switch workspace first:

```bash
cd infra/terraform
terraform workspace select prod     # switch to prod state
terraform plan -var-file=production.tfvars
terraform apply -var-file=production.tfvars
```

To go back to staging:

```bash
terraform workspace select default  # staging state lives here
```

⚠️ **Never run `terraform apply` in the wrong workspace** — it will think the
other env's resources don't exist and try to create duplicates. Always check:

```bash
terraform workspace show
```

---

## SES — moving out of sandbox

By default, new AWS accounts are in SES sandbox mode (can only send to verified
emails). Before going live with real users, request production access:

1. AWS Console → SES → Account dashboard → "Request production access"
2. Fill form (use case: transactional emails for user signup, lead notifications)
3. Approval typically takes 24 hours

Until approved, verify any recipient emails manually for testing.

---

## Smoke test (after DNS + deploy)

1. `https://api.corpusai.io/health` → 200 OK
2. `https://corpusai.io` → sign up → email verification received
3. Sign in → redirect to `app.corpusai.io`
4. Create chatbot → upload file → chat works
5. DynamoDB `corpus-chatbots-prod` → record exists
6. Pinecone `corpus-dense-prod` → vectors upserted
7. Google SSO button works (should redirect to Google then back)
