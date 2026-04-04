import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';
import { getChatbotById, integrationsService, processQuery } from '@corpusai/aws-common';

/**
 * Telegram Bot webhook handler
 * Receives messages from Telegram Bot API and responds using the RAG pipeline.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

async function sendTelegramMessage(chatId: number, text: string, parseMode?: string) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    });
  } catch (error: any) {
    console.error('Error sending Telegram message:', error.response?.data || error.message);
    throw error;
  }
}

async function sendChatAction(chatId: number, action: string) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`, {
      chat_id: chatId,
      action,
    });
  } catch (error: any) {
    console.error('Error sending chat action:', error.response?.data || error.message);
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Telegram webhook received');

  try {
    // Verify webhook signature if present
    const secretTokenHeader = event.headers?.['x-telegram-bot-api-secret-token'] ||
                              event.headers?.['X-Telegram-Bot-Api-Secret-Token'];

    const allIntegrations = await integrationsService.entities.telegramIntegration.scan.go();

    if (!allIntegrations.data || allIntegrations.data.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    let matchedIntegration = allIntegrations.data[0]; // default: first one

    if (secretTokenHeader) {
      const matched = allIntegrations.data.find((i: any) => i.secretKey === secretTokenHeader);
      if (!matched) {
        console.warn('[Telegram] Invalid secret token');
        return { statusCode: 401, body: JSON.stringify({ ok: false, error: 'Unauthorized' }) };
      }
      matchedIntegration = matched;
    }

    const chatbotId = matchedIntegration.chatbotId;

    const body = JSON.parse(event.body || '{}');
    const message = body.message;

    if (!message || !message.text) {
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    const chatId = message.chat.id;
    const messageText = message.text;

    // Handle commands
    if (messageText.startsWith('/start')) {
      await sendTelegramMessage(chatId, "Welcome! I'm an AI assistant. Send me a message and I'll help you.");
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    if (messageText.startsWith('/help')) {
      await sendTelegramMessage(chatId, "Just send me any question and I'll do my best to answer it based on my knowledge base.");
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    // Typing indicator
    await sendChatAction(chatId, 'typing');

    // Process query via shared pipeline
    const result = await processQuery({
      chatbotId,
      query: messageText,
      sessionId: `telegram-${chatId}-${Date.now()}`,
      topK: 3,
      maxTokens: 800,
      stream: false,
      skipQuotaCheck: true,
      skipCache: true,
      channel: 'telegram',
      systemPromptSuffix: 'You can use Telegram formatting: *bold*, _italic_, `code`',
    });

    await sendTelegramMessage(chatId, result.answer, 'Markdown');

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (error: any) {
    console.error('Error processing Telegram message:', error);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: error.message }) };
  }
};
