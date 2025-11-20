/**
 * TanStack Query hooks for account management
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient, auth } from '@/lib/auth'
import { apiClient, APIError } from '@/lib/api/client'
import { userKeys } from './use-user'
import { useAuthContext } from '@/components/providers/auth-provider'

// Account-related types
export interface DeleteAccountRequest {
  confirmation: string
}

export interface DeleteAccountResponse {
  success: boolean
  message: string
  deletionScheduled?: string
}

export interface UpdateProfileRequest {
  name?: string
  bio?: string
  image?: string // fileId for new uploads, or existing URL/fileId for unchanged
  profileCompleted?: boolean
}

export interface UpdateProfileResponse {
  success: boolean
  message: string
  user: any // Better Auth user type
}

export interface CompleteProfileRequest {
  name: string
}

export interface CompleteProfileResponse {
  success: boolean
  message: string
  user: any // Better Auth user type
}

// Mutations
export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // Use Better Auth's deleteUser with email verification
      const response = await auth.deleteUser('/auth/account-deleted')

      // Better Auth returns { data, error } instead of throwing
      if (response.error) {
        throw new Error(response.error.message || 'Failed to request account deletion')
      }

      return response.data
    },
    onSuccess: () => {
      toast.success('Account deletion verification email sent. Please check your email to complete the process.')
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      // Sign out the user after successful deletion request
      authClient.signOut()
    },
    onError: (error) => {
      const message = error instanceof Error
        ? error.message
        : 'Failed to request account deletion'
      toast.error(message)
    },
  })
}

export function useCompleteAccountDeletion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (token: string) => {
      // Complete deletion with token (requires fresh session)
      const response = await authClient.deleteUser({
        token,
      })

      // Better Auth returns { data, error } instead of throwing
      if (response.error) {
        throw new Error(response.error.message || 'Failed to delete account')
      }

      return response.data
    },
    onSuccess: async () => {
      toast.success('Your account has been permanently deleted')
      // Sign out the user after successful deletion
      await authClient.signOut()
    },
    onError: (error) => {
      const message = error instanceof Error
        ? error.message
        : 'Failed to delete account. The verification link may be invalid or expired.'
      toast.error(message)
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { getAuthToken } = useAuthContext()

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      return apiClient.patch<UpdateProfileResponse>('/user', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Profile updated successfully')
      // Invalidate and refetch user queries to get updated data
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (error) => {
      const message = error instanceof APIError
        ? error.message
        : error instanceof Error
        ? error.message
        : 'Failed to update profile'
      toast.error(message)
    },
  })
}

export function useCompleteProfile() {
  const queryClient = useQueryClient()
  const { getAuthToken } = useAuthContext()

  return useMutation({
    mutationFn: async (data: CompleteProfileRequest) => {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      return apiClient.post<CompleteProfileResponse>('/user/complete-profile',
        { name: data.name },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Profile completed successfully')
      // Invalidate and refetch user queries to get updated data
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (error) => {
      const message = error instanceof APIError
        ? error.message
        : error instanceof Error
        ? error.message
        : 'Failed to complete profile'
      toast.error(message)
    },
  })
}