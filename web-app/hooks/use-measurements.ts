'use client'

/**
 * Measurement Hooks
 * React Query hooks for fetching heart rate and SpO2 measurements
 * Includes real-time auto-refresh functionality
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  getWeeklySummary,
  getDailyMeasurements,
  getDailyAggregates,
  getMeasurements,
  getDeviceMeasurements
} from '@/lib/api/measurements'
import type {
  WeeklySummary,
  DailyMeasurementsResponse,
  DailyAggregate,
  MeasurementFilters,
  MeasurementsListResponse,
  Measurement
} from '@/lib/types/measurement'

// Real-time update interval (60 seconds)
const REFETCH_INTERVAL = 60 * 1000

/**
 * Hook to fetch weekly summary statistics with auto-refresh
 * Refetches every 60 seconds for real-time updates
 */
export function useWeeklySummary(
  options?: Omit<UseQueryOptions<WeeklySummary>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['measurements', 'weekly-summary'],
    queryFn: getWeeklySummary,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    ...options
  })
}

/**
 * Hook to fetch measurements for a specific date
 * @param date - Date in YYYY-MM-DD format
 * @param enabled - Whether the query should run (default: true)
 */
export function useDailyMeasurements(
  date: string,
  options?: Omit<UseQueryOptions<DailyMeasurementsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['measurements', 'daily', date],
    queryFn: () => getDailyMeasurements(date),
    refetchInterval: REFETCH_INTERVAL,
    staleTime: 30 * 1000,
    enabled: !!date, // Only fetch if date is provided
    ...options
  })
}

/**
 * Hook to fetch daily aggregates for trend visualization
 * @param days - Number of days to fetch (default: 7)
 */
export function useDailyAggregates(
  days: number = 7,
  options?: Omit<UseQueryOptions<DailyAggregate[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['measurements', 'daily-aggregates', days],
    queryFn: () => getDailyAggregates(days),
    refetchInterval: REFETCH_INTERVAL,
    staleTime: 30 * 1000,
    ...options
  })
}

/**
 * Hook to fetch measurements with filtering and pagination
 * Does NOT auto-refresh (user-initiated queries for export/history)
 * @param filters - Optional filters for date range, device, pagination
 */
export function useMeasurements(
  filters?: MeasurementFilters,
  options?: Omit<UseQueryOptions<MeasurementsListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['measurements', 'list', filters],
    queryFn: () => getMeasurements(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes - this is for historical data
    ...options
  })
}

/**
 * Hook to fetch measurements for a specific device
 * @param deviceId - The device ID to filter by
 */
export function useDeviceMeasurements(
  deviceId: string | undefined,
  options?: Omit<UseQueryOptions<Measurement[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['measurements', 'device', deviceId],
    queryFn: () => getDeviceMeasurements(deviceId!),
    enabled: !!deviceId, // Only fetch if deviceId is provided
    staleTime: 30 * 1000,
    ...options
  })
}

/**
 * Helper hook to check if data is being refreshed
 * Useful for showing "updating..." indicator
 */
export function useIsRefetching() {
  const weeklySummary = useWeeklySummary({ enabled: false })
  const dailyAggregates = useDailyAggregates(7, { enabled: false })

  return weeklySummary.isFetching || dailyAggregates.isFetching
}
