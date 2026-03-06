import { Router } from 'express';
import {
  getCustomization,
  getCustomizationPublic,
  updateCustomization,
  updateTheme,
  updateSystemPrompt,
} from '../controllers/customize.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { sanitizeBody } from '../middleware/validation.middleware';

const router = Router();

/**
 * Customization Routes (All protected with authentication)
 */

// Get public customization (PUBLIC - used by widget embed, no auth)
router.get('/:chatbotId/public', getCustomizationPublic);

// Get customization for a chatbot
router.get('/:chatbotId', authenticateToken, getCustomization);

// Update customization
router.put('/:chatbotId', authenticateToken, sanitizeBody, updateCustomization);

// Update theme colors
router.post('/:chatbotId/theme', authenticateToken, sanitizeBody, updateTheme);

// Update system prompt
router.post('/:chatbotId/prompt', authenticateToken, sanitizeBody, updateSystemPrompt);

export default router;
