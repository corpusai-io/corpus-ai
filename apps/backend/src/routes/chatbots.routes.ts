import { Router } from 'express';
import multer from 'multer';
import {
  createChatbot,
  listChatbots,
  getChatbot,
  getChatbotPublic,
  updateChatbot,
  deleteChatbot,
  rebuildChatbot,
  activateChatbot,
  getChatbotStatus,
  streamChatbotStatus,
  getUploadUrl,
  uploadFile,
  startBuild,
  localBuild,
} from '../controllers/chatbots.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { sanitizeBody } from '../middleware/validation.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

/**
 * Chatbot CRUD Routes (All protected with authentication)
 */

// Create a new chatbot
router.post('/', authenticateToken, sanitizeBody, createChatbot);

// List all chatbots for a user (supports ?search=&status=&sort=&order=&limit=&offset=)
router.get('/', authenticateToken, listChatbots);

// Get limited public chatbot info (PUBLIC - used by widget embed, no auth)
router.get('/:id/public', getChatbotPublic);

// Get a single chatbot by ID
router.get('/:id', authenticateToken, getChatbot);

// Update a chatbot
router.put('/:id', authenticateToken, sanitizeBody, updateChatbot);

// Delete a chatbot
router.delete('/:id', authenticateToken, deleteChatbot);

// Trigger chatbot rebuild
router.post('/:id/rebuild', authenticateToken, rebuildChatbot);

// Generate presigned upload URL for files
router.post('/:id/upload-url', authenticateToken, sanitizeBody, getUploadUrl);

// Upload a file via the backend (server-side S3 upload)
router.post('/:id/upload', authenticateToken, upload.single('file'), uploadFile);

// Start build after files are uploaded
router.post('/:id/build', authenticateToken, sanitizeBody, startBuild);

// Local dev: run full RAG pipeline inline (no SQS/Lambda needed)
router.post('/:id/local-build', authenticateToken, localBuild);

// Force-activate chatbot (local dev only)
router.post('/:id/activate', authenticateToken, activateChatbot);

// Get chatbot build status
router.get('/:id/status', authenticateToken, getChatbotStatus);

// Stream chatbot build status as SSE
router.get('/:id/status/stream', authenticateToken, streamChatbotStatus);

export default router;
