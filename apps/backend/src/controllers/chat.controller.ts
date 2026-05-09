import { Response } from 'express';
import { processQuery, ChatHistoryModel } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Chat endpoint — POST /api/chat
 *
 * Delegates to the shared processQuery() in @corpusai/aws-common (the same
 * function used by lambdaChat). Used by the dashboard's authenticated chat
 * preview; the embeddable widget calls lambdaChat directly via API Gateway.
 *
 * Supports two response modes:
 *   - Default (no `stream` flag): JSON response when generation finishes.
 *   - `stream: true` in body OR `?stream=true` query: Server-Sent Events,
 *     emitting `chunk`, `citations`, and `complete` events as text streams.
 */
type ConversationMessage = { role: 'user' | 'assistant'; content: string };

async function loadConversationHistory(
  chatbotId: string,
  callerUsername: string | undefined,
): Promise<ConversationMessage[]> {
  if (!callerUsername) return [];
  try {
    const historyRecords = await ChatHistoryModel.query('chatbotId')
      .eq(chatbotId)
      .sort('descending')
      .limit(200)
      .exec();

    return historyRecords
      .filter((r: any) => r.username === callerUsername)
      .slice(0, 20)
      .reverse()
      .map((r: any) => ({
        role: r.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: r.content,
      }));
  } catch (err) {
    console.warn('Failed to load chat history for context:', err);
    return [];
  }
}

async function persistTurn(params: {
  chatbotId: string;
  callerUsername: string | undefined;
  sessionId: string;
  query: string;
  answer: string;
  citations: unknown[] | undefined;
}): Promise<void> {
  const { chatbotId, callerUsername, sessionId, query, answer, citations } = params;
  if (!callerUsername) return;
  try {
    const now = new Date().toISOString();
    await ChatHistoryModel.batchPut([
      new ChatHistoryModel({
        chatbotId,
        username: callerUsername,
        sessionId,
        role: 'user',
        content: query,
        citations: '',
        createdAt: now,
      }),
      new ChatHistoryModel({
        chatbotId,
        username: callerUsername,
        sessionId,
        role: 'bot',
        content: answer,
        citations: JSON.stringify(citations || []),
        createdAt: new Date(Date.now() + 1).toISOString(),
      }),
    ]);
  } catch (err) {
    console.warn('Failed to save chat history:', err);
  }
}

