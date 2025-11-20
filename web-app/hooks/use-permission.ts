"use client"

import { useQuery } from "@tanstack/react-query"
import { authClient, useSession } from "@/lib/auth"
import { hasRole, ROLE_GROUPS } from "@/lib/constants/roles"

/**
 * Hook to check if current user has a specific permission
 * Uses React Query for automatic caching and deduplication
 *
 * @param namespace - Permission namespace (e.g., 'user', 'session', 'ui')
 * @param action - Permission action (e.g., 'create', 'delete', 'set-role')
 * @returns Object with permission status, loading state, and error
 *
 * @example
 * const { data: canSetRole, isLoading } = usePermission('user', 'set-role')
 * if (canSetRole) {
 *   // Show change role button
 * }
 */
export function usePermission(namespace: string, action: string) {
	const { data: session } = useSession()

	// Only check permissions for roles with admin panel access
	const canAccessAdmin = hasRole(session?.user?.role, ROLE_GROUPS.ADMIN_PANEL_ACCESS)

	return useQuery({
		queryKey: ['permission', namespace, action],
		queryFn: async () => {
			const result = await authClient.admin.hasPermission({
				permissions: {
					[namespace]: [action]
				} as any // Type assertion for custom permission namespaces
			})

			// Better Auth returns { data: { success: boolean, error: null }, error: Error | null }
			if (result.error) {
				throw new Error(result.error.message || 'Failed to check permission')
			}

			// Extract boolean from nested response structure
			// result.data = { success: boolean, error: null }
			return (result as any).data?.success ?? false
		},
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
		gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
		enabled: canAccessAdmin, // Only run for roles with admin access
	})
}

/**
 * Hook to check multiple permissions at once
 * More efficient than multiple usePermission calls
 *
 * @param permissions - Object with namespace as key and actions array as value
 * @returns Object with permission status, loading state, and error
 *
 * @example
 * const { data: hasPermissions } = usePermissions({
 *   user: ['create', 'delete'],
 *   session: ['list']
 * })
 * // Returns true only if user has ALL specified permissions
 */
export function usePermissions(permissions: Record<string, string[]>) {
	const { data: session } = useSession()

	const canAccessAdmin = hasRole(session?.user?.role, ROLE_GROUPS.ADMIN_PANEL_ACCESS)

	// Create a stable query key from permissions object
	const queryKey = ['permissions', JSON.stringify(permissions)]

	return useQuery({
		queryKey,
		queryFn: async () => {
			const result = await authClient.admin.hasPermission({
				permissions: permissions as any
			})

			if (result.error) {
				throw new Error(result.error.message || 'Failed to check permissions')
			}

			// Extract boolean from nested response: result.data.success
			return (result as any).data?.success ?? false
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		enabled: canAccessAdmin,
	})
}

/**
 * Hook to preload common permissions
 * Call this in admin layout to cache permissions before user needs them
 *
 * @param permissionList - Array of [namespace, action] tuples
 *
 * @example
 * usePreloadPermissions([
 *   ['user', 'set-role'],
 *   ['user', 'ban'],
 *   ['user', 'delete']
 * ])
 */
export function usePreloadPermissions(permissionList: Array<[string, string]>) {
	const { data: session } = useSession()

	const canAccessAdmin = hasRole(session?.user?.role, ROLE_GROUPS.ADMIN_PANEL_ACCESS)

	// Fire all permission checks in parallel
	// They'll be cached for later use
	permissionList.forEach(([namespace, action]) => {
		useQuery({
			queryKey: ['permission', namespace, action],
			queryFn: async () => {
				const result = await authClient.admin.hasPermission({
					permissions: {
						[namespace]: [action]
					} as any
				})
				// Extract boolean from nested response: result.data.success
				return (result as any).data?.success ?? false
			},
			staleTime: 5 * 60 * 1000,
			gcTime: 10 * 60 * 1000,
			enabled: canAccessAdmin,
		})
	})
}
