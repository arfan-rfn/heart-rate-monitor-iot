/**
 * API client for physician portal endpoints
 */

import { apiClient } from './client'
import type {
  PatientListResponse,
  PatientDetailResponse,
  PatientDailyResponse,
  UpdateDeviceConfigRequest,
  UpdateDeviceConfigResponse,
  DailyAggregatesResponse,
  PatientHistoryResponse,
  AllTimeStatsResponse,
  HistoryFilters,
} from '@/lib/types/physician'

const BASE_PATH = '/physicians'

/**
 * Get all patients associated with the current physician
 * Includes 7-day health summaries for each patient
 */
export async function getPatients(): Promise<PatientListResponse> {
  return apiClient.get<PatientListResponse>(`${BASE_PATH}/patients`)
}

/**
 * Get detailed weekly summary for a specific patient
 * Includes patient info, weekly stats, and device list
 */
export async function getPatientSummary(
  patientId: string
): Promise<PatientDetailResponse> {
  return apiClient.get<PatientDetailResponse>(
    `${BASE_PATH}/patients/${patientId}/summary`
  )
}

/**
 * Get daily measurements for a specific patient on a specific date
 */
export async function getPatientDaily(
  patientId: string,
  date: string // YYYY-MM-DD format
): Promise<PatientDailyResponse> {
  return apiClient.get<PatientDailyResponse>(
    `${BASE_PATH}/patients/${patientId}/daily/${date}`
  )
}

/**
 * Update device configuration for a patient's device
 * Allows physician to adjust measurement frequency and active hours
 */
export async function updateDeviceConfig(
  patientId: string,
  deviceId: string,
  config: UpdateDeviceConfigRequest
): Promise<UpdateDeviceConfigResponse> {
  return apiClient.put<UpdateDeviceConfigResponse>(
    `${BASE_PATH}/patients/${patientId}/devices/${deviceId}/config`,
    config
  )
}

// ===== Analytics Endpoints =====

/**
 * Get daily aggregates for a patient over a specified number of days
 * Perfect for trend charts showing patterns over time
 */
export async function getPatientDailyAggregates(
  patientId: string,
  days: number = 30
): Promise<DailyAggregatesResponse> {
  return apiClient.get<DailyAggregatesResponse>(
    `${BASE_PATH}/patients/${patientId}/analytics/daily-aggregates?days=${days}`
  )
}

/**
 * Get full measurement history for a patient with optional filtering
 * Supports pagination and date range filtering
 */
export async function getPatientHistory(
  patientId: string,
  filters?: HistoryFilters
): Promise<PatientHistoryResponse> {
  const params = new URLSearchParams()

  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.page) params.append('page', filters.page.toString())

  const queryString = params.toString()
  const endpoint = `${BASE_PATH}/patients/${patientId}/analytics/history${queryString ? `?${queryString}` : ''}`

  return apiClient.get<PatientHistoryResponse>(endpoint)
}

/**
 * Get all-time statistics for a patient
 * Includes lifetime metrics from first to last measurement
 */
export async function getPatientAllTimeStats(
  patientId: string
): Promise<AllTimeStatsResponse> {
  return apiClient.get<AllTimeStatsResponse>(
    `${BASE_PATH}/patients/${patientId}/analytics/all-time`
  )
}

/**
 * Export patient history as CSV
 * Returns a blob that can be downloaded
 */
export async function exportPatientHistoryCSV(
  patientId: string,
  filters?: HistoryFilters
): Promise<Blob> {
  const params = new URLSearchParams()

  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const queryString = params.toString()
  const endpoint = `${BASE_PATH}/patients/${patientId}/analytics/history${queryString ? `?${queryString}` : ''}`

  // Make request with CSV accept header
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    headers: {
      'Accept': 'text/csv',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to export CSV')
  }

  return response.blob()
}
