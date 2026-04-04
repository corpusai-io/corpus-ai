import { Router } from 'express';
import {
  getBuiltinIntegrations,
  saveBuiltinIntegration,
  testBuiltinIntegration,
  disconnectBuiltinIntegration,
} from '../controllers/builtin-integrations.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { sanitizeBody } from '../middleware/validation.middleware';

const router = Router();

router.get('/:chatbotId', authenticateToken, getBuiltinIntegrations);
router.put('/:chatbotId/:integrationKey', authenticateToken, sanitizeBody, saveBuiltinIntegration);
router.post('/:chatbotId/:integrationKey/test', authenticateToken, sanitizeBody, testBuiltinIntegration);
router.delete('/:chatbotId/:integrationKey', authenticateToken, disconnectBuiltinIntegration);

export default router;
