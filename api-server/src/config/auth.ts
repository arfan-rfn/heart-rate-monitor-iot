import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { bearer } from 'better-auth/plugins';
import { jwt } from 'better-auth/plugins';
import { apiKey } from 'better-auth/plugins';
import bcrypt from 'bcrypt';

/**
 * Initialize Better Auth with MongoDB adapter, JWT, Bearer, and API Key plugins
 * This must be called after MongoDB connection is established
 */
export const createAuth = (db: any) => betterAuth({
  // Database adapter
  database: mongodbAdapter(db),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Can enable for production
    password: {
      // Use bcrypt with 10 salt rounds (as required by project)
      hash: async (password: string) => {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
        return await bcrypt.hash(password, saltRounds);
      },
      verify: async ({ hash, password }: { hash: string; password: string }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },

  // Custom user fields
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false, // Don't allow users to set their own role
      },
      physicianId: {
        type: 'string',
        required: false,
        input: false, // Users can't set this directly
      },
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
    // Cookie configuration for cross-origin support
    cookie: {
      name: 'better_auth.session_token',
      sameSite: 'lax', // Allow cross-origin cookies in development
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
  },

  // Plugins
  plugins: [
    // Bearer token authentication (for API requests)
    bearer(),

    // JWT token support (24-hour expiration as required)
    jwt({
      jwt: {
        expirationTime: '24h',
        issuer: 'hearttrack',
        audience: 'hearttrack-api',
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
          role: user.role || 'user',
          physicianId: user.physicianId,
        }),
      },
    }),

    // API Key authentication (for IoT devices)
    apiKey(),
  ],

  // Base URL for auth endpoints
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  // Secret for signing cookies and tokens
  secret: process.env.BETTER_AUTH_SECRET || '',

  // Trust host (needed for development)
  trustedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
});

/**
 * Global auth instance (initialized in server.ts after DB connection)
 */
export let auth: ReturnType<typeof createAuth>;

/**
 * Set the auth instance (called from server.ts)
 */
export const setAuth = (authInstance: ReturnType<typeof createAuth>) => {
  auth = authInstance;
};

/**
 * Type definitions for extending better-auth types
 */
export type Auth = ReturnType<typeof createAuth>;
export type Session = any;
export type User = any;
