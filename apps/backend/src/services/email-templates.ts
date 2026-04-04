/**
 * Branded HTML email templates for Corpus AI
 *
 * Brand colors:
 *   Primary purple: #BF56FF
 *   Gradient: #FC5990 to #AC5DE6
 *   Background: #F9FAFB
 *   Text: #1A1A1A
 */

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:8080';

/** Shared wrapper that every email uses */
function wrapTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Corpus AI</title>
</head>
<body style="margin:0;padding:0;background-color:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#FC5990,#AC5DE6);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Corpus AI</h1>
</td></tr>

<!-- Body card -->
<tr><td style="background-color:#ffffff;padding:40px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
${content}
</td></tr>

<!-- Footer -->
<tr><td style="background-color:#ffffff;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;padding:24px 40px;text-align:center;">
  <p style="margin:0 0 8px;color:#9CA3AF;font-size:13px;">Corpus AI &mdash; Build intelligent chatbots in minutes.</p>
  <p style="margin:0;color:#9CA3AF;font-size:12px;">If you no longer wish to receive these emails you can update your notification preferences in your account settings.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
<tr><td align="center">
  <a href="${url}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#FC5990,#AC5DE6);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
    ${text}
  </a>
</td></tr>
</table>`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export function welcomeEmailHtml(name: string): string {
  return wrapTemplate(`
<h2 style="margin:0 0 16px;color:#1A1A1A;font-size:22px;font-weight:600;">Welcome to Corpus AI, ${name}!</h2>
<p style="margin:0 0 12px;color:#4B5563;font-size:15px;line-height:1.6;">
  We're excited to have you on board. With Corpus AI you can:
</p>
<ul style="margin:0 0 8px;padding-left:20px;color:#4B5563;font-size:15px;line-height:1.8;">
  <li>Create AI-powered chatbots trained on your own data</li>
  <li>Embed them on any website with a single line of code</li>
  <li>Capture leads and analyze conversations</li>
</ul>
${ctaButton('Go to Dashboard', DASHBOARD_URL)}
`);
}

export function welcomeEmailText(name: string): string {
  return `Welcome to Corpus AI, ${name}!\n\nWe're excited to have you on board.\n\nGo to your dashboard: ${DASHBOARD_URL}`;
}

export function verificationCodeHtml(code: string): string {
  return wrapTemplate(`
<h2 style="margin:0 0 16px;color:#1A1A1A;font-size:22px;font-weight:600;">Verify your email</h2>
<p style="margin:0 0 24px;color:#4B5563;font-size:15px;line-height:1.6;">
  Enter the verification code below to confirm your email address.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center">
  <div style="display:inline-block;background-color:#F3F4F6;border:2px dashed #BF56FF;border-radius:12px;padding:20px 48px;letter-spacing:10px;font-size:36px;font-weight:700;color:#1A1A1A;">${code}</div>
</td></tr>
</table>
<p style="margin:20px 0 0;color:#9CA3AF;font-size:13px;text-align:center;">This code expires in 10 minutes.</p>
`);
}

export function verificationCodeText(code: string): string {
  return `Your Corpus AI verification code is: ${code}\n\nThis code expires in 10 minutes.`;
}

export function passwordResetHtml(code: string): string {
  return wrapTemplate(`
<h2 style="margin:0 0 16px;color:#1A1A1A;font-size:22px;font-weight:600;">Reset your password</h2>
<p style="margin:0 0 24px;color:#4B5563;font-size:15px;line-height:1.6;">
  We received a request to reset your password. Use the code below to proceed.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center">
  <div style="display:inline-block;background-color:#F3F4F6;border:2px dashed #BF56FF;border-radius:12px;padding:20px 48px;letter-spacing:10px;font-size:36px;font-weight:700;color:#1A1A1A;">${code}</div>
</td></tr>
</table>
<p style="margin:20px 0 0;color:#9CA3AF;font-size:13px;text-align:center;">This code expires in 10 minutes.</p>
<p style="margin:16px 0 0;color:#EF4444;font-size:13px;text-align:center;">If you didn't request this, you can safely ignore this email.</p>
`);
}

export function passwordResetText(code: string): string {
  return `Your Corpus AI password reset code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.`;
}

export function paymentConfirmationHtml(planName: string, amount: string): string {
  return wrapTemplate(`
<h2 style="margin:0 0 16px;color:#1A1A1A;font-size:22px;font-weight:600;">Payment Confirmed</h2>
<p style="margin:0 0 24px;color:#4B5563;font-size:15px;line-height:1.6;">
  Thank you for your payment! Here are the details:
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
  <tr style="background-color:#F9FAFB;">
    <td style="padding:12px 20px;color:#6B7280;font-size:14px;font-weight:600;border-bottom:1px solid #E5E7EB;">Plan</td>
    <td style="padding:12px 20px;color:#1A1A1A;font-size:14px;border-bottom:1px solid #E5E7EB;">${planName}</td>
  </tr>
  <tr>
    <td style="padding:12px 20px;color:#6B7280;font-size:14px;font-weight:600;border-bottom:1px solid #E5E7EB;">Amount</td>
    <td style="padding:12px 20px;color:#1A1A1A;font-size:14px;border-bottom:1px solid #E5E7EB;">${amount}</td>
  </tr>
  <tr style="background-color:#F9FAFB;">
    <td style="padding:12px 20px;color:#6B7280;font-size:14px;font-weight:600;">Next billing</td>
    <td style="padding:12px 20px;color:#1A1A1A;font-size:14px;">~30 days from now</td>
  </tr>
</table>
${ctaButton('Manage Subscription', `${DASHBOARD_URL}/settings/billing`)}
`);
}

