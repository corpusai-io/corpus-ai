import { Router } from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  verifyToken,
  confirmUser,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Authentication Routes
 */

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Logout user (client-side token removal)
router.post('/logout', logout);

// Get current user info (protected)
router.get('/me', authenticateToken, getCurrentUser);

// Verify JWT token
router.get('/verify', verifyToken);

// Admin: Confirm user email (for development)
router.post('/confirm', confirmUser);

export default router;
