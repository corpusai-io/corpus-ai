import { Response } from 'express';
import { QueryLogModel, getQueryLogRecords, ChatbotModel } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Get query logs with filters
 * GET /api/query-log/:chatbotId
 */
export async function getQueryLogs(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const {
      startDate,
      endDate,
      order = 'descending',
      limit = 50,
      cursor,
    } = req.query;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get chatbot to get the passageIndex
    const chatbot = await ChatbotModel.get(chatbotId);

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const passageIndex = chatbot.indexName;

    // Build query
    let query = QueryLogModel.query('passageIndex').eq(passageIndex);

    // Add date range filter if provided
    if (startDate && endDate) {
      query = query
        .filter('uniqueTimestamp')
        .between(startDate as string, `${endDate}T23:59:59`);
    }

    // Execute query with pagination
    const result = await query
      .sort(order as 'ascending' | 'descending')
      .startAt(cursor as any)
      .limit(Number(limit))
      .exec();

    // Transform results
    const logs = result.map((log: any) => ({
      logId: log.uniqueTimestamp,
      query: log.query,
      answer: log.answer,
      thumb: log.thumb,
      sessionId: log.sessionId,
      timestamp: log.uniqueTimestamp,
      leadContactName: log.leadContactName,
      leadContactEmail: log.leadContactEmail,
      leadContactPhone: log.leadContactPhone,
    }));

    res.json({
      success: true,
      logs,
      cursor: result.lastKey,
      count: logs.length,
    });
  } catch (error) {
    console.error('Error getting query logs:', error);
    res.status(500).json({
      error: 'Failed to get query logs',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Search query logs by message
 * POST /api/query-log/:chatbotId/search
 */
export async function searchQueryLogs(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { searchTerm } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!searchTerm) {
      return res.status(400).json({ error: 'searchTerm is required' });
    }

    // Get chatbot to get the passageIndex
    const chatbot = await ChatbotModel.get(chatbotId);

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const passageIndex = chatbot.indexName;

    // Query all logs and filter in memory (DynamoDB doesn't support full-text search)
    const result = await QueryLogModel.query('passageIndex')
      .eq(passageIndex)
      .exec();

    const searchLower = searchTerm.toLowerCase();
    const filteredLogs = result.filter(
      (log: any) =>
        log.query?.toLowerCase().includes(searchLower) ||
        log.answer?.toLowerCase().includes(searchLower)
    );

    const logs = filteredLogs.map((log: any) => ({
      logId: log.uniqueTimestamp,
      query: log.query,
      answer: log.answer,
      thumb: log.thumb,
      sessionId: log.sessionId,
      timestamp: log.uniqueTimestamp,
    }));

    res.json({
      success: true,
      logs,
      count: logs.length,
    });
  } catch (error) {
    console.error('Error searching query logs:', error);
    res.status(500).json({
      error: 'Failed to search query logs',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Record feedback (thumbs up/down)
 * POST /api/query-log/:chatbotId/feedback
 */
export async function recordFeedback(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { logId, thumb } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!logId || (thumb !== 1 && thumb !== -1)) {
      return res.status(400).json({
        error: 'logId and thumb (1 or -1) are required',
      });
    }

    // Get chatbot to get the passageIndex
    const chatbot = await ChatbotModel.get(chatbotId);

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const passageIndex = chatbot.indexName;

    // Update the log record
    await QueryLogModel.update(
      { passageIndex, uniqueTimestamp: logId },
      { thumb }
    );

    res.json({
      success: true,
      message: 'Feedback recorded successfully',
    });
  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({
      error: 'Failed to record feedback',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Export query logs as CSV
 * GET /api/query-log/:chatbotId/export
 */
export async function exportQueryLogs(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { startDate, endDate } = req.query;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get chatbot to get the passageIndex
    const chatbot = await ChatbotModel.get(chatbotId);

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const passageIndex = chatbot.indexName;

    // Get all logs (with date filter if provided)
    let records: any[];

    if (startDate && endDate) {
      records = await getQueryLogRecords(
        passageIndex,
        startDate as string,
        endDate as string,
        'descending'
      );
    } else {
      const result = await QueryLogModel.query('passageIndex')
        .eq(passageIndex)
        .exec();
      records = result.map((log: any) => [
        log.query,
        log.answer,
        log.uniqueTimestamp,
      ]);
    }

    if (records.length === 0) {
      return res.status(404).json({
        error: 'No query logs found',
      });
    }

    // Convert to CSV
    const headers = ['Query', 'Answer', 'Timestamp'];
    const csvRows = [headers.join(',')];

    records.forEach((record) => {
      const row = record.map((value: any) => {
        // Escape commas and quotes in CSV
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="querylog-${chatbotId}-${Date.now()}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('Error exporting query logs:', error);
    res.status(500).json({
      error: 'Failed to export query logs',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get analytics stats
 * GET /api/query-log/:chatbotId/analytics
 */
export async function getAnalytics(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { startDate, endDate } = req.query;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get chatbot to get the passageIndex
    const chatbot = await ChatbotModel.get(chatbotId);

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const passageIndex = chatbot.indexName;

    // Query logs
    let query = QueryLogModel.query('passageIndex').eq(passageIndex);

    if (startDate && endDate) {
      query = query
        .filter('uniqueTimestamp')
        .between(startDate as string, `${endDate}T23:59:59`);
    }

    const result = await query.exec();

    // Calculate analytics
    const totalQueries = result.length;
    const thumbsUp = result.filter((log: any) => log.thumb === 1).length;
    const thumbsDown = result.filter((log: any) => log.thumb === -1).length;

    // Count top queries
    const queryCount: Record<string, number> = {};
    result.forEach((log: any) => {
      if (log.query) {
        queryCount[log.query] = (queryCount[log.query] || 0) + 1;
      }
    });

    const topQueries = Object.entries(queryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    res.json({
      success: true,
      analytics: {
        totalQueries,
        thumbsUp,
        thumbsDown,
        thumbsUpPercentage:
          totalQueries > 0
            ? Math.round((thumbsUp / totalQueries) * 100)
            : 0,
        thumbsDownPercentage:
          totalQueries > 0
            ? Math.round((thumbsDown / totalQueries) * 100)
            : 0,
        topQueries,
      },
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
