import { Router } from 'express';
import {
  listIntegrations,
  slackOAuthCallback,
  connectSlack,
  disconnectSlack,
  zapierSubscribe,
  zapierUnsubscribe,
  zapierSamples,
  listGoogleDriveProfiles,
  connectGoogleDrive,
  disconnectGoogleDrive,
  connectTelegram,
  disconnectTelegram,
  connectWhatsApp,
  disconnectWhatsApp,
} from '../controllers/integrations.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { sanitizeBody } from '../middleware/validation.middleware';

const router = Router();

/**
 * Integrations Routes
 */

// List all integrations (protected)
router.get('/:chatbotId', authenticateToken, listIntegrations);

// ========== SLACK ==========
router.get('/slack/oauth', slackOAuthCallback); // OAuth callback (public)
router.post('/slack/:chatbotId', authenticateToken, sanitizeBody, connectSlack);
router.delete('/slack/:chatbotId', authenticateToken, disconnectSlack);

// ========== ZAPIER ==========
router.post('/zapier/subscribe', authenticateToken, sanitizeBody, zapierSubscribe);
router.delete('/zapier/unsubscribe', authenticateToken, zapierUnsubscribe);
router.get('/zapier/samples', zapierSamples); // Public for Zapier setup

// ========== GOOGLE DRIVE ==========
router.get('/google-drive/profiles', authenticateToken, listGoogleDriveProfiles);
router.post('/google-drive/:chatbotId', authenticateToken, sanitizeBody, connectGoogleDrive);
router.delete('/google-drive/:chatbotId', authenticateToken, disconnectGoogleDrive);

// ========== TELEGRAM ==========
router.post('/telegram/:chatbotId', authenticateToken, sanitizeBody, connectTelegram);
router.delete('/telegram/:chatbotId', authenticateToken, disconnectTelegram);

// ========== WHATSAPP ==========
router.post('/whatsapp/:chatbotId', authenticateToken, sanitizeBody, connectWhatsApp);
router.delete('/whatsapp/:chatbotId', authenticateToken, disconnectWhatsApp);

export default router;
