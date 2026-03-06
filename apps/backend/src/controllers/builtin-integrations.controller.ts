import { Response } from 'express';
import { BuiltinIntegrationModel, ChatbotModel, encrypt } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';
import { errorResponse, ErrorCodes } from '../utils/error-response';

async function verifyOwnership(chatbotId: string, email: string): Promise<boolean> {
  const bots = await ChatbotModel.query('username').eq(email).exec();
  return bots.some((b: any) => b.chatbotId === chatbotId);
}

async function runConnectionTest(
  integrationKey: string,
  credentials: Record<string, string>
): Promise<{ ok: boolean; accountName?: string; error?: string }> {
  const timeout = 10000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);

  try {
    switch (integrationKey) {
      case 'stripe': {
        const r = await fetch('https://api.stripe.com/v1/account', {
          headers: { Authorization: `Bearer ${credentials.secretKey}` },
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!r.ok) return { ok: false, error: 'Invalid Stripe secret key. Check it starts with sk_live_ or sk_test_.' };
        const d: any = await r.json();
        return { ok: true, accountName: d.email || d.business_profile?.name || 'Stripe Account' };
      }
      case 'zendesk': {
        const { subdomain, email, apiToken } = credentials;
        const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
        const r = await fetch(`https://${subdomain}.zendesk.com/api/v2/users/me.json`, {
          headers: { Authorization: `Basic ${auth}` },
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!r.ok) return { ok: false, error: 'Invalid Zendesk credentials. Check your subdomain, email, and API token.' };
        const d: any = await r.json();
        return { ok: true, accountName: d.user?.name || subdomain };
      }
      case 'freshdesk': {
        const { domain, apiKey } = credentials;
        const auth = Buffer.from(`${apiKey}:X`).toString('base64');
        const r = await fetch(`https://${domain}.freshdesk.com/api/v2/agents/me`, {
          headers: { Authorization: `Basic ${auth}` },
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!r.ok) return { ok: false, error: 'Invalid Freshdesk credentials. Check your domain and API key.' };
        const d: any = await r.json();
        return { ok: true, accountName: d.contact?.name || domain };
      }
      case 'hubspot': {
        const r = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
          headers: { Authorization: `Bearer ${credentials.privateAppToken}` },
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!r.ok) return { ok: false, error: 'Invalid HubSpot private app token.' };
        return { ok: true, accountName: 'HubSpot Account' };
      }
      case 'calendly': {
        const r = await fetch('https://api.calendly.com/users/me', {
          headers: { Authorization: `Bearer ${credentials.apiKey}`, 'Content-Type': 'application/json' },
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!r.ok) return { ok: false, error: 'Invalid Calendly personal access token.' };
        const d: any = await r.json();
        return { ok: true, accountName: d.resource?.name || 'Calendly User' };
      }
      case 'cal_com': {
        const r = await fetch('https://api.cal.com/v2/me', {
          headers: { Authorization: `Bearer ${credentials.apiKey}`, 'cal-api-version': '2024-08-13' },
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!r.ok) return { ok: false, error: 'Invalid Cal.com API key.' };
        const d: any = await r.json();
        return { ok: true, accountName: d.data?.username || 'Cal.com User' };
      }
      case 'shopify': {
        const { storeDomain, accessToken } = credentials;
        const r = await fetch(`https://${storeDomain}/admin/api/2024-01/shop.json`, {
          headers: { 'X-Shopify-Access-Token': accessToken },
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!r.ok) return { ok: false, error: 'Invalid Shopify credentials. Check your store domain and access token.' };
        const d: any = await r.json();
        return { ok: true, accountName: d.shop?.name || storeDomain };
      }
      case 'jira': {
        const { domain, email, apiToken } = credentials;
        const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
        const r = await fetch(`https://${domain}/rest/api/3/myself`, {
          headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!r.ok) return { ok: false, error: 'Invalid Jira credentials. Check your domain, email, and API token.' };
        const d: any = await r.json();
        return { ok: true, accountName: d.displayName || email };
      }
      case 'zapier':
      case 'make':
      case 'slack_alerts': {
        clearTimeout(timer);
        const url = credentials.webhookUrl || '';
        if (!url.startsWith('https://')) return { ok: false, error: 'Webhook URL must start with https://' };
        try { new URL(url); } catch { return { ok: false, error: 'Invalid webhook URL format' }; }
        return { ok: true, accountName: new URL(url).hostname };
      }
      default:
        clearTimeout(timer);
        return { ok: false, error: 'Unknown integration type' };
    }
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') return { ok: false, error: 'Connection timed out. Check your credentials and try again.' };
    return { ok: false, error: err.message || 'Connection failed' };
  }
}

export async function getBuiltinIntegrations(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    if (!req.user) return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    const owned = await verifyOwnership(chatbotId, req.user.email);
    if (!owned) return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'Access denied');

    const records = await BuiltinIntegrationModel.query('chatbotId').eq(chatbotId).exec();

    const integrations = records.map((r: any) => ({
      integrationKey: r.integrationKey,
      enabled: r.enabled,
      connected: r.connected,
      operations: (() => { try { return JSON.parse(r.operations || '[]'); } catch { return []; } })(),
      triggerDescription: r.triggerDescription,
      metadata: (() => { try { return JSON.parse(r.metadata || '{}'); } catch { return {}; } })(),
    }));

    res.json({ success: true, integrations });
  } catch (error) {
    console.error('Error getting builtin integrations:', error);
    return errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to get integrations');
  }
}

export async function saveBuiltinIntegration(req: AuthRequest, res: Response) {
  try {
    const { chatbotId, integrationKey } = req.params;
    if (!req.user) return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    const owned = await verifyOwnership(chatbotId, req.user.email);
    if (!owned) return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'Access denied');

    const { credentials, operations, triggerDescription, enabled, metadata } = req.body;

    const updateData: Record<string, any> = {
      operations: JSON.stringify(operations || []),
      triggerDescription: triggerDescription || '',
      enabled: enabled !== undefined ? enabled : true,
      updatedAt: Date.now(),
    };

    if (metadata !== undefined) {
      updateData.metadata = JSON.stringify(metadata);
    }

    if (credentials && Object.keys(credentials).length > 0) {
      updateData.connected = true;
      updateData.encryptedCredentials = encrypt(JSON.stringify(credentials));
    }

    await BuiltinIntegrationModel.update({ chatbotId, integrationKey }, updateData);

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving builtin integration:', error);
    return errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to save integration');
  }
}

export async function testBuiltinIntegration(req: AuthRequest, res: Response) {
  try {
    const { chatbotId, integrationKey } = req.params;
    if (!req.user) return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    const owned = await verifyOwnership(chatbotId, req.user.email);
    if (!owned) return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'Access denied');

    const { credentials } = req.body;
    const result = await runConnectionTest(integrationKey, credentials || {});

    res.json({ success: true, ok: result.ok, accountName: result.accountName, error: result.error });
  } catch (error) {
    console.error('Error testing builtin integration:', error);
    return errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to test integration');
  }
}

export async function disconnectBuiltinIntegration(req: AuthRequest, res: Response) {
  try {
    const { chatbotId, integrationKey } = req.params;
    if (!req.user) return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    const owned = await verifyOwnership(chatbotId, req.user.email);
    if (!owned) return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'Access denied');

    await BuiltinIntegrationModel.update(
      { chatbotId, integrationKey },
      { connected: false, encryptedCredentials: '', enabled: false, metadata: '{}', updatedAt: Date.now() }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting builtin integration:', error);
    return errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to disconnect integration');
  }
}
