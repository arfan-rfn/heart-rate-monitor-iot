import mongoose, { Schema } from 'mongoose';
import { IMeasurement, IMeasurementModel, MeasurementQuality } from './types.js';

/**
 * Measurement Schema
 */
const measurementSchema = new Schema<IMeasurement>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      index: true,
    },
    heartRate: {
      type: Number,
      required: [true, 'Heart rate is required'],
      min: [40, 'Heart rate must be at least 40 bpm'],
      max: [200, 'Heart rate cannot exceed 200 bpm'],
    },
    spO2: {
      type: Number,
      required: [true, 'SpO2 is required'],
      min: [70, 'SpO2 must be at least 70%'],
      max: [100, 'SpO2 cannot exceed 100%'],
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      index: true,
    },
    quality: {
      type: String,
      enum: Object.values(MeasurementQuality),
      default: MeasurementQuality.GOOD,
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence must be between 0 and 1'],
      max: [1, 'Confidence must be between 0 and 1'],
      default: 1.0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation time
    collection: 'measurements',
  }
);

/**
 * Compound Indexes for efficient queries
 */
measurementSchema.index({ userId: 1, timestamp: -1 });
measurementSchema.index({ deviceId: 1, timestamp: -1 });
measurementSchema.index({ userId: 1, deviceId: 1, timestamp: -1 });

/**
 * TTL Index (optional - for data retention)
 * Uncomment to automatically delete measurements older than specified days
 */
// measurementSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 }); // 1 year

/**
 * Static Methods
 */

// Get measurements for a user within a date range
measurementSchema.statics.findByUserAndDateRange = function (
  userId: string,
  startDate: Date,
  endDate: Date
) {
  return this.find({
    userId,
    timestamp: { $gte: startDate, $lte: endDate },
  }).sort({ timestamp: 1 });
};

// Get measurements for a specific device
measurementSchema.statics.findByDevice = function (deviceId: string, limit: number = 100) {
  return this.find({ deviceId }).sort({ timestamp: -1 }).limit(limit);
};

// Get daily measurements for a user
measurementSchema.statics.findDailyMeasurements = function (userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    userId,
    timestamp: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ timestamp: 1 });
};

// Get weekly summary for a user
measurementSchema.statics.getWeeklySummary = async function (userId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const result = await this.aggregate([
    {
      $match: {
        userId,
        timestamp: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: null,
        averageHeartRate: { $avg: '$heartRate' },
        minHeartRate: { $min: '$heartRate' },
        maxHeartRate: { $max: '$heartRate' },
        averageSpO2: { $avg: '$spO2' },
        minSpO2: { $min: '$spO2' },
        maxSpO2: { $max: '$spO2' },
        totalMeasurements: { $sum: 1 },
        firstMeasurement: { $min: '$timestamp' },
        lastMeasurement: { $max: '$timestamp' },
      },
    },
  ]);

  return result[0] || null;
};

// Get daily aggregates for the last 7 days
measurementSchema.statics.getDailyAggregates = async function (userId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return await this.aggregate([
    {
      $match: {
        userId,
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
        },
        date: { $first: '$timestamp' },
        averageHeartRate: { $avg: '$heartRate' },
        minHeartRate: { $min: '$heartRate' },
        maxHeartRate: { $max: '$heartRate' },
        averageSpO2: { $avg: '$spO2' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { date: 1 },
    },
    {
      $project: {
        _id: 0,
        date: 1,
        averageHeartRate: { $round: ['$averageHeartRate', 1] },
        minHeartRate: 1,
        maxHeartRate: 1,
        averageSpO2: { $round: ['$averageSpO2', 1] },
        count: 1,
      },
    },
  ]);
};

/**
 * Export Measurement Model
 */
export const Measurement = mongoose.model<IMeasurement, IMeasurementModel>(
  'Measurement',
  measurementSchema
);
