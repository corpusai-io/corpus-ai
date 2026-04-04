import { APIGatewayProxyHandler } from 'aws-lambda';
import { processQuery } from '@corpusai/aws-common';
import { buildApiGateway, sendMessage, sendError, wsDynamodb, WS_CONNECTION_TABLE } from '../common/ws-utils';
import { SessionMessage, MAX_SESSION_MESSAGES } from '../common/types';

/**
 * WebSocket "chat" route handler
 * Streams OpenAI responses token-by-token to the client.
 */

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

async function checkRateLimit(connectionId: string): Promise<boolean> {
  const now = Date.now();
  try {
    const result = await wsDynamodb.get({
      TableName: WS_CONNECTION_TABLE,
      Key: { connectionId },
      ProjectionExpression: 'messageCount, windowStart',
    });
    const item = result.Item;
    if (!item) return false;

    if (now - (item.windowStart || 0) > RATE_LIMIT_WINDOW_MS) {
      await wsDynamodb.update({
        TableName: WS_CONNECTION_TABLE,
        Key: { connectionId },
        UpdateExpression: 'SET messageCount = :one, windowStart = :now',
        ExpressionAttributeValues: { ':one': 1, ':now': now },
      });
      return true;
    }
    if ((item.messageCount || 0) >= RATE_LIMIT_MAX) return false;

    await wsDynamodb.update({
      TableName: WS_CONNECTION_TABLE,
      Key: { connectionId },
      UpdateExpression: 'SET messageCount = messageCount + :one',
      ExpressionAttributeValues: { ':one': 1 },
    });
    return true;
  } catch {
    return true;
  }
}

async function getWsSessionHistory(connectionId: string): Promise<SessionMessage[]> {
  try {
    const result = await wsDynamodb.get({
      TableName: WS_CONNECTION_TABLE,
      Key: { connectionId },
      ProjectionExpression: 'sessionHistory',
    });
    return result.Item?.sessionHistory || [];
  } catch {
    return [];
  }
}

async function updateWsSessionHistory(
  connectionId: string,
  userMessage: string,
  assistantMessage: string,
): Promise<void> {
  try {
    const current = await getWsSessionHistory(connectionId);
    current.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage },
    );
    const trimmed = current.slice(-MAX_SESSION_MESSAGES * 2);

    await wsDynamodb.update({
      TableName: WS_CONNECTION_TABLE,
      Key: { connectionId },
      UpdateExpression: 'SET sessionHistory = :history',
      ExpressionAttributeValues: { ':history': trimmed },
    });
  } catch (error) {
    console.error(`Failed to update WS session for ${connectionId}:`, error);
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const connectionId = event.requestContext.connectionId!;
  const domainName = event.requestContext.domainName!;
  const stage = event.requestContext.stage!;
  const apiGateway = buildApiGateway(domainName, stage);

  try {
    let body: { chatbotId?: string; query?: string; sessionId?: string; username?: string };
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      await sendError(apiGateway, connectionId, 'INVALID_JSON', 'Invalid JSON in message body');
      return { statusCode: 400, body: 'Invalid JSON' };
    }

    const { chatbotId, query, username } = body;
    const sessionId = body.sessionId || `ws-${connectionId}-${Date.now()}`;

    if (!chatbotId || !query) {
      await sendError(apiGateway, connectionId, 'VALIDATION_ERROR', 'Missing required fields: chatbotId and query');
      return { statusCode: 400, body: 'Missing required fields' };
    }

    if (query.length > 5000) {
      await sendError(apiGateway, connectionId, 'VALIDATION_ERROR', 'Query too long. Maximum 5000 characters.');
      return { statusCode: 400, body: 'Query too long' };
    }

    // Rate limiting
    const allowed = await checkRateLimit(connectionId);
    if (!allowed) {
      await sendError(apiGateway, connectionId, 'RATE_LIMITED', `Rate limit exceeded. Max ${RATE_LIMIT_MAX} messages per minute.`);
      return { statusCode: 429, body: 'Rate limited' };
    }

    // Send processing acknowledgement
    await sendMessage(apiGateway, connectionId, { type: 'ready', message: 'Processing your query...', sessionId });

    // Load session history from connection record
    const sessionHistory = await getWsSessionHistory(connectionId);
    const conversationHistory = sessionHistory.map(m => ({ role: m.role, content: m.content }));

    // Process query with real-time streaming
    const result = await processQuery({
      chatbotId,
      query,
      sessionId,
      username,
      conversationHistory,
      stream: true,
      channel: 'websocket',
      onChunk: async (content, chunkIndex) => {
        await sendMessage(apiGateway, connectionId, { type: 'chunk', content, chunkIndex });
      },
    });

    // Send citations (after chunks, before complete)
    if (result.citations.length > 0) {
      await sendMessage(apiGateway, connectionId, { type: 'citations', data: result.citations });
    }

    // Send completion
    await sendMessage(apiGateway, connectionId, {
      type: 'complete',
      answer: result.answer,
      citations: result.citations,
      duration: result.duration,
      sessionId,
    });

    // Update session
    await updateWsSessionHistory(connectionId, query, result.answer);

    return { statusCode: 200, body: 'Chat completed' };
  } catch (error: any) {
    console.error(`Error processing chat [${connectionId}]:`, error);
    await sendError(apiGateway, connectionId, 'INTERNAL_ERROR', 'An unexpected error occurred. Please try again.');
    return { statusCode: 500, body: JSON.stringify({ type: 'error', code: 'INTERNAL_ERROR', message: error.message }) };
  }
};
