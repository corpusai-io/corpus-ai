import { OpenAI } from 'openai';
import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  getChatbotById,
  QueryLogModel,
  UserModel,
  retrievePassages,
  buildRAGPrompt,
  extractCitations,
} from '@corpusai/aws-common';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ChatRequest {
  chatbotId: string;
  query: string;
  sessionId?: string;
  username?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Chat service handling request...');

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: '',
      };
    }

    // Parse request body
    const body: ChatRequest = event.body ? JSON.parse(event.body) : {};
    const { chatbotId, query, sessionId, username } = body;

    // Validate required fields
    if (!chatbotId || !query) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'Missing required fields: chatbotId and query'
        }),
      };
    }

    // Get chatbot details
    const chatbot = await getChatbotById(chatbotId);
    if (!chatbot) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Chatbot not found' }),
      };
    }

    // Check chatbot status
    if (chatbot.status !== 'ACTIVE') {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: `Chatbot is not active. Current status: ${chatbot.status}`
        }),
      };
    }

    // Check user quota if username provided
    if (username) {
      const user = await UserModel.get(username);
      if (user) {
        // Check if user has exceeded quota
        const quotas = JSON.parse(process.env.CHAT_QUOTA || '[20, 1500, 7500, 15000]');
        const userQuota = quotas[user.tier || 0];

        if (user.chat_usage >= userQuota) {
          return {
            statusCode: 429,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
              error: 'Chat quota exceeded. Please upgrade your plan.'
            }),
          };
        }
      }
    }

    // Retrieve relevant passages using RAG
    console.log('Retrieving relevant passages from Pinecone...');
    const indexName = chatbot.indexName || `chatbot-${chatbotId}`;

    let passages = [];
    let citations = [];

    try {
      passages = await retrievePassages(indexName, query, {
        topK: 5,
        minScore: 0.7,
        filter: { chatbotId },
      });

      console.log(`Retrieved ${passages.length} relevant passages`);
      citations = extractCitations(passages);
    } catch (ragError: any) {
      console.warn('RAG retrieval failed, proceeding without context:', ragError.message);
      // Continue without RAG if it fails
    }

    // Build RAG-augmented prompt
    const systemPrompt = `You are a helpful AI assistant for ${chatbot.title || 'this chatbot'}.

Answer the user's question using the context provided below. If the context doesn't contain relevant information to answer the question, say so clearly and provide the best answer you can based on your general knowledge.

When answering:
1. Prioritize information from the context
2. Be specific and cite sources when possible
3. Be honest if you don't know something
4. Keep your response clear and concise`;

    const augmentedPrompt = passages.length > 0
      ? buildRAGPrompt(query, passages, systemPrompt)
      : query;

    // Call OpenAI API with RAG context
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
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
    });

    const answer = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    const duration = Date.now() - startTime;

    // Log the query to DynamoDB
    try {
      const queryLog = new QueryLogModel({
        passageIndex: chatbot.indexName,
        query,
        answer,
        sessionId: sessionId || `session-${Date.now()}`,
      });
      await queryLog.save();

      // Increment user chat usage if username provided
      if (username) {
        const user = await UserModel.get(username);
        if (user) {
          user.chat_usage = (user.chat_usage || 0) + 1;
          await user.save();
        }
      }
    } catch (logError) {
      console.error('Error logging query:', logError);
      // Don't fail the request if logging fails
    }

    // Return successful response with citations
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answer,
        chatbotId,
        sessionId: sessionId || `session-${Date.now()}`,
        duration,
        usage: completion.usage,
        citations: citations.length > 0 ? citations : undefined,
        passagesFound: passages.length,
      }),
    };

  } catch (error) {
    console.error('Error processing chat request:', error);

    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};