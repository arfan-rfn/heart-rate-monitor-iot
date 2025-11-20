"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SessionActionsMenu } from "./session-actions-menu"
import { ArrowUpDown, Monitor, MapPin, Calendar, Clock, Copy, Check, Shield } from "lucide-react"
import type { Session } from "@/lib/types/auth"
import { useState } from "react"
import { formatDistance } from "date-fns"

/**
 * Parse user agent to get browser and OS info
 */
function parseUserAgent(userAgent: string | undefined): { browser: string; os: string } {
	if (!userAgent) return { browser: "Unknown", os: "Unknown" }

	// Simple parsing - you could use a library like ua-parser-js for more accurate parsing
	let browser = "Unknown"
	let os = "Unknown"

	// Detect OS
	if (userAgent.includes("Windows")) os = "Windows"
	else if (userAgent.includes("Mac")) os = "macOS"
	else if (userAgent.includes("Linux")) os = "Linux"
	else if (userAgent.includes("Android")) os = "Android"
	else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS"

	// Detect Browser
	if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) browser = "Chrome"
	else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari"
	else if (userAgent.includes("Firefox")) browser = "Firefox"
	else if (userAgent.includes("Edg")) browser = "Edge"

	return { browser, os }
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
			title="Copy Session ID"
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
 * Column definitions for the sessions data table
 */
export const columns: ColumnDef<Session>[] = [
	{
		accessorKey: "id",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4 h-8 data-[state=open]:bg-accent"
				>
					Session
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row, table }) => {
			const session = row.original
			const { browser, os } = parseUserAgent(session.userAgent ?? undefined)
			// Access the onSessionClick callback from table meta
			const onSessionClick = (table.options.meta as any)?.onSessionClick

			return (
				<div
					className="flex flex-col min-w-0 py-2 -mx-2 px-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-muted/50 group"
					onClick={() => onSessionClick?.(session)}
				>
					<div className="flex items-center gap-2">
						<Monitor className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
						<span className="font-medium text-sm group-hover:text-primary transition-colors">{browser} on {os}</span>
					</div>
					<div className="flex items-center gap-1 text-xs text-muted-foreground/70 font-mono mt-1">
						<span className="truncate" title={session.id}>ID: {session.id.slice(0, 12)}...</span>
						<CopyButton text={session.id} />
					</div>
				</div>
			)
		},
	},
	{
		accessorKey: "userId",
		header: "User ID",
		cell: ({ row }) => {
			const userId = row.getValue("userId") as string
			return (
				<div className="flex items-center gap-2">
					<span className="font-mono text-xs text-muted-foreground truncate max-w-[120px]" title={userId}>
						{userId.slice(0, 12)}...
					</span>
					<CopyButton text={userId} />
				</div>
			)
		},
	},
	{
		accessorKey: "ipAddress",
		header: "Location",
		cell: ({ row }) => {
			const ipAddress = row.getValue("ipAddress") as string | undefined
			return (
				<div className="flex items-center gap-2">
					<MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
					<span className="text-sm">{ipAddress || "Unknown"}</span>
				</div>
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
				<div className="flex items-center gap-2">
					<Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
					<Badge variant="secondary" className="font-normal">
						{formatDistance(date, new Date(), { addSuffix: true })}
					</Badge>
				</div>
			)
		},
	},
	{
		accessorKey: "expiresAt",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4 h-8 data-[state=open]:bg-accent"
				>
					Expires
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			const date = new Date(row.getValue("expiresAt"))
			const isExpired = date < new Date()

			return (
				<div className="flex items-center gap-2">
					<Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
					<Badge
						variant={isExpired ? "destructive" : "outline"}
						className="font-normal"
					>
						{isExpired ? "Expired" : formatDistance(date, new Date(), { addSuffix: true })}
					</Badge>
				</div>
			)
		},
	},
	{
		accessorKey: "impersonatedBy",
		header: "Impersonated",
		cell: ({ row }) => {
			const impersonatedBy = row.getValue("impersonatedBy") as string | null
			return impersonatedBy ? (
				<Badge variant="outline" className="gap-1 font-medium text-orange-700 border-orange-200 bg-orange-50 dark:text-orange-400 dark:border-orange-900 dark:bg-orange-950/30">
					<Shield className="h-3 w-3" />
					Yes
				</Badge>
			) : (
				<span className="text-sm text-muted-foreground">-</span>
			)
		},
	},
	{
		id: "actions",
		cell: ({ row, table }) => {
			// Access the onSessionClick callback from table meta
			const onSessionClick = (table.options.meta as any)?.onSessionClick

			return (
				<SessionActionsMenu
					session={row.original}
					onViewDetails={onSessionClick}
				/>
			)
		},
	},
]
