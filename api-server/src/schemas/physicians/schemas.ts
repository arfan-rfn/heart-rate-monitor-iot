import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// ============================================================================
// PHYSICIAN PORTAL SCHEMAS (ECE 513)
// ============================================================================

// Patient ID param
export const patientIdParamSchema = z.object({
  patientId: z.string().openapi({
    description: 'Patient user ID (MongoDB ObjectId)',
    example: '68f96bf21e1d965c7ed19ff4'
  })
});

// Device ID param for physician endpoints
export const physicianDeviceIdParamSchema = z.object({
  patientId: z.string().openapi({
    description: 'Patient user ID',
    example: '68f96bf21e1d965c7ed19ff4'
  }),
  deviceId: z.string().openapi({
    description: 'Device ID',
    example: 'photon-device-123'
  })
});

// Date param for physician daily view
export const physicianDateParamSchema = z.object({
  patientId: z.string().openapi({
    description: 'Patient user ID',
    example: '68f96bf21e1d965c7ed19ff4'
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).openapi({
    description: 'Date in YYYY-MM-DD format',
    example: '2025-11-20'
  })
});

// Query params for analytics endpoints
export const dailyAggregatesQueryParamsSchema = z.object({
  days: z.string().optional().openapi({
    description: 'Number of days to retrieve (default: 30)',
    example: '30'
  })
});

export const historyQueryParamsSchema = z.object({
  startDate: z.string().optional().openapi({
    description: 'Start date (YYYY-MM-DD)',
    example: '2025-11-01'
  }),
  endDate: z.string().optional().openapi({
    description: 'End date (YYYY-MM-DD)',
    example: '2025-11-20'
  }),
  limit: z.string().optional().openapi({
    description: 'Maximum number of records (default: 1000)',
    example: '1000'
  }),
  page: z.string().optional().openapi({
    description: 'Page number (default: 1)',
    example: '1'
  })
});

// Update device config request for physicians
export const updatePatientDeviceConfigRequestSchema = z.object({
  measurementFrequency: z.number().min(900).max(14400).optional().openapi({
    description: 'Measurement frequency in seconds (15 min - 4 hours)',
    example: 1800
  }),
  activeStartTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional().openapi({
    description: 'Active start time in HH:MM format',
    example: '06:00'
  }),
  activeEndTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional().openapi({
    description: 'Active end time in HH:MM format',
    example: '22:00'
  })
});

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

// Weekly stats schema (for patient list)
const weeklyStatsSchema = z.object({
  averageHeartRate: z.number().openapi({ example: 72.5 }),
  minHeartRate: z.number().openapi({ example: 58 }),
  maxHeartRate: z.number().openapi({ example: 110 }),
  averageSpO2: z.number().openapi({ example: 97.8 }),
  totalMeasurements: z.number().openapi({ example: 168 }),
  lastMeasurement: z.string().nullable().openapi({ example: '2025-11-20T14:30:00.000Z' })
});

// Overview stats schema (for patient list)
const overviewStatsSchema = z.object({
  totalMeasurementsAllTime: z.number().openapi({ example: 1248 }),
  totalDevices: z.number().openapi({ example: 2 }),
  activeDevices: z.number().openapi({ example: 2 }),
  hasRecentData: z.boolean().openapi({ example: true }),
  monitoringStatus: z.enum(['active', 'inactive', 'no_devices']).openapi({
    example: 'active',
    description: 'active: has devices + recent data, inactive: has devices but no recent data, no_devices: no active devices'
  })
});

// Patient with stats (for list)
const patientWithStatsSchema = z.object({
  id: z.string().openapi({ example: 'usr_abc123xyz' }),
  name: z.string().openapi({ example: 'John Doe' }),
  email: z.string().email().openapi({ example: 'john@example.com' }),
  stats: z.object({
    weekly: weeklyStatsSchema,
    overview: overviewStatsSchema
  })
});

// Patient info (minimal for other endpoints)
const patientInfoSchema = z.object({
  id: z.string().openapi({ example: 'usr_abc123xyz' }),
  name: z.string().openapi({ example: 'John Doe' }),
  email: z.string().email().openapi({ example: 'john@example.com' })
});

// Summary stats (for summary endpoint)
const summaryStatsSchema = z.object({
  averageHeartRate: z.number().openapi({ example: 72.5 }),
  minHeartRate: z.number().openapi({ example: 58 }),
  maxHeartRate: z.number().openapi({ example: 110 }),
  averageSpO2: z.number().openapi({ example: 97.8 }),
  minSpO2: z.number().openapi({ example: 90 }),
  maxSpO2: z.number().openapi({ example: 100 }),
  totalMeasurements: z.number().openapi({ example: 168 }),
  dateRange: z.object({
    start: z.string().openapi({ example: '2025-11-13' }),
    end: z.string().openapi({ example: '2025-11-20' })
  })
});

// Device info (for summary endpoint)
const deviceInfoSchema = z.object({
  deviceId: z.string().openapi({ example: 'photon-device-123' }),
  name: z.string().openapi({ example: 'Living Room Monitor' }),
  status: z.enum(['active', 'inactive', 'error']).openapi({ example: 'active' }),
  config: z.object({
    measurementFrequency: z.number().openapi({ example: 1800 }),
    activeStartTime: z.string().openapi({ example: '06:00' }),
    activeEndTime: z.string().openapi({ example: '22:00' }),
    timezone: z.string().optional().openapi({ example: 'America/New_York' })
  }),
  lastSeen: z.string().nullable().openapi({ example: '2025-11-20T14:30:00.000Z' })
});

// Measurement schema
const measurementSchema = z.object({
  timestamp: z.string().openapi({ example: '2025-11-20T14:30:00.000Z' }),
  heartRate: z.number().openapi({ example: 72 }),
  spO2: z.number().openapi({ example: 98 }),
  quality: z.enum(['good', 'fair', 'poor']).optional().openapi({ example: 'good' }),
  confidence: z.number().optional().openapi({ example: 0.95 }),
  deviceId: z.string().openapi({ example: 'photon-device-123' })
});

// Daily aggregate schema
const dailyAggregateSchema = z.object({
  date: z.string().openapi({ example: '2025-11-20' }),
  averageHeartRate: z.number().openapi({ example: 72.5 }),
  minHeartRate: z.number().openapi({ example: 58 }),
  maxHeartRate: z.number().openapi({ example: 110 }),
  averageSpO2: z.number().openapi({ example: 97.8 }),
  minSpO2: z.number().openapi({ example: 90 }),
  maxSpO2: z.number().openapi({ example: 100 }),
  totalMeasurements: z.number().openapi({ example: 24 })
});

// All-time stats schema
const allTimeStatsSchema = z.object({
  totalMeasurements: z.number().openapi({ example: 1248 }),
  firstMeasurement: z.string().nullable().openapi({ example: '2025-10-01T06:00:00.000Z' }),
  lastMeasurement: z.string().nullable().openapi({ example: '2025-11-20T14:30:00.000Z' }),
  heartRate: z.object({
    overallAverage: z.number().openapi({ example: 72.5 }),
    overallMin: z.number().openapi({ example: 48 }),
    overallMax: z.number().openapi({ example: 155 }),
    lowestRecorded: z.object({
      value: z.number().openapi({ example: 48 }),
      timestamp: z.string().openapi({ example: '2025-10-15T03:22:00.000Z' })
    }).nullable(),
    highestRecorded: z.object({
      value: z.number().openapi({ example: 155 }),
      timestamp: z.string().openapi({ example: '2025-11-05T18:45:00.000Z' })
    }).nullable()
  }),
  spO2: z.object({
    overallAverage: z.number().openapi({ example: 97.5 }),
    overallMin: z.number().openapi({ example: 88 }),
    overallMax: z.number().openapi({ example: 100 }),
    lowestRecorded: z.object({
      value: z.number().openapi({ example: 88 }),
      timestamp: z.string().openapi({ example: '2025-10-22T07:10:00.000Z' })
    }).nullable(),
    highestRecorded: z.object({
      value: z.number().openapi({ example: 100 }),
      timestamp: z.string().openapi({ example: '2025-11-01T10:30:00.000Z' })
    }).nullable()
  }),
  daysTracked: z.number().openapi({ example: 45 })
});

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

// GET /api/physicians/patients
export const getPatientsResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    patients: z.array(patientWithStatsSchema),
    totalPatients: z.number().openapi({ example: 20 })
  })
});

