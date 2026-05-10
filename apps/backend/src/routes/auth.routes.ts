import { Router } from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  verifyToken,
  confirmUser,
  confirmSignUp,
  forgotPassword,
  confirmForgotPassword,
  refreshToken,
  googleSSO,
  googleSSOCallback,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { sanitizeBody } from '../middleware/validation.middleware';
import { rateLimits } from '../middleware/rateLimit.middleware';

const router = Router();

/**
 * Authentication Routes
 */

// Register a new user
router.post('/register', rateLimits.auth, sanitizeBody, register);

// Login user
router.post('/login', rateLimits.auth, sanitizeBody, login);

// Logout user (client-side token removal)
router.post('/logout', logout);

// Get current user info (protected)
router.get('/me', authenticateToken, getCurrentUser);

// Verify JWT token
router.get('/verify', verifyToken);

// Admin: Confirm user email — requires ADMIN_CONFIRM_SECRET env var + x-admin-secret header
router.post('/confirm', rateLimits.auth, sanitizeBody, confirmUser);

// User: Confirm signup with verification code
router.post('/confirm-signup', sanitizeBody, confirmSignUp);

// Forgot password - initiate reset
router.post('/forgot-password', rateLimits.passwordReset, sanitizeBody, forgotPassword);

// Confirm forgot password with code and new password
router.post('/confirm-forgot-password', rateLimits.passwordReset, sanitizeBody, confirmForgotPassword);

// Refresh access token (public - no auth middleware needed)
router.post('/refresh', rateLimits.auth, sanitizeBody, refreshToken);

// Google SSO - initiate OAuth flow via Cognito Hosted UI
router.get('/google', googleSSO);

// Google SSO - callback from Cognito after Google authentication
router.get('/google/callback', googleSSOCallback);

export default router;
