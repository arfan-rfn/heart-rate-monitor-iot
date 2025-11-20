import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './openapi-registry';

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'PulseConnect API',
      description: `
# PulseConnect IoT - API Documentation

PulseConnect is a comprehensive IoT heart rate and SpO2 monitoring system. This API serves as the central hub connecting IoT devices and the web frontend.

## Overview

The PulseConnect API provides endpoints for:
- **User Management**: Registration, login, profile management
- **Device Management**: Register IoT devices, configure measurement settings
- **Measurements**: Submit and retrieve heart rate/SpO2 data
- **Data Aggregation**: Weekly summaries and daily statistics

## Authentication

The API uses two authentication methods:

### 1. JWT Bearer Token (Web Clients)
For web frontend and user-authenticated requests:
\`\`\`
Authorization: Bearer <jwt-token>
\`\`\`
- Obtain token via \`POST /api/auth/sign-in/email\` or \`POST /api/auth/sign-up/email\`
- Token expires after 24 hours
- Include in Authorization header for all protected endpoints

### 2. API Key (IoT Devices)
For IoT device measurement submissions:
\`\`\`
X-API-Key: hrt_abc123xyz789...
\`\`\`
- Obtain API key when registering a device via \`POST /api/devices\`
- API key is shown ONLY ONCE on device registration - store it securely!
- Include in X-API-Key header for device endpoints
- API keys expire after 1 year

## Error Handling

All errors follow this standardized format:

\`\`\`json
{
  "success": false,
  "error": {
    "message": "Human-readable error description",
    "code": "ERROR_CODE"
  }
}
\`\`\`

Common HTTP status codes:
- \`200 OK\`: Successful GET/PUT/PATCH
- \`201 Created\`: Successful POST (resource created)
- \`204 No Content\`: Successful DELETE
- \`400 Bad Request\`: Invalid input or validation error
- \`401 Unauthorized\`: Authentication required or failed
- \`403 Forbidden\`: Authorized but insufficient permissions
- \`404 Not Found\`: Resource not found
- \`500 Internal Server Error\`: Server-side error

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP address
- Headers included in responses:
  - \`X-RateLimit-Limit\`: Maximum requests allowed
  - \`X-RateLimit-Remaining\`: Requests remaining
  - \`X-RateLimit-Reset\`: Time when limit resets

## Data Validation

All inputs are validated against strict schemas:

### Heart Rate
- Range: 40-200 bpm
- Type: Integer

### SpO2 (Blood Oxygen Saturation)
- Range: 70-100%
- Type: Integer

### Timestamps
- Format: ISO 8601 with timezone (e.g., \`2025-11-20T14:30:00.000Z\`)
- All dates stored in UTC

### Passwords
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character

## Pagination

List endpoints support pagination:

\`\`\`
?page=1&limit=50
\`\`\`

Response includes pagination metadata:

\`\`\`json
{
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "pages": 3
  }
}
\`\`\`

## Typical Workflows

### 1. User Registration & Setup
1. Register user: \`POST /api/auth/sign-up/email\`
2. Receive JWT token in response
3. Register IoT device: \`POST /api/devices\`
4. Store API key from device registration response
5. Configure device on IoT hardware with API key

### 2. IoT Device Operation
1. Device submits measurements: \`POST /api/measurements\` (with API key)
2. Device polls for config updates: \`GET /api/devices/{deviceId}/config\`
3. Device updates based on new configuration

### 3. Web Dashboard
1. User logs in: \`POST /api/auth/sign-in/email\`
2. Get weekly summary: \`GET /api/measurements/weekly/summary\`
3. Get daily data: \`GET /api/measurements/daily/{date}\`
4. Update device config: \`PUT /api/devices/{deviceId}/config\`

## Support

For issues and questions:
- GitHub: https://github.com/yourusername/pulseconnect
- Course: ECE 513 - IoT Systems
      `.trim(),
      contact: {
        name: 'PulseConnect Support',
        email: 'support@pulseconnect.example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.pulseconnect.example.com',
        description: 'Production server (replace with your domain)'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and session management'
      },
      {
        name: 'User Management',
        description: 'User profile, password, and account operations'
      },
      {
        name: 'Devices',
        description: 'IoT device registration and configuration'
      },
      {
        name: 'Measurements',
        description: 'Heart rate and SpO2 measurement data'
      }
    ],
    externalDocs: {
      description: 'Full Project Documentation',
      url: 'https://github.com/yourusername/pulseconnect/tree/main/docs'
    }
  });
}
