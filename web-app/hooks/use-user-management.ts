/**
 * TanStack Query hooks for user management operations
 * Integrates with backend /api/users endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, APIError } from '@/lib/api/client'
import { useAuthContext } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import {
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
  UpdatePhysicianRequest,
  UpdatePhysicianResponse,
} from '@/lib/types/user'

// Query keys for user management
export const userManagementKeys = {
  all: ['user-management'] as const,
  profile: () => [...userManagementKeys.all, 'profile'] as const,
}

/**
 * Fetch user profile with statistics
 */
export function useUserProfile() {
  const { getAuthToken, isAuthenticated } = useAuthContext()

  return useQuery({
    queryKey: userManagementKeys.profile(),
    queryFn: async (): Promise<GetProfileResponse> => {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      return apiClient.get<GetProfileResponse>('/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof APIError && error.status === 401) {
        return false
      }
      return failureCount < 2
    },
    enabled: isAuthenticated,
  })
}

/**
 * Update user profile (name only)
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient()
  const { getAuthToken } = useAuthContext()

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      return apiClient.put<UpdateProfileResponse>('/users/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Profile updated successfully')
      // Invalidate profile query to refetch updated data
      queryClient.invalidateQueries({ queryKey: userManagementKeys.profile() })
      // Also invalidate the user query if it exists
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error) => {
      const message =
        error instanceof APIError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'Failed to update profile'
      toast.error(message)
    },
  })
}

/**
 * Change user password
 */
export function useChangePassword() {
  const { getAuthToken } = useAuthContext()

  return useMutation({
    mutationFn: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      return apiClient.post<ChangePasswordResponse>('/users/change-password', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Password changed successfully')
    },
    onError: (error) => {
      const message =
        error instanceof APIError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'Failed to change password'
      toast.error(message)
    },
  })
}

/**
 * Delete user account permanently
 */
export function useDeleteUserAccount() {
  const queryClient = useQueryClient()
  const { getAuthToken } = useAuthContext()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: DeleteAccountRequest): Promise<DeleteAccountResponse> => {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      return apiClient.delete<DeleteAccountResponse>('/users/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    },
    onSuccess: (data) => {
      toast.success(
        `Account deleted successfully. ${data.deletedDevices} devices and ${data.deletedMeasurements} measurements were removed.`
      )
      // Clear all queries
      queryClient.clear()
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push('/auth/sign-in')
      }, 2000)
    },
    onError: (error) => {
      const message =
        error instanceof APIError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'Failed to delete account'
      toast.error(message)
    },
  })
}

/**
 * Update physician association
 */
export function useUpdatePhysician() {
  const queryClient = useQueryClient()
  const { getAuthToken } = useAuthContext()

  return useMutation({
    mutationFn: async (data: UpdatePhysicianRequest): Promise<UpdatePhysicianResponse> => {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      return apiClient.put<UpdatePhysicianResponse>('/users/physician', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    },
    onSuccess: (data) => {
      const message = data.user.physicianId
        ? 'Physician association updated successfully'
        : 'Physician association removed successfully'
      toast.success(data.message || message)
      // Invalidate profile query to refetch updated data
      queryClient.invalidateQueries({ queryKey: userManagementKeys.profile() })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error) => {
      const message =
        error instanceof APIError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'Failed to update physician association'
      toast.error(message)
    },
  })
}
