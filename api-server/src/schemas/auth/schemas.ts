import { z } from 'zod';
import { emailSchema, passwordSchema } from '../common';

// Registration request
export const registerRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1).max(100).openapi({
    example: 'John Doe',
    description: 'User full name'
  })
}).openapi('RegisterRequest');

// Login request
export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().openapi({
    example: 'SecurePass123!',
    description: 'User password'
  })
}).openapi('LoginRequest');

// User object (response)
export const userSchema = z.object({
  id: z.string().openapi({ example: '691e656205ec0f339eeb288a' }),
  email: emailSchema,
  name: z.string().openapi({ example: 'John Doe' }),
  role: z.enum(['user', 'physician']).openapi({ example: 'user' }),
  physicianId: z.string().nullable().openapi({
    example: null,
    description: 'Associated physician ID (null if not associated)'
  }),
  createdAt: z.string().datetime().openapi({ example: '2025-11-20T00:48:34.936Z' }),
  updatedAt: z.string().datetime().openapi({ example: '2025-11-20T00:48:34.936Z' })
}).openapi('User');

// Auth response
export const authResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string().optional().openapi({
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      description: 'JWT authentication token'
    }),
    user: userSchema
  })
}).openapi('AuthResponse');

// Session response
export const sessionResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    session: z.object({
      userId: z.string(),
      expiresAt: z.string().datetime()
    }).nullable(),
    user: userSchema.nullable()
  })
}).openapi('SessionResponse');
