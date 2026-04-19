variable "aws_region" {
  type    = string
  default = "eu-north-1"
}

variable "environment" {
  type        = string
  description = "staging or prod"
  validation {
    condition     = contains(["staging", "prod"], var.environment)
    error_message = "environment must be staging or prod"
  }
}

variable "domain" {
  type        = string
  default     = "corpusai.io"
  description = "Root domain (DNS managed externally on Spaceship)"
}

variable "cognito_domain_prefix" {
  type        = string
  description = "Prefix for Cognito Hosted UI: <prefix>.auth.<region>.amazoncognito.com"
}

variable "callback_urls" {
  type        = list(string)
  description = "Allowed Cognito callback URLs (post-login redirects)"
}

variable "logout_urls" {
  type        = list(string)
  description = "Allowed Cognito logout URLs"
}

variable "google_client_id" {
  type      = string
  sensitive = true
}

variable "google_client_secret" {
  type      = string
  sensitive = true
}

# Non-AWS secrets loaded into Secrets Manager
variable "openai_api_key" {
  type      = string
  sensitive = true
}

variable "pinecone_api_key" {
  type      = string
  sensitive = true
}

variable "pinecone_region" {
  type    = string
  default = "us-east-1"
}

variable "pinecone_index" {
  type = string
}

variable "pinecone_sparse_index" {
  type = string
}

variable "cohere_api_key" {
  type      = string
  sensitive = true
}

variable "firecrawl_api_key" {
  type      = string
  sensitive = true
}

variable "database_encryption_key" {
  type        = string
  sensitive   = true
  description = "64-char hex key (openssl rand -hex 32)"
}

variable "ses_sender_email" {
  type    = string
  default = "noreply@corpusai.io"
}

variable "allowed_origins" {
  type        = list(string)
  description = "CORS origins (website + dashboard URLs per env)"
}
