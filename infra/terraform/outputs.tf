output "environment" {
  value = var.environment
}

output "aws_region" {
  value = var.aws_region
}

# Runtime credentials for Railway / Vercel environment variables
output "runtime_access_key_id" {
  value     = aws_iam_access_key.runtime.id
  sensitive = true
}

output "runtime_secret_access_key" {
  value     = aws_iam_access_key.runtime.secret
  sensitive = true
}

output "secret_name" {
  value       = aws_secretsmanager_secret.app.name
  description = "Set AWS_SM_SECRET_NAME to this in Railway to auto-load all app secrets"
}

# Cognito details
output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.app.id
}

output "cognito_domain" {
  value = "${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"
}

# S3 + SQS + SES
output "s3_bucket" {
  value = aws_s3_bucket.files.id
}

output "sqs_queue_url" {
  value = aws_sqs_queue.build.url
}

output "sqs_dlq_url" {
  value = aws_sqs_queue.build_dlq.url
}

# SES DNS records (only created in staging) — paste these into Spaceship DNS
output "ses_verification_token" {
  value       = var.environment == "staging" ? aws_ses_domain_identity.domain[0].verification_token : null
  description = "Add TXT record: _amazonses.<domain> = this value"
}

output "ses_dkim_tokens" {
  value       = var.environment == "staging" ? aws_ses_domain_dkim.domain[0].dkim_tokens : []
  description = "For each token, add CNAME: <token>._domainkey.<domain> -> <token>.dkim.amazonses.com"
}

# Dynamo table names
output "dynamo_tables" {
  value = {
    users                = aws_dynamodb_table.users.name
    chatbots             = aws_dynamodb_table.chatbots.name
    customization        = aws_dynamodb_table.customization.name
    access_control       = aws_dynamodb_table.access_control.name
    query_log            = aws_dynamodb_table.query_log.name
    lead_generation      = aws_dynamodb_table.lead_generation.name
    main                 = aws_dynamodb_table.main.name
    integrations         = aws_dynamodb_table.integrations.name
    api_keys             = aws_dynamodb_table.api_keys.name
    database_connections = aws_dynamodb_table.database_connections.name
    chat_history         = aws_dynamodb_table.chat_history.name
  }
}
