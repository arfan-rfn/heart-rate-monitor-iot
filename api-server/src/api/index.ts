import dotenv from 'dotenv';
import { createApp } from '../app.js';
import { connectDatabase, getMongoDbInstance } from '../config/database.js';
import { createAuth, setAuth } from '../config/auth.js';

// Load environment variables
dotenv.config();

// Track initialization state
let isInitialized = false;

/**
 * Initialize the application (database, auth, etc.)
 * This is called once on cold start
 */
const initialize = async () => {
  if (isInitialized) return;

  try {
    // Connect to MongoDB
    await connectDatabase();

    // Initialize Better Auth after DB connection
    const authInstance = createAuth(getMongoDbInstance());
    setAuth(authInstance);

    isInitialized = true;
    console.log('✅ Vercel serverless function initialized');
  } catch (error) {
    console.error('❌ Failed to initialize:', error);
    throw error;
  }
};

// Create the Express app
const app = createApp();

// Wrap the app with initialization
const handler = async (req: unknown, res: unknown) => {
  await initialize();
  return app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
};

// Export as default for Vercel
export default handler;
