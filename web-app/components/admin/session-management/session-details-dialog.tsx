"use client"

import { useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Monitor,
	MapPin,
	Calendar,
	Clock,
	Copy,
	Check,
	Shield,
	Fingerprint,
	User,
} from "lucide-react"
import type { Session } from "@/lib/types/auth"
import { formatDistance } from "date-fns"

/**
 * Parse user agent to get browser and OS info
 */
function parseUserAgent(userAgent: string | undefined): { browser: string; os: string; full: string } {
	if (!userAgent) return { browser: "Unknown", os: "Unknown", full: "Unknown" }

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

	return { browser, os, full: userAgent }
}

/**
 * Copy button with feedback
 */
function CopyButton({ text, label }: { text: string; label: string }) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		await navigator.clipboard.writeText(text)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={handleCopy}
			className="h-7 gap-2"
		>
			{copied ? (
				<>
					<Check className="h-3.5 w-3.5 text-green-600" />
					<span className="text-xs">Copied!</span>
				</>
			) : (
				<>
					<Copy className="h-3.5 w-3.5" />
					<span className="text-xs">{label}</span>
				</>
			)}
		</Button>
	)
}

/**
 * Detail row component
 */
function DetailRow({ icon: Icon, label, value, copyable }: {
	icon: React.ComponentType<{ className?: string }>
	label: string
	value: string | React.ReactNode
	copyable?: string
}) {
	return (
		<div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
			<div className="mt-0.5 shrink-0">
				<Icon className="h-4 w-4 text-muted-foreground" />
			</div>
			<div className="flex-1 min-w-0 overflow-hidden">
				<div className="text-xs text-muted-foreground mb-1">{label}</div>
				<div className="text-sm font-medium break-words overflow-wrap-anywhere">{value}</div>
			</div>
			{copyable && (
				<div className="shrink-0">
					<CopyButton text={copyable} label="Copy" />
				</div>
			)}
		</div>
	)
}

interface SessionDetailsDialogProps {
	session: Session | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Session details dialog showing all session information
 */
export function SessionDetailsDialog({ session, open, onOpenChange }: SessionDetailsDialogProps) {
	if (!session) return null

	const { browser, os, full } = parseUserAgent(session.userAgent ?? undefined)
	const isExpired = new Date(session.expiresAt) < new Date()

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Session Details</DialogTitle>
					<DialogDescription>
						Complete information for this session
					</DialogDescription>
				</DialogHeader>

				{/* Session Header */}
				<div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border/40">
					<div className="p-3 bg-primary/10 rounded-full">
						<Monitor className="h-8 w-8 text-primary" />
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-lg">{browser} on {os}</h3>
						<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
							<MapPin className="h-3.5 w-3.5" />
							<span>{session.ipAddress || "Unknown location"}</span>
						</div>
						<div className="flex items-center gap-2 mt-2">
							<Badge
								variant={isExpired ? "destructive" : "outline"}
								className="font-normal"
							>
								{isExpired ? "Expired" : "Active"}
							</Badge>
							{session.impersonatedBy && (
								<Badge variant="outline" className="gap-1 font-medium text-orange-700 border-orange-200 bg-orange-50 dark:text-orange-400 dark:border-orange-900 dark:bg-orange-950/30">
									<Shield className="h-3 w-3" />
									Impersonated
								</Badge>
							)}
						</div>
					</div>
				</div>

				{/* Session Details */}
				<div className="space-y-1">
					<h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
						<Fingerprint className="h-4 w-4" />
						Session Information
					</h4>

					<DetailRow
						icon={Fingerprint}
						label="Session ID"
						value={<span className="font-mono text-xs break-all">{session.id}</span>}
						copyable={session.id}
					/>

					<DetailRow
						icon={User}
						label="User ID"
						value={<span className="font-mono text-xs break-all">{session.userId}</span>}
						copyable={session.userId}
					/>

					<DetailRow
						icon={MapPin}
						label="IP Address"
						value={session.ipAddress || "Unknown"}
						copyable={session.ipAddress ?? undefined}
					/>

					<DetailRow
						icon={Monitor}
						label="Browser"
						value={browser}
					/>

					<DetailRow
						icon={Monitor}
						label="Operating System"
						value={os}
					/>

					<DetailRow
						icon={Monitor}
						label="Full User Agent"
						value={<span className="text-xs break-all">{full}</span>}
						copyable={full}
					/>

					<DetailRow
						icon={Calendar}
						label="Session Created"
						value={new Date(session.createdAt).toLocaleString('en-US', {
							dateStyle: 'full',
							timeStyle: 'short'
						})}
					/>

					<DetailRow
						icon={Clock}
						label="Expires At"
						value={
							<div className="flex items-center gap-2">
								<span>
									{new Date(session.expiresAt).toLocaleString('en-US', {
										dateStyle: 'full',
										timeStyle: 'short'
									})}
								</span>
								<Badge variant={isExpired ? "destructive" : "secondary"} className="font-normal">
									{isExpired ? "Expired" : formatDistance(new Date(session.expiresAt), new Date(), { addSuffix: true })}
								</Badge>
							</div>
						}
					/>

					{session.impersonatedBy && (
						<DetailRow
							icon={Shield}
							label="Impersonated By"
							value={<span className="font-mono text-xs break-all">{session.impersonatedBy}</span>}
							copyable={session.impersonatedBy}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
