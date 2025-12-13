import { Request, Response } from 'express';
import { Measurement, IMeasurement } from '../../models/measurements/index.js';
import { Device } from '../../models/devices/index.js';
import { asyncHandler, AppError } from '../../middleware/error/index.js';

/**
 * Format a Date to ISO string in a specific timezone
 * Returns format: "2025-12-12T18:11:55.000-07:00" (with timezone offset)
 */
function formatInTimezone(date: Date, timezone: string): string {
  try {
    // Get the timezone offset
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';

    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hour = getPart('hour');
    const minute = getPart('minute');
    const second = getPart('second');
    // Get milliseconds from original date
    const ms = String(date.getMilliseconds()).padStart(3, '0');

    // Calculate timezone offset string (e.g., "-07:00")
    const offsetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    });
    const offsetParts = offsetFormatter.formatToParts(date);
    const tzPart = offsetParts.find(p => p.type === 'timeZoneName')?.value || 'GMT';

    let offsetStr = '+00:00';
    const match = tzPart.match(/GMT([+-]?)(\d{1,2})(?::(\d{2}))?/);
    if (match) {
      const sign = match[1] || '+';
      const hours = match[2].padStart(2, '0');
      const minutes = match[3] || '00';
      offsetStr = `${sign}${hours}:${minutes}`;
    }

    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}${offsetStr}`;
  } catch {
    // Fallback to UTC if timezone is invalid
    return date.toISOString();
  }
}

/**
 * Get the date string (YYYY-MM-DD) in a specific timezone
 */
function getDateInTimezone(date: Date, timezone: string): string {
  try {
    return date.toLocaleDateString('en-CA', { timeZone: timezone });
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Submit a measurement from IoT device
 * POST /api/measurements
 * Requires: API key authentication
 *
 * Note: deviceId is required in request body for account-level API keys.
 * For device-specific keys, deviceId must match the authenticated device.
 */
export const submitMeasurement = asyncHandler(async (req: Request, res: Response) => {
  const { deviceId, heartRate, spO2, timestamp, quality, confidence } = req.body;
  const device = req.device; // Attached by authenticateApiKey middleware

  if (!device) {
    throw new AppError('Device not authenticated', 401, 'UNAUTHORIZED');
  }

  // Validate required fields
  if (!deviceId || !heartRate || !spO2) {
    throw new AppError('Device ID, heart rate, and SpO2 are required', 400, 'INVALID_INPUT');
  }

  // Verify deviceId matches authenticated device
  // (Middleware already handles this for account-level keys)
  if (device.deviceId !== deviceId) {
    throw new AppError(
      'Device ID mismatch: deviceId in request does not match authenticated device',
      403,
      'DEVICE_ID_MISMATCH'
    );
  }

  // Use provided timestamp or current time
  const measurementTimestamp = timestamp ? new Date(timestamp) : new Date();

  // Create measurement
  const measurement = new Measurement({
    userId: device.userId,
    deviceId: deviceId,
    heartRate,
    spO2,
    timestamp: measurementTimestamp,
    quality: quality || 'good',
    confidence: confidence !== undefined ? confidence : 1.0,
  });

  await measurement.save();

  res.status(201).json({
    success: true,
    data: {
      measurement: {
        id: measurement._id,
        heartRate: measurement.heartRate,
        spO2: measurement.spO2,
        timestamp: measurement.timestamp,
        quality: measurement.quality,
        confidence: measurement.confidence,
      },
    },
  });
});

/**
 * Get user's measurements with optional filtering
 * GET /api/measurements?startDate=...&endDate=...&deviceId=...&timezone=America/Phoenix
 * Requires: JWT authentication
 */
export const getUserMeasurements = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  const { startDate, endDate, deviceId, limit = 100, page = 1, timezone } = req.query;

  // Get timezone: from query param, or from user's device config, or default
  let tz = (timezone as string) || '';
  if (!tz) {
    const userDevice = await Device.findOne({ userId });
    tz = userDevice?.config?.timezone || 'America/Phoenix';
  }

  // Build query
  const query: any = { userId };

  // Add date range filter
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = new Date(startDate as string);
    }
    if (endDate) {
      query.timestamp.$lte = new Date(endDate as string);
    }
  }

  // Add device filter
  if (deviceId) {
    query.deviceId = deviceId;
  }

  // Pagination
  const limitNum = parseInt(limit as string);
  const pageNum = parseInt(page as string);
  const skip = (pageNum - 1) * limitNum;

  // Get measurements
  const measurements = await Measurement.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limitNum);

  // Get total count
  const total = await Measurement.countDocuments(query);

  // Format timestamps in the requested timezone
  const formattedMeasurements = measurements.map((m: IMeasurement) => ({
    _id: m._id,
    userId: m.userId,
    deviceId: m.deviceId,
    heartRate: m.heartRate,
    spO2: m.spO2,
    timestamp: formatInTimezone(m.timestamp, tz),
    quality: m.quality,
    confidence: m.confidence,
    createdAt: m.createdAt ? formatInTimezone(m.createdAt, tz) : undefined,
  }));

  res.status(200).json({
    success: true,
    data: {
      measurements: formattedMeasurements,
      timezone: tz,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

/**
 * Get daily measurements for a specific date
 * GET /api/measurements/daily/:date?timezone=America/Phoenix
 * Requires: JWT authentication
 *
 * The date parameter should be in YYYY-MM-DD format.
 * If timezone is provided, the date is interpreted in that timezone
 * and all timestamps are returned in that timezone.
 */
export const getDailyMeasurements = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { date } = req.params;
  const { timezone } = req.query;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  if (!date) {
    throw new AppError('Date parameter is required', 400, 'INVALID_INPUT');
  }

  // Get timezone: from query param, or from user's device config, or default to UTC
  let tz = (timezone as string) || '';
  if (!tz) {
    // Try to get timezone from user's first device config
    const userDevice = await Device.findOne({ userId });
    tz = userDevice?.config?.timezone || 'America/Phoenix';
  }

  // Parse the date in the specified timezone
  // For timezone-aware querying, we need to find the start and end of day in that timezone
  let startOfDay: Date;
  let endOfDay: Date;

  try {
    // Parse the date parts
    const [year, month, day] = date.split('-').map(Number);

    // Create start of day in the target timezone
    // We need to find what UTC time corresponds to midnight in the target timezone
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`;
    const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:59:59.999`;

    // Use Intl to get the UTC equivalent
    const startLocal = new Date(dateStr);
    const endLocal = new Date(endDateStr);

    // Get the offset for the timezone at that date
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(startLocal);
    const tzPart = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT';

    let offsetHours = 0;
    const match = tzPart.match(/GMT([+-]?)(\d{1,2})(?::(\d{2}))?/);
    if (match) {
      const sign = match[1] === '-' ? -1 : 1;
      const hours = parseInt(match[2], 10);
      const minutes = match[3] ? parseInt(match[3], 10) : 0;
      offsetHours = sign * (hours + minutes / 60);
    }

    // Convert local time to UTC by subtracting the offset
    startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - offsetHours * 60 * 60 * 1000);
    endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) - offsetHours * 60 * 60 * 1000);
  } catch {
    // Fallback to UTC parsing
    const targetDate = new Date(date);
    startOfDay = new Date(Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      0, 0, 0, 0
    ));
    endOfDay = new Date(Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      23, 59, 59, 999
    ));
  }

  // Query measurements within the timezone-adjusted day
  const measurements = await Measurement.find({
    userId,
    timestamp: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ timestamp: 1 });

  res.status(200).json({
    success: true,
    data: {
      date: date,
      timezone: tz,
      measurements: measurements.map((m: IMeasurement) => ({
        timestamp: formatInTimezone(m.timestamp, tz),
        heartRate: m.heartRate,
        spO2: m.spO2,
        quality: m.quality,
        confidence: m.confidence,
        deviceId: m.deviceId,
      })),
      count: measurements.length,
    },
  });
});

/**
 * Get weekly summary
 * GET /api/measurements/weekly/summary
 * Requires: JWT authentication
 */
export const getWeeklySummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  const summary = await Measurement.getWeeklySummary(userId);

  if (!summary) {
    return res.status(200).json({
      success: true,
      data: {
        summary: {
          averageHeartRate: 0,
          minHeartRate: 0,
          maxHeartRate: 0,
          averageSpO2: 0,
          minSpO2: 0,
          maxSpO2: 0,
          totalMeasurements: 0,
          dateRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
          },
        },
      },
    });
  }

  res.status(200).json({
    success: true,
    data: {
      summary: {
        averageHeartRate: Math.round(summary.averageHeartRate * 10) / 10,
        minHeartRate: summary.minHeartRate,
        maxHeartRate: summary.maxHeartRate,
        averageSpO2: Math.round(summary.averageSpO2 * 10) / 10,
        minSpO2: summary.minSpO2,
        maxSpO2: summary.maxSpO2,
        totalMeasurements: summary.totalMeasurements,
        dateRange: {
          start: summary.firstMeasurement?.toISOString().split('T')[0],
          end: summary.lastMeasurement?.toISOString().split('T')[0],
        },
      },
    },
  });
});

/**
 * Get daily aggregates for the last N days
 * GET /api/measurements/daily-aggregates?days=7
 * Requires: JWT authentication
 */
export const getDailyAggregates = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { days = 7 } = req.query;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  const daysNum = parseInt(days as string);
  const aggregates = await Measurement.getDailyAggregates(userId, daysNum);

  res.status(200).json({
    success: true,
    data: {
      aggregates,
      days: daysNum,
    },
  });
});

/**
 * Get measurements for a specific device
 * GET /api/measurements/device/:deviceId
 * Requires: JWT authentication + device ownership
 */
export const getDeviceMeasurements = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { deviceId } = req.params;
  const { limit = 100 } = req.query;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  // Verify device ownership
  const device = await Device.findOne({ deviceId, userId });
  if (!device) {
    throw new AppError('Device not found or access denied', 404, 'DEVICE_NOT_FOUND');
  }

  const measurements = await Measurement.findByDevice(deviceId, parseInt(limit as string));

  res.status(200).json({
    success: true,
    data: {
      deviceId,
      measurements,
      count: measurements.length,
    },
  });
});
