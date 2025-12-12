import mongoose, { Schema, Model } from 'mongoose';
import crypto from 'crypto';
import { IDevice, DeviceStatus } from './types.js';

/**
 * Device Schema
 */
const deviceSchema = new Schema<IDevice>(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
      maxlength: [100, 'Device name cannot exceed 100 characters'],
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      select: false, // Don't return API key by default
    },
    status: {
      type: String,
      enum: Object.values(DeviceStatus),
      default: DeviceStatus.ACTIVE,
      index: true,
    },
    config: {
      measurementFrequency: {
        type: Number,
        default: 1800, // 30 minutes in seconds
        min: [30, 'Measurement frequency must be at least 30 seconds'],
        max: [14400, 'Measurement frequency cannot exceed 4 hours'],
      },
      activeStartTime: {
        type: String,
        default: '06:00',
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
      },
      activeEndTime: {
        type: String,
        default: '22:00',
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
      },
      timezone: {
        type: String,
        default: 'America/New_York',
      },
    },
    lastSeen: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt with timezone
    collection: 'devices',
  }
);

/**
 * Indexes
 */
deviceSchema.index({ userId: 1, createdAt: -1 });
deviceSchema.index({ deviceId: 1, userId: 1 });

/**
 * Instance Methods
 */

// Generate a cryptographically secure API key
deviceSchema.methods.generateApiKey = function (): string {
  const apiKey = `hrt_${crypto.randomBytes(32).toString('hex')}`;
  this.apiKey = apiKey;
  return apiKey;
};

// Update last seen timestamp
deviceSchema.methods.updateLastSeen = async function (): Promise<IDevice> {
  this.lastSeen = new Date();
  return await this.save();
};

/**
 * Static Methods
 */
deviceSchema.statics.findByDeviceId = function (deviceId: string) {
  return this.findOne({ deviceId });
};

deviceSchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Export Device Model
 */
export const Device: Model<IDevice> = mongoose.model<IDevice>('Device', deviceSchema);
