import { Router } from 'express';
import {
  registerDevice,
  getUserDevices,
  getDevice,
  getDeviceConfig,
  updateDeviceConfig,
  updateDevice,
  deleteDevice,
} from './controller.js';
import { authenticate } from '../../middleware/auth/index.js';
import { authenticateApiKey, validateDeviceOwnership } from '../../middleware/device/index.js';

const router = Router();

/**
 * Device Management Routes
 */

// Register new device (requires JWT auth)
router.post('/', authenticate, registerDevice);

// Get all user's devices (requires JWT auth)
router.get('/', authenticate, getUserDevices);

// Get single device (requires JWT auth + ownership)
router.get('/:deviceId', authenticate, validateDeviceOwnership, getDevice);

// Update device (requires JWT auth + ownership)
router.put('/:deviceId', authenticate, validateDeviceOwnership, updateDevice);

// Delete device (requires JWT auth + ownership)
router.delete('/:deviceId', authenticate, validateDeviceOwnership, deleteDevice);

/**
 * Device Configuration Routes
 */

// Get device config (API key OR JWT auth)
// This endpoint supports both authentication methods
router.get('/:deviceId/config', async (req, res, next) => {
  const hasApiKey = req.headers['x-api-key'];

  if (hasApiKey) {
    // Use API key authentication for IoT devices
    return authenticateApiKey(req, res, next);
  } else {
    // Use JWT authentication for web clients
    return authenticate(req, res, next);
  }
}, getDeviceConfig);

// Update device config (requires JWT auth + ownership)
router.put('/:deviceId/config', authenticate, validateDeviceOwnership, updateDeviceConfig);

export default router;
