import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { auth } from './config/auth.js';
import { toNodeHandler } from 'better-auth/node';
import deviceRoutes from './routes/device.routes.js';
import measurementRoutes from './routes/measurement.routes.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

/**
 * Create and configure Express application
 */
export const createApp = (): Application => {
  const app = express();

  // ===== Security Middleware =====

  // Helmet: Set security-related HTTP headers
  app.use(helmet());

  // CORS: Configure allowed origins
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Limit each IP
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiting to all routes
  app.use(limiter);

  // ===== Body Parsing Middleware =====
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ===== Logging Middleware =====
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // ===== Health Check Endpoint =====
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });

  // ===== Better Auth Routes =====
  // Mount better-auth routes at /api/auth
  // This provides: /api/auth/sign-up/email, /api/auth/sign-in/email, etc.
  // Use Better Auth's toNodeHandler for proper Express/Node.js integration
  app.use('/api/auth', toNodeHandler(auth));

  // ===== API Routes =====
  app.use('/api/devices', deviceRoutes);
  app.use('/api/measurements', measurementRoutes);

  // ===== API Info Endpoint =====
  app.get('/api', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Heart Track API',
      version: '1.0.0',
      endpoints: {
        auth: {
          signUp: 'POST /api/auth/sign-up/email',
          signIn: 'POST /api/auth/sign-in/email',
          signOut: 'POST /api/auth/sign-out',
          getSession: 'GET /api/auth/get-session',
        },
        devices: {
          register: 'POST /api/devices',
          list: 'GET /api/devices',
          get: 'GET /api/devices/:deviceId',
          update: 'PUT /api/devices/:deviceId',
          delete: 'DELETE /api/devices/:deviceId',
          getConfig: 'GET /api/devices/:deviceId/config',
          updateConfig: 'PUT /api/devices/:deviceId/config',
        },
        measurements: {
          submit: 'POST /api/measurements',
          list: 'GET /api/measurements',
          weekly: 'GET /api/measurements/weekly/summary',
          daily: 'GET /api/measurements/daily/:date',
          aggregates: 'GET /api/measurements/daily-aggregates',
          byDevice: 'GET /api/measurements/device/:deviceId',
        },
      },
    });
  });

  // ===== Error Handling =====
  // 404 handler
  app.use(notFound);

  // Global error handler
  app.use(errorHandler);

  return app;
};
