import { z } from 'zod';
import { deviceIdSchema, timestampSchema, paginationSchema } from '../common';

// Measurement quality enum
export const measurementQualitySchema = z.enum(['good', 'fair', 'poor']).openapi({
  example: 'good',
  description: 'Measurement quality indicator'
});

// Measurement object
export const measurementSchema = z.object({
  _id: z.string().openapi({
    example: '507f1f77bcf86cd799439012',
    description: 'Measurement MongoDB ID'
  }),
  heartRate: z.number().int().min(40).max(200).openapi({
    example: 72,
    description: 'Heart rate in beats per minute (40-200 bpm)'
  }),
  spO2: z.number().int().min(70).max(100).openapi({
    example: 98,
    description: 'Blood oxygen saturation percentage (70-100%)'
  }),
  timestamp: timestampSchema,
  quality: measurementQualitySchema,
  confidence: z.number().min(0).max(1).openapi({
    example: 0.95,
    description: 'Confidence score (0.0-1.0)'
  }),
  deviceId: deviceIdSchema
}).openapi('Measurement');

// Submit measurement request (from IoT device)
export const submitMeasurementRequestSchema = z.object({
  deviceId: deviceIdSchema,
  heartRate: z.number().int().min(40).max(200).openapi({
    example: 72,
    description: 'Heart rate in bpm'
  }),
  spO2: z.number().int().min(70).max(100).openapi({
    example: 98,
    description: 'SpO2 percentage'
  }),
  timestamp: timestampSchema,
  quality: measurementQualitySchema.default('good'),
  confidence: z.number().min(0).max(1).default(1.0).openapi({
    example: 0.95
  })
}).openapi('SubmitMeasurementRequest');

// Query parameters for getting measurements
export const getMeasurementsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().openapi({
    example: '2025-10-15',
    description: 'Start date in YYYY-MM-DD format'
  }),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().openapi({
    example: '2025-10-22',
    description: 'End date in YYYY-MM-DD format'
  }),
  deviceId: deviceIdSchema.optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(1000)).default('50').openapi({
    example: '50',
    description: 'Number of measurements to return (1-1000)'
  }),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1').openapi({
    example: '1',
    description: 'Page number for pagination'
  })
}).openapi('GetMeasurementsQuery');

// Daily aggregates query
export const dailyAggregatesQuerySchema = z.object({
  days: z.string().transform(Number).pipe(z.number().int().min(1).max(90)).default('7').openapi({
    example: '7',
    description: 'Number of days to aggregate (1-90)'
  })
}).openapi('DailyAggregatesQuery');

// Weekly summary data
export const weeklySummarySchema = z.object({
  averageHeartRate: z.number().openapi({ example: 72.5 }),
  minHeartRate: z.number().openapi({ example: 58 }),
  maxHeartRate: z.number().openapi({ example: 105 }),
  averageSpO2: z.number().openapi({ example: 97.8 }),
  minSpO2: z.number().openapi({ example: 95 }),
  maxSpO2: z.number().openapi({ example: 100 }),
  totalMeasurements: z.number().int().openapi({ example: 48 }),
  dateRange: z.object({
    start: z.string().openapi({ example: '2025-10-15' }),
    end: z.string().openapi({ example: '2025-10-22' })
  })
}).openapi('WeeklySummary');

// Daily aggregate data
export const dailyAggregateSchema = z.object({
  date: z.string().openapi({ example: '2025-10-22' }),
  averageHeartRate: z.number().openapi({ example: 72.5 }),
  minHeartRate: z.number().openapi({ example: 60 }),
  maxHeartRate: z.number().openapi({ example: 95 }),
  averageSpO2: z.number().openapi({ example: 97.8 }),
  minSpO2: z.number().openapi({ example: 95 }),
  maxSpO2: z.number().openapi({ example: 100 }),
  measurementCount: z.number().int().openapi({ example: 24 })
}).openapi('DailyAggregate');

// Submit measurement response
export const submitMeasurementResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    measurement: measurementSchema.omit({ _id: true }).extend({
      id: z.string().openapi({ example: '507f1f77bcf86cd799439012' })
    })
  })
}).openapi('SubmitMeasurementResponse');

// Get measurements response
export const getMeasurementsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    measurements: z.array(measurementSchema),
    pagination: paginationSchema
  })
}).openapi('GetMeasurementsResponse');

// Weekly summary response
export const weeklySummaryResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    summary: weeklySummarySchema
  })
}).openapi('WeeklySummaryResponse');

// Daily measurements response
export const dailyMeasurementsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    date: z.string().openapi({ example: '2025-10-22' }),
    measurements: z.array(measurementSchema),
    count: z.number().int().openapi({ example: 24 })
  })
}).openapi('DailyMeasurementsResponse');

// Daily aggregates response
export const dailyAggregatesResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    aggregates: z.array(dailyAggregateSchema),
    days: z.number().int().openapi({ example: 7 })
  })
}).openapi('DailyAggregatesResponse');

// Device measurements response
export const deviceMeasurementsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    deviceId: deviceIdSchema,
    measurements: z.array(measurementSchema),
    count: z.number().int().openapi({ example: 150 })
  })
}).openapi('DeviceMeasurementsResponse');
