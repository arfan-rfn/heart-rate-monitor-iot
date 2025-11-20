# API Documentation Setup Guide

This guide explains the auto-generated API documentation system implemented for the Heart Track API Server.

## Overview

The Heart Track API uses **OpenAPI 3.0** (formerly Swagger) for comprehensive, interactive API documentation. The documentation is auto-generated from code using **Zod schemas** and **@asteasolutions/zod-to-openapi**, ensuring it stays in sync with the actual implementation.

## Features

✅ **Interactive Swagger UI** - Test endpoints directly from the browser
✅ **Auto-generated from code** - Documentation stays in sync with implementation
✅ **Type-safe validation** - Zod schemas provide runtime validation
✅ **TypeScript client generation** - Auto-generate typed API clients for frontend
✅ **Industry standard** - OpenAPI 3.0 compatible with all major tools
✅ **Comprehensive** - Includes request/response examples, authentication, error codes

## Quick Start

### 1. View API Documentation

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to:

**📖 Swagger UI**: http://localhost:4000/api-docs

This provides an interactive interface where you can:
- Browse all API endpoints organized by category
- View request/response schemas with examples
- Test endpoints directly (Try it out feature)
- See authentication requirements
- Copy example requests

### 2. Download OpenAPI Specification

The raw OpenAPI JSON specification is available at:

**📄 OpenAPI JSON**: http://localhost:4000/api-docs/openapi.json

Use this for:
- Importing into Postman/Insomnia
- Generating API clients in other languages
- Integration with API testing tools
- Documentation for external developers

### 3. Generate TypeScript Client for Frontend

Generate a type-safe TypeScript client for the web frontend:

```bash
npm run generate-client
```

This command:
1. Generates `openapi.json` from code
2. Creates TypeScript types: `../web-app/src/api/generated/api-types.ts`
3. Creates API client wrapper: `../web-app/src/api/client.ts`

## Architecture

### Directory Structure

```
api-server/
├── src/
│   ├── docs/
│   │   ├── openapi-registry.ts       # OpenAPI endpoint registration
│   │   └── openapi-generator.ts      # OpenAPI spec generator
│   ├── schemas/
│   │   ├── common.schema.ts          # Shared schemas (errors, pagination)
│   │   ├── auth.schema.ts            # Authentication schemas
│   │   ├── user.schema.ts            # User management schemas
│   │   ├── device.schema.ts          # Device management schemas
│   │   ├── measurement.schema.ts     # Measurement data schemas
│   │   ├── params.schema.ts          # Path/query parameter schemas
│   │   └── index.ts                  # Schema exports
│   └── app.ts                        # Swagger UI integration
├── scripts/
│   ├── generate-openapi.ts           # Script to generate openapi.json
│   └── generate-client-wrapper.ts    # Script to create API client
├── openapi.json                      # Generated OpenAPI spec (auto-generated)
└── docs/
    └── API_DOCUMENTATION_SETUP.md    # This file
```

### How It Works

1. **Zod Schemas Define Structure**
   - Request/response schemas written using Zod
   - Extended with OpenAPI metadata (.openapi() method)
   - Provides both runtime validation AND documentation

2. **OpenAPI Registry Registers Endpoints**
   - Each endpoint registered with path, method, schemas
   - Security requirements defined (JWT, API key)
   - Response codes and error cases documented

3. **Generator Creates OpenAPI Document**
   - Converts Zod schemas to OpenAPI 3.0 format
   - Adds metadata (title, description, servers)
   - Generates complete specification

4. **Swagger UI Serves Documentation**
   - Express middleware serves interactive UI
   - Reads generated OpenAPI document
   - Provides try-it-out functionality

## Using the Documentation

### Accessing Swagger UI

```bash
npm run dev
```

Navigate to: http://localhost:4000/api-docs

### Testing Endpoints

1. **Without Authentication**:
   - Expand any endpoint (e.g., `POST /api/auth/sign-up/email`)
   - Click "Try it out"
   - Edit the request body
   - Click "Execute"
   - View response

2. **With Authentication**:
   - First, register or login to get a JWT token
   - Click the "Authorize" button at the top
   - Enter: `Bearer <your-jwt-token>`
   - Click "Authorize"
   - Now all protected endpoints will include the token

3. **Device Authentication (API Key)**:
   - Register a device to get an API key
   - Click "Authorize" → Select "apiKeyAuth"
   - Enter your API key (e.g., `hrt_abc123...`)
   - Click "Authorize"
   - Test device endpoints like `POST /api/measurements`

