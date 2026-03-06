import { Router } from 'express';
import {
  listLeads,
  addLead,
  exportLeads,
  updateLeadFields,
  getLeadFields,
  getLead,
  updateLead,
  getLeadAnalytics,
} from '../controllers/leads.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { sanitizeBody } from '../middleware/validation.middleware';

const router = Router();

/**
 * Lead Generation Routes
 * Order matters: static segment routes before dynamic param routes
 * Note: addLead and getLeadFields are public (no auth) for chatbot form submissions
 */

// Export leads as CSV (protected) - before /:chatbotId
router.get('/:chatbotId/export', authenticateToken, exportLeads);

// Lead analytics (protected) - before /:chatbotId
router.get('/:chatbotId/analytics', authenticateToken, getLeadAnalytics);

// Update lead form fields (protected) - before /:chatbotId/:dataId
router.put('/:chatbotId/fields', authenticateToken, sanitizeBody, updateLeadFields);

// Get lead form configuration (PUBLIC - used by widget) - before /:chatbotId/:dataId
router.get('/:chatbotId/fields', getLeadFields);

// List leads (protected)
router.get('/:chatbotId', authenticateToken, listLeads);

// Add lead (PUBLIC - no auth, sanitized)
router.post('/:chatbotId', sanitizeBody, addLead);

// Get single lead with transcript (protected)
router.get('/:chatbotId/:dataId', authenticateToken, getLead);

// Update lead status/notes (protected)
router.put('/:chatbotId/:dataId', authenticateToken, sanitizeBody, updateLead);

export default router;
