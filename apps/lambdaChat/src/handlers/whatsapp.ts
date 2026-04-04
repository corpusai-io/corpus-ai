import crypto from 'crypto';
import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';
import { integrationsService, processQuery } from '@corpusai/aws-common';

/**
 * WhatsApp Business API webhook handler
 * GET  — webhook verification
 * POST — incoming message processing via RAG pipeline
 */

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'corpus-ai-verify-token';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

async function sendWhatsAppMessage(phoneNumberId: string, to: string, message: string) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      { messaging_product: 'whatsapp', to, text: { body: message } },
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' } },
    );
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    throw error;
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  // ── Webhook verification (GET) ───────────────────────
  if (event.httpMethod === 'GET') {
    const mode = event.queryStringParameters?.['hub.mode'];
    const token = event.queryStringParameters?.['hub.verify_token'];
    const challenge = event.queryStringParameters?.['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return { statusCode: 200, body: challenge || '' };
    }
    return { statusCode: 403, body: 'Verification failed' };
  }

  // ── Message handling (POST) ──────────────────────────
  if (event.httpMethod === 'POST') {
    try {
      const appSecret = process.env.WHATSAPP_APP_SECRET;
      if (appSecret && event.body) {
        const signature = event.headers?.['x-hub-signature-256'] ||
                          event.headers?.['X-Hub-Signature-256'];
        if (signature) {
          const expectedSig = 'sha256=' + crypto
            .createHmac('sha256', appSecret)
            .update(event.body)
            .digest('hex');
          if (signature !== expectedSig) {
            console.warn('[WhatsApp] Invalid X-Hub-Signature-256');
            return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
          }
        }
      }

      const body = JSON.parse(event.body || '{}');
      const entry = body.entry?.[0];
      const value = entry?.changes?.[0]?.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) {
        return { statusCode: 200, body: JSON.stringify({ status: 'ok' }) };
      }

      const message = messages[0];
      const from = message.from;
      const messageText = message.text?.body;
      const phoneNumberId = value.metadata?.phone_number_id;

      if (!messageText) {
        return { statusCode: 200, body: JSON.stringify({ status: 'ok' }) };
      }

      if (!phoneNumberId) {
        throw new Error('Phone number ID not found');
      }

      // Find linked chatbot
      const integration = await integrationsService.entities.whatsAppIntegration
        .query.byPhoneNumberId({ phoneNumberId })
        .go();

      if (!integration.data || integration.data.length === 0) {
        await sendWhatsAppMessage(phoneNumberId, from, 'This WhatsApp number is not linked to any chatbot. Please configure the integration.');
        return { statusCode: 200, body: JSON.stringify({ status: 'ok' }) };
      }

      const chatbotId = integration.data[0].chatbotId;

      // Process via shared pipeline
      const result = await processQuery({
        chatbotId,
        query: messageText,
        sessionId: `whatsapp-${from}-${Date.now()}`,
        topK: 3,
        maxTokens: 500,
        stream: false,
        skipQuotaCheck: true,
        skipCache: true,
        channel: 'whatsapp',
        systemPromptSuffix: 'Keep responses short (under 300 words) as this is WhatsApp.',
      });

      await sendWhatsAppMessage(phoneNumberId, from, result.answer);

      return { statusCode: 200, body: JSON.stringify({ status: 'ok' }) };
    } catch (error: any) {
      console.error('Error processing WhatsApp message:', error);
      return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error', message: error.message }) };
    }
  }

  return { statusCode: 405, body: 'Method not allowed' };
};
