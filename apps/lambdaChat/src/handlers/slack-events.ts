import { APIGatewayProxyHandler } from 'aws-lambda';
import { App, AwsLambdaReceiver } from '@slack/bolt';
import { integrationsService, processQuery, QueryLogModel } from '@corpusai/aws-common';
import { getThreadHistory, updateThreadHistory } from '../common/session';

/**
 * Slack Bot handler
 * Events: app_mention, /corpus command, feedback buttons, DMs
 */

// ============================================================
// Block Kit helpers
// ============================================================

function buildResponseBlocks(answer: string, citations: any[], queryLogId?: string, chatbotId?: string): any[] {
  const blocks: any[] = [];

  blocks.push({ type: 'section', text: { type: 'mrkdwn', text: answer } });

  if (citations.length > 0) {
    blocks.push({ type: 'divider' });
    const sourceLines = citations.map((c, i) => {
      const link = c.url ? `<${c.url}|${c.source}>` : c.source;
      return `${i + 1}. ${link}`;
    });
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: `:books: *Sources:*\n${sourceLines.join('\n')}` }],
    });
  }

  if (queryLogId && chatbotId) {
    // Encode both chatbotId and queryLogId so feedback handlers can look up the record.
    // Format: "<chatbotId>:<queryLogId>" — queryLogId (uniqueTimestamp) never contains ":" so splitting on
    // the first ":" is unambiguous.
    const feedbackValue = `${chatbotId}:${queryLogId}`;
    blocks.push({
      type: 'actions',
      block_id: `feedback_${queryLogId}`,
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: ':thumbsup: Helpful', emoji: true },
          style: 'primary',
          action_id: 'feedback_thumbsup',
          value: feedbackValue,
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: ':thumbsdown: Not helpful', emoji: true },
          action_id: 'feedback_thumbsdown',
          value: feedbackValue,
        },
      ],
    });
  }

  return blocks;
}

// ============================================================
// Slack App Setup
// ============================================================

const receiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || '',
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
  processBeforeResponse: true,
});

// ── @mention handler ─────────────────────────────────
app.event('app_mention', async ({ event, client, say }) => {
  try {
    const message = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();
    const threadTs = event.thread_ts || event.ts;

    if (!message) {
      await say({ text: 'Hello! How can I help you today? Ask me a question.', thread_ts: threadTs });
      return;
    }

    const workspaceId = event.team || '';
    const integration = await integrationsService.entities.slackIntegration
      .query.byWorkspaceId({ workspaceId })
      .go();

    if (!integration.data || integration.data.length === 0) {
      await say({ text: ':warning: No chatbot is linked to this workspace. Please configure the integration from the dashboard.', thread_ts: threadTs });
      return;
    }

    const chatbotId = integration.data[0].chatbotId;

    // Thinking indicator
    const thinkingMsg = await client.chat.postMessage({
      channel: event.channel,
      thread_ts: threadTs,
      text: ':hourglass_flowing_sand: Thinking...',
    });

    // Load thread history
    const threadHistory = await getThreadHistory(event.channel, threadTs);
    const conversationHistory = threadHistory.map(m => ({ role: m.role, content: m.content }));
    const sessionId = `slack-${event.channel}-${threadTs}`;

    // Process via shared pipeline
    const result = await processQuery({
      chatbotId,
      query: message,
      sessionId,
      conversationHistory,
      stream: false,
      channel: 'slack',
      systemPromptSuffix: 'Use Slack formatting: *bold*, `code`, > quotes, - bullets',
    });

    // Build Block Kit response and update thinking message
    const blocks = buildResponseBlocks(result.answer, result.citations, result.queryLogId, chatbotId);

    await client.chat.update({
      channel: event.channel,
      ts: thinkingMsg.ts!,
      text: result.answer,
      blocks,
    });

    await updateThreadHistory(event.channel, threadTs, message, result.answer);
  } catch (error: any) {
    console.error('Error handling app mention:', error);
    const threadTs = event.thread_ts || event.ts;
    const errorMsg = error.code === 'NOT_FOUND' || error.code === 'NOT_ACTIVE'
      ? error.message
      : 'Sorry, an error occurred while processing your request.';
    await say({ text: `:x: ${errorMsg}`, thread_ts: threadTs });
  }
});

