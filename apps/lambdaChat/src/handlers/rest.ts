import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { processQuery } from '@corpusai/aws-common';
import { getSessionHistory, updateSessionHistory } from '../common/session';
import { CORS_HEADERS, MAX_QUERY_LENGTH } from '../common/types';

/**
 * REST Chat Handler
 * POST /chat       — synchronous JSON response
 * POST /chat/stream — Server-Sent Events (pre-collected, Lambda limitation)
 */

function generateSessionId(): string {
  return `sess-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

function errorResult(statusCode: number, code: string, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: true, code, message }),
  };
}

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return errorResult(405, 'METHOD_NOT_ALLOWED', 'Only POST is supported');
  }

  // Parse body
  let body: { chatbotId?: string; query?: string; sessionId?: string; username?: string; stream?: boolean };
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return errorResult(400, 'INVALID_JSON', 'Invalid JSON in request body');
  }

  const { chatbotId, query, username } = body;

  if (!chatbotId || typeof chatbotId !== 'string') {
    return errorResult(400, 'VALIDATION_ERROR', 'Missing or invalid field: chatbotId');
  }
  if (!query || typeof query !== 'string') {
    return errorResult(400, 'VALIDATION_ERROR', 'Missing or invalid field: query');
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return errorResult(400, 'VALIDATION_ERROR', `Query too long. Maximum ${MAX_QUERY_LENGTH} characters.`);
  }
  if (query.trim().length === 0) {
    return errorResult(400, 'VALIDATION_ERROR', 'Query cannot be empty');
  }

  const sessionId = body.sessionId || generateSessionId();
  const isStream = event.path?.endsWith('/stream') || body.stream === true;

  // Load session history
  const sessionHistory = await getSessionHistory(sessionId);
  const conversationHistory = sessionHistory.map(m => ({ role: m.role, content: m.content }));

  if (isStream) {
    // ── SSE streaming ──────────────────────────────────
    try {
      let sseBody = '';

      const result = await processQuery({
        chatbotId,
        query,
        sessionId,
        username,
        conversationHistory,
        stream: true,
        channel: 'rest-stream',
        onChunk: async (content) => {
          sseBody += `data: ${JSON.stringify({ type: 'chunk', content })}\n\n`;
        },
      });

      // Prepend citations
      let fullSse = '';
      if (result.citations.length > 0) {
        fullSse += `data: ${JSON.stringify({ type: 'citations', data: result.citations })}\n\n`;
      }
      fullSse += sseBody;
      fullSse += `data: ${JSON.stringify({
        type: 'complete',
        answer: result.answer,
        citations: result.citations,
        duration: result.duration,
        sessionId,
      })}\n\n`;

      // Save session
      await updateSessionHistory(sessionId, query, result.answer);

      return {
        statusCode: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: fullSse,
      };
    } catch (error: any) {
      console.error('Streaming chat error:', error);
      const sseError = `data: ${JSON.stringify({ type: 'error', message: error.message || 'Internal server error' })}\n\n`;
      return {
        statusCode: error.statusCode || 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'text/event-stream' },
        body: sseError,
      };
    }
  }

  // ── Standard JSON response ─────────────────────────
  try {
    const result = await processQuery({
      chatbotId,
      query,
      sessionId,
      username,
      conversationHistory,
      stream: false,
      channel: 'rest',
    });

    // Save session
    await updateSessionHistory(sessionId, query, result.answer);

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer: result.answer,
        citations: result.citations,
        duration: result.duration,
        sessionId: result.sessionId,
        chatbotId: result.chatbotId,
        model: result.model,
        usage: result.usage,
      }),
    };
  } catch (error: any) {
    console.error('Chat error:', error);
    return errorResult(
      error.statusCode || 500,
      error.code || 'INTERNAL_ERROR',
      error.message || 'Unknown error',
    );
  }
};
