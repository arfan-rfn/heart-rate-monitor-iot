import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
  updatePhysicianAssociation,
} from './controller.js';
import {
  generateAccountApiKey,
  viewAccountApiKey,
  regenerateAccountApiKey,
  revokeAccountApiKey,
} from './api-key.controller.js';
import { authenticate } from '../../middleware/auth/index.js';

/**
 * Strict rate limiter for sensitive API key operations
 * Prevents abuse of key generation/regeneration
 * DISABLED in development mode for easier testing
 */
const apiKeyRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'development' ? 1000 : 5, // 1000 in dev, 5 in production
  message: 'Too many API key requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // Skip rate limiting in dev mode
  // Use user ID for rate limiting (users must be authenticated)
  keyGenerator: (req) => {
    // API key endpoints require authentication, so user.id should always exist
    return req.user?.id || 'unauthenticated';
  },
  // Explicitly validate that we're not using IP addresses for rate limiting
  validate: {
    keyGeneratorIpFallback: false, // Disable IPv6 validation warning
  },
});

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

/**
 * Account-Level API Key Management
 * These endpoints manage API keys that work across all user's devices
 */

/**
 * @route   POST /api/users/api-key
 * @desc    Generate account-level API key for IoT devices
 * @access  Private (requires JWT/Session)
 * @return  { apiKey: string } - Only shown once
 * @rateLimit 5 requests per hour
 */
router.post('/api-key', authenticate, apiKeyRateLimiter, generateAccountApiKey);

/**
 * @route   GET /api/users/api-key
 * @desc    View existing account API key (masked)
 * @access  Private (requires JWT/Session)
 * @return  { keyPreview: string, createdAt, expiresAt }
 */
router.get('/api-key', authenticate, viewAccountApiKey);

/**
 * @route   POST /api/users/api-key/regenerate
 * @desc    Revoke old key and generate new account API key
 * @access  Private (requires JWT/Session)
 * @return  { apiKey: string } - Only shown once
 * @rateLimit 5 requests per hour
 */
router.post('/api-key/regenerate', authenticate, apiKeyRateLimiter, regenerateAccountApiKey);

/**
 * @route   DELETE /api/users/api-key
 * @desc    Revoke account API key
 * @access  Private (requires JWT/Session)
 * @rateLimit 5 requests per hour
 */
router.delete('/api-key', authenticate, apiKeyRateLimiter, revokeAccountApiKey);

export default router;
