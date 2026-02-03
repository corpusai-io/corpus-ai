import { APIGatewayProxyHandler } from 'aws-lambda';
import { App, AwsLambdaReceiver } from '@slack/bolt';
import OpenAI from 'openai';
import {
  getChatbotById,
  UserModel,
  QueryLogModel,
  retrievePassages,
  buildRAGPrompt,
  extractCitations,
  integrationsService,
} from '@corpusai/aws-common';

/**
 * Slack Bot Integration
 * Handles Slack events and routes messages to chatbots
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Slack receiver for AWS Lambda
const receiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || '',
});

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
  processBeforeResponse: true,
});

/**
 * Handle app_mention events (when someone @mentions the bot)
 */
app.event('app_mention', async ({ event, client, say }) => {
  console.log('App mention received:', event);

  try {
    // Extract message and remove bot mention
    const message = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

    if (!message) {
      await say({
        text: 'Hello! How can I help you today?',
        thread_ts: event.ts,
      });
      return;
    }

    // Get workspace ID from event
    const workspaceId = event.team || '';

    // Find chatbot linked to this workspace
    const integration = await integrationsService.entities.slackIntegration
      .query.byWorkspaceId({ workspaceId })
      .go();

    if (!integration.data || integration.data.length === 0) {
      await say({
        text: 'No chatbot is linked to this workspace. Please configure the integration.',
        thread_ts: event.ts,
      });
      return;
    }

    const chatbotId = integration.data[0].chatbotId;

    // Post "thinking" message
    const thinkingMsg = await client.chat.postMessage({
      channel: event.channel,
      thread_ts: event.ts,
      text: ':hourglass_flowing_sand: Processing your query...',
    });

    // Get chatbot
    const chatbot = await getChatbotById(chatbotId);
    if (!chatbot || chatbot.status !== 'ACTIVE') {
      await client.chat.update({
        channel: event.channel,
        ts: thinkingMsg.ts!,
        text: ':x: Chatbot is not active or not found.',
      });
      return;
    }

    // Retrieve RAG passages
    const indexName = chatbot.indexName || `chatbot-${chatbotId}`;
    let passages = [];
    let citations = [];

    try {
      passages = await retrievePassages(indexName, message, {
        topK: 5,
        minScore: 0.7,
        filter: { chatbotId },
      });

      citations = extractCitations(passages);
      console.log(`Retrieved ${passages.length} passages`);
    } catch (ragError: any) {
      console.warn('RAG retrieval failed:', ragError.message);
    }

    // Build prompt
    const systemPrompt = `You are a helpful AI assistant for ${
      chatbot.title || 'this chatbot'
    } in a Slack workspace.

Answer the user's question using the context provided. Keep your response clear, concise, and formatted for Slack.

Use Slack formatting:
- *bold* for emphasis
- \`code\` for code snippets
- > for quotes`;

    const augmentedPrompt =
      passages.length > 0 ? buildRAGPrompt(message, passages, systemPrompt) : message;

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
      max_tokens: 1000,
    });

    const answer =
      completion.choices[0]?.message?.content ||
      'I apologize, but I could not generate a response.';

    // Build response blocks
    const blocks: any[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: answer,
        },
      },
    ];

    // Add citations if available
    if (citations.length > 0) {
      blocks.push({
        type: 'divider',
      });

      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `📚 *Sources:*\n${citations
              .map((c, i) => `${i + 1}. ${c.source}`)
              .join('\n')}`,
          },
        ],
      });
    }

    // Update message with response
    await client.chat.update({
      channel: event.channel,
      ts: thinkingMsg.ts!,
      text: answer,
      blocks,
    });

    // Log query
    try {
      const queryLog = new QueryLogModel({
        passageIndex: indexName,
        query: message,
        answer,
        sessionId: `slack-${event.channel}-${event.ts}`,
      });
      await queryLog.save();
    } catch (logError) {
      console.error('Error logging query:', logError);
    }
  } catch (error: any) {
    console.error('Error handling app mention:', error);

    await say({
      text: `:x: Sorry, an error occurred: ${error.message}`,
      thread_ts: event.ts,
    });
  }
});

/**
 * Handle direct messages to the bot
 */
app.message(async ({ message, say }) => {
  // Only handle direct messages (not in channels)
  if ('channel_type' in message && message.channel_type === 'im') {
    const text = 'text' in message ? message.text : '';

    await say({
      text: `You said: "${text}"\n\nTo use this chatbot, please @mention me in a channel where I'm installed.`,
    });
  }
});

/**
 * Lambda handler
 */
export const handler: APIGatewayProxyHandler = async (event, context) => {
  console.log('Slack event received');

  // Handle Slack URL verification challenge
  if (event.body) {
    const body = JSON.parse(event.body);
    if (body.type === 'url_verification') {
      return {
        statusCode: 200,
        body: JSON.stringify({ challenge: body.challenge }),
      };
    }
  }

  // Process event with Slack Bolt
  const result = await receiver.start();
  const response = await result({
    body: event.body || '',
    headers: event.headers,
    method: event.httpMethod,
    path: event.path,
    query: event.queryStringParameters || {},
  });

  return {
    statusCode: response.statusCode,
    headers: response.headers,
    body: response.body || '',
  };
};