### Endpoint Categories

The API is organized into 4 main categories:

1. **Authentication** - User registration, login, session management
2. **User Management** - Profile, password change, account deletion
3. **Devices** - IoT device registration, configuration, management
4. **Measurements** - Submit and retrieve health measurement data

## Development Workflow

### Adding a New Endpoint

Follow these steps to add a fully-documented endpoint:

#### Step 1: Create Zod Schema

In `src/schemas/`, create request and response schemas:

```typescript
// src/schemas/example.schema.ts
import { z } from 'zod';

export const createExampleRequestSchema = z.object({
  name: z.string().min(1).openapi({
    example: 'Example Name',
    description: 'Name of the example'
  }),
  value: z.number().min(0).openapi({
    example: 42,
    description: 'Example value'
  })
}).openapi('CreateExampleRequest');

export const exampleResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().openapi({ example: '507f1f77bcf86cd799439011' }),
    name: z.string().openapi({ example: 'Example Name' }),
    value: z.number().openapi({ example: 42 }),
    createdAt: z.string().datetime().openapi({ example: '2025-11-20T14:30:00.000Z' })
  })
}).openapi('ExampleResponse');
```

#### Step 2: Register in OpenAPI Registry

In `src/docs/openapi-registry.ts`:

```typescript
import { createExampleRequestSchema, exampleResponseSchema } from '../schemas';

registry.registerPath({
  method: 'post',
  path: '/api/examples',
  tags: ['Examples'],
  summary: 'Create an example',
  description: 'Creates a new example resource',
  security: [{ bearerAuth: [] }],  // Requires JWT
  request: {
    body: {
      content: {
        'application/json': {
          schema: createExampleRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Example created successfully',
      content: {
        'application/json': {
          schema: exampleResponseSchema
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
```

#### Step 3: Implement Route Handler

Create your route handler and use Zod for validation:

```typescript
import { createExampleRequestSchema } from '../schemas';

router.post('/examples', authenticate, async (req, res) => {
  try {
    // Validate request body
    const validated = createExampleRequestSchema.parse(req.body);

    // Implement business logic
    const example = await Example.create({
      ...validated,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: example
    });
  } catch (error) {
    // Error handling
  }
});
```

#### Step 4: Regenerate Documentation

The documentation updates automatically when the dev server reloads. If you want to regenerate the static OpenAPI file:

```bash
npm run generate-openapi
```

### Updating Existing Endpoint Documentation

1. Update the Zod schema in `src/schemas/`
2. Update the endpoint registration in `src/docs/openapi-registry.ts`
3. Reload dev server or run `npm run generate-openapi`
4. Refresh Swagger UI to see changes

## Frontend Integration

### Using the Generated TypeScript Client

After running `npm run generate-client`, use the client in your frontend:

```typescript
// web-app/src/components/Example.tsx
import { apiClient } from '@/api/client';

// Set authentication token (from login response)
apiClient.setAuthToken(token);

// Make type-safe API calls
async function fetchUserProfile() {
  try {
    const response = await apiClient.get('/api/users/profile');
    // response is fully typed based on OpenAPI spec
    console.log(response.data.user.name);
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
  }
}

// POST request with type-safe body
async function registerDevice(deviceId: string, name: string) {
  const response = await apiClient.post('/api/devices', {
    deviceId,
    name
  });
  // TypeScript will enforce correct request body structure
  return response.data.device;
}
```

### Benefits of Generated Client

✅ **Type Safety** - TypeScript knows request/response shapes
✅ **Autocomplete** - IDE suggests available endpoints and fields
✅ **Compile-time Errors** - Catch API misuse before runtime
✅ **Refactoring Safety** - API changes cause type errors in frontend
✅ **No Manual Types** - Types are always in sync with backend

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot-reload (Swagger UI at /api-docs) |
| `npm run generate-openapi` | Generate openapi.json from code |
| `npm run generate-client` | Generate TypeScript client for frontend |
| `npm start` | Start production server |

## Configuration

### Swagger UI Customization

Edit `src/app.ts` to customize Swagger UI:

```typescript
swaggerUi.setup(openApiDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Heart Track API Documentation',
  swaggerOptions: {
    persistAuthorization: true,  // Remember auth tokens
    displayRequestDuration: true, // Show request timing
    filter: true,                 // Enable endpoint search
    tryItOutEnabled: true,        // Enable try-it-out by default
  },
})
```

