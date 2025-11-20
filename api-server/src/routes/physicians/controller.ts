import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { Measurement } from '../../models/measurements/index.js';
import { Device } from '../../models/devices/index.js';
import { asyncHandler, AppError } from '../../middleware/error/index.js';
import {
  verifyPhysicianPatientRelationship,
  getPatientsForPhysician,
} from './helpers.js';
import { getMongoDbInstance } from '../../config/database.js';

/**
 * Get all patients with their 7-day summaries
 * GET /api/physicians/patients
 * Auth: JWT + requirePhysician middleware
 *
 * Required by ECE 513 spec: "list all patients by name with their 7-day average, maximum, and minimum heart rate"
 */
export const getAllPatients = asyncHandler(async (req: Request, res: Response) => {
  const physicianId = req.user?.id;

  if (!physicianId) {
    throw new AppError('Physician not authenticated', 401, 'UNAUTHORIZED');
  }

  // Get all patients associated with this physician
  const patients = await getPatientsForPhysician(physicianId);

  if (patients.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        patients: [],
        totalPatients: 0,
      },
    });
  }

  // Fetch comprehensive stats for each patient in parallel
  const patientSummaries = await Promise.all(
    patients.map(async (patient: any) => {
      // Extract patient ID (Better Auth uses 'id' field, but also check _id as fallback)
      const patientId = patient.id || patient._id?.toString();

      // Get 7-day summary
      const weeklySummary = await Measurement.getWeeklySummary(patientId);

      // Get total measurement count (all-time)
      const totalMeasurements = await Measurement.countDocuments({ userId: patientId });

      // Get device count
      const deviceCount = await Device.countDocuments({ userId: patientId });

      // Get active device count
      const activeDeviceCount = await Device.countDocuments({
        userId: patientId,
        status: 'active',
      });

      return {
        id: patientId,
        name: patient.name,
        email: patient.email,
        stats: {
          // 7-day summary
          weekly: weeklySummary
            ? {
                averageHeartRate: Math.round(weeklySummary.averageHeartRate * 10) / 10,
                minHeartRate: weeklySummary.minHeartRate,
                maxHeartRate: weeklySummary.maxHeartRate,
                averageSpO2: Math.round(weeklySummary.averageSpO2 * 10) / 10,
                totalMeasurements: weeklySummary.totalMeasurements,
                lastMeasurement: weeklySummary.lastMeasurement?.toISOString(),
              }
            : {
                averageHeartRate: 0,
                minHeartRate: 0,
                maxHeartRate: 0,
                averageSpO2: 0,
                totalMeasurements: 0,
                lastMeasurement: null,
              },
          // High-level overview stats
          overview: {
            totalMeasurementsAllTime: totalMeasurements,
            totalDevices: deviceCount,
            activeDevices: activeDeviceCount,
            hasRecentData: weeklySummary ? weeklySummary.totalMeasurements > 0 : false,
            monitoringStatus:
              activeDeviceCount > 0 && weeklySummary && weeklySummary.totalMeasurements > 0
                ? 'active'
                : activeDeviceCount > 0
                ? 'inactive'
                : 'no_devices',
          },
        },
      };
    })
  );

  // Already sorted by name from getPatientsForPhysician helper

  res.status(200).json({
    success: true,
    data: {
      patients: patientSummaries,
      totalPatients: patientSummaries.length,
    },
  });
});

/**
 * Get specific patient's weekly summary
 * GET /api/physicians/patients/:patientId/summary
 * Auth: JWT + requirePhysician + patient verification
 *
 * Required by ECE 513 spec: "patient's summary view similar to weekly summary view"
 */
