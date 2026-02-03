import { Router } from 'express';
import {
  listAccessControl,
  grantAccess,
  revokeAccess,
  setAccessMode,
  generateApiKey,
  validateApiKey,
} from '../controllers/access.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Access Control Routes
 * Note: validateApiKey is public (no auth) for API key validation
 */

// List all users with access (protected)
router.get('/:chatbotId', authenticateToken, listAccessControl);

// Grant access to a user (protected)
router.post('/:chatbotId', authenticateToken, grantAccess);

// Revoke access from a user (protected)
router.delete('/:chatbotId/:email', authenticateToken, revokeAccess);

// Set access mode (protected)
router.put('/:chatbotId/mode', authenticateToken, setAccessMode);

// Generate API key (protected)
router.post('/:chatbotId/apikey', authenticateToken, generateApiKey);

// Validate API key (PUBLIC - no auth)
router.post('/validate', validateApiKey);

export default router;
