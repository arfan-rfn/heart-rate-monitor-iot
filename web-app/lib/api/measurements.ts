/**
 * Measurement API Client
 * Functions for fetching heart rate and SpO2 measurements from the backend
 */

import { apiClient } from './client'
import type {
  WeeklySummary,
  DailyMeasurementsResponse,
  DailyAggregate,
  MeasurementFilters,
  MeasurementsListResponse,
  Measurement
} from '@/lib/types/measurement'

/**
 * Get weekly summary statistics
 * Returns 7-day aggregate data (avg, min, max for heart rate and SpO2)
 */
export async function getWeeklySummary(): Promise<WeeklySummary> {
  const response = await apiClient.get<{ summary: WeeklySummary }>(
    '/measurements/weekly/summary'
  )
  return response.summary
}

/**
 * Get all measurements for a specific date
 * Returns chronologically sorted measurements for chart rendering
 * @param date - Date in YYYY-MM-DD format
 */
export async function getDailyMeasurements(
  date: string
): Promise<DailyMeasurementsResponse> {
  return apiClient.get<DailyMeasurementsResponse>(
    `/measurements/daily/${date}`
  )
}

/**
 * Get daily aggregates for multiple days
 * Returns day-by-day summaries for trend visualization
 * @param days - Number of days to fetch (default: 7)
 */
export async function getDailyAggregates(
  days: number = 7
): Promise<DailyAggregate[]> {
  const response = await apiClient.get<{ aggregates: DailyAggregate[]; days: number }>(
    `/measurements/daily-aggregates?days=${days}`
  )
  return response.aggregates
}

/**
 * Get user's measurements with filtering and pagination
 * @param filters - Optional filters for date range, device, pagination
 */
export async function getMeasurements(
  filters?: MeasurementFilters
): Promise<MeasurementsListResponse> {
  const params = new URLSearchParams()

  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.deviceId) params.append('deviceId', filters.deviceId)
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.page) params.append('page', filters.page.toString())

  const queryString = params.toString()
  const url = queryString
    ? `/measurements?${queryString}`
    : '/measurements'

  return apiClient.get<MeasurementsListResponse>(url)
}

/**
 * Get measurements for a specific device
 * @param deviceId - The device ID to filter by
 */
export async function getDeviceMeasurements(
  deviceId: string
): Promise<Measurement[]> {
  return apiClient.get<Measurement[]>(`/measurements/device/${deviceId}`)
}

/**
 * Submit a new measurement (typically used by IoT devices via API key)
 * This function is included for completeness but is primarily used by devices
 * @param data - Measurement data to submit
 */
export async function submitMeasurement(data: {
  deviceId: string
  heartRate: number
  spO2: number
  timestamp: string
  quality?: 'good' | 'fair' | 'poor'
  confidence?: number
}): Promise<Measurement> {
  return apiClient.post<Measurement>('/measurements', data)
}
