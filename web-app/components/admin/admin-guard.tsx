"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCanAccessAdmin } from "@/hooks/use-admin"

interface AdminGuardProps {
	children: React.ReactNode
}

/**
 * Component to protect admin routes
 * Redirects users without admin panel access to dashboard
 */
export function AdminGuard({ children }: AdminGuardProps) {
	const { canAccess, isLoading } = useCanAccessAdmin()
	const router = useRouter()

	useEffect(() => {
		if (!isLoading && !canAccess) {
			router.push('/dashboard')
		}
	}, [canAccess, isLoading, router])

	// Show loading state while checking admin access
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="flex flex-col items-center gap-2">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-sm text-muted-foreground">Verifying access...</p>
				</div>
			</div>
		)
	}

	// Don't render anything if user doesn't have access
	if (!canAccess) {
		return null
	}

	return <>{children}</>
}
