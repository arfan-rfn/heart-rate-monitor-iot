"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authClient, useSession } from "@/lib/auth"
import { toast } from "sonner"
import { hasRole, ROLE_GROUPS, ROLES, type Role } from "@/lib/constants/roles"
import type {
	CreateUserInput,
	UpdateUserInput,
	SetRoleInput,
	SetPasswordInput,
	RemoveUserInput,
	ListUsersQuery,
	BanUserInput,
	UnbanUserInput,
	ImpersonateUserInput,
	RevokeSessionInput,
	RevokeUserSessionsInput,
	ListUserSessionsQuery,
} from "@/lib/types/auth"

// ============================================================================
// ROLE-BASED ACCESS CONTROL
// ============================================================================

/**
 * Hook to check if the current user can access the admin panel
 * This is the recommended way to check admin panel access
 *
 * @returns Object containing canAccess flag, loading state, role, and user
 *
 * @example
 * const { canAccess, isLoading } = useCanAccessAdmin()
 * if (canAccess) {
 *   return <AdminPanel />
 * }
 */
export function useCanAccessAdmin() {
	const { data: session, isPending: isLoading } = useSession()

	const canAccess = hasRole(session?.user?.role, ROLE_GROUPS.ADMIN_PANEL_ACCESS)

	return {
		canAccess,
		isLoading,
		role: session?.user?.role,
		user: session?.user
	}
}

/**
 * Generic hook to check if the current user has one of the allowed roles
 * Use this for custom role-based checks
 *
 * @param allowedRoles - Single role or array of roles to check against
 * @returns Object containing hasRole flag, loading state, role, and user
 *
 * @example
 * Check single role
 * const { hasRole } = useHasRole(ROLES.ADMIN)
 *
 * @example
 * Check multiple roles
 * const { hasRole } = useHasRole([ROLES.ADMIN, ROLES.MODERATOR, ROLES.SUPPORT])
 */
export function useHasRole(allowedRoles: Role | Role[]) {
	const { data: session, isPending: isLoading } = useSession()

	const roleArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
	const hasRequiredRole = hasRole(session?.user?.role, roleArray)

	return {
		hasRole: hasRequiredRole,
		isLoading,
		role: session?.user?.role,
		user: session?.user
	}
}

/**
 * Hook to check if the current user is strictly an admin (not moderator)
 * Use this only when you need to differentiate admin from other privileged roles
 *
 * @returns Object containing isAdmin flag, loading state, and user
 *
 * @example
 * const { isAdmin } = useIsAdmin()
 * if (isAdmin) {
 *   return <SuperAdminFeature />
 * }
 */
export function useIsAdmin() {
	const { data: session, isPending: isLoading } = useSession()

	const isAdmin = session?.user?.role === ROLES.ADMIN

	return {
		isAdmin,
		isLoading,
		user: session?.user
	}
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Hook to list users with optional filtering
 *
 * Supports both simple search (via 'search' parameter) and advanced Better Auth search parameters.
 * Simple search automatically detects whether to search by email or name.
 */
export function useListUsers(query?: ListUsersQuery) {
	return useQuery({
		queryKey: ['admin', 'users', 'moderator', query],
		queryFn: async () => {
			// Transform the query to match Better Auth API expectations
			const transformedQuery: Record<string, any> = { ...query }

			// Convert simple search to Better Auth format
			if (query?.search && !query?.searchValue) {
				transformedQuery.searchValue = query.search
				// Smart detection: if search contains @, search by email, otherwise by name
				transformedQuery.searchField = query.search.includes('@') ? 'email' : 'name'
				transformedQuery.searchOperator = 'contains'
				delete transformedQuery.search
			}

			const result = await authClient.admin.listUsers({ query: transformedQuery })
			if (!result.data) {
				throw new Error(result.error?.message || 'Failed to fetch users')
			}
			return result.data
		},
		staleTime: 30000, // 30 seconds
	})
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: CreateUserInput) => {
			const result = await authClient.admin.createUser(data)
			if (!result.data) {
				throw new Error(result.error?.message || 'Failed to create user')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
			toast.success('User created successfully')
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})
}

/**
 * Hook to update user details
 */
export function useUpdateUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId, data }: UpdateUserInput) => {
			const result = await authClient.admin.updateUser({ userId, data })
			if (!result.data) {
				throw new Error(result.error?.message || 'Failed to update user')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
			toast.success('User updated successfully')
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})
}

/**
 * Hook to change user role
 */
export function useSetUserRole() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId, role }: SetRoleInput) => {
			const result = await authClient.admin.setRole({ userId, role: role as "user" | "admin" })
			if (!result.data) {
				throw new Error(result.error?.message || 'Failed to set user role')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
			toast.success('User role updated successfully')
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})
}

