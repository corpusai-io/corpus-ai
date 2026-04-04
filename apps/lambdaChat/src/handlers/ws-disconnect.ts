import { APIGatewayProxyHandler } from 'aws-lambda';
import { wsDynamodb, WS_CONNECTION_TABLE } from '../common/ws-utils';

/**
 * WebSocket $disconnect handler
 * Cleans up connection record from DynamoDB.
 */

export const handler: APIGatewayProxyHandler = async (event) => {
  const connectionId = event.requestContext.connectionId;

  if (!connectionId) {
    return { statusCode: 400, body: 'Connection ID not found' };
  }

  console.log(`WebSocket disconnect: ${connectionId}`);

  try {
    await wsDynamodb.delete({
      TableName: WS_CONNECTION_TABLE,
      Key: { connectionId },
    });

    console.log(`Connection ${connectionId} cleaned up`);
    return { statusCode: 200, body: 'Disconnected' };
  } catch (error: any) {
    console.error(`Error in disconnect handler [${connectionId}]:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ type: 'error', code: 'DISCONNECT_FAILED', message: 'Failed to disconnect' }),
    };
  }
};
