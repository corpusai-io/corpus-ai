import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import {
  welcomeEmailHtml,
  welcomeEmailText,
  verificationCodeHtml,
  verificationCodeText,
  passwordResetHtml,
  passwordResetText,
  paymentConfirmationHtml,
  paymentConfirmationText,
  paymentFailedHtml,
  paymentFailedText,
  subscriptionCancelledHtml,
  subscriptionCancelledText,
  leadNotificationHtml,
  leadNotificationText,
  accessInvitationHtml,
  accessInvitationText,
} from './email-templates';

const SES_FROM_EMAIL = process.env.SES_SENDER_EMAIL || process.env.SES_FROM_EMAIL || 'noreply@corpusai.io';
const SES_REGION = process.env.SES_REGION || 'eu-north-1';

let sesClient: SESClient | null = null;

/**
 * Lazily initialise the SES client.
 * If AWS credentials are missing the client is still created (it will use the
 * default credential chain, e.g. IAM role). If sending fails later we log a
 * warning instead of crashing.
 */
function getClient(): SESClient {
  if (!sesClient) {
    const opts: Record<string, any> = { region: SES_REGION };

    // If explicit credentials are set, use them. Otherwise rely on the
    // default AWS SDK credential chain (IAM role, env, etc.)
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      opts.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    sesClient = new SESClient(opts);
  }
  return sesClient;
}

// ---------------------------------------------------------------------------
// Core send helper
// ---------------------------------------------------------------------------

/**
 * Send an email via AWS SES.
 *
 * This is intentionally NOT exported as a fire-and-forget helper.  The
 * public-facing wrapper functions below call it inside a try/catch and
 * deliberately do NOT await, so that a failed email never blocks the main
 * request flow.
 */
async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string,
  textBody?: string,
): Promise<void> {
  const client = getClient();

  const command = new SendEmailCommand({
    Source: SES_FROM_EMAIL,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: htmlBody, Charset: 'UTF-8' },
        ...(textBody ? { Text: { Data: textBody, Charset: 'UTF-8' } } : {}),
      },
    },
  });

  await client.send(command);
}

// ---------------------------------------------------------------------------
// Fire-and-forget wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps an async email send so it never blocks and never throws.
 * Logs errors to the console for observability.
 */
function fireAndForget(label: string, promise: Promise<void>): void {
  promise.catch((err) => {
    console.warn(`[EMAIL] Failed to send ${label}:`, err.message || err);
  });
}

// ---------------------------------------------------------------------------
// Public API  (all fire-and-forget)
// ---------------------------------------------------------------------------

export function sendWelcomeEmail(email: string, name: string): void {
  fireAndForget(
    'welcome email',
    sendEmail(
      email,
      'Welcome to Corpus AI!',
      welcomeEmailHtml(name),
      welcomeEmailText(name),
    ),
  );
}

export function sendVerificationEmail(email: string, code: string): void {
  fireAndForget(
    'verification email',
    sendEmail(
      email,
      'Verify your Corpus AI email',
      verificationCodeHtml(code),
      verificationCodeText(code),
    ),
  );
}

export function sendPasswordResetEmail(email: string, code: string): void {
  fireAndForget(
    'password reset email',
    sendEmail(
      email,
      'Reset your Corpus AI password',
      passwordResetHtml(code),
      passwordResetText(code),
    ),
  );
}

export function sendPaymentConfirmationEmail(
  email: string,
  planName: string,
  amount: string,
): void {
  fireAndForget(
    'payment confirmation email',
    sendEmail(
      email,
      'Payment Confirmed - Corpus AI',
      paymentConfirmationHtml(planName, amount),
      paymentConfirmationText(planName, amount),
    ),
  );
}

export function sendPaymentFailedEmail(email: string): void {
  fireAndForget(
    'payment failed email',
    sendEmail(
      email,
      'Payment Failed - Corpus AI',
      paymentFailedHtml(),
      paymentFailedText(),
    ),
  );
}

export function sendSubscriptionCancelledEmail(email: string): void {
  fireAndForget(
    'subscription cancelled email',
    sendEmail(
      email,
      'Subscription Cancelled - Corpus AI',
      subscriptionCancelledHtml(),
      subscriptionCancelledText(),
    ),
  );
}

export function sendLeadNotificationEmail(
  ownerEmail: string,
  chatbotName: string,
  leadEmail: string,
  leadName: string,
): void {
  fireAndForget(
    'lead notification email',
    sendEmail(
      ownerEmail,
      `New Lead from ${chatbotName} - Corpus AI`,
      leadNotificationHtml(chatbotName, leadEmail, leadName),
      leadNotificationText(chatbotName, leadEmail, leadName),
    ),
  );
}

export function sendAccessInvitationEmail(
  email: string,
  chatbotName: string,
  grantedBy: string,
): void {
  fireAndForget(
    'access invitation email',
    sendEmail(
      email,
      `You've been invited to ${chatbotName} - Corpus AI`,
      accessInvitationHtml(chatbotName, grantedBy),
      accessInvitationText(chatbotName, grantedBy),
    ),
  );
}
