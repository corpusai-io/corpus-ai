import { APIGatewayProxyHandler } from 'aws-lambda';
import { buildApiGateway, sendMessage, WS_CONNECTION_TABLE, wsDynamodb } from '../common/ws-utils';
import { ErrorPayload } from '../common/types';

/**
 * WebSocket $default route handler
 * Routes incoming messages and enforces rate limiting.
 */

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

async function checkRateLimit(connectionId: string): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  try {
    const result = await wsDynamodb.get({
      TableName: WS_CONNECTION_TABLE,
      Key: { connectionId },
      ProjectionExpression: 'messageCount, windowStart',
    });
    const item = result.Item;
    if (!item) return { allowed: false, remaining: 0 };

    const windowStart = item.windowStart || 0;
    const messageCount = item.messageCount || 0;

    if (now - windowStart > RATE_LIMIT_WINDOW_MS) {
      await wsDynamodb.update({
        TableName: WS_CONNECTION_TABLE,
        Key: { connectionId },
        UpdateExpression: 'SET messageCount = :one, windowStart = :now',
        ExpressionAttributeValues: { ':one': 1, ':now': now },
      });
      return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
    }

    if (messageCount >= RATE_LIMIT_MAX) {
      return { allowed: false, remaining: 0 };
    }

    await wsDynamodb.update({
      TableName: WS_CONNECTION_TABLE,
      Key: { connectionId },
      UpdateExpression: 'SET messageCount = messageCount + :one',
      ExpressionAttributeValues: { ':one': 1 },
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX - messageCount - 1 };
  } catch (error) {
    console.error(`Rate limit check failed for ${connectionId}:`, error);
    return { allowed: true, remaining: RATE_LIMIT_MAX };
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const connectionId = event.requestContext.connectionId!;
  const domainName = event.requestContext.domainName!;
  const stage = event.requestContext.stage!;
  const apiGateway = buildApiGateway(domainName, stage);

  let body: any;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return { statusCode: 400, body: JSON.stringify({ type: 'error', code: 'INVALID_JSON', message: 'Invalid JSON' }) };
  }

  try {
    const { allowed, remaining } = await checkRateLimit(connectionId);
    if (!allowed) {
      const err: ErrorPayload = {
        type: 'error',
        code: 'RATE_LIMITED',
        message: `Rate limit exceeded. Max ${RATE_LIMIT_MAX} messages per minute.`,
      };
      try { await sendMessage(apiGateway, connectionId, err); } catch {}
      return { statusCode: 429, body: JSON.stringify(err) };
    }

    switch (body.action) {
      case 'ping':
        await sendMessage(apiGateway, connectionId, {
          type: 'pong',
          timestamp: Date.now(),
          rateLimit: { remaining, limit: RATE_LIMIT_MAX },
        });
        return { statusCode: 200, body: 'pong' };

      case 'chat':
        await sendMessage(apiGateway, connectionId, {
          type: 'info',
          message: 'Use the "chat" route for chat messages',
        });
        return { statusCode: 200, body: 'Redirected to chat route' };

      default: {
        const err: ErrorPayload = {
          type: 'error',
          code: 'UNKNOWN_ACTION',
          message: `Unknown action "${body.action || '(none)'}". Supported: ping, chat`,
        };
        await sendMessage(apiGateway, connectionId, err);
        return { statusCode: 400, body: JSON.stringify(err) };
      }
    }
  } catch (error: any) {
    console.error(`Error handling message [${connectionId}]:`, error);
    try {
      await sendMessage(apiGateway, connectionId, { type: 'error', code: 'INTERNAL_ERROR', message: 'Internal server error' });
    } catch {}
    return { statusCode: 500, body: JSON.stringify({ type: 'error', code: 'INTERNAL_ERROR', message: error.message }) };
  }
};
