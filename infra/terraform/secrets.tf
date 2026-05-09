locals {
  secret_name = "corpus-ai/${var.environment == "prod" ? "production" : "staging"}"

  app_secrets = {
    # OpenAI
    OPENAI_API_KEY         = var.openai_api_key
    OPENAI_MODEL           = "gpt-4o-mini"
    OPENAI_EMBEDDING_MODEL = "text-embedding-3-large"

    # Pinecone
    PINECONE_API_KEY      = var.pinecone_api_key
    PINECONE_REGION       = var.pinecone_region
    PINECONE_INDEX        = var.pinecone_index
    PINECONE_SPARSE_INDEX = var.pinecone_sparse_index

    # Cohere
    COHERE_API_KEY = var.cohere_api_key

    # Firecrawl
    FIRECRAWL_API_KEY = var.firecrawl_api_key

    # Cognito (populated from resources above)
    AWS_COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
    AWS_COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.app.id
    AWS_COGNITO_REGION       = var.aws_region
    AWS_COGNITO_DOMAIN       = "${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"

    # S3 + SQS
    S3_BUCKET_NAME      = aws_s3_bucket.files.id
    S3_REGION           = var.aws_region
    SQS_BUILD_QUEUE_URL = aws_sqs_queue.build.url
    SQS_REGION          = var.aws_region

    # Dynamo tables (mirrors env var names the backend expects)
    AWS_DYNAMO_USER_TABLE                 = aws_dynamodb_table.users.name
    AWS_DYNAMO_CHATBOT_TABLE              = aws_dynamodb_table.chatbots.name
    AWS_DYNAMO_CUSTOMIZATION_TABLE        = aws_dynamodb_table.customization.name
    AWS_DYNAMO_ACCESS_CONTROL_TABLE       = aws_dynamodb_table.access_control.name
    AWS_DYNAMO_QUERY_LOG_TABLE            = aws_dynamodb_table.query_log.name
    AWS_DYNAMO_LEAD_GENERATION_TABLE      = aws_dynamodb_table.lead_generation.name
    AWS_DYNAMO_MAIN_TABLE                 = aws_dynamodb_table.main.name
    AWS_DYNAMO_INTEGRATIONS_TABLE         = aws_dynamodb_table.integrations.name
    AWS_DYNAMO_API_KEYS_TABLE             = aws_dynamodb_table.api_keys.name
    AWS_DYNAMO_DATABASE_CONNECTIONS_TABLE = aws_dynamodb_table.database_connections.name
    AWS_DYNAMO_CHAT_HISTORY_TABLE         = aws_dynamodb_table.chat_history.name
    AWS_DYNAMO_AI_ACTIONS_TABLE           = aws_dynamodb_table.ai_actions.name
    AWS_DYNAMO_BUILTIN_INTEGRATIONS_TABLE = aws_dynamodb_table.builtin_integrations.name
    AWS_DYNAMO_RESPONSE_CACHE_TABLE       = aws_dynamodb_table.response_cache.name

    # Security
    DATABASE_ENCRYPTION_KEY = var.database_encryption_key

    # SES
    SES_SENDER_EMAIL = var.ses_sender_email
    SES_REGION       = var.aws_region
  }
}

resource "aws_secretsmanager_secret" "app" {
  name                    = local.secret_name
  description             = "Corpus AI non-AWS secrets + config for ${var.environment}"
  recovery_window_in_days = var.environment == "prod" ? 30 : 0
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id     = aws_secretsmanager_secret.app.id
  secret_string = jsonencode(local.app_secrets)
}
