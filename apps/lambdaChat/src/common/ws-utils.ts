import { ApiGatewayManagementApi } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { ErrorPayload } from './types';

/**
 * WebSocket utility functions shared across WS handlers
 */

const dynamodb = DynamoDBDocument.from(new DynamoDB({}));
const TABLE_NAME = process.env.WEBSOCKET_CONNECTION_TABLE || 'corpus-ws-connections-dev';

export { TABLE_NAME as WS_CONNECTION_TABLE };
export { dynamodb as wsDynamodb };

/**
 * Send a JSON payload to a WebSocket client, cleaning up stale connections.
 */
export async function sendMessage(
  apiGateway: ApiGatewayManagementApi,
  connectionId: string,
  data: any,
): Promise<void> {
  try {
    await apiGateway.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(data),
    });
  } catch (error: any) {
    if (error.statusCode === 410) {
      console.log(`Stale connection ${connectionId}, cleaning up...`);
      await dynamodb.delete({ TableName: TABLE_NAME, Key: { connectionId } }).catch(() => {});
    }
    throw error;
  }
}

/**
 * Send a standardised error to the WebSocket client.
 */
export async function sendError(
  apiGateway: ApiGatewayManagementApi,
  connectionId: string,
  code: string,
  message: string,
): Promise<void> {
  try {
    await sendMessage(apiGateway, connectionId, { type: 'error', code, message } as ErrorPayload);
  } catch {
    // Connection might be stale, nothing to do
  }
}

/**
 * Build an ApiGatewayManagementApi client from the event request context.
 */
export function buildApiGateway(domainName: string, stage: string): ApiGatewayManagementApi {
  return new ApiGatewayManagementApi({
    endpoint: `https://${domainName}/${stage}`,
  });
}
