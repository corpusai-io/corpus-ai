import { APIGatewayProxyHandler } from 'aws-lambda';

/**
 * WebSocket Default Message Handler
 * Routes incoming messages to appropriate handlers
 */

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('WebSocket message received:', event.requestContext.connectionId);

  const connectionId = event.requestContext.connectionId;
  const body = event.body ? JSON.parse(event.body) : {};

  console.log('Message body:', body);

  try {
    // Route based on action
    const { action } = body;

    switch (action) {
      case 'ping':
        return {
          statusCode: 200,
          body: JSON.stringify({ type: 'pong', timestamp: Date.now() }),
        };

      case 'chat':
        // This will be handled by the chat.ts handler
        return {
          statusCode: 200,
          body: JSON.stringify({ type: 'routing', message: 'Use chat route' }),
        };

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({
            type: 'error',
            message: 'Unknown action. Supported actions: ping, chat',
          }),
        };
    }
  } catch (error: any) {
    console.error('Error handling message:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        type: 'error',
        message: 'Internal server error: ' + error.message,
      }),
    };
  }
};
