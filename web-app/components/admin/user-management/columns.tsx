"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RoleBadge } from "@/components/admin/role-badge"
import { UserActionsMenu } from "./user-actions-menu"
import { CheckCircle2, Mail, ArrowUpDown, CircleCheck, Ban as BanIcon, Copy, Check } from "lucide-react"
import type { User } from "@/lib/types/auth"
import { useState } from "react"

/**
 * Get user initials from name
 */
function getInitials(name: string): string {
	return name
		.split(' ')
		.map(word => word[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

/**
 * Copy button component with feedback
 */
function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async (e: React.MouseEvent) => {
		e.stopPropagation()
		await navigator.clipboard.writeText(text)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<button
			onClick={handleCopy}
			className="ml-1 p-0.5 hover:bg-muted rounded transition-colors"
			title="Copy ID"
		>
			{copied ? (
				<Check className="h-3 w-3 text-green-600" />
			) : (
				<Copy className="h-3 w-3 text-muted-foreground" />
			)}
		</button>
	)
}

/**
 * Column definitions for the users data table
 */
export const columns: ColumnDef<User>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4 h-8 data-[state=open]:bg-accent"
				>
					User
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row, table }) => {
			const user = row.original
			// Access the onUserClick callback from table meta
			const onUserClick = (table.options.meta as any)?.onUserClick

			return (
				<div
					className="flex items-center gap-3 cursor-pointer py-1 -mx-2 px-2 rounded-md transition-all duration-200 hover:bg-muted/50 group"
					onClick={() => onUserClick?.(user)}
				>
					<Avatar className="h-10 w-10 shrink-0 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
						<AvatarImage src={user.image || undefined} alt={user.name} />
						<AvatarFallback className="bg-primary/10 text-primary font-semibold">
							{getInitials(user.name)}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col min-w-0">
						<span className="font-medium truncate group-hover:text-primary transition-colors">{user.name}</span>
						<div className="flex items-center gap-1 text-sm text-muted-foreground">
							<Mail className="h-3 w-3 shrink-0" />
							<span className="truncate">{user.email}</span>
							{user.emailVerified && (
								<CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400" />
							)}
						</div>
						<div className="flex items-center gap-1 text-xs text-muted-foreground/70 font-mono">
							<span className="truncate" title={user.id}>ID: {user.id}</span>
							<CopyButton text={user.id} />
						</div>
					</div>
				</div>
			)
		},
	},
	{
		accessorKey: "role",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4 h-8 data-[state=open]:bg-accent"
				>
					Role
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			return <RoleBadge role={row.getValue("role") || "user"} />
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id))
		},
	},
	{
		accessorKey: "banned",
		header: "Status",
		cell: ({ row }) => {
			const banned = row.getValue("banned")
			return banned ? (
				<Badge variant="outline" className="gap-1 font-medium text-destructive border-destructive/30 bg-destructive/5">
					<BanIcon className="h-3 w-3" />
					Banned
				</Badge>
			) : (
				<Badge variant="outline" className="gap-1 font-medium text-green-700 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-900 dark:bg-green-950/30">
					<CircleCheck className="h-3 w-3" />
					Active
				</Badge>
			)
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id))
		},
	},
	{
		accessorKey: "profileCompleted",
		header: "Profile",
		cell: ({ row }) => {
			const completed = row.getValue("profileCompleted")
			return completed ? (
				<Badge variant="outline" className="gap-1 font-medium bg-background text-muted-foreground border-border">
					<CheckCircle2 className="h-3 w-3" />
					Complete
				</Badge>
			) : (
				<Badge variant="outline" className="gap-1 font-medium text-muted-foreground/50 border-border/50">
					Incomplete
				</Badge>
			)
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4 h-8 data-[state=open]:bg-accent"
				>
					Created
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			const date = new Date(row.getValue("createdAt"))
			return (
				<div className="text-sm text-muted-foreground">
					{date.toLocaleDateString()}
				</div>
			)
		},
	},
	{
		id: "actions",
		cell: ({ row, table }) => {
			// Access the onUserClick callback from table meta
			const onUserClick = (table.options.meta as any)?.onUserClick

			return (
				<UserActionsMenu
					user={row.original}
					onViewProfile={onUserClick}
				/>
			)
		},
	},
]
