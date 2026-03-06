import { Response } from 'express';
import { processQuery, ChatHistoryModel } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Local development chat proxy
 * POST /api/chat
 *
 * Delegates to the shared processQuery() in @corpusai/aws-common.
 * This keeps the dashboard functional in local dev without running
 * a separate Lambda container.
 */
export async function chatProxy(req: AuthRequest, res: Response) {
  try {
    const { chatbotId, query, sessionId, username } = req.body;

    if (!chatbotId || !query) {
      return res.status(400).json({ error: 'Missing required fields: chatbotId, query' });
    }

    if (query.length > 5000) {
      return res.status(400).json({ error: 'Query too long. Maximum 5000 characters.' });
    }

    // Check OpenAI key for local dev
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        answer: '[Local Dev] Chat is working! However, no OPENAI_API_KEY is configured, so I can\'t generate real AI responses. Add your OpenAI API key to apps/backend/.env.development to enable AI chat.',
        citations: [],
        sessionId: sessionId || `sess-${Date.now()}`,
        chatbotId,
        duration: 0,
      });
    }

    // Load cross-session history for this user — fetch enough records to find user's messages
    // even in shared/multi-user chatbots
    const callerUsername = username || req.user?.email;
    let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    if (callerUsername) {
      try {
        const historyRecords = await ChatHistoryModel.query('chatbotId')
          .eq(chatbotId)
          .sort('descending')
          .limit(200)
          .exec();

        // Filter to this user and take their most recent 20 messages (10 turns), chronological order
        const userRecords = historyRecords
          .filter((r: any) => r.username === callerUsername)
          .slice(0, 20)
          .reverse();

        conversationHistory = userRecords.map((r: any) => ({
          role: r.role === 'user' ? 'user' as const : 'assistant' as const,
          content: r.content,
        }));
      } catch (err) {
        console.warn('Failed to load chat history for context:', err);
      }
    }

    const effectiveSessionId = sessionId || `sess-${Date.now()}`;

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

    // Save user message + bot response to chat history
    if (callerUsername) {
      try {
        const now = new Date().toISOString();
        await ChatHistoryModel.batchPut([
          new ChatHistoryModel({
            chatbotId,
            username: callerUsername,
            sessionId: effectiveSessionId,
            role: 'user',
            content: query,
            citations: '',
            createdAt: now,
          }),
          new ChatHistoryModel({
            chatbotId,
            username: callerUsername,
            sessionId: effectiveSessionId,
            role: 'bot',
            content: result.answer,
            citations: JSON.stringify(result.citations || []),
            createdAt: new Date(Date.now() + 1).toISOString(), // +1ms to preserve order
          }),
        ]);
      } catch (err) {
        console.warn('Failed to save chat history:', err);
      }
    }

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