export async function chatProxy(req: AuthRequest, res: Response) {
  const { chatbotId, query, sessionId, username, stream } = req.body ?? {};
  const wantsStream = stream === true || req.query.stream === 'true';

  if (!chatbotId || !query) {
    return res.status(400).json({ error: 'Missing required fields: chatbotId, query' });
  }

  if (typeof query !== 'string' || query.length > 5000) {
    return res.status(400).json({ error: 'Query too long. Maximum 5000 characters.' });
  }

  const effectiveSessionId = sessionId || `sess-${Date.now()}`;
  const callerUsername = username || req.user?.email;

  // Local-dev fallback when no OpenAI key configured — short-circuit identically
  // for both streaming and non-streaming so the dashboard sees something useful.
  if (!process.env.OPENAI_API_KEY) {
    const fallback = {
      answer:
        "[Local Dev] Chat is working! However, no OPENAI_API_KEY is configured, so I can't generate real AI responses. Add your OpenAI API key to apps/backend/.env.local to enable AI chat.",
      citations: [],
      sessionId: effectiveSessionId,
      chatbotId,
      duration: 0,
    };
    if (!wantsStream) return res.json(fallback);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();
    res.write(`data: ${JSON.stringify({ type: 'chunk', content: fallback.answer })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'complete', ...fallback })}\n\n`);
    return res.end();
  }

  const conversationHistory = await loadConversationHistory(chatbotId, callerUsername);

  // ── Streaming branch (SSE) ──────────────────────────────────────────────
  if (wantsStream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    try {
      const result = await processQuery({
        chatbotId,
        query,
        sessionId: effectiveSessionId,
        username,
        conversationHistory,
        stream: true,
        channel: 'backend-proxy-stream',
        allowBuildingStatus: true,
        onChunk: async (content) => {
          res.write(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`);
        },
      });

      if (result.citations?.length) {
        res.write(`data: ${JSON.stringify({ type: 'citations', data: result.citations })}\n\n`);
      }
      res.write(
        `data: ${JSON.stringify({
          type: 'complete',
          answer: result.answer,
          citations: result.citations,
          duration: result.duration,
          sessionId: result.sessionId,
          chatbotId: result.chatbotId,
          model: result.model,
        })}\n\n`,
      );
      res.end();

      await persistTurn({
        chatbotId,
        callerUsername,
        sessionId: effectiveSessionId,
        query,
        answer: result.answer,
        citations: result.citations,
      });
    } catch (error: any) {
      console.error('Chat proxy stream error:', error);
      res.write(
        `data: ${JSON.stringify({ type: 'error', message: error.message || 'Chat request failed' })}\n\n`,
      );
      res.end();
    }
    return;
  }

  // ── Standard JSON branch ────────────────────────────────────────────────
  try {
    const result = await processQuery({
      chatbotId,
      query,
      sessionId: effectiveSessionId,
      username,
      stream: false,
      channel: 'backend-proxy',
      allowBuildingStatus: true,
      conversationHistory,
    });

    await persistTurn({
      chatbotId,
      callerUsername,
      sessionId: effectiveSessionId,
      query,
      answer: result.answer,
      citations: result.citations,
    });

    res.json({
      answer: result.answer,
      citations: result.citations,
      duration: result.duration,
      sessionId: result.sessionId,
      chatbotId: result.chatbotId,
      model: result.model,
      usage: result.usage,
    });
  } catch (error: any) {
    console.error('Chat proxy error:', error);
    res.status(error.statusCode || error.status || 500).json({
      error: error.message || 'Chat request failed',
    });
  }
}

/**
 * Get chat history for a chatbot
 * GET /api/chat/history/:chatbotId?limit=50&lastKey=...
 */
export async function getChatHistory(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { chatbotId } = req.params;
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const lastKeyStr = req.query.lastKey as string | undefined;

    let queryBuilder = ChatHistoryModel.query('chatbotId')
      .eq(chatbotId)
      .sort('ascending');

    if (lastKeyStr) {
      try {
        queryBuilder = queryBuilder.startAt(JSON.parse(lastKeyStr));
      } catch {
        // ignore invalid lastKey
      }
    }

    const records = await queryBuilder.limit(limit).exec();

    // Filter to the authenticated user's messages only
    const userRecords = records
      .filter((r: any) => r.username === req.user!.email)
      .map((r: any) => ({
        chatbotId: r.chatbotId,
        messageId: r.messageId,
        role: r.role,
        content: r.content,
        citations: r.citations ? safeJsonParse(r.citations, []) : [],
        feedback: r.feedback || null,
        createdAt: r.createdAt,
        sessionId: r.sessionId,
      }));

    res.json({
      success: true,
      messages: userRecords,
      lastKey: records.lastKey ? JSON.stringify(records.lastKey) : null,
      count: userRecords.length,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      error: 'Failed to fetch chat history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Clear chat history for a chatbot
 * DELETE /api/chat/history/:chatbotId
 */
export async function clearChatHistory(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { chatbotId } = req.params;

    // Query all records for this chatbot belonging to the user
    let cursor: any = undefined;
    let deletedCount = 0;

    do {
      const records = await ChatHistoryModel.query('chatbotId')
        .eq(chatbotId)
        .startAt(cursor)
        .limit(100)
        .exec();

      cursor = records.lastKey;

      const userRecords = records.filter((r: any) => r.username === req.user!.email);

      if (userRecords.length > 0) {
        await Promise.all(
          userRecords.map((r: any) =>
            ChatHistoryModel.delete({ chatbotId, messageId: r.messageId }).catch((e: any) =>
              console.error('Failed to delete chat history record:', e)
            )
          )
        );
        deletedCount += userRecords.length;
      }
    } while (cursor !== undefined);

    res.json({
      success: true,
      message: 'Chat history cleared',
      deletedCount,
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({
      error: 'Failed to clear chat history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Update feedback on a chat message
 * PUT /api/chat/history/:chatbotId/:messageId/feedback
 */
export async function updateChatFeedback(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { chatbotId, messageId } = req.params;
    const { feedback } = req.body;

    if (feedback !== 1 && feedback !== -1 && feedback !== null) {
      return res.status(400).json({ error: 'feedback must be 1, -1, or null' });
    }

    await ChatHistoryModel.update(
      { chatbotId, messageId },
      { feedback: feedback ?? 0 },
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating chat feedback:', error);
    res.status(500).json({
      error: 'Failed to update feedback',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function safeJsonParse(str: string, fallback: any) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
