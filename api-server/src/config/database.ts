import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * @returns Promise<typeof mongoose>
 */
export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hearttrack';

    const connection = await mongoose.connect(mongoUri, {
      // Connection options
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
    console.log(`📊 Database: ${connection.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return connection;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('👋 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
};

/**
 * Get MongoDB database instance for better-auth adapter
 */
export const getMongoDbInstance = () => {
  if (!mongoose.connection.db) {
    throw new Error('MongoDB not connected. Call connectDatabase() first.');
  }
  return mongoose.connection.db;
};
