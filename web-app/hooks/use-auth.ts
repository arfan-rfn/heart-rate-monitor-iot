"use client"

import { useSession as useBetterAuthSession } from "@/lib/auth"
import { authClient } from "@/lib/auth"

export function useAuth() {
	// Use Better Auth's built-in useSession hook - it handles caching and state management
	const { data: session, isPending: isLoading, error, refetch } = useBetterAuthSession()

	// Extract user from session data
	const user = session?.user || null
	const isAuthenticated = !!user

	// Wrapped signOut - Better Auth's session listener will handle state updates automatically
	const signOut = async () => {
		try {
			await authClient.signOut()
			// Refetch session after sign out to update state
			await refetch()
		} catch (error) {
			console.error("Failed to sign out:", error)
		}
	}

	return {
		user,
		session,
		isLoading,
		isAuthenticated,
		error,
		signIn: authClient.signIn,
		signUp: authClient.signUp,
		signOut,
		refresh: refetch,
	}
}
