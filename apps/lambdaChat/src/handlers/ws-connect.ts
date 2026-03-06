import { APIGatewayProxyHandler } from 'aws-lambda';
import { verifyCognitoToken, verifyApiKey } from '../common/auth';
import { wsDynamodb, WS_CONNECTION_TABLE } from '../common/ws-utils';

/**
 * WebSocket $connect handler
 * Authenticates via Cognito token, API key, or allows anonymous.
 */

export const handler: APIGatewayProxyHandler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const timestamp = Date.now();

  if (!connectionId) {
    return { statusCode: 400, body: 'Connection ID not found' };
  }

  const queryParams = event.queryStringParameters || {};
  const token = queryParams.token;
  const apiKey = queryParams.apiKey;
  const chatbotId = queryParams.chatbotId;

  console.log(`WebSocket connect: ${connectionId}, chatbotId: ${chatbotId}, hasToken: ${!!token}, hasApiKey: ${!!apiKey}`);

  let authenticatedUser: { email: string; username: string } | null = null;
  let authMethod: 'cognito' | 'apikey' | 'anonymous' = 'anonymous';

  try {
    if (token) {
      authenticatedUser = await verifyCognitoToken(token);
      if (!authenticatedUser) {
        return {
          statusCode: 401,
          body: JSON.stringify({ type: 'error', code: 'INVALID_TOKEN', message: 'Invalid or expired token' }),
        };
      }
      authMethod = 'cognito';
    } else if (apiKey && chatbotId) {
      const valid = await verifyApiKey(apiKey, chatbotId);
      if (!valid) {
        return {
          statusCode: 401,
          body: JSON.stringify({ type: 'error', code: 'INVALID_API_KEY', message: 'Invalid API key' }),
        };
      }
      authMethod = 'apikey';
    }

    await wsDynamodb.put({
      TableName: WS_CONNECTION_TABLE,
      Item: {
        connectionId,
        connectedAt: timestamp,
        ttl: Math.floor(timestamp / 1000) + 7200,
        domainName: event.requestContext.domainName,
        stage: event.requestContext.stage,
        authMethod,
        email: authenticatedUser?.email || null,
        username: authenticatedUser?.username || null,
        chatbotId: chatbotId || null,
        messageCount: 0,
        windowStart: timestamp,
        sessionHistory: [],
      },
    });

    console.log(`Connection ${connectionId} stored (auth: ${authMethod})`);
    return { statusCode: 200, body: 'Connected' };
  } catch (error: any) {
    console.error(`Error in connect handler [${connectionId}]:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ type: 'error', code: 'CONNECTION_FAILED', message: 'Failed to connect' }),
    };
  }
};
