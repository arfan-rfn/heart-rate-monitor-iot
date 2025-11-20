import dotenv from 'dotenv';
import { createApp } from './src/app.js';
import { connectDatabase, disconnectDatabase, getMongoDbInstance } from './src/config/database.js';
import { createAuth, setAuth } from './src/config/auth.js';

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await connectDatabase();

    // Initialize Better Auth after DB connection
    console.log('🔐 Initializing Better Auth...');
    const authInstance = createAuth(getMongoDbInstance());
    setAuth(authInstance);
    console.log('✅ Better Auth initialized');

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 PulseConnect API Server');
      console.log('='.repeat(50));
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`🌐 Server: http://${HOST}:${PORT}`);
      console.log(`🔗 API: http://${HOST}:${PORT}/api`);
      console.log(`📖 API Docs: http://${HOST}:${PORT}/api-docs`);
      console.log(`❤️  Health: http://${HOST}:${PORT}/health`);
      console.log('='.repeat(50) + '\n');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n\n⚠️  ${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('🔒 HTTP server closed');

        try {
          await disconnectDatabase();
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⏱️  Forced shutdown after 10 seconds');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
