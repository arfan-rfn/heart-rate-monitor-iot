const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

// ========== Configuration ==========
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/";
const DATABASE_NAME = process.env.DATABASE_NAME || "heart_track_db";
const COLLECTION_NAME = process.env.COLLECTION_NAME || "measurements";
const PORT = process.env.PORT || 3000;

// ========== MongoDB Connection ==========
const client = new MongoClient(MONGODB_URI);
let db;
let collection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(DATABASE_NAME);
    collection = db.collection(COLLECTION_NAME);
    console.log('✓ Connected to MongoDB');
    console.log(`  Database: ${DATABASE_NAME}`);
    console.log(`  Collection: ${COLLECTION_NAME}`);
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    process.exit(1);
  }
}

// ========== Routes ==========

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    database: DATABASE_NAME,
    collection: COLLECTION_NAME
  });
});

// Test endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Heart Track MongoDB Proxy',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      measurements: '/api/measurements (POST)'
    }
  });
});

// Receive measurement from Photon 2
app.post('/api/measurements', async (req, res) => {
  try {
    const measurement = req.body;
    
    console.log('📥 Received measurement from:', measurement.deviceId);
    console.log('   HR:', measurement.heartRate, 'bpm');
    console.log('   SpO2:', measurement.spO2, '%');
    console.log('   Raw timestamp:', measurement.timestamp);
    
    // Transform to match MongoDB schema
    const document = {
      userId: process.env.DEFAULT_USER_ID || "000000000000000000000000", // Add this env var to Railway
      deviceId: measurement.deviceId,
      heartRate: Math.round(measurement.heartRate), // MongoDB schema shows integers
      spO2: Math.round(measurement.spO2),
      timestamp: new Date(measurement.timestamp * 1000), // Convert Unix to Date object
      quality: measurement.quality || "good",
      confidence: measurement.confidence || 1,
      createdAt: new Date(),
      __v: 0
    };
    
    console.log('📝 Transformed document:', JSON.stringify(document, null, 2));
    
    const result = await collection.insertOne(document);
    
    console.log('✓ Stored with ID:', result.insertedId);
    
    res.status(200).json({
      success: true,
      id: result.insertedId,
      message: 'Measurement stored successfully'
    });
    
  } catch (error) {
    console.error('✗ Error storing measurement:', error);
    console.error('   Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Get recent measurements (for testing)
app.get('/api/measurements', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const measurements = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    
    res.json({
      success: true,
      count: measurements.length,
      measurements: measurements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== Start Server ==========
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API: http://localhost:${PORT}/api/measurements\n`);
  });
});

// ========== Graceful Shutdown ==========
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await client.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await client.close();
  process.exit(0);
});
