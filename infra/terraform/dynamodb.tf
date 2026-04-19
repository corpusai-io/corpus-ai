# DynamoDB tables — schemas mirror apps/backend/setup-aws-dynamodb.js exactly.
# If you add a GSI or change keys there, update it here too.

locals {
  dynamo_common = {
    billing_mode                = "PAY_PER_REQUEST"
    point_in_time_recovery      = var.environment == "prod"
    deletion_protection_enabled = var.environment == "prod"
  }
}

# --- corpus-users ---
resource "aws_dynamodb_table" "users" {
  name         = "corpus-users-${local.suffix}"
  billing_mode = local.dynamo_common.billing_mode
  hash_key     = "username"
  attribute {
    name = "username"
    type = "S"
  }
  point_in_time_recovery {
    enabled = local.dynamo_common.point_in_time_recovery
  }
  deletion_protection_enabled = local.dynamo_common.deletion_protection_enabled
  server_side_encryption {
    enabled = true
  }
}

# --- corpus-chatbots ---
resource "aws_dynamodb_table" "chatbots" {
  name         = "corpus-chatbots-${local.suffix}"
  billing_mode = local.dynamo_common.billing_mode
  hash_key     = "chatbotId"
  attribute {
    name = "chatbotId"
    type = "S"
  }
  attribute {
    name = "username"
    type = "S"
  }
  global_secondary_index {
    name            = "username-index"
    hash_key        = "username"
    projection_type = "ALL"
  }
  point_in_time_recovery {
    enabled = local.dynamo_common.point_in_time_recovery
  }
  deletion_protection_enabled = local.dynamo_common.deletion_protection_enabled
  server_side_encryption {
    enabled = true
  }
}

# --- corpus-customization ---
resource "aws_dynamodb_table" "customization" {
  name         = "corpus-customization-${local.suffix}"
  billing_mode = local.dynamo_common.billing_mode
  hash_key     = "chatbotId"
  range_key    = "id"
  attribute {
    name = "chatbotId"
    type = "S"
  }
  attribute {
    name = "id"
    type = "S"
  }
  point_in_time_recovery {
    enabled = local.dynamo_common.point_in_time_recovery
  }
  deletion_protection_enabled = local.dynamo_common.deletion_protection_enabled
  server_side_encryption {
    enabled = true
  }
}

# --- corpus-main (ElectroDB single-table, uppercase PK/SK) ---
resource "aws_dynamodb_table" "main" {
  name         = "corpus-main-${local.suffix}"
  billing_mode = local.dynamo_common.billing_mode
  hash_key     = "PK"
  range_key    = "SK"
  attribute {
    name = "PK"
    type = "S"
  }
  attribute {
    name = "SK"
    type = "S"
  }
  attribute {
    name = "gsi1pk"
    type = "S"
  }
  attribute {
    name = "gsi1sk"
    type = "S"
  }
  global_secondary_index {
    name            = "gsi1pk-gsi1sk-index"
    hash_key        = "gsi1pk"
    range_key       = "gsi1sk"
    projection_type = "ALL"
  }
  point_in_time_recovery {
    enabled = local.dynamo_common.point_in_time_recovery
  }
  deletion_protection_enabled = local.dynamo_common.deletion_protection_enabled
  server_side_encryption {
    enabled = true
  }
}

# --- corpus-access-control ---
resource "aws_dynamodb_table" "access_control" {
  name         = "corpus-access-control-${local.suffix}"
  billing_mode = local.dynamo_common.billing_mode
  hash_key     = "chatbotId"
  range_key    = "email"
  attribute {
    name = "chatbotId"
    type = "S"
  }
  attribute {
    name = "email"
    type = "S"
  }
  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }
  point_in_time_recovery {
    enabled = local.dynamo_common.point_in_time_recovery
  }
  deletion_protection_enabled = local.dynamo_common.deletion_protection_enabled
  server_side_encryption {
    enabled = true
  }
}

# --- corpus-query-log ---
resource "aws_dynamodb_table" "query_log" {
  name         = "corpus-query-log-${local.suffix}"
  billing_mode = local.dynamo_common.billing_mode
  hash_key     = "passageIndex"
  range_key    = "uniqueTimestamp"
  attribute {
    name = "passageIndex"
    type = "S"
  }
  attribute {
    name = "uniqueTimestamp"
    type = "S"
  }
  attribute {
    name = "sessionId"
    type = "S"
  }
  global_secondary_index {
    name            = "sessionId-uniqueTimestamp-index"
    hash_key        = "sessionId"
    range_key       = "uniqueTimestamp"
    projection_type = "ALL"
  }
  point_in_time_recovery {
    enabled = local.dynamo_common.point_in_time_recovery
  }
  deletion_protection_enabled = local.dynamo_common.deletion_protection_enabled
  server_side_encryption {
    enabled = true
  }
}

