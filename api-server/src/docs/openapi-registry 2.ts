import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  // Common
  errorSchema,
  successResponseSchema,
  // Auth
  registerRequestSchema,
  loginRequestSchema,
  authResponseSchema,
  sessionResponseSchema,
  // User
  updateProfileRequestSchema,
  changePasswordRequestSchema,
  deleteAccountRequestSchema,
  updatePhysicianRequestSchema,
  userProfileResponseSchema,
  updateProfileResponseSchema,
  changePasswordResponseSchema,
  deleteAccountResponseSchema,
  updatePhysicianResponseSchema,
  // Device
  registerDeviceRequestSchema,
  updateDeviceRequestSchema,
  updateDeviceConfigRequestSchema,
  registerDeviceResponseSchema,
  getDevicesResponseSchema,
  getDeviceResponseSchema,
  updateDeviceResponseSchema,
  getDeviceConfigResponseSchema,
  updateDeviceConfigResponseSchema,
  // Measurement
  submitMeasurementRequestSchema,
  getMeasurementsQuerySchema,
  dailyAggregatesQuerySchema,
  submitMeasurementResponseSchema,
  getMeasurementsResponseSchema,
  weeklySummaryResponseSchema,
  dailyMeasurementsResponseSchema,
  dailyAggregatesResponseSchema,
  deviceMeasurementsResponseSchema,
  // Params
  deviceIdParamSchema,
  dateParamSchema,
  deviceMeasurementsQuerySchema
} from '../schemas';

// Create registry
export const registry = new OpenAPIRegistry();

// Register security schemes
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT token obtained from login or registration'
});

registry.registerComponent('securitySchemes', 'apiKeyAuth', {
  type: 'apiKey',
  in: 'header',
  name: 'X-API-Key',
  description: 'API key for IoT device authentication (prefix: hrt_)'
});

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

