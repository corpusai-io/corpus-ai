resource "aws_sqs_queue" "build_dlq" {
  name                      = "corpus-ai-queue-${local.suffix}-dlq"
  message_retention_seconds = 1209600 # 14 days
  sqs_managed_sse_enabled   = true
}

resource "aws_sqs_queue" "build" {
  name                       = "corpus-ai-queue-${local.suffix}"
  visibility_timeout_seconds = 900 # 15 min, matches Lambda max
  message_retention_seconds  = 345600 # 4 days
  sqs_managed_sse_enabled    = true

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.build_dlq.arn
    maxReceiveCount     = 3
  })
}
