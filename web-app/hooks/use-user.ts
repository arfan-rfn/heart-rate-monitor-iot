/**
 * TanStack Query hook for fetching comprehensive user data from /user endpoint
 * Provides longer cache validation and better user experience than session-based data
 */

import { useQuery } from '@tanstack/react-query'
import { apiClient, APIError } from '@/lib/api/client'
import { useAuthContext } from '@/components/providers/auth-provider'

// Enhanced user type with comprehensive profile data matching API response
export interface User {
  id: string
  email: string
  name?: string
  emailVerified: boolean
  avatarUrl?: string | null // Full URL constructed by backend from fileId
  profileCompleted?: boolean
  createdAt: string
  updatedAt: string
  firstLoginAt?: string
  profileCompletedAt?: string | null
}

export interface UseUserOptions {
  // Whether to refetch on window focus (default: true)
  refetchOnWindowFocus?: boolean
  // Whether to refetch on reconnect (default: true)
  refetchOnReconnect?: boolean
}

/**
 * Fetch comprehensive user data with longer validation times
 * Uses 10 minutes stale time by default for better caching
 * @param options Configuration options for the query
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

      return apiClient.get<User>('/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    },
    staleTime: 10 * 60 * 1000, // 10 minutes default for good caching
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