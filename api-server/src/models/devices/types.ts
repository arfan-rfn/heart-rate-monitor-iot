import { Document } from 'mongoose';

/**
 * Device status enum
 */
export enum DeviceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

/**
 * Device configuration interface
 */
export interface IDeviceConfig {
  measurementFrequency: number; // in seconds (default: 1800 = 30 minutes)
  activeStartTime: string; // HH:MM format (default: "06:00")
  activeEndTime: string; // HH:MM format (default: "22:00")
  timezone: string; // IANA timezone (default: "America/New_York")
}

/**
 * Device interface
 */
export interface IDevice extends Document {
  deviceId: string;
  userId: string;
  name: string;
  apiKey: string;
  status: DeviceStatus;
  config: IDeviceConfig;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  generateApiKey(): string;
  updateLastSeen(): Promise<IDevice>;
}
