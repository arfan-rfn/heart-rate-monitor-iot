import { Request, Response } from 'express';
import { Measurement, IMeasurement } from '../models/Measurement.js';
import { Device } from '../models/Device.js';
import { asyncHandler, AppError } from '../middleware/error.middleware.js';

/**
 * Submit a measurement from IoT device
 * POST /api/measurements
 * Requires: API key authentication
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
 * GET /api/measurements?startDate=...&endDate=...&deviceId=...
 * Requires: JWT authentication
 */
export const getUserMeasurements = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  const { startDate, endDate, deviceId, limit = 100, page = 1 } = req.query;

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

  res.status(200).json({
    success: true,
    data: {
      measurements,
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
 * GET /api/measurements/daily/:date
 * Requires: JWT authentication
 */
export const getDailyMeasurements = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { date } = req.params;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  if (!date) {
    throw new AppError('Date parameter is required', 400, 'INVALID_INPUT');
  }

  const targetDate = new Date(date);
  const measurements = await Measurement.findDailyMeasurements(userId, targetDate);

  res.status(200).json({
    success: true,
    data: {
      date: targetDate.toISOString().split('T')[0],
      measurements: measurements.map((m: IMeasurement) => ({
        timestamp: m.timestamp,
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
