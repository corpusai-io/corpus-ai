import { LambdaClient } from '@aws-sdk/client-lambda';
import { OpenAI } from 'openai';
import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Chat service handling request...');
  
  const lambda = new LambdaClient({ region: process.env.AWS_REGION });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ message: 'Chat service ready' })
  };
};