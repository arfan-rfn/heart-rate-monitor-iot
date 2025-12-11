import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { auth } from './config/auth.js';
import { toNodeHandler } from 'better-auth/node';
import { userRoutes } from './routes/users/index.js';
import { deviceRoutes } from './routes/devices/index.js';
import { measurementRoutes } from './routes/measurements/index.js';
import { physicianRoutes } from './routes/physicians/index.js';
import { errorHandler, notFound } from './middleware/error/index.js';
import { generateOpenAPIDocument } from './docs/openapi-generator.js';

/**
 * Create and configure Express application
 */
export const createApp = (): Application => {
  const app = express();

  // Trust proxy - needed when behind reverse proxy (nginx, load balancer, etc.)
  // This enables correct protocol detection (http vs https) and client IP
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // ===== Security Middleware =====

  // Helmet: Set security-related HTTP headers
  // Configure CSP to allow Swagger UI to load properly from CDN
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          // Don't upgrade HTTP to HTTPS - important when HTTPS is not configured
          upgradeInsecureRequests: null,
        },
      },
      // Disable crossOriginEmbedderPolicy to allow Swagger UI assets to load
      crossOriginEmbedderPolicy: false,
      // Disable crossOriginResourcePolicy to allow assets from same origin
      crossOriginResourcePolicy: { policy: 'same-site' },
    })
  );

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

  // ===== OpenAPI/Swagger Documentation =====
  const openApiDocument = generateOpenAPIDocument();

  // Serve OpenAPI JSON spec
  app.get('/api-docs/openapi.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openApiDocument);
  });

  // Serve Swagger UI
  // Use CDN for static assets to work properly on serverless (Vercel)
  const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PulseConnect API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
    // Use CDN-hosted Swagger UI assets for serverless compatibility
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css',
    customJs: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js',
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js',
    ],
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, swaggerUiOptions));

  // ===== Better Auth Routes =====
  // Mount better-auth routes at /api/auth
  // This provides: /api/auth/sign-up/email, /api/auth/sign-in/email, etc.
  // Use Better Auth's toNodeHandler for proper Express/Node.js integration
  app.use('/api/auth', toNodeHandler(auth));

  // ===== API Routes =====
  app.use('/api/devices', deviceRoutes);
  app.use('/api/measurements', measurementRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/physicians', physicianRoutes);

  // ===== API Info Endpoint =====
  app.get('/api', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'PulseConnect API',
      version: '1.0.0',
      documentation: {
        swagger: `${req.protocol}://${req.get('host')}/api-docs`,
        openapi: `${req.protocol}://${req.get('host')}/api-docs/openapi.json`,
      },
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
        users: {
          getProfile: 'GET /api/users/profile',
          updateProfile: 'PUT /api/users/profile',
          changePassword: 'POST /api/users/change-password',
          deleteAccount: 'DELETE /api/users/profile',
          updatePhysician: 'PUT /api/users/physician',
        },
        physicians: {
          listPatients: 'GET /api/physicians/patients',
          patientSummary: 'GET /api/physicians/patients/:patientId/summary',
          patientDaily: 'GET /api/physicians/patients/:patientId/daily/:date',
          updatePatientConfig: 'PUT /api/physicians/patients/:patientId/devices/:deviceId/config',
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
