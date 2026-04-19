terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "corpus-ai"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

locals {
  suffix = var.environment # "staging" or "prod"
  name   = "corpus"
}