export const getPatientSummary = asyncHandler(async (req: Request, res: Response) => {
  const physicianId = req.user?.id;
  const { patientId } = req.params;

  if (!physicianId) {
    throw new AppError('Physician not authenticated', 401, 'UNAUTHORIZED');
  }

  // Verify patient belongs to physician
  await verifyPhysicianPatientRelationship(physicianId, patientId);

  // Get patient info from MongoDB
  const db = getMongoDbInstance();
  const userCollection = db.collection('user');
  const patient = await userCollection.findOne({
    $or: [
      { id: patientId },
      { _id: new ObjectId(patientId) }
    ]
  });

  if (!patient) {
    throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
  }

  // Get weekly summary
  const summary = await Measurement.getWeeklySummary(patientId);

  // Get patient's devices
  const devices = await Device.find({ userId: patientId }).select(
    'deviceId name status config lastSeen'
  );

  res.status(200).json({
    success: true,
    data: {
      patient: {
        id: patient.id || patient._id?.toString(),
        name: patient.name,
        email: patient.email,
      },
      summary: summary
        ? {
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
          }
        : {
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
      devices: devices.map((d) => ({
        deviceId: d.deviceId,
        name: d.name,
        status: d.status,
        config: d.config,
        lastSeen: d.lastSeen?.toISOString(),
      })),
    },
  });
});

/**
 * Get patient's daily measurements
 * GET /api/physicians/patients/:patientId/daily/:date
 * Auth: JWT + requirePhysician + patient verification
 *
 * Required by ECE 513 spec: "patient's detailed day view"
 */
export const getPatientDailyMeasurements = asyncHandler(
  async (req: Request, res: Response) => {
    const physicianId = req.user?.id;
    const { patientId, date } = req.params;

    if (!physicianId) {
      throw new AppError('Physician not authenticated', 401, 'UNAUTHORIZED');
    }

    if (!date) {
      throw new AppError('Date parameter is required', 400, 'INVALID_INPUT');
    }

    // Verify patient belongs to physician
    await verifyPhysicianPatientRelationship(physicianId, patientId);

    // Get patient info from MongoDB
    const db = getMongoDbInstance();
    const userCollection = db.collection('user');
    const patient = await userCollection.findOne({
      $or: [
        { id: patientId },
        { _id: new ObjectId(patientId) }
      ]
    });

    if (!patient) {
      throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
    }

    // Get daily measurements
    const targetDate = new Date(date);
    const measurements = await Measurement.findDailyMeasurements(patientId, targetDate);

    res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient.id || patient._id?.toString(),
          name: patient.name,
          email: patient.email,
        },
        date: targetDate.toISOString().split('T')[0],
        measurements: measurements.map((m: any) => ({
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
  }
);

/**
 * Get patient's daily aggregates (for charting)
 * GET /api/physicians/patients/:patientId/analytics/daily-aggregates?days=30
 * Auth: JWT + requirePhysician + patient verification
 *
 * Provides daily averages, min/max for trend charts
 */
export const getPatientDailyAggregates = asyncHandler(
  async (req: Request, res: Response) => {
    const physicianId = req.user?.id;
    const { patientId } = req.params;
    const { days = 30 } = req.query;

    if (!physicianId) {
      throw new AppError('Physician not authenticated', 401, 'UNAUTHORIZED');
    }

    // Verify patient belongs to physician
    await verifyPhysicianPatientRelationship(physicianId, patientId);

    // Get patient info
    const db = getMongoDbInstance();
    const userCollection = db.collection('user');
    const patient = await userCollection.findOne({
      $or: [
        { id: patientId },
        { _id: new ObjectId(patientId) }
      ]
    });

    if (!patient) {
      throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
    }

    // Get daily aggregates
    const daysNum = parseInt(days as string);
    const aggregates = await Measurement.getDailyAggregates(patientId, daysNum);

    res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient.id || patient._id?.toString(),
          name: patient.name,
          email: patient.email,
        },
        aggregates,
        days: daysNum,
      },
    });
  }
);

/**
 * Get patient's full measurement history
 * GET /api/physicians/patients/:patientId/analytics/history?startDate=...&endDate=...&limit=1000
 * Auth: JWT + requirePhysician + patient verification
 *
 * Allows physicians to see complete patient history with optional date range filtering
 */
