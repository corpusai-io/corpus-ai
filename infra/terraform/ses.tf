# SES is a shared resource — domain identity only needs to be created once per account.
# We only create it for staging to avoid duplicate-identity errors.
# Both environments will send via the same verified domain.

resource "aws_ses_domain_identity" "domain" {
  count  = var.environment == "staging" ? 1 : 0
  domain = var.domain
}

resource "aws_ses_domain_dkim" "domain" {
  count  = var.environment == "staging" ? 1 : 0
  domain = aws_ses_domain_identity.domain[0].domain
}
