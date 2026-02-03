import { APIGatewayProxyHandler } from 'aws-lambda';
import { ApiGatewayManagementApi } from '@aws-sdk/client-apigatewaymanagementapi';
import OpenAI from 'openai';
import {
  getChatbotById,
  UserModel,
  QueryLogModel,
  retrievePassages,
  buildRAGPrompt,
  extractCitations,
} from '@corpusai/aws-common';

/**
 * WebSocket Chat Handler with Streaming
 * Handles real-time chat queries with streaming responses
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  chatbotId: string;
  query: string;
  sessionId?: string;
  username?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const connectionId = event.requestContext.connectionId!;
  const domainName = event.requestContext.domainName;
  const stage = event.requestContext.stage;

  // Create API Gateway Management API client for sending messages
  const apiGateway = new ApiGatewayManagementApi({
    endpoint: `https://${domainName}/${stage}`,
  });

  /**
   * Send message to WebSocket client
   */
  async function sendMessage(data: any) {
    try {
      await apiGateway.postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(data),
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.statusCode === 410) {
        console.log('Connection is stale, removing...');
      }
      throw error;
    }
  }

  try {
    // Parse message
    const body: ChatMessage = event.body ? JSON.parse(event.body) : {};
    const { chatbotId, query, sessionId, username } = body;

    console.log(`Chat request from connection ${connectionId}:`, {
      chatbotId,
      query: query?.substring(0, 50),
      username,
    });

    // Validate required fields
    if (!chatbotId || !query) {
      await sendMessage({
        type: 'error',
        message: 'Missing required fields: chatbotId and query',
      });
      return { statusCode: 400, body: 'Missing required fields' };
    }

    // Send "chatbot-ready" message
    await sendMessage({
      type: 'ready',
      message: 'Chatbot is processing your query...',
    });

    // Get chatbot details
    const chatbot = await getChatbotById(chatbotId);
    if (!chatbot) {
      await sendMessage({
        type: 'error',
        message: 'Chatbot not found',
      });
      return { statusCode: 404, body: 'Chatbot not found' };
    }

    // Check chatbot status
    if (chatbot.status !== 'ACTIVE') {
      await sendMessage({
        type: 'error',
        message: `Chatbot is not active. Current status: ${chatbot.status}`,
      });
      return { statusCode: 400, body: 'Chatbot not active' };
    }

    // Check user quota
    if (username) {
      const user = await UserModel.get(username);
      if (user) {
        const quotas = JSON.parse(
          process.env.CHAT_QUOTA || '[20, 1500, 7500, 15000]'
        );
        const userQuota = quotas[user.tier || 0];

        if (user.chat_usage >= userQuota) {
          await sendMessage({
            type: 'error',
            message: 'Chat quota exceeded. Please upgrade your plan.',
          });
          return { statusCode: 429, body: 'Quota exceeded' };
        }
      }
    }

    // Retrieve relevant passages using RAG
    console.log('Retrieving passages from Pinecone...');
    const indexName = chatbot.indexName || `chatbot-${chatbotId}`;

    let passages = [];
    let citations = [];

    try {
      passages = await retrievePassages(indexName, query, {
        topK: 5,
        minScore: 0.7,
        filter: { chatbotId },
      });

      console.log(`Retrieved ${passages.length} passages`);
      citations = extractCitations(passages);

      // Send citations immediately
      if (citations.length > 0) {
        await sendMessage({
          type: 'citations',
          data: citations,
        });
      }
    } catch (ragError: any) {
      console.warn('RAG retrieval failed:', ragError.message);
      // Continue without RAG
    }

    // Build RAG-augmented prompt
    const systemPrompt = `You are a helpful AI assistant for ${
      chatbot.title || 'this chatbot'
    }.

Answer the user's question using the context provided. If the context doesn't contain relevant information, say so clearly and provide the best answer you can based on your general knowledge.

Keep your response clear and concise.`;

    const augmentedPrompt =
      passages.length > 0 ? buildRAGPrompt(query, passages, systemPrompt) : query;

    // Stream response from OpenAI
    const startTime = Date.now();
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: augmentedPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    // Send streaming chunks
    let fullAnswer = '';
    let chunkCount = 0;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullAnswer += content;
        chunkCount++;

        // Send chunk to client
        await sendMessage({
          type: 'chunk',
          content,
          chunkIndex: chunkCount,
        });
      }
    }

    const duration = Date.now() - startTime;

    // Send completion message
    await sendMessage({
      type: 'complete',
      answer: fullAnswer,
      duration,
      passagesFound: passages.length,
    });

    // Log query to DynamoDB
    try {
      const queryLog = new QueryLogModel({
        passageIndex: indexName,
        query,
        answer: fullAnswer,
        sessionId: sessionId || `session-${Date.now()}`,
      });
      await queryLog.save();

      // Increment user chat usage
      if (username) {
        const user = await UserModel.get(username);
        if (user) {
          user.chat_usage = (user.chat_usage || 0) + 1;
          await user.save();
        }
      }
    } catch (logError) {
      console.error('Error logging query:', logError);
    }

    return {
      statusCode: 200,
      body: 'Chat completed',
    };
  } catch (error: any) {
    console.error('Error processing chat:', error);

    try {
      await sendMessage({
        type: 'error',
        message: error.message || 'Internal server error',
      });
    } catch (sendError) {
      console.error('Failed to send error message:', sendError);
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};
