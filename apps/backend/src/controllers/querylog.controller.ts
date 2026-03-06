import { Response } from 'express';
import { QueryLogModel, ChatbotModel } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';
import { errorResponse, ErrorCodes } from '../utils/error-response';

/**
 * Parse uniqueTimestamp ("2024-01-15T10:30:00#randomId") into epoch ms.
 * Returns NaN on invalid input.
 */
function parseUniqueTimestamp(raw: string): number {
  if (!raw) return NaN;
  const isoStr = raw.split('#')[0];
  // The stored ISO string is UTC but lacks a trailing "Z" — append it
  // so Date parses it as UTC, not local time.
  return new Date(isoStr + 'Z').getTime();
}

/**
 * Convert a date query param (epoch-ms OR ISO string) to an ISO prefix
 * suitable for DynamoDB string range-key comparison against uniqueTimestamp.
 */
function epochToISO(value: string | number): string {
  const num = Number(value);
  // If it's a valid number treat as epoch-ms, otherwise parse as ISO/date string
  const date = !isNaN(num) && isFinite(num) ? new Date(num) : new Date(value as string);
  return date.toISOString().split('.')[0]; // "2024-01-15T10:30:00"
}

/**
 * Map numeric thumb (1 / -1) to string for the dashboard.
 */
function thumbToString(thumb: number | undefined | null): string | null {
  if (thumb === 1) return 'up';
  if (thumb === -1) return 'down';
  return null;
}

/**
 * Transform a raw DynamoDB log record into the API shape the dashboard expects.
 */
function transformLog(log: any) {
  const rawTs = log.uniqueTimestamp || '';
  const parsedTime = parseUniqueTimestamp(rawTs);

  return {
    logId: log.uniqueTimestamp,
    query: log.query,
    answer: log.answer,
    thumb: thumbToString(log.thumb),
    sessionId: log.sessionId,
    timestamp: isNaN(parsedTime) ? Date.now() : parsedTime,
    duration: log.duration || null,
    leadContactName: log.leadContactName,
    leadContactEmail: log.leadContactEmail,
    leadContactPhone: log.leadContactPhone,
  };
}

/**
 * Get query logs with filters
 * GET /api/query-log/:chatbotId?startDate=&endDate=&order=&limit=&cursor=&thumb=
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
      thumb,
    } = req.query;

    if (!req.user?.email) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const parsedLimit = Math.min(Math.max(1, Number(limit) || 50), 200);
    const validOrder = order === 'ascending' ? 'ascending' : 'descending';

    // Verify chatbot exists
    const chatbot = await ChatbotModel.get(chatbotId);
    if (!chatbot) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Chatbot not found');
    }

    // Use chatbotId as passageIndex (each chatbot has its own partition)
    let query = QueryLogModel.query('passageIndex').eq(chatbotId);

    // Date range on the sort key (uniqueTimestamp)
    if (startDate && endDate) {
      const startISO = epochToISO(startDate as string);
      const endISO = epochToISO(endDate as string) + '~'; // ~ sorts after all normal chars
      query = query.where('uniqueTimestamp').between(startISO, endISO);
    }

    // Thumb filter (post-query)
    if (thumb !== undefined) {
      query = query.filter('thumb').eq(Number(thumb));
    }

    const result = await query
      .sort(validOrder)
      .startAt(cursor as any)
      .limit(parsedLimit)
      .exec();

    res.json({
      success: true,
      logs: result.map(transformLog),
      cursor: result.lastKey,
      count: result.length,
    });
  } catch (error) {
    console.error('Error getting query logs:', error);
    errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to get query logs');
  }
}

/**
 * Search query logs by message
 * POST /api/query-log/:chatbotId/search
 */
export async function searchQueryLogs(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { searchTerm, limit = 50, offset = 0 } = req.body;

    if (!req.user?.email) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    if (!searchTerm || typeof searchTerm !== 'string') {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'searchTerm is required and must be a string');
    }

    if (searchTerm.length > 500) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'searchTerm must be under 500 characters');
    }

    const parsedLimit = Math.min(Math.max(1, Number(limit) || 50), 200);
    const parsedOffset = Math.max(0, Number(offset) || 0);

    const chatbot = await ChatbotModel.get(chatbotId);
    if (!chatbot) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Chatbot not found');
    }

    const result = await QueryLogModel.query('passageIndex')
      .eq(chatbotId)
      .exec();

    const searchLower = searchTerm.toLowerCase();
    const filteredLogs = result.filter(
      (log: any) =>
        log.query?.toLowerCase().includes(searchLower) ||
        log.answer?.toLowerCase().includes(searchLower)
    );

    const paginated = filteredLogs.slice(parsedOffset, parsedOffset + parsedLimit);

    res.json({
      success: true,
      logs: paginated.map(transformLog),
      count: paginated.length,
      total: filteredLogs.length,
      offset: parsedOffset,
    });
  } catch (error) {
    console.error('Error searching query logs:', error);
    errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to search query logs');
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
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    if (!logId || (thumb !== 1 && thumb !== -1)) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'logId and thumb (1 or -1) are required');
    }

    const chatbot = await ChatbotModel.get(chatbotId);
    if (!chatbot) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Chatbot not found');
    }

    await QueryLogModel.update(
      { passageIndex: chatbotId, uniqueTimestamp: logId },
      { thumb }
    );

    res.json({
      success: true,
      message: 'Feedback recorded successfully',
    });
  } catch (error) {
    console.error('Error recording feedback:', error);
    errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to record feedback');
  }
}

