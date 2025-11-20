#!/usr/bin/env tsx

/**
 * Set Physician Role Script
 *
 * This script allows you to manually set a user's role to 'physician'.
 *
 * Usage:
 *   npm run set-physician <email>
 *
 * Example:
 *   npm run set-physician dr.smith@hospital.com
 */

import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase, getMongoDbInstance } from '../src/config/database.js';

// Load environment variables from .env file
dotenv.config();

const setPhysicianRole = async (email: string) => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Database connected successfully\n');

    console.log(`🔍 Looking for user with email: ${email}`);

    const db = getMongoDbInstance();
    const userCollection = db.collection('user');

    // Find user by email
    const user = await userCollection.findOne({ email });

    if (!user) {
      console.error(`\n❌ User not found with email: ${email}`);
      console.log('\n💡 Make sure the user has registered first via /api/auth/sign-up/email');
      process.exit(1);
    }

    console.log(`\n✅ User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role || 'user'}`);

    // Check if already a physician
    if (user.role === 'physician') {
      console.log('\n⚠️  User is already a physician!');
      process.exit(0);
    }

    // Update role to physician
    console.log(`\n🔄 Updating role to 'physician'...`);

    const result = await userCollection.updateOne(
      { email },
      {
        $set: {
          role: 'physician',
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log('\n✅ Success! User role updated to physician');
      console.log(`\n📋 User Details:`);
      console.log(`   Email: ${email}`);
      console.log(`   Role: physician`);
      console.log(`   Updated: ${new Date().toISOString()}`);
      console.log('\n🔐 This user can now access physician portal endpoints:');
      console.log('   - GET /api/physicians/patients');
      console.log('   - GET /api/physicians/patients/:patientId/summary');
      console.log('   - GET /api/physicians/patients/:patientId/daily/:date');
      console.log('   - PUT /api/physicians/patients/:patientId/devices/:deviceId/config');
    } else {
      console.error('\n❌ Failed to update user role');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);

    // Check if it's a MongoDB connection error
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting Steps:');
      console.log('   1. Make sure MongoDB is running:');
      console.log('      brew services start mongodb-community');
      console.log('   2. Or check your .env file for correct MONGODB_URI');
      console.log('   3. Verify MongoDB is accessible:');
      console.log('      mongosh mongodb://localhost:27017');
    }

    process.exit(1);
  } finally {
    try {
      await disconnectDatabase();
      console.log('\n🔌 Database connection closed');
    } catch (e) {
      // Ignore disconnect errors if connection never established
    }
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email address is required');
  console.log('\nUsage:');
  console.log('  npm run set-physician <email>');
  console.log('\nExample:');
  console.log('  npm run set-physician dr.smith@hospital.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Error: Invalid email format');
  process.exit(1);
}

// Run the script
setPhysicianRole(email);
