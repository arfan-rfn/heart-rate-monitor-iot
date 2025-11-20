/**
 * TanStack Query hook for fetching comprehensive user data from /users/profile endpoint
 * Provides longer cache validation and better user experience than session-based data
 * Updated to use User Management API instead of Better Auth /user endpoint
 */

import { useQuery } from '@tanstack/react-query'
import { apiClient, APIError } from '@/lib/api/client'
import { useAuthContext } from '@/components/providers/auth-provider'

// Enhanced user type with comprehensive profile data matching API response
export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'physician'
  physicianId?: string | null
  emailVerified?: boolean
  avatarUrl?: string | null // Full URL constructed by backend from fileId (from Better Auth)
  profileCompleted?: boolean
  createdAt: string
  updatedAt: string
  firstLoginAt?: string
  profileCompletedAt?: string | null
  // Stats from user management API
  deviceCount?: number
  recentMeasurementCount?: number
}

export interface UseUserOptions {
  // Whether to refetch on window focus (default: true)
  refetchOnWindowFocus?: boolean
  // Whether to refetch on reconnect (default: true)
  refetchOnReconnect?: boolean
}

/**
 * Fetch comprehensive user data with longer validation times
 * Uses 5 minutes stale time by default for better caching
 * Now uses User Management API endpoint /users/profile
 */
export function useUser() {
  // Get auth token from context instead of calling getSession
  const { getAuthToken, isAuthenticated } = useAuthContext()

  return useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User> => {
      // Get authentication token from cached context
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Call User Management API to get profile with stats
      const response = await apiClient.get<{ user: any; stats: any }>('/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      // Merge user data with stats
      return {
        ...response.user,
        deviceCount: response.stats.deviceCount,
        recentMeasurementCount: response.stats.recentMeasurementCount,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for user profile data
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof APIError && error.status === 401) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    // Only run query if user is authenticated
    enabled: isAuthenticated,
  })
}

/**
 * Query key factory for user-related queries
 */
export const userKeys = {
  all: ['user'] as const,
  detail: () => [...userKeys.all, 'detail'] as const,
}