registry.registerPath({
  method: 'post',
  path: '/api/auth/sign-up/email',
  tags: ['Authentication'],
  summary: 'Register new user',
  description: 'Create a new user account with email and password',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'User registered successfully',
      content: {
        'application/json': {
          schema: authResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid input or email already exists',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/sign-in/email',
  tags: ['Authentication'],
  summary: 'Login user',
  description: 'Authenticate user and receive JWT token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: authResponseSchema
        }
      }
    },
    401: {
      description: 'Invalid credentials',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/sign-out',
  tags: ['Authentication'],
  summary: 'Logout user',
  description: 'Invalidate current session',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Logout successful',
      content: {
        'application/json': {
          schema: successResponseSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/auth/get-session',
  tags: ['Authentication'],
  summary: 'Get current session',
  description: 'Retrieve current user session information',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Session retrieved',
      content: {
        'application/json': {
          schema: sessionResponseSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

// ============================================================================
// USER MANAGEMENT ENDPOINTS
// ============================================================================

registry.registerPath({
  method: 'get',
  path: '/api/users/profile',
  tags: ['User Management'],
  summary: 'Get user profile',
  description: 'Get current user profile with device and measurement statistics',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Profile retrieved successfully',
      content: {
        'application/json': {
          schema: userProfileResponseSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'put',
  path: '/api/users/profile',
  tags: ['User Management'],
  summary: 'Update user profile',
  description: 'Update user name (email cannot be changed)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: updateProfileRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Profile updated successfully',
      content: {
        'application/json': {
          schema: updateProfileResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid input',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'post',
  path: '/api/users/change-password',
  tags: ['User Management'],
  summary: 'Change password',
  description: 'Change user password (requires current password verification)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: changePasswordRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Password changed successfully',
      content: {
        'application/json': {
          schema: changePasswordResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid password or weak new password',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    401: {
      description: 'Not authenticated or incorrect current password',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'delete',
  path: '/api/users/profile',
  tags: ['User Management'],
  summary: 'Delete account',
  description: 'Permanently delete user account and all associated data (devices, measurements)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: deleteAccountRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Account deleted successfully',
      content: {
        'application/json': {
          schema: deleteAccountResponseSchema
        }
      }
    },
    401: {
      description: 'Not authenticated or incorrect password',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'put',
  path: '/api/users/physician',
  tags: ['User Management'],
  summary: 'Update physician association',
  description: 'Associate or disassociate user with a physician',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: updatePhysicianRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Physician association updated',
      content: {
        'application/json': {
          schema: updatePhysicianResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid physician ID',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

// ============================================================================
// DEVICE MANAGEMENT ENDPOINTS
// ============================================================================

registry.registerPath({
  method: 'post',
  path: '/api/devices',
  tags: ['Devices'],
  summary: 'Register new device',
  description: 'Register a new IoT device and receive API key (shown only once!)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerDeviceRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Device registered successfully',
      content: {
        'application/json': {
          schema: registerDeviceResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid input or device ID already exists',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/devices',
  tags: ['Devices'],
  summary: 'List user devices',
  description: 'Get all devices owned by authenticated user',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Devices retrieved successfully',
      content: {
        'application/json': {
          schema: getDevicesResponseSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/devices/{deviceId}',
  tags: ['Devices'],
  summary: 'Get device details',
  description: 'Get details of a specific device (must be owned by user)',
  security: [{ bearerAuth: [] }],
  request: {
    params: {
      deviceId: {
        schema: { type: 'string' },
        description: 'Device ID',
        example: 'photon-001'
      }
    }
  },
  responses: {
    200: {
      description: 'Device retrieved successfully',
      content: {
        'application/json': {
          schema: getDeviceResponseSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    403: {
      description: 'Device not owned by user',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    404: {
      description: 'Device not found',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'put',
  path: '/api/devices/{deviceId}',
  tags: ['Devices'],
  summary: 'Update device',
  description: 'Update device name or status',
  security: [{ bearerAuth: [] }],
  request: {
    params: {
      deviceId: {
        schema: { type: 'string' },
        description: 'Device ID',
        example: 'photon-001'
      }
    },
    body: {
      content: {
        'application/json': {
          schema: updateDeviceRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Device updated successfully',
      content: {
        'application/json': {
          schema: updateDeviceResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid input',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    403: {
      description: 'Device not owned by user',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    404: {
      description: 'Device not found',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'delete',
  path: '/api/devices/{deviceId}',
  tags: ['Devices'],
  summary: 'Delete device',
  description: 'Delete a device (does not delete associated measurements)',
  security: [{ bearerAuth: [] }],
  request: {
    params: {
      deviceId: {
        schema: { type: 'string' },
        description: 'Device ID',
        example: 'photon-001'
      }
    }
  },
  responses: {
    204: {
      description: 'Device deleted successfully'
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    403: {
      description: 'Device not owned by user',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    404: {
      description: 'Device not found',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/devices/{deviceId}/config',
  tags: ['Devices'],
  summary: 'Get device configuration',
  description: 'Get device configuration (IoT devices use API key, web clients use JWT)',
  security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
  request: {
    params: {
      deviceId: {
        schema: { type: 'string' },
        description: 'Device ID',
        example: 'photon-001'
      }
    }
  },
  responses: {
    200: {
      description: 'Configuration retrieved successfully',
      content: {
        'application/json': {
          schema: getDeviceConfigResponseSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    403: {
      description: 'Device not owned by user or device inactive',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    404: {
      description: 'Device not found',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'put',
  path: '/api/devices/{deviceId}/config',
  tags: ['Devices'],
  summary: 'Update device configuration',
  description: 'Update device measurement frequency, active hours, or timezone',
  security: [{ bearerAuth: [] }],
  request: {
    params: {
      deviceId: {
        schema: { type: 'string' },
        description: 'Device ID',
        example: 'photon-001'
      }
    },
    body: {
      content: {
        'application/json': {
          schema: updateDeviceConfigRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Configuration updated successfully',
      content: {
        'application/json': {
          schema: updateDeviceConfigResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid configuration values',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    403: {
      description: 'Device not owned by user',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    404: {
      description: 'Device not found',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

// ============================================================================
// MEASUREMENT ENDPOINTS
// ============================================================================

registry.registerPath({
  method: 'post',
  path: '/api/measurements',
  tags: ['Measurements'],
  summary: 'Submit measurement',
  description: 'IoT device submits heart rate and SpO2 measurement (requires API key)',
  security: [{ apiKeyAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: submitMeasurementRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Measurement submitted successfully',
      content: {
        'application/json': {
          schema: submitMeasurementResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid measurement data',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    401: {
      description: 'Invalid or missing API key',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    403: {
      description: 'Device is inactive',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/measurements',
  tags: ['Measurements'],
  summary: 'Get user measurements',
  description: 'Get measurements with optional filtering by date range and device',
  security: [{ bearerAuth: [] }],
  request: {
    query: getMeasurementsQuerySchema
  },
  responses: {
    200: {
      description: 'Measurements retrieved successfully',
      content: {
        'application/json': {
          schema: getMeasurementsResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid query parameters',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/measurements/weekly/summary',
  tags: ['Measurements'],
  summary: 'Get weekly summary',
  description: 'Get aggregated statistics for the past 7 days',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Weekly summary retrieved successfully',
      content: {
        'application/json': {
          schema: weeklySummaryResponseSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/measurements/daily/{date}',
  tags: ['Measurements'],
  summary: 'Get daily measurements',
  description: 'Get all measurements for a specific date (YYYY-MM-DD format)',
  security: [{ bearerAuth: [] }],
  request: {
    params: {
      date: {
        schema: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        description: 'Date in YYYY-MM-DD format',
        example: '2025-10-22'
      }
    }
  },
  responses: {
    200: {
      description: 'Daily measurements retrieved successfully',
      content: {
        'application/json': {
          schema: dailyMeasurementsResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid date format',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/measurements/daily-aggregates',
  tags: ['Measurements'],
  summary: 'Get daily aggregates',
  description: 'Get daily summary statistics for the last N days',
  security: [{ bearerAuth: [] }],
  request: {
    query: dailyAggregatesQuerySchema
  },
  responses: {
    200: {
      description: 'Daily aggregates retrieved successfully',
      content: {
        'application/json': {
          schema: dailyAggregatesResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid query parameters',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/measurements/device/{deviceId}',
  tags: ['Measurements'],
  summary: 'Get device measurements',
  description: 'Get all measurements from a specific device',
  security: [{ bearerAuth: [] }],
  request: {
    params: {
      deviceId: {
        schema: { type: 'string' },
        description: 'Device ID',
        example: 'photon-001'
      }
    },
    query: {
      limit: {
        schema: { type: 'string', default: '100' },
        description: 'Number of measurements to return',
        example: '100'
      }
    }
  },
  responses: {
    200: {
      description: 'Device measurements retrieved successfully',
      content: {
        'application/json': {
          schema: deviceMeasurementsResponseSchema
        }
      }
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    403: {
      description: 'Device not owned by user',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    },
    404: {
      description: 'Device not found',
      content: {
        'application/json': {
          schema: errorSchema
        }
      }
    }
  }
});

export default registry;