### Server URLs

Update production server URL in `src/docs/openapi-generator.ts`:

```typescript
servers: [
  {
    url: 'http://localhost:3000',
    description: 'Development server'
  },
  {
    url: 'https://api.yourdomain.com',  // <-- Change this
    description: 'Production server'
  }
]
```

## Troubleshooting

### Swagger UI not loading

**Issue**: /api-docs returns 404 or blank page

**Solution**:
1. Check server is running: `npm run dev`
2. Verify port (default 4000): http://localhost:4000/api-docs
3. Check browser console for CSP errors
4. Ensure Helmet CSP allows Swagger UI (configured in `src/app.ts`)

### OpenAPI generation fails

**Issue**: `npm run generate-openapi` throws errors

**Solution**:
1. Check Zod schemas are valid (no TypeScript errors)
2. Ensure all schemas are properly extended with `.openapi()`
3. Verify path parameters match schema names
4. Run `npm run lint` to check for type errors

### Frontend client types not updating

**Issue**: Generated types don't match backend changes

**Solution**:
1. Re-run `npm run generate-client` in api-server
2. Restart web-app dev server to reload types
3. Clear TypeScript cache: Delete `web-app/tsconfig.tsbuildinfo`
4. Verify openapi.json was regenerated (check timestamp)

### Authorization not working in Swagger UI

**Issue**: Protected endpoints return 401 even after authorizing

**Solution**:
1. Click "Authorize" button (top of Swagger UI)
2. For JWT: Enter `Bearer <token>` (include "Bearer " prefix)
3. For API Key: Enter just the key (e.g., `hrt_abc123...`)
4. Click "Authorize" then "Close"
5. Try the endpoint again

## Best Practices

### 1. Always Add Examples

```typescript
// ✅ Good - includes example
z.string().email().openapi({
  example: 'user@example.com',
  description: 'User email address'
})

// ❌ Bad - no example
z.string().email()
```

### 2. Document All Error Cases

```typescript
responses: {
  200: { /* success */ },
  400: { description: 'Invalid input', /* ... */ },
  401: { description: 'Not authenticated', /* ... */ },
  403: { description: 'Insufficient permissions', /* ... */ },
  404: { description: 'Resource not found', /* ... */ },
  500: { description: 'Server error', /* ... */ }
}
```

### 3. Use Consistent Schema Names

```typescript
// ✅ Good - follows naming convention
export const createUserRequestSchema = z.object({ /* ... */ }).openapi('CreateUserRequest');
export const userResponseSchema = z.object({ /* ... */ }).openapi('UserResponse');

// ❌ Bad - inconsistent naming
export const newUser = z.object({ /* ... */ }).openapi('User_Create');
```

### 4. Reuse Common Schemas

```typescript
// ✅ Good - reuses common error schema
import { errorSchema } from './common.schema';

responses: {
  400: {
    content: {
      'application/json': {
        schema: errorSchema  // Reuse
      }
    }
  }
}

// ❌ Bad - duplicates error schema
responses: {
  400: {
    content: {
      'application/json': {
        schema: z.object({
          success: z.literal(false),
          error: z.object({ /* ... */ })
        })
      }
    }
  }
}
```

### 5. Keep Registry Organized

Group related endpoints together in `openapi-registry.ts`:

```typescript
// ============================================================================
// USER MANAGEMENT ENDPOINTS
// ============================================================================

registry.registerPath({ /* GET /api/users/profile */ });
registry.registerPath({ /* PUT /api/users/profile */ });
registry.registerPath({ /* POST /api/users/change-password */ });

// ============================================================================
// DEVICE MANAGEMENT ENDPOINTS
// ============================================================================

registry.registerPath({ /* POST /api/devices */ });
// ...
```

## Resources

- **OpenAPI Specification**: https://swagger.io/specification/
- **Zod Documentation**: https://zod.dev/
- **zod-to-openapi**: https://github.com/asteasolutions/zod-to-openapi
- **Swagger UI**: https://swagger.io/tools/swagger-ui/
- **openapi-typescript**: https://github.com/drwpow/openapi-typescript

## Conclusion

This auto-generated documentation system provides:

✅ Interactive, always-up-to-date API documentation
✅ Type-safe frontend integration
✅ Reduced manual documentation effort
✅ Consistent request/response validation
✅ Professional developer experience

The documentation automatically stays in sync with your code, ensuring frontend developers always have accurate API information without reading backend source code.
