/**
 * Export all middleware
 */
export { authenticate, optionalAuth } from './auth.middleware.js';
export { authenticateApiKey, validateDeviceOwnership } from './apiKey.middleware.js';
export {
  requireRole,
  requirePhysician,
  requireAdmin,
  requireUserOrPhysician,
} from './role.middleware.js';
export { errorHandler, notFound, asyncHandler, AppError } from './error.middleware.js';
