# Runtime IAM user — least privilege for backend + lambdas running on Railway/AWS.
# Access keys are output via `terraform output` so you can paste them into Railway/Vercel.

resource "aws_iam_user" "runtime" {
  name = "corpus-backend-${local.suffix}"
  path = "/corpus/"
}

resource "aws_iam_access_key" "runtime" {
  user = aws_iam_user.runtime.name
}

data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id

  dynamo_table_arns = [
    aws_dynamodb_table.users.arn,
    aws_dynamodb_table.chatbots.arn,
    aws_dynamodb_table.customization.arn,
    aws_dynamodb_table.access_control.arn,
    aws_dynamodb_table.query_log.arn,
    aws_dynamodb_table.lead_generation.arn,
    aws_dynamodb_table.main.arn,
    aws_dynamodb_table.integrations.arn,
    aws_dynamodb_table.api_keys.arn,
    aws_dynamodb_table.database_connections.arn,
    aws_dynamodb_table.chat_history.arn,
  ]

  # Include GSI ARNs (DynamoDB requires explicit permissions on indexes)
  dynamo_index_arns = [for arn in local.dynamo_table_arns : "${arn}/index/*"]
}

data "aws_iam_policy_document" "runtime" {
  # DynamoDB — full CRUD on our tables + indexes
  statement {
    sid = "DynamoDBAccess"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:BatchGetItem",
      "dynamodb:BatchWriteItem",
      "dynamodb:DescribeTable",
      "dynamodb:ConditionCheckItem",
    ]
    resources = concat(local.dynamo_table_arns, local.dynamo_index_arns)
  }

  # S3 — bucket + object access
  statement {
    sid       = "S3BucketAccess"
    actions   = ["s3:ListBucket", "s3:GetBucketLocation"]
    resources = [aws_s3_bucket.files.arn]
  }
  statement {
    sid = "S3ObjectAccess"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:GetObjectAttributes",
    ]
    resources = ["${aws_s3_bucket.files.arn}/*"]
  }

  # SQS — send/receive on our queue
  statement {
    sid = "SQSAccess"
    actions = [
      "sqs:SendMessage",
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:GetQueueUrl",
      "sqs:ChangeMessageVisibility",
    ]
    resources = [aws_sqs_queue.build.arn, aws_sqs_queue.build_dlq.arn]
  }

  # Cognito — admin APIs backend uses
  statement {
    sid = "CognitoAccess"
    actions = [
      "cognito-idp:AdminCreateUser",
      "cognito-idp:AdminDeleteUser",
      "cognito-idp:AdminGetUser",
      "cognito-idp:AdminUpdateUserAttributes",
      "cognito-idp:AdminSetUserPassword",
      "cognito-idp:AdminInitiateAuth",
      "cognito-idp:AdminRespondToAuthChallenge",
      "cognito-idp:AdminConfirmSignUp",
      "cognito-idp:ListUsers",
      "cognito-idp:SignUp",
      "cognito-idp:ConfirmSignUp",
      "cognito-idp:InitiateAuth",
      "cognito-idp:RespondToAuthChallenge",
      "cognito-idp:ForgotPassword",
      "cognito-idp:ConfirmForgotPassword",
      "cognito-idp:ResendConfirmationCode",
      "cognito-idp:GetUser",
    ]
    resources = [aws_cognito_user_pool.main.arn]
  }

  # Secrets Manager — read only this env's secret
  statement {
    sid       = "SecretsManagerRead"
    actions   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
    resources = [aws_secretsmanager_secret.app.arn]
  }

  # SES — send email from verified domain
  statement {
    sid = "SESSend"
    actions = [
      "ses:SendEmail",
      "ses:SendRawEmail",
    ]
    resources = ["arn:aws:ses:${var.aws_region}:${local.account_id}:identity/${var.domain}"]
  }

  # CloudWatch Logs (Railway-hosted backends won't use, but Lambda does)
  statement {
    sid = "CloudWatchLogs"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["arn:aws:logs:${var.aws_region}:${local.account_id}:*"]
  }
}

resource "aws_iam_policy" "runtime" {
  name   = "corpus-backend-${local.suffix}-policy"
  policy = data.aws_iam_policy_document.runtime.json
}

resource "aws_iam_user_policy_attachment" "runtime" {
  user       = aws_iam_user.runtime.name
  policy_arn = aws_iam_policy.runtime.arn
}
