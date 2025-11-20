/**
 * TypeScript type definitions for physician portal features
 */

import type { DeviceConfig, DeviceStatus, UpdateDeviceConfigRequest } from './device'
import type { MeasurementQuality } from './measurement'

// Re-export types that are used in physician portal
export type { DeviceConfig, DeviceStatus, UpdateDeviceConfigRequest, MeasurementQuality }

// ===== Physician Dashboard - Patient List =====

export type MonitoringStatus = 'active' | 'inactive' | 'no_devices'

export interface PatientWeeklyStats {
  averageHeartRate: number // BPM, rounded to 1 decimal
  minHeartRate: number // BPM
  maxHeartRate: number // BPM
  averageSpO2: number // %, rounded to 1 decimal
  totalMeasurements: number // Count in last 7 days
  lastMeasurement: string | null // ISO timestamp or null
}

export interface PatientOverviewStats {
  totalMeasurementsAllTime: number // Lifetime count
  totalDevices: number // Total registered devices
  activeDevices: number // Devices with status='active'
  hasRecentData: boolean // Has data in last 7 days
  monitoringStatus: MonitoringStatus
}

export interface Patient {
  id: string // Patient's user ID - use as patientId for other endpoints
  name: string
  email: string
  stats: {
    weekly: PatientWeeklyStats
    overview: PatientOverviewStats
  }
}

export interface PatientListResponse {
  patients: Patient[]
  totalPatients: number
}

// Legacy PatientSummary for backward compatibility with other endpoints
export interface PatientSummary {
  averageHeartRate: number
  minHeartRate: number
  maxHeartRate: number
  totalMeasurements: number
  lastMeasurement: string | null
}

// ===== Patient Detail - Weekly Summary =====

export interface WeeklySummary {
  averageHeartRate: number
  minHeartRate: number
  maxHeartRate: number
  averageSpO2: number
  minSpO2: number
  maxSpO2: number
  totalMeasurements: number
  dateRange: {
    start: string // YYYY-MM-DD
    end: string // YYYY-MM-DD
  }
}

export interface PatientDevice {
  deviceId: string
  name: string
  status: DeviceStatus
  config: DeviceConfig
  lastSeen: string | null // ISO 8601 timestamp
}

export interface PatientInfo {
  id: string
  name: string
  email: string
}

export interface PatientDetailResponse {
  patient: PatientInfo
  summary: WeeklySummary
  devices: PatientDevice[]
}

// ===== Daily Measurements =====

export interface Measurement {
  timestamp: string // ISO 8601 timestamp
  heartRate: number // BPM
  spO2: number // Percentage
  quality: MeasurementQuality
  confidence: number // 0.0 - 1.0
  deviceId: string
}

export interface PatientDailyResponse {
  patient: PatientInfo
  date: string // YYYY-MM-DD
  measurements: Measurement[]
  count: number
}

// ===== Device Config Update =====

export interface UpdateDeviceConfigResponse {
  device: {
    deviceId: string
    name: string
    config: DeviceConfig
    updatedAt: string
  }
  message: string
}

// ===== Validation Constants =====

export const MEASUREMENT_FREQUENCY_OPTIONS = [
  { value: 900, label: 'Every 15 minutes' },
  { value: 1800, label: 'Every 30 minutes' },
  { value: 3600, label: 'Every hour' },
  { value: 7200, label: 'Every 2 hours' },
  { value: 14400, label: 'Every 4 hours' },
] as const

export const MEASUREMENT_FREQUENCY_LIMITS = {
  MIN: 900, // 15 minutes
  MAX: 14400, // 4 hours
} as const

// ===== Analytics Types =====

// Daily Aggregates
export interface DailyAggregate {
  date: string // YYYY-MM-DD
  averageHeartRate: number
  minHeartRate: number
  maxHeartRate: number
  averageSpO2: number
  minSpO2: number
  maxSpO2: number
  count: number
}

export interface DailyAggregatesResponse {
  patient: PatientInfo
  aggregates: DailyAggregate[]
  dateRange: {
    start: string
    end: string
  }
  totalDays: number
}

// Full History
export interface HistoricalMeasurement {
  timestamp: string // ISO 8601 timestamp
  heartRate: number
  spO2: number
  quality: MeasurementQuality
  confidence: number
  deviceId: string
}

export interface PatientHistoryResponse {
  patient: PatientInfo
  measurements: HistoricalMeasurement[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  dateRange?: {
    start: string
    end: string
  }
}

// All-Time Stats
export interface AllTimeStats {
  totalMeasurements: number
  firstMeasurement: string | null // ISO 8601 timestamp
  lastMeasurement: string | null // ISO 8601 timestamp
  heartRate: {
    overallAverage: number
    overallMin: number
    overallMax: number
    lowestRecorded: {
      value: number
      timestamp: string
    } | null
    highestRecorded: {
      value: number
      timestamp: string
    } | null
  }
  spO2: {
    overallAverage: number
    overallMin: number
    overallMax: number
    lowestRecorded: {
      value: number
      timestamp: string
    } | null
    highestRecorded: {
      value: number
      timestamp: string
    } | null
  }
  daysTracked: number
}

export interface AllTimeStatsResponse {
  patient: PatientInfo
  stats: AllTimeStats
}

// History Query Filters
export interface HistoryFilters {
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  limit?: number
  page?: number
}

// Days options for trend analysis
export const TREND_DAYS_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
] as const
