"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/components/providers/auth-provider"
import { useUser } from "@/hooks/use-user"
import { useCanAccessAdmin } from "@/hooks/use-admin"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Icons } from "./icons"

/**
 * AccountButton displays a sign-in button if not authenticated,
 * or an account dropdown with avatar, dashboard, and sign out if authenticated.
 * Responsive and accessible.
 */
export function AccountButton() {
	const { isAuthenticated, isLoading: authLoading, signOut, refresh } = useAuthContext()
	const { data: user, isLoading: userLoading } = useUser()
	const { canAccess: canAccessAdmin } = useCanAccessAdmin()
	const router = useRouter()

	// Combined loading state
	const isLoading = authLoading || userLoading

	// Helper: render avatar component
	const renderAvatar = () => {
		return (
			<Avatar className="size-8">
				<AvatarImage
					src={user?.avatarUrl || undefined}
					alt={user?.name || user?.email || "User"}
				/>
				<AvatarFallback className="text-xs font-medium">
					<Icons.User className="size-4" />
				</AvatarFallback>
			</Avatar>
		)
	}

	// Handle sign out
	const handleSignOut = async () => {
		await signOut()
		// Manual refresh as fallback in case session listener doesn't work
		setTimeout(() => {
			refresh()
		}, 100)
		router.push("/auth/sign-in")
	}

	// Loading state: show skeleton
	if (isLoading) {
		return (
			<Icons.Loader className="size-9 p-1 animate-spin text-muted-foreground" />
		)
	}

	// Not authenticated: show sign in button
	if (!isAuthenticated) {
		return (
			<Button asChild size="sm" className="w-full md:w-auto">
				<Link href="/auth/sign-in">Sign In</Link>
			</Button>
		)
	}

	// Authenticated: show account dropdown
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative flex items-center justify-center size-10 focus-visible:ring-2 focus-visible:ring-ring"
					aria-label="Account menu"
				>
					{renderAvatar()}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<div className="flex items-center space-x-3 px-2 py-2">
					{renderAvatar()}
					<div className="min-w-0 flex-1">
						<div className="truncate font-medium text-sm">
							{user?.name || user?.email || "Account"}
						</div>
						{user?.email && (
							<div className="truncate text-xs text-muted-foreground">
								{user.email}
							</div>
						)}
					</div>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => router.push("/dashboard")}
					className="cursor-pointer space-x-2"
				>
					<Icons.Home className="size-4" />
					<span>Dashboard</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => router.push("/settings")}
					className="cursor-pointer space-x-2"
				>
					<Icons.Settings className="size-4" />
					<span>Settings</span>
				</DropdownMenuItem>
				{canAccessAdmin && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => router.push("/admin")}
							className="cursor-pointer space-x-2"
						>
							<Icons.Shield className="size-4" />
							<span>Admin Panel</span>
						</DropdownMenuItem>
					</>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleSignOut}
					className="text-destructive focus:text-destructive cursor-pointer space-x-2"
				>
					<Icons.LogOut className="size-4" />
					<span>Sign Out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
