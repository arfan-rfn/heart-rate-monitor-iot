import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

// Common schemas used across the API
export const errorSchema = z.object({
  success: z.literal(false).openapi({ example: false }),
  error: z.object({
    message: z.string().openapi({ example: 'Error description' }),
    code: z.string().optional().openapi({ example: 'ERROR_CODE' })
  })
}).openapi('Error');

export const successResponseSchema = z.object({
  success: z.literal(true).openapi({ example: true }),
  message: z.string().optional().openapi({ example: 'Operation completed successfully' })
}).openapi('SuccessResponse');

export const paginationSchema = z.object({
  total: z.number().int().min(0).openapi({ example: 150 }),
  page: z.number().int().min(1).openapi({ example: 1 }),
  limit: z.number().int().min(1).openapi({ example: 50 }),
  pages: z.number().int().min(0).openapi({ example: 3 })
}).openapi('Pagination');

// Common validation patterns
export const emailSchema = z.string().email().openapi({
  example: 'user@example.com',
  description: 'Valid email address'
});

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .openapi({
    example: 'SecurePass123!',
    description: 'Strong password with uppercase, lowercase, number, and special character'
  });

export const mongoIdSchema = z.string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId')
  .openapi({
    example: '507f1f77bcf86cd799439011',
    description: 'MongoDB ObjectId (24 hex characters)'
  });

export const timestampSchema = z.string()
  .datetime()
  .openapi({
    example: '2025-11-20T14:30:00.000Z',
    description: 'ISO 8601 timestamp with timezone'
  });

export const deviceIdSchema = z.string()
  .min(1)
  .max(50)
  .openapi({
    example: 'photon-001',
    description: 'Unique device identifier'
  });

export const apiKeySchema = z.string()
  .startsWith('hrt_')
  .openapi({
    example: 'hrt_abc123xyz789...',
    description: 'API key for device authentication (prefix: hrt_)'
  });

// Path parameters
export const deviceIdParamSchema = z.object({
  deviceId: z.string().openapi({
    param: {
      name: 'deviceId',
      in: 'path',
    },
    example: 'photon-001',
    description: 'Device identifier'
  })
});

export const dateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).openapi({
    param: {
      name: 'date',
      in: 'path',
    },
    example: '2025-10-22',
    description: 'Date in YYYY-MM-DD format'
  })
});

// Query parameters for device measurements
export const deviceMeasurementsQuerySchema = z.object({
  limit: z.string().optional().openapi({
    param: {
      name: 'limit',
      in: 'query',
    },
    example: '100',
    description: 'Number of measurements to return'
  })
});
