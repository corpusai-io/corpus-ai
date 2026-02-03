import { Router } from 'express';
import {
  getUserQuota,
  checkChatbotQuota,
  getUsageStats,
  getAvailableTiers,
} from '../controllers/quota.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Quota Management Routes (All protected with authentication)
 */

// Get user quota
router.get('/', authenticateToken, getUserQuota);

// Check chatbot quota
router.get('/:chatbotId', authenticateToken, checkChatbotQuota);

// Get detailed usage stats
router.get('/usage', authenticateToken, getUsageStats);

// Get available tiers
router.get('/tiers', authenticateToken, getAvailableTiers);

export default router;
