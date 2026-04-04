import { Router } from 'express';
import {
  listAccessControl,
  grantAccess,
  revokeAccess,
  setAccessMode,
  generateApiKey,
  listApiKeys,
  deleteApiKey,
  validateApiKey,
} from '../controllers/access.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { sanitizeBody } from '../middleware/validation.middleware';

const router = Router();

/**
 * Access Control Routes
 * IMPORTANT: Specific paths must come BEFORE parameterized routes
 * to avoid Express matching "apikeys" as `:email`.
 */

// Validate API key (PUBLIC - no auth)
router.post('/validate', sanitizeBody, validateApiKey);

// --- Specific sub-paths (must come before /:chatbotId/:email) ---

// Set access mode (protected)
router.put('/:chatbotId/mode', authenticateToken, sanitizeBody, setAccessMode);

// Generate API key (protected)
router.post('/:chatbotId/apikey', authenticateToken, generateApiKey);

// List API keys (protected)
router.get('/:chatbotId/apikeys', authenticateToken, listApiKeys);

// Delete API key (protected)
router.delete('/:chatbotId/apikeys/:keyId', authenticateToken, deleteApiKey);

// --- Parameterized routes (last) ---

// List all users with access (protected)
router.get('/:chatbotId', authenticateToken, listAccessControl);

// Grant access to a user (protected)
router.post('/:chatbotId', authenticateToken, sanitizeBody, grantAccess);

// Revoke access from a user (protected)
router.delete('/:chatbotId/:email', authenticateToken, revokeAccess);

export default router;
