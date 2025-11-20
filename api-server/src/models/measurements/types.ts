import { Document, Model } from 'mongoose';

/**
 * Measurement quality enum
 */
export enum MeasurementQuality {
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

/**
 * Measurement interface
 */
export interface IMeasurement extends Document {
  userId: string;
  deviceId: string;
  heartRate: number;
  spO2: number;
  timestamp: Date;
  quality?: MeasurementQuality;
  confidence?: number;
  createdAt: Date;
}

/**
 * Measurement Model interface with static methods
 */
export interface IMeasurementModel extends Model<IMeasurement> {
  findByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<IMeasurement[]>;
  findByDevice(deviceId: string, limit?: number): Promise<IMeasurement[]>;
  findDailyMeasurements(userId: string, date: Date): Promise<IMeasurement[]>;
  getWeeklySummary(userId: string): Promise<any>;
  getDailyAggregates(userId: string, days?: number): Promise<any[]>;
}
