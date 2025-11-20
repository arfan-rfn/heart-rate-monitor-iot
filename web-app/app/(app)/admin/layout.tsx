"use client"

import { AdminGuard } from "@/components/admin/admin-guard"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { usePreloadPermissions } from "@/hooks/use-permission"
import { COMMON_ADMIN_PERMISSIONS } from "@/lib/constants/permissions"
import { LayoutDashboard, Users, Activity } from "lucide-react"
import { Icons } from "@/components/icons"

interface AdminLayoutProps {
	children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	// Preload common permissions to cache them before user interacts
	usePreloadPermissions(COMMON_ADMIN_PERMISSIONS as any)

	return (
		<AdminGuard>
			<div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
				<div className="container py-8 space-y-8">
					{/* Navigation */}
					<div className="space-y-3">
						<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
							<Icons.Shield className="size-4" />
							Admin Panel
						</span>
						<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
							<nav className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg w-full sm:w-fit backdrop-blur-sm border border-border/40 min-w-max">
								<AdminNavLink href="/admin" icon={LayoutDashboard}>
									Dashboard
								</AdminNavLink>
								<AdminNavLink href="/admin/users" icon={Users}>
									Users
								</AdminNavLink>
								<AdminNavLink href="/admin/sessions" icon={Activity}>
									Sessions
								</AdminNavLink>
							</nav>
						</div>
					</div>

					{/* Page content */}
					<div className="animate-in fade-in-50 duration-300">
						{children}
					</div>
				</div>
			</div>
		</AdminGuard>
	)
}

function AdminNavLink({
	href,
	children,
	icon: Icon
}: {
	href: string
	children: React.ReactNode
	icon: React.ElementType
}) {
	const pathname = usePathname()
	const isActive = pathname === href

	return (
		<Link
			href={href}
			className={cn(
				"flex items-center gap-1.5 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
				"sm:gap-2 sm:px-4",
				"hover:bg-background/80 hover:shadow-sm",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				isActive
					? "bg-background text-foreground shadow-sm border border-border/50"
					: "text-muted-foreground hover:text-foreground"
			)}
		>
			<Icon className={cn(
				"h-4 w-4 shrink-0 transition-colors",
				isActive ? "text-primary" : "text-muted-foreground"
			)} />
			<span className="whitespace-nowrap">{children}</span>
		</Link>
	)
}
