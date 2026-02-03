import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

/**
 * WebSocket Disconnect Handler
 * Cleans up connection information when client disconnects
 */

const dynamodb = DynamoDBDocument.from(new DynamoDB({}));
const TABLE_NAME = process.env.WEBSOCKET_CONNECTION_TABLE || 'corpus-ws-connections-dev';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('WebSocket disconnect:', event.requestContext.connectionId);

  const connectionId = event.requestContext.connectionId;

  if (!connectionId) {
    return {
      statusCode: 400,
      body: 'Connection ID not found',
    };
  }

  try {
    // Delete connection from DynamoDB
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: {
        connectionId,
      },
    });

    console.log(`Connection ${connectionId} deleted successfully`);

    return {
      statusCode: 200,
      body: 'Disconnected',
    };
  } catch (error: any) {
    console.error('Error deleting connection:', error);
    return {
      statusCode: 500,
      body: 'Failed to disconnect: ' + error.message,
    };
  }
};