export const getPatientHistory = asyncHandler(async (req: Request, res: Response) => {
  const physicianId = req.user?.id;
  const { patientId } = req.params;
  const { startDate, endDate, limit = 1000, page = 1 } = req.query;

  if (!physicianId) {
    throw new AppError('Physician not authenticated', 401, 'UNAUTHORIZED');
  }

  // Verify patient belongs to physician
  await verifyPhysicianPatientRelationship(physicianId, patientId);

  // Get patient info
  const db = getMongoDbInstance();
  const userCollection = db.collection('user');
  const patient = await userCollection.findOne({
    $or: [
      { id: patientId },
      { _id: new ObjectId(patientId) }
    ]
  });

  if (!patient) {
    throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
  }

  // Build query
  const query: any = { userId: patientId };

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
      patient: {
        id: patient.id || patient._id?.toString(),
        name: patient.name,
        email: patient.email,
      },
      measurements: measurements.map((m: any) => ({
        timestamp: m.timestamp,
        heartRate: m.heartRate,
        spO2: m.spO2,
        quality: m.quality,
        confidence: m.confidence,
        deviceId: m.deviceId,
      })),
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
 * Get patient's all-time statistics
 * GET /api/physicians/patients/:patientId/analytics/all-time
 * Auth: JWT + requirePhysician + patient verification
 *
 * Provides comprehensive lifetime statistics for the patient
 */
export const getPatientAllTimeStats = asyncHandler(
  async (req: Request, res: Response) => {
    const physicianId = req.user?.id;
    const { patientId } = req.params;

    if (!physicianId) {
      throw new AppError('Physician not authenticated', 401, 'UNAUTHORIZED');
    }

    // Verify patient belongs to physician
    await verifyPhysicianPatientRelationship(physicianId, patientId);

    // Get patient info
    const db = getMongoDbInstance();
    const userCollection = db.collection('user');
    const patient = await userCollection.findOne({
      $or: [
        { id: patientId },
        { _id: new ObjectId(patientId) }
      ]
    });

    if (!patient) {
      throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
    }

    // Get all-time statistics
    const stats = await Measurement.aggregate([
      {
        $match: { userId: patientId },
      },
      {
        $group: {
          _id: null,
          totalMeasurements: { $sum: 1 },
          averageHeartRate: { $avg: '$heartRate' },
          minHeartRate: { $min: '$heartRate' },
          maxHeartRate: { $max: '$heartRate' },
          averageSpO2: { $avg: '$spO2' },
          minSpO2: { $min: '$spO2' },
          maxSpO2: { $max: '$spO2' },
          firstMeasurement: { $min: '$timestamp' },
          lastMeasurement: { $max: '$timestamp' },
        },
      },
    ]);

    const result = stats[0] || {
      totalMeasurements: 0,
      averageHeartRate: 0,
      minHeartRate: 0,
      maxHeartRate: 0,
      averageSpO2: 0,
      minSpO2: 0,
      maxSpO2: 0,
      firstMeasurement: null,
      lastMeasurement: null,
    };

    // Get lowest and highest heart rate records
    const lowestHR = await Measurement.findOne({ userId: patientId })
      .sort({ heartRate: 1 })
      .select('heartRate timestamp')
      .lean();

    const highestHR = await Measurement.findOne({ userId: patientId })
      .sort({ heartRate: -1 })
      .select('heartRate timestamp')
      .lean();

    // Get lowest and highest SpO2 records
    const lowestSpO2 = await Measurement.findOne({ userId: patientId })
      .sort({ spO2: 1 })
      .select('spO2 timestamp')
      .lean();

    const highestSpO2 = await Measurement.findOne({ userId: patientId })
      .sort({ spO2: -1 })
      .select('spO2 timestamp')
      .lean();

    // Calculate days tracked (distinct dates)
    const distinctDates = await Measurement.aggregate([
      { $match: { userId: patientId } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          }
        }
      },
      { $count: 'total' }
    ]);
    const daysTracked = distinctDates[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient.id || patient._id?.toString(),
          name: patient.name,
          email: patient.email,
        },
        stats: {
          totalMeasurements: result.totalMeasurements,
          firstMeasurement: result.firstMeasurement?.toISOString() || null,
          lastMeasurement: result.lastMeasurement?.toISOString() || null,
          heartRate: {
            overallAverage: Math.round(result.averageHeartRate * 10) / 10,
            overallMin: result.minHeartRate,
            overallMax: result.maxHeartRate,
            lowestRecorded: lowestHR ? {
              value: lowestHR.heartRate,
              timestamp: lowestHR.timestamp.toISOString()
            } : null,
            highestRecorded: highestHR ? {
              value: highestHR.heartRate,
              timestamp: highestHR.timestamp.toISOString()
            } : null,
          },
          spO2: {
            overallAverage: Math.round(result.averageSpO2 * 10) / 10,
            overallMin: result.minSpO2,
            overallMax: result.maxSpO2,
            lowestRecorded: lowestSpO2 ? {
              value: lowestSpO2.spO2,
              timestamp: lowestSpO2.timestamp.toISOString()
            } : null,
            highestRecorded: highestSpO2 ? {
              value: highestSpO2.spO2,
              timestamp: highestSpO2.timestamp.toISOString()
            } : null,
          },
          daysTracked,
        },
      },
    });
  }
);

