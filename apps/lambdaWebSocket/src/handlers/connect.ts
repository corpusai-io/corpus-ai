import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

/**
 * WebSocket Connect Handler
 * Stores connection information when client connects
 */

const dynamodb = DynamoDBDocument.from(new DynamoDB({}));
const TABLE_NAME = process.env.WEBSOCKET_CONNECTION_TABLE || 'corpus-ws-connections-dev';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('WebSocket connect:', event.requestContext.connectionId);

  const connectionId = event.requestContext.connectionId;
  const timestamp = Date.now();

  if (!connectionId) {
    return {
      statusCode: 400,
      body: 'Connection ID not found',
    };
  }

  try {
    // Store connection info in DynamoDB
    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: {
        connectionId,
        connectedAt: timestamp,
        ttl: Math.floor(timestamp / 1000) + 7200, // 2 hour TTL
        domainName: event.requestContext.domainName,
        stage: event.requestContext.stage,
      },
    });

    console.log(`Connection ${connectionId} stored successfully`);

    return {
      statusCode: 200,
      body: 'Connected',
    };
  } catch (error: any) {
    console.error('Error storing connection:', error);
    return {
      statusCode: 500,
      body: 'Failed to connect: ' + error.message,
    };
  }
};
