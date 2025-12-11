import { Request, Response } from 'express';
import { Device } from '../../models/devices/index.js';
import { auth } from '../../config/auth.js';
import { asyncHandler, AppError } from '../../middleware/error/index.js';

/**
 * Register a new device
 * POST /api/devices
 * Requires: JWT authentication
 */
export const registerDevice = asyncHandler(async (req: Request, res: Response) => {
  const { deviceId, name } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  // Validate input
  if (!deviceId || !name) {
    throw new AppError('Device ID and name are required', 400, 'INVALID_INPUT');
  }

  // Check if device already exists
  const existingDevice = await Device.findOne({ deviceId });
  if (existingDevice) {
    throw new AppError('Device ID already registered', 400, 'DEVICE_EXISTS');
  }

  // Create API key in better-auth first
  const apiKeyResponse = await auth.api.createApiKey({
    body: {
      name: `Device: ${name}`,
      userId: userId,
      expiresIn: 60 * 60 * 24 * 365, // 1 year
    },
  });

  // Extract the API key from the response
  const apiKey = (apiKeyResponse as any)?.key;

  if (!apiKey) {
    throw new AppError('Failed to generate API key', 500, 'API_KEY_GENERATION_FAILED');
  }

  // Create device with the better-auth generated API key
  const device = new Device({
    deviceId,
    userId,
    name,
    apiKey, // Store the better-auth API key
  });

  // Save device
  await device.save();

  // Return device info with API key (only shown once)
  res.status(201).json({
    success: true,
    data: {
      device: {
        id: device._id,
        deviceId: device.deviceId,
        name: device.name,
        apiKey: apiKey, // Only returned on registration
        status: device.status,
        config: device.config,
        createdAt: device.createdAt,
      },
    },
  });
});

/**
 * Get all user's devices
 * GET /api/devices
 * Requires: JWT authentication
 */
export const getUserDevices = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  const devices = await Device.find({ userId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      devices: devices.map((device) => ({
        id: device._id,
        deviceId: device.deviceId,
        name: device.name,
        status: device.status,
        config: device.config,
        lastSeen: device.lastSeen,
        createdAt: device.createdAt,
        updatedAt: device.updatedAt,
      })),
      count: devices.length,
    },
  });
});

/**
 * Get single device details
 * GET /api/devices/:deviceId
 * Requires: JWT authentication + device ownership
 */
export const getDevice = asyncHandler(async (req: Request, res: Response) => {
  const device = req.device; // Attached by validateDeviceOwnership middleware

  if (!device) {
    throw new AppError('Device not found', 404, 'DEVICE_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: {
      device: {
        id: device._id,
        deviceId: device.deviceId,
        name: device.name,
        status: device.status,
        config: device.config,
        lastSeen: device.lastSeen,
        createdAt: device.createdAt,
        updatedAt: device.updatedAt,
      },
    },
  });
});

/**
 * Calculate UTC offset in hours for a given IANA timezone
 * Returns the current offset including DST adjustments
 */
function getTimezoneOffset(timezone: string): number {
  try {
    // Create a date formatter for the target timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    });

    // Parse the offset from the formatted string (e.g., "GMT-7" or "GMT+5:30")
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find(p => p.type === 'timeZoneName');

    if (tzPart) {
      const offsetStr = tzPart.value; // e.g., "GMT-7", "GMT+5:30"
      const match = offsetStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);

      if (match) {
        const sign = match[1] === '+' ? 1 : -1;
        const hours = parseInt(match[2], 10);
        const minutes = match[3] ? parseInt(match[3], 10) : 0;
        return sign * (hours + minutes / 60);
      }
    }

    // Fallback: calculate offset by comparing UTC and local times
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const diffMs = tzDate.getTime() - utcDate.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  } catch (error) {
    // Default to UTC if timezone is invalid
    console.warn(`Invalid timezone "${timezone}", defaulting to UTC`);
    return 0;
  }
}

/**
 * Get device configuration
 * GET /api/devices/:deviceId/config
 * Requires: API key OR JWT authentication
 */
export const getDeviceConfig = asyncHandler(async (req: Request, res: Response) => {
  const { deviceId } = req.params;

  // If authenticated via API key, device is already attached by middleware
  // Otherwise, look up device and verify JWT ownership
  let device = req.device;

  if (!device) {
    // JWT auth path - look up device
    device = await Device.findOne({ deviceId });

    if (!device) {
      throw new AppError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    // Verify ownership for JWT auth
    if (req.user && device.userId !== req.user.id) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }
  }

  // Calculate the current UTC offset for the device's timezone
  // This accounts for DST automatically
  const timezoneOffset = getTimezoneOffset(device.config.timezone || 'America/New_York');

  res.status(200).json({
    success: true,
    data: {
      config: {
        ...device.config,
        timezoneOffset, // UTC offset in hours (e.g., -7 for MST, -4 for EDT)
      },
    },
  });
});

/**
 * Update device configuration
 * PUT /api/devices/:deviceId/config
 * Requires: JWT authentication + device ownership
 */
export const updateDeviceConfig = asyncHandler(async (req: Request, res: Response) => {
  const device = req.device; // Attached by validateDeviceOwnership middleware
  const { measurementFrequency, activeStartTime, activeEndTime, timezone } = req.body;

  if (!device) {
    throw new AppError('Device not found', 404, 'DEVICE_NOT_FOUND');
  }

  // Update config fields if provided
  if (measurementFrequency !== undefined) {
    device.config.measurementFrequency = measurementFrequency;
  }
  if (activeStartTime !== undefined) {
    device.config.activeStartTime = activeStartTime;
  }
  if (activeEndTime !== undefined) {
    device.config.activeEndTime = activeEndTime;
  }
  if (timezone !== undefined) {
    device.config.timezone = timezone;
  }

  await device.save();

  res.status(200).json({
    success: true,
    data: {
      config: device.config,
    },
  });
});

/**
 * Update device details
 * PUT /api/devices/:deviceId
 * Requires: JWT authentication + device ownership
 */
export const updateDevice = asyncHandler(async (req: Request, res: Response) => {
  const device = req.device; // Attached by validateDeviceOwnership middleware
  const { name, status } = req.body;

  if (!device) {
    throw new AppError('Device not found', 404, 'DEVICE_NOT_FOUND');
  }

  // Update fields if provided
  if (name !== undefined) {
    device.name = name;
  }
  if (status !== undefined) {
    device.status = status;
  }

  await device.save();

  res.status(200).json({
    success: true,
    data: {
      device: {
        id: device._id,
        deviceId: device.deviceId,
        name: device.name,
        status: device.status,
        config: device.config,
        lastSeen: device.lastSeen,
        updatedAt: device.updatedAt,
      },
    },
  });
});

/**
 * Delete a device
 * DELETE /api/devices/:deviceId
 * Requires: JWT authentication + device ownership
 */
export const deleteDevice = asyncHandler(async (req: Request, res: Response) => {
  const device = req.device; // Attached by validateDeviceOwnership middleware

  if (!device) {
    throw new AppError('Device not found', 404, 'DEVICE_NOT_FOUND');
  }

  await device.deleteOne();

  // TODO: Optionally delete associated measurements
  // await Measurement.deleteMany({ deviceId: device.deviceId });

  res.status(204).send();
});
