/**
 * Measurement Types
 * Type definitions for heart rate and SpO2 measurements
 */

export type MeasurementQuality = 'good' | 'fair' | 'poor'

export interface Measurement {
  _id: string
  userId: string
  deviceId: string
  heartRate: number // 40-200 bpm
  spO2: number // 70-100%
  timestamp: Date | string
  quality: MeasurementQuality
  confidence: number // 0.0-1.0
  createdAt: Date | string
}

export interface WeeklySummary {
  averageHeartRate: number
  minHeartRate: number
  maxHeartRate: number
  averageSpO2: number
  minSpO2: number
  maxSpO2: number
  totalMeasurements: number
  dateRange: {
    start: string
    end: string
  }
}

export interface DailyMeasurementsResponse {
  date: string
  measurements: Array<{
    timestamp: string
    heartRate: number
    spO2: number
    quality: MeasurementQuality
    confidence: number
    deviceId: string
  }>
  count: number
}

export interface DailyAggregate {
  date: string
  averageHeartRate: number
  minHeartRate: number
  maxHeartRate: number
  averageSpO2: number
  minSpO2?: number
  maxSpO2?: number
  count: number
}

export interface MeasurementFilters {
  startDate?: string
  endDate?: string
  deviceId?: string
  limit?: number
  page?: number
}

export interface MeasurementsListResponse {
  measurements: Measurement[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Chart data types
export interface ChartDataPoint {
  timestamp: string
  heartRate: number
  spO2: number
  quality: MeasurementQuality
  confidence: number
}

export interface WeeklyChartData {
  date: string
  avgHeartRate: number
  avgSpO2: number
  count: number
}

// Threshold definitions
export const HEART_RATE_THRESHOLDS = {
  normal: { min: 60, max: 100 },
  warning: { min: 50, max: 120 },
  critical: { min: 40, max: 200 }
} as const

export const SPO2_THRESHOLDS = {
  normal: { min: 95, max: 100 },
  warning: { min: 90, max: 94 },
  critical: { min: 70, max: 89 }
} as const

// Quality color mapping
export const QUALITY_COLORS = {
  good: '#10b981', // green
  fair: '#f59e0b', // yellow
  poor: '#ef4444'  // red
} as const

// Helper type guards
export function isAbnormalHeartRate(hr: number): boolean {
  return hr < HEART_RATE_THRESHOLDS.normal.min || hr > HEART_RATE_THRESHOLDS.normal.max
}

export function isAbnormalSpO2(spo2: number): boolean {
  return spo2 < SPO2_THRESHOLDS.normal.min
}

export function isCriticalHeartRate(hr: number): boolean {
  return hr < HEART_RATE_THRESHOLDS.warning.min || hr > HEART_RATE_THRESHOLDS.warning.max
}

export function isCriticalSpO2(spo2: number): boolean {
  return spo2 < SPO2_THRESHOLDS.warning.min
}
