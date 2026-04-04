/**
 * Configure AWS Cognito User Pool email templates
 *
 * This script updates the Cognito User Pool to use branded HTML email templates
 * for verification codes and password reset codes.
 *
 * Usage: node setup-cognito-emails.js
 *
 * NOTE: The "From" email (no-reply@verificationemail.com) is Cognito's default.
 * To change it, you must:
 * 1. Verify a domain/email in AWS SES
 * 2. Update the User Pool EmailConfiguration to use SES (DEVELOPER mode)
 * This is typically done via AWS Console.
 */

require('dotenv').config({ path: '.env.development' });
const {
  CognitoIdentityProviderClient,
  DescribeUserPoolCommand,
  UpdateUserPoolCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const USER_POOL_ID = process.env.AWS_COGNITO_USER_POOL_ID || 'eu-north-1_Turu9JdIl';
const REGION = process.env.AWS_COGNITO_REGION || process.env.AWS_REGION || 'eu-north-1';

if (!USER_POOL_ID) {
  console.error('AWS_COGNITO_USER_POOL_ID not set in .env.development');
  process.exit(1);
}

const client = new CognitoIdentityProviderClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Branded HTML verification email template
// Cognito requires {####} placeholder for the code
const verificationEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#FC5990,#AC5DE6);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Corpus AI</h1>
</td></tr>
<tr><td style="background-color:#ffffff;padding:40px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
  <h2 style="margin:0 0 16px;color:#1A1A1A;font-size:22px;font-weight:600;">Verify your email</h2>
  <p style="margin:0 0 24px;color:#4B5563;font-size:15px;line-height:1.6;">
    Thanks for signing up! Enter the verification code below to confirm your email address and activate your account.
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center">
    <div style="display:inline-block;background-color:#F3F4F6;border:2px dashed #BF56FF;border-radius:12px;padding:20px 48px;letter-spacing:10px;font-size:36px;font-weight:700;color:#1A1A1A;">{####}</div>
  </td></tr>
  </table>
  <p style="margin:20px 0 0;color:#9CA3AF;font-size:13px;text-align:center;">This code expires in 24 hours.</p>
</td></tr>
<tr><td style="background-color:#ffffff;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;padding:24px 40px;text-align:center;">
  <p style="margin:0 0 8px;color:#9CA3AF;font-size:13px;">Corpus AI -- Build intelligent chatbots in minutes.</p>
  <p style="margin:0;color:#9CA3AF;font-size:12px;">If you didn't create an account, you can safely ignore this email.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const verificationEmailSubject = 'Verify your Corpus AI account';

// Branded HTML password reset email template
const passwordResetEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#FC5990,#AC5DE6);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Corpus AI</h1>
</td></tr>
<tr><td style="background-color:#ffffff;padding:40px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
  <h2 style="margin:0 0 16px;color:#1A1A1A;font-size:22px;font-weight:600;">Reset your password</h2>
  <p style="margin:0 0 24px;color:#4B5563;font-size:15px;line-height:1.6;">
    We received a request to reset your password. Use the code below to set a new password.
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center">
    <div style="display:inline-block;background-color:#F3F4F6;border:2px dashed #BF56FF;border-radius:12px;padding:20px 48px;letter-spacing:10px;font-size:36px;font-weight:700;color:#1A1A1A;">{####}</div>
  </td></tr>
  </table>
  <p style="margin:20px 0 0;color:#9CA3AF;font-size:13px;text-align:center;">This code expires in 1 hour.</p>
  <p style="margin:16px 0 0;color:#EF4444;font-size:13px;text-align:center;">If you didn't request this, you can safely ignore this email.</p>
</td></tr>
<tr><td style="background-color:#ffffff;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;padding:24px 40px;text-align:center;">
  <p style="margin:0 0 8px;color:#9CA3AF;font-size:13px;">Corpus AI -- Build intelligent chatbots in minutes.</p>
  <p style="margin:0;color:#9CA3AF;font-size:12px;">If you didn't request a password reset, no action is needed.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const passwordResetEmailSubject = 'Reset your Corpus AI password';

async function configureEmails() {
  console.log('\nConfiguring Cognito Email Templates...\n');
  console.log('User Pool:', USER_POOL_ID);
  console.log('Region:', REGION);

  try {
    // First, get current User Pool config to avoid overwriting settings
    console.log('\nFetching current User Pool configuration...');
    const describeResult = await client.send(
      new DescribeUserPoolCommand({ UserPoolId: USER_POOL_ID })
    );

    const pool = describeResult.UserPool;

    // Build update params, preserving existing config
    const updateParams = {
      UserPoolId: USER_POOL_ID,
      // Preserve existing policies
      Policies: pool.Policies,
      // Preserve auto-verified attributes
      AutoVerifiedAttributes: pool.AutoVerifiedAttributes,
      // Preserve MFA config
      MfaConfiguration: pool.MfaConfiguration,
      // Update email verification template
      EmailVerificationMessage: verificationEmailHtml,
      EmailVerificationSubject: verificationEmailSubject,
      // Preserve existing email config (SES settings etc)
      EmailConfiguration: pool.EmailConfiguration,
      // Preserve account recovery
      AccountRecoverySetting: pool.AccountRecoverySetting,
      // Set verification message template
      VerificationMessageTemplate: {
        EmailMessage: verificationEmailHtml,
        EmailSubject: verificationEmailSubject,
        DefaultEmailOption: 'CONFIRM_WITH_CODE',
      },
      // Preserve user attribute settings
      UserAttributeUpdateSettings: pool.UserAttributeUpdateSettings,
    };

    console.log('Updating email templates...');
    await client.send(new UpdateUserPoolCommand(updateParams));
    console.log('Verification email template updated!');
    console.log('Subject: "' + verificationEmailSubject + '"');

    console.log('\nDone! Cognito will now send branded emails.');
    console.log('\nNOTE: The sender email is still "no-reply@verificationemail.com" (Cognito default).');
    console.log('   To change the sender, configure SES in AWS Console:');
    console.log('   1. Verify your domain in SES');
    console.log('   2. Update User Pool > Messaging > Email > Use SES (DEVELOPER mode)');
    console.log('   3. Set the FROM email to your verified SES identity\n');

  } catch (error) {
    console.error('Failed to update email templates:', error.message);
    if (error.name === 'NotAuthorizedException') {
      console.error('   Your AWS credentials lack permission. Required: cognito-idp:UpdateUserPool');
    }
    process.exit(1);
  }
}

configureEmails();