# --- corpus-lead-generation ---
resource "aws_dynamodb_table" "lead_generation" {
  name         = "corpus-lead-generation-${local.suffix}"
  billing_mode = local.dynamo_common.billing_mode
  hash_key     = "chatbotId"
  range_key    = "uniqueTimestamp"
  attribute {
    name = "chatbotId"
    type = "S"
  }
  attribute {
    name = "uniqueTimestamp"
    type = "S"
  }
  point_in_time_recovery {
    enabled = local.dynamo_common.point_in_time_recovery
  }
  deletion_protection_enabled = local.dynamo_common.deletion_protection_enabled
  server_side_encryption {
    enabled = true
  }
}

# --- corpus-integrations (lowercase pk/sk) ---
resource "aws_dynamodb_table" "integrations" {
  name         = "corpus-integrations-${local.suffix}"
  billing_mode = local.dynamo_common.billing_mode
  hash_key     = "pk"
  range_key    = "sk"
  attribute {
    name = "pk"
    type = "S"
  }
  attribute {
    name = "sk"
    type = "S"
  }
  attribute {
    name = "gsi1pk"
    type = "S"
  }
  attribute {
    name = "gsi1sk"
    type = "S"
  }
  attribute {
    name = "gsi2pk"
    type = "S"
  }
  attribute {
    name = "gsi2sk"
    type = "S"
  }
  global_secondary_index {
    name            = "gsi1pk-gsi1sk-index"
    hash_key        = "gsi1pk"
    range_key       = "gsi1sk"
    projection_type = "ALL"
  }
  global_secondary_index {
    name            = "gsi2pk-gsi2sk-index"
    hash_key        = "gsi2pk"
    range_key       = "gsi2sk"
    projection_type = "ALL"
  }
  point_in_time_recovery {
    enabled = local.dynamo_common.point_in_time_recovery
  }
  deletion_protection_enabled = local.dynamo_common.deletion_protection_enabled
  server_side_encryption {
    enabled = true
  }
}

# --- corpus-chat-history ---
resource "aws_dynamodb_table" "chat_history" {
  name         = "corpus-chat-history-${local.suffix}"
  billing_mode = local.dynamo_common.billing_mode
  hash_key     = "chatbotId"
  range_key    = "messageId"
  attribute {
    name = "chatbotId"
    type = "S"
  }
  attribute {
    name = "messageId"
    type = "S"
  }
  attribute {
    name = "username"
    type = "S"
  }
  global_secondary_index {
    name            = "username-chatbotId-index"
    hash_key        = "username"
    range_key       = "chatbotId"
    projection_type = "ALL"
  }
  point_in_time_recovery {
    enabled = local.dynamo_common.point_in_time_recovery
  }
  deletion_protection_enabled = local.dynamo_common.deletion_protection_enabled
  server_side_encryption {
    enabled = true
  }
}

# --- corpus-api-keys ---
resource "aws_dynamodb_table" "api_keys" {
  name         = "corpus-api-keys-${local.suffix}"
  billing_mode = local.dynamo_common.billing_mode
  hash_key     = "chatbotId"
  range_key    = "keyId"
  attribute {
    name = "chatbotId"
    type = "S"
  }
  attribute {
    name = "keyId"
    type = "S"
  }
  point_in_time_recovery {
    enabled = local.dynamo_common.point_in_time_recovery
  }
  deletion_protection_enabled = local.dynamo_common.deletion_protection_enabled
  server_side_encryption {
    enabled = true
  }
}

# --- corpus-database-connections ---
resource "aws_dynamodb_table" "database_connections" {
  name         = "corpus-database-connections-${local.suffix}"
  billing_mode = local.dynamo_common.billing_mode
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }
  attribute {
    name = "chatbotId"
    type = "S"
  }
  global_secondary_index {
    name            = "chatbotId-index"
    hash_key        = "chatbotId"
    projection_type = "ALL"
  }
  point_in_time_recovery {
    enabled = local.dynamo_common.point_in_time_recovery
  }
  deletion_protection_enabled = local.dynamo_common.deletion_protection_enabled
  server_side_encryption {
    enabled = true
  }
}
