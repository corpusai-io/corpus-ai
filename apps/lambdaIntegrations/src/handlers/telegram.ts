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
 * Telegram Bot API Integration
 * Handles webhook for incoming messages
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Telegram webhook received');

  try {
    const body = JSON.parse(event.body || '{}');
    console.log('Telegram update:', JSON.stringify(body, null, 2));

    const message = body.message;

    if (!message || !message.text) {
      // Not a text message or no message
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true }),
      };
    }

    const chatId = message.chat.id;
    const messageText = message.text;
    const from = message.from;

    console.log(`Message from ${from.username || from.first_name}: ${messageText}`);

    // Handle commands
    if (messageText.startsWith('/start')) {
      await sendTelegramMessage(
        chatId,
        'Welcome! I\'m an AI assistant. Send me a message and I\'ll help you.'
      );
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true }),
      };
    }

    if (messageText.startsWith('/help')) {
      await sendTelegramMessage(
        chatId,
        'Just send me any question and I\'ll do my best to answer it based on my knowledge base.'
      );
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true }),
      };
    }

    // Find chatbot linked to this bot token
    // For simplicity, we'll use a fixed mapping or store in integration config
    // In production, you'd query by botId
    const integration = await integrationsService.entities.telegramIntegration
      .scan.go();

    if (!integration.data || integration.data.length === 0) {
      await sendTelegramMessage(
        chatId,
        'This bot is not linked to any chatbot. Please configure the integration.'
      );
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true }),
      };
    }

    // For now, use the first integration found
    // In production, you'd match by bot token or bot ID
    const chatbotId = integration.data[0].chatbotId;

    // Send "typing" indicator
    await sendChatAction(chatId, 'typing');

    // Get chatbot
    const chatbot = await getChatbotById(chatbotId);
    if (!chatbot || chatbot.status !== 'ACTIVE') {
      await sendTelegramMessage(
        chatId,
        'Sorry, the chatbot is not active at the moment.'
      );
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true }),
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
    } on Telegram.

Answer questions clearly and concisely. You can use Telegram formatting:
- *bold* for emphasis
- _italic_ for emphasis
- \`code\` for code snippets`;

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
      max_tokens: 800,
    });

    const answer =
      completion.choices[0]?.message?.content ||
      'I apologize, but I could not generate a response.';

    // Send reply
    await sendTelegramMessage(chatId, answer, 'Markdown');

    // Log query
    try {
      const queryLog = new QueryLogModel({
        passageIndex: indexName,
        query: messageText,
        answer,
        sessionId: `telegram-${chatId}-${Date.now()}`,
      });
      await queryLog.save();
    } catch (logError) {
      console.error('Error logging query:', logError);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error: any) {
    console.error('Error processing Telegram message:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error.message,
      }),
    };
  }
};

/**
 * Send Telegram message
 */
async function sendTelegramMessage(
  chatId: number,
  text: string,
  parseMode?: string
) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    });

    console.log(`Sent Telegram message to ${chatId}`);
  } catch (error: any) {
    console.error('Error sending Telegram message:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Send chat action (typing indicator)
 */
async function sendChatAction(chatId: number, action: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      action,
    });
  } catch (error: any) {
    console.error('Error sending chat action:', error.response?.data || error.message);
  }
}