// GET /api/physicians/patients/:patientId/summary
export const getPatientSummaryResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    patient: patientInfoSchema,
    summary: summaryStatsSchema,
    devices: z.array(deviceInfoSchema)
  })
});

// GET /api/physicians/patients/:patientId/daily/:date
export const getPatientDailyMeasurementsResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    patient: patientInfoSchema,
    date: z.string().openapi({ example: '2025-11-20' }),
    measurements: z.array(measurementSchema),
    count: z.number().openapi({ example: 24 })
  })
});

// GET /api/physicians/patients/:patientId/analytics/daily-aggregates
export const getPatientDailyAggregatesResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    patient: patientInfoSchema,
    aggregates: z.array(dailyAggregateSchema),
    days: z.number().openapi({ example: 30 })
  })
});

// GET /api/physicians/patients/:patientId/analytics/history
export const getPatientHistoryResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    patient: patientInfoSchema,
    measurements: z.array(measurementSchema),
    pagination: z.object({
      total: z.number().openapi({ example: 1248 }),
      page: z.number().openapi({ example: 1 }),
      limit: z.number().openapi({ example: 1000 }),
      pages: z.number().openapi({ example: 2 })
    })
  })
});

// GET /api/physicians/patients/:patientId/analytics/all-time
export const getPatientAllTimeStatsResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    patient: patientInfoSchema,
    stats: allTimeStatsSchema
  })
});

// PUT /api/physicians/patients/:patientId/devices/:deviceId/config
export const updatePatientDeviceConfigResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    device: z.object({
      deviceId: z.string().openapi({ example: 'photon-device-123' }),
      name: z.string().openapi({ example: 'Living Room Monitor' }),
      config: z.object({
        measurementFrequency: z.number().openapi({ example: 1800 }),
        activeStartTime: z.string().openapi({ example: '06:00' }),
        activeEndTime: z.string().openapi({ example: '22:00' }),
        timezone: z.string().optional().openapi({ example: 'America/New_York' })
      }),
      updatedAt: z.string().openapi({ example: '2025-11-20T14:30:00.000Z' })
    }),
    message: z.string().openapi({ example: 'Device configuration updated by physician' })
  })
});