// ── /corpus slash command ────────────────────────────
app.command('/corpus', async ({ command, ack, respond }) => {
  await ack();

  const query = command.text?.trim();

  if (!query) {
    await respond({
      response_type: 'ephemeral',
      text: ':wave: Usage: `/corpus <your question>` — Ask me anything about your linked knowledge base.',
    });
    return;
  }

  try {
    const integration = await integrationsService.entities.slackIntegration
      .query.byWorkspaceId({ workspaceId: command.team_id })
      .go();

    if (!integration.data || integration.data.length === 0) {
      await respond({
        response_type: 'ephemeral',
        text: ':warning: No chatbot is linked to this workspace. Please configure the integration from the CorpusAI dashboard.',
      });
      return;
    }

    const chatbotId = integration.data[0].chatbotId;
    const sessionId = `slack-cmd-${command.user_id}-${Date.now()}`;

    const result = await processQuery({
      chatbotId,
      query,
      sessionId,
      conversationHistory: [],
      stream: false,
      channel: 'slack-command',
      systemPromptSuffix: 'Use Slack formatting: *bold*, `code`, > quotes, - bullets',
    });

    const blocks = buildResponseBlocks(result.answer, result.citations);

    await respond({ response_type: 'ephemeral', text: result.answer, blocks });
  } catch (error: any) {
    console.error('Error handling /corpus command:', error);
    const errorMsg = error.code === 'NOT_FOUND' || error.code === 'NOT_ACTIVE'
      ? error.message
      : 'Sorry, an error occurred while processing your request. Please try again.';
    await respond({ response_type: 'ephemeral', text: `:x: ${errorMsg}` });
  }
});

// ── Feedback buttons ─────────────────────────────────
app.action('feedback_thumbsup', async ({ ack, action }) => {
  await ack();
  const rawValue = (action as any).value as string | undefined;
  if (rawValue) {
    // Value format: "<chatbotId>:<queryLogId>" where queryLogId is the uniqueTimestamp sort key.
    const colonIdx = rawValue.indexOf(':');
    const chatbotId = colonIdx !== -1 ? rawValue.slice(0, colonIdx) : undefined;
    const queryLogId = colonIdx !== -1 ? rawValue.slice(colonIdx + 1) : rawValue;
    console.log(`Feedback thumbsup for query log: ${queryLogId} (chatbot: ${chatbotId})`);
    if (chatbotId && queryLogId) {
      try {
        const logRecord = await QueryLogModel.get({ passageIndex: chatbotId, uniqueTimestamp: queryLogId });
        if (logRecord) {
          logRecord.thumb = 1;
          await logRecord.save();
          console.log(`[Slack] Saved thumbsup feedback for query log: ${queryLogId}`);
        } else {
          console.warn(`[Slack] QueryLog record not found for thumbsup: chatbotId=${chatbotId}, queryLogId=${queryLogId}`);
        }
      } catch (err) {
        console.error('[Slack] Failed to save thumbsup feedback:', err);
      }
    }
  }
});

app.action('feedback_thumbsdown', async ({ ack, action }) => {
  await ack();
  const rawValue = (action as any).value as string | undefined;
  if (rawValue) {
    // Value format: "<chatbotId>:<queryLogId>" where queryLogId is the uniqueTimestamp sort key.
    const colonIdx = rawValue.indexOf(':');
    const chatbotId = colonIdx !== -1 ? rawValue.slice(0, colonIdx) : undefined;
    const queryLogId = colonIdx !== -1 ? rawValue.slice(colonIdx + 1) : rawValue;
    console.log(`Feedback thumbsdown for query log: ${queryLogId} (chatbot: ${chatbotId})`);
    if (chatbotId && queryLogId) {
      try {
        const logRecord = await QueryLogModel.get({ passageIndex: chatbotId, uniqueTimestamp: queryLogId });
        if (logRecord) {
          logRecord.thumb = -1;
          await logRecord.save();
          console.log(`[Slack] Saved thumbsdown feedback for query log: ${queryLogId}`);
        } else {
          console.warn(`[Slack] QueryLog record not found for thumbsdown: chatbotId=${chatbotId}, queryLogId=${queryLogId}`);
        }
      } catch (err) {
        console.error('[Slack] Failed to save thumbsdown feedback:', err);
      }
    }
  }
});

// ── Direct messages ──────────────────────────────────
app.message(async ({ message, say }) => {
  if ('channel_type' in message && message.channel_type === 'im') {
    const text = 'text' in message ? message.text : '';
    await say({
      text: `You said: "${text}"\n\nTo use this chatbot, please @mention me in a channel or use the \`/corpus\` slash command.`,
    });
  }
});

// ============================================================
// Lambda handler
// ============================================================

export const handler: APIGatewayProxyHandler = async (event, context, callback) => {
  // Handle Slack URL verification challenge
  if (event.body) {
    try {
      const body = JSON.parse(event.body);
      if (body.type === 'url_verification') {
        return { statusCode: 200, body: JSON.stringify({ challenge: body.challenge }) };
      }
    } catch {
      // Not JSON, continue to Bolt
    }
  }

  const boltHandler = await receiver.start();
  return boltHandler(event, context, callback);
};
