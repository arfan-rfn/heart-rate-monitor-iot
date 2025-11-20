import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
  updatePhysicianAssociation,
} from './controller.js';
import { authenticate } from '../../middleware/auth/index.js';

const router = Router();

/**
 * All user routes require authentication
 */

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile with stats
 * @access  Private (requires JWT/Session)
 */
router.get('/profile', authenticate, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile (name only)
 * @access  Private (requires JWT/Session)
 * @body    { name: string }
 */
router.put('/profile', authenticate, updateUserProfile);

/**
 * @route   POST /api/users/change-password
 * @desc    Change user password
 * @access  Private (requires JWT/Session)
 * @body    { currentPassword: string, newPassword: string }
 */
router.post('/change-password', authenticate, changePassword);

/**
 * @route   DELETE /api/users/profile
 * @desc    Delete user account and all associated data
 * @access  Private (requires JWT/Session)
 * @body    { password: string } - for confirmation
 */
router.delete('/profile', authenticate, deleteAccount);

/**
 * @route   PUT /api/users/physician
 * @desc    Associate or disassociate user with a physician
 * @access  Private (requires JWT/Session)
 * @body    { physicianId: string | null }
 */
router.put('/physician', authenticate, updatePhysicianAssociation);

export default router;
