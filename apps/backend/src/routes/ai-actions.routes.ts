import { Router } from 'express';
import { getAiActions, saveAiActions } from '../controllers/ai-actions.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { sanitizeBody } from '../middleware/validation.middleware';

const router = Router();

// Get AI actions config for a chatbot
router.get('/:chatbotId', authenticateToken, getAiActions);

// Save AI actions config for a chatbot
router.put('/:chatbotId', authenticateToken, sanitizeBody, saveAiActions);

export default router;
