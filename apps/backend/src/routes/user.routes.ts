import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  getUserStats,
} from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * User Profile Routes (All protected with authentication)
 */

// Get user profile
router.get('/profile', authenticateToken, getUserProfile);

// Update user profile
router.put('/profile', authenticateToken, updateUserProfile);

// Change password
router.put('/password', authenticateToken, changePassword);

// Delete user account
router.delete('/account', authenticateToken, deleteUserAccount);

// Get user statistics
router.get('/stats', authenticateToken, getUserStats);

export default router;
