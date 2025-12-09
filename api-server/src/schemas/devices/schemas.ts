import { z } from 'zod';
import { deviceIdSchema, apiKeySchema, timestampSchema, mongoIdSchema } from '../common/index.js';

// Device configuration schema
export const deviceConfigSchema = z.object({
  measurementFrequency: z.number().int().min(900).max(14400).openapi({
    example: 1800,
    description: 'Measurement frequency in seconds (15 min to 4 hours)'
  }),
  activeStartTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).openapi({
    example: '06:00',
    description: 'Active period start time in HH:MM format'
  }),
  activeEndTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).openapi({
    example: '22:00',
    description: 'Active period end time in HH:MM format'
  }),
  timezone: z.string().openapi({
    example: 'America/New_York',
    description: 'IANA timezone identifier'
  })
}).openapi('DeviceConfig');

// Device status enum
export const deviceStatusSchema = z.enum(['active', 'inactive', 'error']).openapi({
  example: 'active',
  description: 'Device operational status'
});

// Device object (response)
export const deviceSchema = z.object({
  id: mongoIdSchema.openapi({ description: 'Device MongoDB ID' }),
  deviceId: deviceIdSchema,
  name: z.string().openapi({
    example: 'Living Room Monitor',
    description: 'User-friendly device name'
  }),
  status: deviceStatusSchema,
  config: deviceConfigSchema,
  lastSeen: z.string().datetime().nullable().openapi({
    example: '2025-11-20T14:30:00.000Z',
    description: 'Last time device accessed the API'
  }),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}).openapi('Device');

// Device with API key (only returned on registration)
export const deviceWithApiKeySchema = deviceSchema.extend({
  apiKey: apiKeySchema.openapi({
    description: 'API key for device authentication (only shown once on registration!)'
  })
}).openapi('DeviceWithApiKey');

// Register device request
export const registerDeviceRequestSchema = z.object({
  deviceId: deviceIdSchema,
  name: z.string().min(1).max(100).openapi({
    example: 'Living Room Monitor',
    description: 'User-friendly device name'
  })
}).openapi('RegisterDeviceRequest');

// Update device request
export const updateDeviceRequestSchema = z.object({
  name: z.string().min(1).max(100).optional().openapi({
    example: 'Updated Device Name',
    description: 'New device name'
  }),
  status: deviceStatusSchema.optional()
}).openapi('UpdateDeviceRequest');

// Update device config request
export const updateDeviceConfigRequestSchema = deviceConfigSchema.partial().openapi('UpdateDeviceConfigRequest');

// Register device response
export const registerDeviceResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    device: deviceWithApiKeySchema
  })
}).openapi('RegisterDeviceResponse');

// Get devices response
export const getDevicesResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    devices: z.array(deviceSchema),
    count: z.number().int().min(0).openapi({ example: 1 })
  })
}).openapi('GetDevicesResponse');

// Get device response
export const getDeviceResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    device: deviceSchema
  })
}).openapi('GetDeviceResponse');

// Update device response
export const updateDeviceResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    device: deviceSchema
  })
}).openapi('UpdateDeviceResponse');

// Get device config response
export const getDeviceConfigResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    config: deviceConfigSchema
  })
}).openapi('GetDeviceConfigResponse');

// Update device config response
export const updateDeviceConfigResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    config: deviceConfigSchema
  })
}).openapi('UpdateDeviceConfigResponse');