/**
 * Hook to reset user password
 */
export function useSetUserPassword() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId, password }: SetPasswordInput) => {
			const result = await authClient.admin.setUserPassword({ userId, newPassword: password })
			if (!result.data) {
				throw new Error(result.error?.message || 'Failed to reset password')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
			toast.success('Password reset successfully')
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})
}

/**
 * Hook to delete a user
 */
export function useRemoveUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId }: RemoveUserInput) => {
			const result = await authClient.admin.removeUser({ userId })
			if (!result.data) {
				throw new Error(result.error?.message || 'Failed to remove user')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
			toast.success('User removed successfully')
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})
}

// ============================================================================
// BAN MANAGEMENT
// ============================================================================

/**
 * Hook to ban a user
 */
export function useBanUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId, reason, expiresAt }: BanUserInput) => {
			const result = await authClient.admin.banUser({
				userId,
				banReason: reason,
				banExpiresIn: expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 1000) : undefined
			})
			if (!result.data) {
				throw new Error(result.error?.message || 'Failed to ban user')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
			toast.success('User banned successfully')
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})
}

/**
 * Hook to unban a user
 */
export function useUnbanUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId }: UnbanUserInput) => {
			const result = await authClient.admin.unbanUser({ userId })
			if (!result.data) {
				throw new Error(result.error?.message || 'Failed to unban user')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
			toast.success('User unbanned successfully')
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Hook to list sessions for a specific user
 */
export function useListUserSessions(query: ListUserSessionsQuery) {
	return useQuery({
		queryKey: ['admin', 'sessions', query.userId],
		queryFn: async () => {
			const result = await authClient.admin.listUserSessions(query)
			if (!result.data) {
				throw new Error(result.error?.message || 'Failed to fetch sessions')
			}
			return result.data
		},
		staleTime: 30000, // 30 seconds
		enabled: !!query.userId, // Only run if userId is provided
	})
}

/**
 * Hook to revoke a single session
 */
export function useRevokeSession() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ sessionId }: RevokeSessionInput) => {
			const result = await authClient.admin.revokeUserSession({ sessionToken: sessionId })
			if (!result.data) {
				throw new Error(result.error?.message || 'Failed to revoke session')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] })
			toast.success('Session revoked successfully')
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})
}

/**
 * Hook to revoke all sessions for a user
 */
export function useRevokeUserSessions() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId }: RevokeUserSessionsInput) => {
			const result = await authClient.admin.revokeUserSessions({ userId })
			if (!result.data) {
				throw new Error(result.error?.message || 'Failed to revoke sessions')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] })
			toast.success('All sessions revoked successfully')
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})
}

// ============================================================================
// IMPERSONATION
// ============================================================================

/**
 * Hook to impersonate a user
 */
export function useImpersonateUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId }: ImpersonateUserInput) => {
			const result = await authClient.admin.impersonateUser({ userId })
			if (!result.data) {
				throw new Error(result.error?.message || 'Failed to impersonate user')
			}
			return result.data
		},
		onSuccess: () => {
			// Invalidate session to refresh with impersonation data
			queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
			toast.success('Now impersonating user')
			// Reload page to reflect impersonation
			window.location.href = '/dashboard'
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})
}

/**
 * Hook to stop impersonating
 */
export function useStopImpersonating() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async () => {
			const result = await authClient.admin.stopImpersonating()
			if (!result.data) {
				throw new Error(result.error?.message || 'Failed to stop impersonating')
			}
			return result.data
		},
		onSuccess: () => {
			// Invalidate session to refresh
			queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
			toast.success('Stopped impersonating')
			// Reload page to reflect change
			window.location.href = '/admin/users'
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})
}

/**
 * Hook to check if currently impersonating
 *
 * @returns Object with isImpersonating flag and impersonatedBy admin ID
 *
 * @example
 * const { isImpersonating, impersonatedBy } = useIsImpersonating()
 * if (isImpersonating) {
 *   console.log('Being impersonated by admin:', impersonatedBy)
 * }
 */
export function useIsImpersonating() {
	const { data: session } = useSession()

	// Better Auth returns session as: { session: {...}, user: {...} }
	// The impersonatedBy field is on session.session, not session directly
	// @ts-ignore - impersonatedBy is added by Better Auth admin plugin
	const impersonatedBy = session?.session?.impersonatedBy

	return {
		isImpersonating: !!impersonatedBy,
		impersonatedBy: impersonatedBy as string | undefined
	}
}
