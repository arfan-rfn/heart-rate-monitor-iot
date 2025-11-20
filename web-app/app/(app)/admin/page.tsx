"use client"

import { useListUsers } from "@/hooks/use-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Shield, Ban, UserCheck, ArrowRight, Activity } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

/**
 * Admin dashboard with overview statistics
 */
export default function AdminDashboardPage() {
	const { data, isLoading } = useListUsers({ limit: 1000 })

	const stats = {
		totalUsers: data?.users?.length || 0,
		adminUsers: data?.users?.filter(u => u.role === 'admin').length || 0,
		bannedUsers: data?.users?.filter(u => u.banned).length || 0,
		verifiedUsers: data?.users?.filter(u => u.emailVerified).length || 0,
	}

	const statCards = [
		{
			title: "Total Users",
			value: stats.totalUsers,
			description: "All registered users",
			icon: Users,
			color: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-50 dark:bg-blue-950/20",
		},
		{
			title: "Admins",
			value: stats.adminUsers,
			description: "Users with admin role",
			icon: Shield,
			color: "text-purple-600 dark:text-purple-400",
			bgColor: "bg-purple-50 dark:bg-purple-950/20",
		},
		{
			title: "Banned",
			value: stats.bannedUsers,
			description: "Currently banned users",
			icon: Ban,
			color: "text-red-600 dark:text-red-400",
			bgColor: "bg-red-50 dark:bg-red-950/20",
		},
		{
			title: "Verified",
			value: stats.verifiedUsers,
			description: "Email verified users",
			icon: UserCheck,
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-50 dark:bg-green-950/20",
		},
	]

	return (
		<div className="space-y-8">
			{/* Page Header */}
			<h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
				Dashboard
			</h1>

			{/* Statistics cards */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{statCards.map((stat, index) => (
					<Card
						key={stat.title}
						className={cn(
							"group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/40",
							"animate-in fade-in-50 slide-in-from-bottom-4"
						)}
						style={{ animationDelay: `${index * 100}ms` }}
					>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{stat.title}
							</CardTitle>
							<div className={cn("p-2.5 rounded-lg transition-colors", stat.bgColor)}>
								<stat.icon className={cn("h-4 w-4", stat.color)} />
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-1">
								<div className="text-3xl font-bold tracking-tight">
									{isLoading ? (
										<div className="h-9 w-16 bg-muted animate-pulse rounded" />
									) : (
										stat.value
									)}
								</div>
								<p className="text-xs text-muted-foreground">
									{stat.description}
								</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Quick actions */}
			<Card className="border-border/40 overflow-hidden">
				<CardHeader className="border-b bg-muted/30">
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5 text-primary" />
						Quick Actions
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="grid gap-4 md:grid-cols-2">
						<Link href="/admin/users" className="group">
							<div className="flex items-start gap-4 p-4 rounded-lg border border-border/40 transition-all duration-200 hover:border-primary/50 hover:bg-muted/30 hover:shadow-md">
								<div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/30 transition-colors">
									<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								</div>
								<div className="flex-1 space-y-1">
									<h3 className="font-medium group-hover:text-primary transition-colors">
										Manage Users
									</h3>
									<p className="text-sm text-muted-foreground">
										View, create, edit, ban, or delete users
									</p>
								</div>
								<ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
							</div>
						</Link>

						<Link href="/admin/sessions" className="group">
							<div className="flex items-start gap-4 p-4 rounded-lg border border-border/40 transition-all duration-200 hover:border-primary/50 hover:bg-muted/30 hover:shadow-md">
								<div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 group-hover:bg-purple-100 dark:group-hover:bg-purple-950/30 transition-colors">
									<Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
								</div>
								<div className="flex-1 space-y-1">
									<h3 className="font-medium group-hover:text-primary transition-colors">
										Monitor Sessions
									</h3>
									<p className="text-sm text-muted-foreground">
										View and manage active user sessions
									</p>
								</div>
								<ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
							</div>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
