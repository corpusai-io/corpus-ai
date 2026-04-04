import { Router } from 'express';
import {
  getQueryLogs,
  searchQueryLogs,
  recordFeedback,
  exportQueryLogs,
  getAnalytics,
} from '../controllers/querylog.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { sanitizeBody } from '../middleware/validation.middleware';

const router = Router();

/**
 * Query Log Routes (All protected with authentication)
 */

// Get query logs with filters
router.get('/:chatbotId', authenticateToken, getQueryLogs);

// Search query logs by message
router.post('/:chatbotId/search', authenticateToken, sanitizeBody, searchQueryLogs);

// Record feedback (thumbs up/down)
router.post('/:chatbotId/feedback', authenticateToken, sanitizeBody, recordFeedback);

// Export query logs as CSV
router.get('/:chatbotId/export', authenticateToken, exportQueryLogs);

// Get analytics stats
router.get('/:chatbotId/analytics', authenticateToken, getAnalytics);

export default router;
