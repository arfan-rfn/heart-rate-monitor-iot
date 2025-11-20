import { Request, Response, NextFunction } from 'express';
import { auth } from '../../config/auth.js';
import { Device } from '../../models/devices/index.js';
import { getMongoDbInstance } from '../../config/database.js';

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
 * Supports both account-level and device-specific API keys
 *
 * Account-level keys: Require deviceId in request body/query
 * Device-specific keys: Legacy support, deviceId from database
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

    // Check if this is an account-level key by querying MongoDB directly
    // (Better-auth's verifyApiKey doesn't work with manually inserted keys)
    const db = getMongoDbInstance();
    const apiKeyCollection = db.collection('apiKey');

    // Try to find the key in MongoDB (for account-level keys)
    const accountKeyDoc = await apiKeyCollection.findOne({ key: apiKey });

    let isAccountKey = false;
    let result: any = null;

    if (accountKeyDoc) {
      // Found in MongoDB - this is an account-level key
      // Check expiration
      if (new Date(accountKeyDoc.expiresAt) < new Date()) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'API key has expired',
            code: 'API_KEY_EXPIRED',
          },
        });
      }

      isAccountKey = true;
      result = {
        valid: true,
        name: accountKeyDoc.name,
        userId: accountKeyDoc.userId,
        id: accountKeyDoc.id,
      };
    } else {
      // Not found in MongoDB - try better-auth verification (for device-specific keys)
      try {
        result = await auth.api.verifyApiKey({
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

        isAccountKey = (result as any).name === 'Account API Key';
      } catch (verifyError) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid or expired API key',
            code: 'INVALID_API_KEY',
          },
        });
      }
    }

    if (isAccountKey) {
      // ACCOUNT-LEVEL KEY: deviceId must be in request body or query
      const deviceId = req.body.deviceId || req.query.deviceId;

      if (!deviceId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'deviceId is required when using account-level API key',
            code: 'DEVICE_ID_REQUIRED',
          },
        });
      }

      // Validate device belongs to the user
      const device = await Device.findOne({
        deviceId,
        userId: (result as any).userId,
      });

      if (!device) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Device not found or does not belong to this account',
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

      // Attach device, user, and API key data to request
      req.device = device;
      req.user = { id: (result as any).userId };
      req.apiKeyData = result;
    } else {
      // DEVICE-SPECIFIC KEY (Legacy support)
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
    }

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
