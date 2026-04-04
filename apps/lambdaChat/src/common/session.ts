import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { SessionMessage, MAX_SESSION_MESSAGES, SESSION_TTL_SECONDS } from './types';

/**
 * DynamoDB-based session management
 * Used by REST and Slack handlers. WebSocket uses connection record instead.
 */

const dynamodb = DynamoDBDocument.from(new DynamoDB({}));

const SESSION_TABLE = process.env.SESSION_TABLE
  || process.env.AWS_DYNAMO_QUERY_LOG_TABLE
  || 'corpus-query-log-dev';

/**
 * Load session history from DynamoDB.
 * Key format: passageIndex = "session#{sessionId}", uniqueTimestamp = "history"
 */
export async function getSessionHistory(sessionId: string): Promise<SessionMessage[]> {
  try {
    const result = await dynamodb.get({
      TableName: SESSION_TABLE,
      Key: { passageIndex: `session#${sessionId}`, uniqueTimestamp: 'history' },
    });
    return result.Item?.messages || [];
  } catch {
    return [];
  }
}

/**
 * Append a user/assistant pair to the session, keeping the last N pairs.
 */
export async function updateSessionHistory(
  sessionId: string,
  userMessage: string,
  assistantMessage: string,
): Promise<void> {
  const now = Date.now();
  try {
    const current = await getSessionHistory(sessionId);

    current.push(
      { role: 'user', content: userMessage, timestamp: now },
      { role: 'assistant', content: assistantMessage, timestamp: now },
    );

    const trimmed = current.slice(-MAX_SESSION_MESSAGES * 2);

    await dynamodb.put({
      TableName: SESSION_TABLE,
      Item: {
        passageIndex: `session#${sessionId}`,
        uniqueTimestamp: 'history',
        messages: trimmed,
        updatedAt: now,
        ttl: Math.floor(now / 1000) + SESSION_TTL_SECONDS,
      },
    });
  } catch (error) {
    console.error('Failed to update session history:', error);
  }
}

/**
 * Slack thread history — uses a different key pattern.
 */
export async function getThreadHistory(channelId: string, threadTs: string): Promise<SessionMessage[]> {
  try {
    const result = await dynamodb.get({
      TableName: SESSION_TABLE,
      Key: { passageIndex: `slack-thread#${channelId}#${threadTs}`, uniqueTimestamp: 'history' },
    });
    return result.Item?.messages || [];
  } catch {
    return [];
  }
}

export async function updateThreadHistory(
  channelId: string,
  threadTs: string,
  userMessage: string,
  assistantMessage: string,
): Promise<void> {
  const now = Date.now();
  try {
    const current = await getThreadHistory(channelId, threadTs);
    current.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage },
    );
    const trimmed = current.slice(-MAX_SESSION_MESSAGES * 2);

    await dynamodb.put({
      TableName: SESSION_TABLE,
      Item: {
        passageIndex: `slack-thread#${channelId}#${threadTs}`,
        uniqueTimestamp: 'history',
        messages: trimmed,
        updatedAt: now,
        ttl: Math.floor(now / 1000) + SESSION_TTL_SECONDS,
      },
    });
  } catch (error) {
    console.error('Failed to update thread history:', error);
  }
}