export function paymentConfirmationText(planName: string, amount: string): string {
  return `Payment Confirmed\n\nPlan: ${planName}\nAmount: ${amount}\nNext billing: ~30 days from now\n\nManage your subscription: ${DASHBOARD_URL}/settings/billing`;
}

export function paymentFailedHtml(): string {
  return wrapTemplate(`
<h2 style="margin:0 0 16px;color:#EF4444;font-size:22px;font-weight:600;">Payment Failed</h2>
<p style="margin:0 0 12px;color:#4B5563;font-size:15px;line-height:1.6;">
  We were unable to process your latest payment. Please update your payment method to avoid any interruption in service.
</p>
<p style="margin:0 0 8px;color:#4B5563;font-size:15px;line-height:1.6;">
  If the issue persists, your account may be downgraded to the free tier.
</p>
${ctaButton('Update Payment Method', `${DASHBOARD_URL}/settings/billing`)}
`);
}

export function paymentFailedText(): string {
  return `Payment Failed\n\nWe were unable to process your latest payment. Please update your payment method to avoid any interruption.\n\nUpdate payment: ${DASHBOARD_URL}/settings/billing`;
}

export function subscriptionCancelledHtml(): string {
  return wrapTemplate(`
<h2 style="margin:0 0 16px;color:#1A1A1A;font-size:22px;font-weight:600;">Subscription Cancelled</h2>
<p style="margin:0 0 12px;color:#4B5563;font-size:15px;line-height:1.6;">
  Your subscription has been cancelled and your account has been downgraded to the free tier.
</p>
<p style="margin:0 0 8px;color:#4B5563;font-size:15px;line-height:1.6;">
  Your existing chatbots will remain available with free-tier limits. You can re-subscribe at any time to unlock full features.
</p>
${ctaButton('Re-subscribe', `${DASHBOARD_URL}/settings/billing`)}
`);
}

export function subscriptionCancelledText(): string {
  return `Subscription Cancelled\n\nYour subscription has been cancelled and your account is now on the free tier.\n\nRe-subscribe: ${DASHBOARD_URL}/settings/billing`;
}

export function leadNotificationHtml(
  chatbotName: string,
  leadEmail: string,
  leadName: string,
): string {
  return wrapTemplate(`
<h2 style="margin:0 0 16px;color:#1A1A1A;font-size:22px;font-weight:600;">New Lead Captured</h2>
<p style="margin:0 0 24px;color:#4B5563;font-size:15px;line-height:1.6;">
  A new lead has been submitted through your chatbot <strong>${chatbotName}</strong>.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
  <tr style="background-color:#F9FAFB;">
    <td style="padding:12px 20px;color:#6B7280;font-size:14px;font-weight:600;border-bottom:1px solid #E5E7EB;">Name</td>
    <td style="padding:12px 20px;color:#1A1A1A;font-size:14px;border-bottom:1px solid #E5E7EB;">${leadName || 'N/A'}</td>
  </tr>
  <tr>
    <td style="padding:12px 20px;color:#6B7280;font-size:14px;font-weight:600;border-bottom:1px solid #E5E7EB;">Email</td>
    <td style="padding:12px 20px;color:#1A1A1A;font-size:14px;border-bottom:1px solid #E5E7EB;">${leadEmail || 'N/A'}</td>
  </tr>
  <tr style="background-color:#F9FAFB;">
    <td style="padding:12px 20px;color:#6B7280;font-size:14px;font-weight:600;">Chatbot</td>
    <td style="padding:12px 20px;color:#1A1A1A;font-size:14px;">${chatbotName}</td>
  </tr>
</table>
${ctaButton('View Leads', `${DASHBOARD_URL}/chatbots`)}
`);
}

export function leadNotificationText(
  chatbotName: string,
  leadEmail: string,
  leadName: string,
): string {
  return `New Lead Captured\n\nChatbot: ${chatbotName}\nName: ${leadName || 'N/A'}\nEmail: ${leadEmail || 'N/A'}\n\nView leads: ${DASHBOARD_URL}/chatbots`;
}

export function accessInvitationHtml(chatbotName: string, grantedBy: string): string {
  return wrapTemplate(`
<h2 style="margin:0 0 16px;color:#1A1A1A;font-size:22px;font-weight:600;">You've Been Invited</h2>
<p style="margin:0 0 12px;color:#4B5563;font-size:15px;line-height:1.6;">
  <strong>${grantedBy}</strong> has granted you access to the chatbot <strong>${chatbotName}</strong> on Corpus AI.
</p>
<p style="margin:0 0 8px;color:#4B5563;font-size:15px;line-height:1.6;">
  Click below to access the chatbot.
</p>
${ctaButton('Open Corpus AI', DASHBOARD_URL)}
`);
}

export function accessInvitationText(chatbotName: string, grantedBy: string): string {
  return `You've been invited!\n\n${grantedBy} has granted you access to the chatbot "${chatbotName}" on Corpus AI.\n\nAccess it here: ${DASHBOARD_URL}`;
}