/**
 * Update patient's device configuration
 * PUT /api/physicians/patients/:patientId/devices/:deviceId/config
 * Auth: JWT + requirePhysician + patient verification
 *
 * Required by ECE 513 spec: "allow the physician to adjust the frequency of measurement"
 */
export const updatePatientDeviceConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const physicianId = req.user?.id;
    const { patientId, deviceId } = req.params;
    const { measurementFrequency, activeStartTime, activeEndTime } = req.body;

    if (!physicianId) {
      throw new AppError('Physician not authenticated', 401, 'UNAUTHORIZED');
    }

    // Verify patient belongs to physician
    await verifyPhysicianPatientRelationship(physicianId, patientId);

    // Find device
    const device = await Device.findOne({ deviceId, userId: patientId });

    if (!device) {
      throw new AppError(
        'Device not found or does not belong to this patient',
        404,
        'DEVICE_NOT_FOUND'
      );
    }

    // Update configuration
    let updated = false;

    if (measurementFrequency !== undefined) {
      // Validate frequency (15 minutes to 4 hours)
      if (measurementFrequency < 900 || measurementFrequency > 14400) {
        throw new AppError(
          'Measurement frequency must be between 900 and 14400 seconds (15 min - 4 hours)',
          400,
          'INVALID_INPUT'
        );
      }
      device.config.measurementFrequency = measurementFrequency;
      updated = true;
    }

    if (activeStartTime !== undefined) {
      // Validate time format (HH:MM)
      if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(activeStartTime)) {
        throw new AppError(
          'Active start time must be in HH:MM format',
          400,
          'INVALID_INPUT'
        );
      }
      device.config.activeStartTime = activeStartTime;
      updated = true;
    }

    if (activeEndTime !== undefined) {
      // Validate time format (HH:MM)
      if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(activeEndTime)) {
        throw new AppError(
          'Active end time must be in HH:MM format',
          400,
          'INVALID_INPUT'
        );
      }
      device.config.activeEndTime = activeEndTime;
      updated = true;
    }

    if (!updated) {
      throw new AppError(
        'No valid configuration parameters provided',
        400,
        'INVALID_INPUT'
      );
    }

    await device.save();

    res.status(200).json({
      success: true,
      data: {
        device: {
          deviceId: device.deviceId,
          name: device.name,
          config: device.config,
          updatedAt: device.updatedAt,
        },
        message: 'Device configuration updated by physician',
      },
    });
  }
);
