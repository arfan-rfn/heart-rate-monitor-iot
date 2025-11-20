import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/auth.js';
import { Device } from '../models/Device.js';

/**
 * Extend Express Request to include device
 */
declare global {
  namespace Express {
    interface Request {
      device?: any;
      apiKeyData?: any;
    }
  }
}

/**
 * API Key authentication middleware for IoT devices
 * Validates X-API-Key header using better-auth's API Key plugin
 */
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get API key from X-API-Key header
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'API key required',
          code: 'API_KEY_MISSING',
        },
      });
    }

    // Verify API key using better-auth
    const result = await auth.api.verifyApiKey({
      body: {
        key: apiKey,
      },
    });

    if (!result || !result.valid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired API key',
          code: 'INVALID_API_KEY',
        },
      });
    }

    // Get device information
    const device = await Device.findOne({ apiKey }).select('+apiKey');

    if (!device) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Device not found',
          code: 'DEVICE_NOT_FOUND',
        },
      });
    }

    // Check if device is active
    if (device.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Device is not active',
          code: 'DEVICE_INACTIVE',
        },
      });
    }

    // Update last seen timestamp
    await device.updateLastSeen();

    // Attach device and API key data to request
    req.device = device;
    req.apiKeyData = result;

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(401).json({
      success: false,
      error: {
        message: 'API key authentication failed',
        code: 'API_KEY_AUTH_FAILED',
      },
    });
  }
};

/**
 * Middleware to validate device ownership
 * Checks if the authenticated user owns the specified device
 */
export const validateDeviceOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const device = await Device.findOne({ deviceId, userId });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Device not found or access denied',
          code: 'DEVICE_NOT_FOUND',
        },
      });
    }

    req.device = device;
    next();
  } catch (error) {
    console.error('Device ownership validation error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to validate device ownership',
        code: 'VALIDATION_ERROR',
      },
    });
  }
};
