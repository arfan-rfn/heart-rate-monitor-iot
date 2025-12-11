import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import { createApp } from '../src/app.js';
import { connectDatabase, getMongoDbInstance } from '../src/config/database.js';
import { createAuth, setAuth } from '../src/config/auth.js';

// Load environment variables
dotenv.config();

// Track initialization state
let isInitialized = false;
let app: ReturnType<typeof createApp> | null = null;

/**
 * Initialize the application (database, auth, etc.)
 * This is called once on cold start
 */
const initialize = async () => {
  if (isInitialized && app) return app;

  try {
    // Connect to MongoDB
    await connectDatabase();

    // Initialize Better Auth after DB connection
    const authInstance = createAuth(getMongoDbInstance());
    setAuth(authInstance);

    // Create the Express app after initialization
    app = createApp();

    isInitialized = true;
    console.log('✅ Vercel serverless function initialized');
    return app;
  } catch (error) {
    console.error('❌ Failed to initialize:', error);
    throw error;
  }
};

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = await initialize();
  return expressApp(req as any, res as any);
}
