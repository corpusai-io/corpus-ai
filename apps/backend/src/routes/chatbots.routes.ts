import { Router } from 'express';
import {
  createChatbot,
  listChatbots,
  getChatbot,
  updateChatbot,
  deleteChatbot,
  rebuildChatbot,
  getChatbotStatus,
} from '../controllers/chatbots.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Chatbot CRUD Routes (All protected with authentication)
 */

// Create a new chatbot
router.post('/', authenticateToken, createChatbot);

// List all chatbots for a user
router.get('/', authenticateToken, listChatbots);

// Get a single chatbot by ID
router.get('/:id', authenticateToken, getChatbot);

// Update a chatbot
router.put('/:id', authenticateToken, updateChatbot);

// Delete a chatbot
router.delete('/:id', authenticateToken, deleteChatbot);

// Trigger chatbot rebuild
router.post('/:id/rebuild', authenticateToken, rebuildChatbot);

// Get chatbot build status
router.get('/:id/status', authenticateToken, getChatbotStatus);

export default router;
