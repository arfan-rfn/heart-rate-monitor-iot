/**
 * React Query hooks for physician portal data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPatients,
  getPatientSummary,
  getPatientDaily,
  updateDeviceConfig,
  getPatientDailyAggregates,
  getPatientHistory,
  getPatientAllTimeStats,
  exportPatientHistoryCSV,
} from '@/lib/api/physicians'
import type {
  PatientListResponse,
  PatientDetailResponse,
  PatientDailyResponse,
  UpdateDeviceConfigRequest,
  DailyAggregatesResponse,
  PatientHistoryResponse,
  AllTimeStatsResponse,
  HistoryFilters,
} from '@/lib/types/physician'
import { toast } from 'sonner'

// Query keys for cache management
export const physicianKeys = {
  all: ['physician'] as const,
  patients: () => [...physicianKeys.all, 'patients'] as const,
  patientSummary: (patientId: string) =>
    [...physicianKeys.all, 'patient', patientId, 'summary'] as const,
  patientDaily: (patientId: string, date: string) =>
    [...physicianKeys.all, 'patient', patientId, 'daily', date] as const,
  patientAggregates: (patientId: string, days: number) =>
    [...physicianKeys.all, 'patient', patientId, 'aggregates', days] as const,
  patientHistory: (patientId: string, filters?: HistoryFilters) =>
    [...physicianKeys.all, 'patient', patientId, 'history', filters] as const,
  patientAllTime: (patientId: string) =>
    [...physicianKeys.all, 'patient', patientId, 'all-time'] as const,
}

/**
 * Hook to fetch all patients for the current physician
 * Auto-refreshes every 60 seconds
 */
export function usePhysicianPatients() {
  return useQuery<PatientListResponse>({
    queryKey: physicianKeys.patients(),
    queryFn: getPatients,
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  })
}

/**
 * Hook to fetch detailed weekly summary for a specific patient
 * Auto-refreshes every 60 seconds
 */
export function usePatientSummary(patientId: string | null) {
  return useQuery<PatientDetailResponse>({
    queryKey: physicianKeys.patientSummary(patientId || ''),
    queryFn: () => {
      if (!patientId) throw new Error('Patient ID is required')
      return getPatientSummary(patientId)
    },
    enabled: !!patientId,
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

/**
 * Hook to fetch daily measurements for a specific patient on a specific date
 * Auto-refreshes every 60 seconds
 */
export function usePatientDaily(
  patientId: string | null,
  date: string | null
) {
  return useQuery<PatientDailyResponse>({
    queryKey: physicianKeys.patientDaily(patientId || '', date || ''),
    queryFn: () => {
      if (!patientId) throw new Error('Patient ID is required')
      if (!date) throw new Error('Date is required')
      return getPatientDaily(patientId, date)
    },
    enabled: !!patientId && !!date,
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

/**
 * Hook to update device configuration
 * Optimistically updates cache and invalidates related queries
 */
export function useUpdateDeviceConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      patientId,
      deviceId,
      config,
    }: {
      patientId: string
      deviceId: string
      config: UpdateDeviceConfigRequest
    }) => updateDeviceConfig(patientId, deviceId, config),
    onSuccess: (data, variables) => {
      toast.success('Device configuration updated successfully')

      // Invalidate patient summary to refresh device list
      queryClient.invalidateQueries({
        queryKey: physicianKeys.patientSummary(variables.patientId),
      })
    },
    onError: (error: Error) => {
      toast.error(`Failed to update device configuration: ${error.message}`)
    },
  })
}

// ===== Analytics Hooks =====

/**
 * Hook to fetch daily aggregates for trend analysis
 * Auto-refreshes every 60 seconds
 */
export function usePatientDailyAggregates(
  patientId: string | null,
  days: number = 30
) {
  return useQuery<DailyAggregatesResponse>({
    queryKey: physicianKeys.patientAggregates(patientId || '', days),
    queryFn: () => {
      if (!patientId) throw new Error('Patient ID is required')
      return getPatientDailyAggregates(patientId, days)
    },
    enabled: !!patientId,
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

/**
 * Hook to fetch patient history with optional filtering
 * Auto-refreshes every 60 seconds
 */
export function usePatientHistory(
  patientId: string | null,
  filters?: HistoryFilters
) {
  return useQuery<PatientHistoryResponse>({
    queryKey: physicianKeys.patientHistory(patientId || '', filters),
    queryFn: () => {
      if (!patientId) throw new Error('Patient ID is required')
      return getPatientHistory(patientId, filters)
    },
    enabled: !!patientId,
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

/**
 * Hook to fetch all-time statistics for a patient
 * Auto-refreshes every 60 seconds
 */
export function usePatientAllTimeStats(patientId: string | null) {
  return useQuery<AllTimeStatsResponse>({
    queryKey: physicianKeys.patientAllTime(patientId || ''),
    queryFn: () => {
      if (!patientId) throw new Error('Patient ID is required')
      return getPatientAllTimeStats(patientId)
    },
    enabled: !!patientId,
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

/**
 * Hook to export patient history as CSV
 */
export function useExportPatientHistory() {
  return useMutation({
    mutationFn: ({
      patientId,
      filters,
    }: {
      patientId: string
      filters?: HistoryFilters
    }) => exportPatientHistoryCSV(patientId, filters),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `patient-${variables.patientId}-history-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Patient history exported successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to export patient history: ${error.message}`)
    },
  })
}
