import { Router } from 'express';
import {
  getCustomization,
  updateCustomization,
  updateTheme,
  updateSystemPrompt,
} from '../controllers/customize.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Customization Routes (All protected with authentication)
 */

// Get customization for a chatbot
router.get('/:chatbotId', authenticateToken, getCustomization);

// Update customization
router.put('/:chatbotId', authenticateToken, updateCustomization);

// Update theme colors
router.post('/:chatbotId/theme', authenticateToken, updateTheme);

// Update system prompt
router.post('/:chatbotId/prompt', authenticateToken, updateSystemPrompt);

export default router;
