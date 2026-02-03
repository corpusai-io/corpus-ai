import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';
import OpenAI from 'openai';
import {
  getChatbotById,
  QueryLogModel,
  retrievePassages,
  buildRAGPrompt,
  integrationsService,
} from '@corpusai/aws-common';

/**
 * WhatsApp Business API Integration
 * Handles webhook verification and incoming messages
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'corpus-ai-verify-token';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('WhatsApp webhook received:', event.httpMethod);

  // Handle webhook verification (GET request)
  if (event.httpMethod === 'GET') {
    const mode = event.queryStringParameters?.['hub.mode'];
    const token = event.queryStringParameters?.['hub.verify_token'];
    const challenge = event.queryStringParameters?.['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WhatsApp webhook verified');
      return {
        statusCode: 200,
        body: challenge || '',
      };
    } else {
      return {
        statusCode: 403,
        body: 'Verification failed',
      };
    }
  }

  // Handle incoming messages (POST request)
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      console.log('WhatsApp message:', JSON.stringify(body, null, 2));

      // Extract message details
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) {
        // No messages to process (might be a status update)
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'ok' }),
        };
      }

      const message = messages[0];
      const from = message.from; // Sender phone number
      const messageText = message.text?.body;
      const messageId = message.id;

      if (!messageText) {
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'ok' }),
        };
      }

      console.log(`Message from ${from}: ${messageText}`);

      // Get phone number ID for sending replies
      const phoneNumberId = value.metadata?.phone_number_id;

      if (!phoneNumberId) {
        throw new Error('Phone number ID not found');
      }

      // Find chatbot linked to this phone number
      const integration = await integrationsService.entities.whatsAppIntegration
        .query.byPhoneNumberId({ phoneNumberId })
        .go();

      if (!integration.data || integration.data.length === 0) {
        // No chatbot linked
        await sendWhatsAppMessage(
          phoneNumberId,
          from,
          'This WhatsApp number is not linked to any chatbot. Please configure the integration.'
        );
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'ok' }),
        };
      }

      const chatbotId = integration.data[0].chatbotId;

      // Get chatbot
      const chatbot = await getChatbotById(chatbotId);
      if (!chatbot || chatbot.status !== 'ACTIVE') {
        await sendWhatsAppMessage(
          phoneNumberId,
          from,
          'Sorry, the chatbot is not active at the moment.'
        );
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'ok' }),
        };
      }

      // Retrieve RAG passages
      const indexName = chatbot.indexName || `chatbot-${chatbotId}`;
      let passages = [];

      try {
        passages = await retrievePassages(indexName, messageText, {
          topK: 3,
          minScore: 0.7,
          filter: { chatbotId },
        });
        console.log(`Retrieved ${passages.length} passages`);
      } catch (ragError: any) {
        console.warn('RAG retrieval failed:', ragError.message);
      }

      // Build prompt
      const systemPrompt = `You are a helpful AI assistant for ${
        chatbot.title || 'this chatbot'
      } on WhatsApp.

Answer questions clearly and concisely. Keep responses short (under 300 words) as this is WhatsApp.`;

      const augmentedPrompt =
        passages.length > 0
          ? buildRAGPrompt(messageText, passages, systemPrompt)
          : messageText;

      // Generate response
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: augmentedPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const answer =
        completion.choices[0]?.message?.content ||
        'I apologize, but I could not generate a response.';

      // Send reply
      await sendWhatsAppMessage(phoneNumberId, from, answer);

      // Log query
      try {
        const queryLog = new QueryLogModel({
          passageIndex: indexName,
          query: messageText,
          answer,
          sessionId: `whatsapp-${from}-${Date.now()}`,
        });
        await queryLog.save();
      } catch (logError) {
        console.error('Error logging query:', logError);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ status: 'ok' }),
      };
    } catch (error: any) {
      console.error('Error processing WhatsApp message:', error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Internal server error',
          message: error.message,
        }),
      };
    }
  }

  return {
    statusCode: 405,
    body: 'Method not allowed',
  };
};

/**
 * Send WhatsApp message using Graph API
 */
async function sendWhatsAppMessage(
  phoneNumberId: string,
  to: string,
  message: string
) {
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  try {
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`Sent WhatsApp message to ${to}`);
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    throw error;
  }
}
