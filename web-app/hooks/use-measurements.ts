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
 * @param deviceId - Optional device ID to filter by
 */
export function useWeeklySummary(
  deviceId?: string,
  options?: Omit<UseQueryOptions<WeeklySummary>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['measurements', 'weekly-summary', deviceId],
    queryFn: async () => {
      // If deviceId is provided, fetch and calculate from filtered measurements
      if (deviceId) {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const measurements = await getMeasurements({
          deviceId,
          startDate: sevenDaysAgo.toISOString().split('T')[0],
          limit: 10000
        })

        if (!measurements.measurements || measurements.measurements.length === 0) {
          return {
            averageHeartRate: 0,
            minHeartRate: 0,
            maxHeartRate: 0,
            averageSpO2: 0,
            minSpO2: 0,
            maxSpO2: 0,
            totalMeasurements: 0,
            dateRange: {
              start: sevenDaysAgo.toISOString().split('T')[0],
              end: new Date().toISOString().split('T')[0]
            }
          }
        }

        const heartRates = measurements.measurements.map(m => m.heartRate)
        const spO2s = measurements.measurements.map(m => m.spO2)

        return {
          averageHeartRate: heartRates.reduce((a, b) => a + b, 0) / heartRates.length,
          minHeartRate: Math.min(...heartRates),
          maxHeartRate: Math.max(...heartRates),
          averageSpO2: spO2s.reduce((a, b) => a + b, 0) / spO2s.length,
          minSpO2: Math.min(...spO2s),
          maxSpO2: Math.max(...spO2s),
          totalMeasurements: measurements.measurements.length,
          dateRange: {
            start: sevenDaysAgo.toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          }
        }
      }
      return getWeeklySummary()
    },
    refetchInterval: REFETCH_INTERVAL,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    ...options
  })
}

/**
 * Hook to fetch measurements for a specific date
 * @param date - Date in YYYY-MM-DD format
 * @param deviceId - Optional device ID to filter by
 */
export function useDailyMeasurements(
  date: string,
  deviceId?: string,
  options?: Omit<UseQueryOptions<DailyMeasurementsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['measurements', 'daily', date, deviceId],
    queryFn: async () => {
      const data = await getDailyMeasurements(date)
      // Filter by device if specified
      if (deviceId && data.measurements) {
        return {
          ...data,
          measurements: data.measurements.filter(m => m.deviceId === deviceId),
          count: data.measurements.filter(m => m.deviceId === deviceId).length
        }
      }
      return data
    },
    refetchInterval: REFETCH_INTERVAL,
    staleTime: 30 * 1000,
    enabled: !!date, // Only fetch if date is provided
    ...options
  })
}

/**
 * Hook to fetch daily aggregates for trend visualization
 * @param days - Number of days to fetch (default: 7)
 * @param deviceId - Optional device ID to filter by
 */
export function useDailyAggregates(
  days: number = 7,
  deviceId?: string,
  options?: Omit<UseQueryOptions<DailyAggregate[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['measurements', 'daily-aggregates', days, deviceId],
    queryFn: async () => {
      // If device filter is specified, we need to fetch and aggregate manually
      if (deviceId) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        const measurements = await getMeasurements({
          deviceId,
          startDate: startDate.toISOString().split('T')[0],
          limit: 10000
        })

        // Group by day manually
        const dayMap = new Map<string, { hr: number[]; spo2: number[] }>()

        measurements.measurements.forEach((m) => {
          const day = new Date(m.timestamp).toISOString().split('T')[0]
          if (!dayMap.has(day)) {
            dayMap.set(day, { hr: [], spo2: [] })
          }
          dayMap.get(day)!.hr.push(m.heartRate)
          dayMap.get(day)!.spo2.push(m.spO2)
        })

        const aggregates: DailyAggregate[] = []
        dayMap.forEach((values, day) => {
          aggregates.push({
            date: new Date(day).toISOString(),
            averageHeartRate: values.hr.reduce((a, b) => a + b, 0) / values.hr.length,
            minHeartRate: Math.min(...values.hr),
            maxHeartRate: Math.max(...values.hr),
            averageSpO2: values.spo2.reduce((a, b) => a + b, 0) / values.spo2.length,
            minSpO2: Math.min(...values.spo2),
            maxSpO2: Math.max(...values.spo2),
            count: values.hr.length
          })
        })

        return aggregates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }
      return getDailyAggregates(days)
    },
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
  const weeklySummary = useWeeklySummary(undefined, { enabled: false })
  const dailyAggregates = useDailyAggregates(7, undefined, { enabled: false })

  return weeklySummary.isFetching || dailyAggregates.isFetching
}
