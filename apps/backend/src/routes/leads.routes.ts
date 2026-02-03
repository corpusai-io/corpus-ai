import { Router } from 'express';
import {
  listLeads,
  addLead,
  exportLeads,
  updateLeadFields,
  getLeadFields,
} from '../controllers/leads.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Lead Generation Routes
 * Note: addLead is public (no auth) for chatbot form submissions
 */

// List leads (protected)
router.get('/:chatbotId', authenticateToken, listLeads);

// Add lead (PUBLIC - no auth)
router.post('/:chatbotId', addLead);

// Export leads as CSV (protected)
router.get('/:chatbotId/export', authenticateToken, exportLeads);

// Update lead form fields (protected)
router.put('/:chatbotId/fields', authenticateToken, updateLeadFields);

// Get lead form configuration (protected)
router.get('/:chatbotId/fields', authenticateToken, getLeadFields);

export default router;
