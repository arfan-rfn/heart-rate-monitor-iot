import { createAuthClient } from "better-auth/react"
import { magicLinkClient, adminClient } from "better-auth/client/plugins"
import { env } from "@/env"
import { toAbsoluteUrl } from "@/lib/utils"

export const authClient = createAuthClient({
	baseURL: `${env.NEXT_PUBLIC_API_URL}/auth`,
	plugins: [
		magicLinkClient(),
		adminClient()
	],
	fetchOptions: {
		credentials: 'include',
		// Don't cache auth requests to ensure fresh session data
		cache: 'no-store' as RequestCache,
	},
})

// Export the useSession hook from Better Auth
export const useSession = authClient.useSession

// Export auth types for better TypeScript support
export type AuthUser = Awaited<ReturnType<typeof authClient.accountInfo>>
export type AuthSession = Awaited<ReturnType<typeof authClient.getSession>>

// Helper functions for common auth operations
export const auth = {
	// Sign in with email and password
	signInWithEmail: async (email: string, password: string) => {
		return await authClient.signIn.email({
			email,
			password,
		})
	},

	// Sign in with Google
	signInWithGoogle: async (callbackURL?: string) => {
		const absoluteCallbackURL = toAbsoluteUrl(callbackURL || "/dashboard")

		return await authClient.signIn.social({
			provider: "google",
			callbackURL: absoluteCallbackURL,
		})
	},

	// Sign in with Apple
	signInWithApple: async (callbackURL?: string) => {
		const absoluteCallbackURL = toAbsoluteUrl(callbackURL || "/dashboard")

		return await authClient.signIn.social({
			provider: "apple",
			callbackURL: absoluteCallbackURL,
		})
	},

	// Sign up with email and password
	signUpWithEmail: async ({ email, password, name }: { email: string, password: string, name: string }) => {
		return await authClient.signUp.email({
			email,
			password,
			name,
		})
	},

	// Sign in with magic link
	signInWithMagicLink: async (email: string, callbackURL?: string) => {
		const redirectURL = callbackURL || "/dashboard"
		// Build the verification URL with the redirect parameter
		const verifyURL = `/auth/magic-link/verify?redirect=${encodeURIComponent(redirectURL)}`
		const absoluteCallbackURL = toAbsoluteUrl(verifyURL)
		const errorCallbackURL = toAbsoluteUrl("/auth/sign-in")

		return await authClient.signIn.magicLink({
			email,
			callbackURL: absoluteCallbackURL,
			errorCallbackURL: errorCallbackURL,
		})
	},

	// Verify magic link token
	verifyMagicLink: async (token: string) => {
		return await authClient.magicLink.verify({
			query: {
				token,
			},
		})
	},

	// Sign out
	signOut: async () => {
		return await authClient.signOut()
	},

	// Get current user
	getUser: async () => {
		const session = await authClient.getSession()
		return session?.data?.user
	},

	// Get current session
	getSession: async () => {
		return await authClient.getSession()
	},

	// Check if user is authenticated
	isAuthenticated: async () => {
		const session = await authClient.getSession()
		return !!session
	},

	// Delete user account with email verification
	deleteUser: async (callbackURL?: string) => {
		const absoluteCallbackURL = toAbsoluteUrl(callbackURL || "/auth/account-deleted")

		return await authClient.deleteUser({
			callbackURL: absoluteCallbackURL,
		})
	},
}