/**
 * Export query logs as CSV
 * GET /api/query-log/:chatbotId/export?startDate=&endDate=
 */
export async function exportQueryLogs(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { startDate, endDate } = req.query;

    if (!req.user?.email) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const chatbot = await ChatbotModel.get(chatbotId);
    if (!chatbot) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Chatbot not found');
    }

    // Fetch all logs for this chatbot
    const allResults = await QueryLogModel.query('passageIndex')
      .eq(chatbotId)
      .exec();

    // Optionally filter by date range
    let records = [...allResults];
    if (startDate && endDate) {
      const startMs = Number(startDate);
      const endMs = Number(endDate);
      records = records.filter((log: any) => {
        const logMs = parseUniqueTimestamp(log.uniqueTimestamp);
        return !isNaN(logMs) && logMs >= startMs && logMs <= endMs;
      });
    }

    if (records.length === 0) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'No query logs found');
    }

    const headers = ['Query', 'Answer', 'Timestamp', 'Feedback', 'Duration (ms)', 'Session ID'];
    const csvRows = [headers.join(',')];

    records.forEach((log: any) => {
      const rawTs = log.uniqueTimestamp || '';
      const isoStr = rawTs.split('#')[0];
      const feedback = log.thumb === 1 ? 'Positive' : log.thumb === -1 ? 'Negative' : '';
      const row = [
        log.query || '',
        log.answer || '',
        isoStr,
        feedback,
        log.duration != null ? String(log.duration) : '',
        log.sessionId || '',
      ].map((value: string) => `"${value.replace(/"/g, '""')}"`);
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
    errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to export query logs');
  }
}

/**
 * Get analytics stats
 * GET /api/query-log/:chatbotId/analytics?startDate=&endDate=
 */
export async function getAnalytics(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { startDate, endDate } = req.query;

    if (!req.user?.email) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const chatbot = await ChatbotModel.get(chatbotId);
    if (!chatbot) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Chatbot not found');
    }

    let query = QueryLogModel.query('passageIndex').eq(chatbotId);

    if (startDate && endDate) {
      const startISO = epochToISO(startDate as string);
      const endISO = epochToISO(endDate as string) + '~';
      query = query.where('uniqueTimestamp').between(startISO, endISO);
    }

    const result = await query.exec();

    // --- Basic counts ---
    const totalQueries = result.length;
    const thumbsUp = result.filter((log: any) => log.thumb === 1).length;
    const thumbsDown = result.filter((log: any) => log.thumb === -1).length;

    // --- Unique sessions ---
    const sessionSet = new Set<string>();
    result.forEach((log: any) => {
      if (log.sessionId) sessionSet.add(log.sessionId);
    });

    // --- Average response time ---
    const durations = result
      .filter((log: any) => log.duration)
      .map((log: any) => log.duration as number);
    const avgResponseTime = durations.length > 0
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : null;

    // --- Daily volume ---
    const dailyBuckets: Record<string, number> = {};
    result.forEach((log: any) => {
      const rawTs = log.uniqueTimestamp || '';
      const dateStr = rawTs.split('T')[0]; // "2024-01-15"
      if (dateStr) {
        dailyBuckets[dateStr] = (dailyBuckets[dateStr] || 0) + 1;
      }
    });
    const dailyVolume = Object.entries(dailyBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // --- Top queries ---
    const queryCount: Record<string, number> = {};
    result.forEach((log: any) => {
      if (log.query) {
        queryCount[log.query] = (queryCount[log.query] || 0) + 1;
      }
    });
    const topQueries = Object.entries(queryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([q, count]) => ({ query: q, count }));

    res.json({
      success: true,
      analytics: {
        totalQueries,
        thumbsUp,
        thumbsDown,
        thumbsUpPercentage: totalQueries > 0 ? Math.round((thumbsUp / totalQueries) * 100) : 0,
        thumbsDownPercentage: totalQueries > 0 ? Math.round((thumbsDown / totalQueries) * 100) : 0,
        uniqueSessions: sessionSet.size,
        avgResponseTime,
        dailyVolume,
        topQueries,
      },
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to get analytics');
  }
}
