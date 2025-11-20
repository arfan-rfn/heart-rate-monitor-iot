"use client"

import { useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RoleBadge } from "@/components/admin/role-badge"
import {
	CheckCircle2,
	Mail,
	Calendar,
	User as UserIcon,
	Copy,
	Check,
	CircleCheck,
	Ban as BanIcon,
	Shield,
	Globe,
} from "lucide-react"
import type { User } from "@/lib/types/auth"

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

interface UserDetailsDialogProps {
	user: User | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * User details dialog showing all user information
 */
export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
	if (!user) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>User Details</DialogTitle>
					<DialogDescription>
						Complete information for this user account
					</DialogDescription>
				</DialogHeader>

				{/* User Header */}
				<div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border/40">
					<Avatar className="h-16 w-16 shrink-0">
						<AvatarImage src={user.image || undefined} alt={user.name} />
						<AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
							{getInitials(user.name)}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-lg truncate">{user.name}</h3>
						<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
							<Mail className="h-3.5 w-3.5" />
							<span className="truncate">{user.email}</span>
							{user.emailVerified && (
								<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
							)}
						</div>
						<div className="flex items-center gap-2 mt-2">
							<RoleBadge role={user.role || "user"} />
							{user.banned ? (
								<Badge variant="outline" className="gap-1 font-medium text-destructive border-destructive/30 bg-destructive/5">
									<BanIcon className="h-3 w-3" />
									Banned
								</Badge>
							) : (
								<Badge variant="outline" className="gap-1 font-medium text-green-700 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-900 dark:bg-green-950/30">
									<CircleCheck className="h-3 w-3" />
									Active
								</Badge>
							)}
							{(user as any).profileCompleted && (
								<Badge variant="outline" className="gap-1 font-medium">
									<CheckCircle2 className="h-3 w-3" />
									Profile Complete
								</Badge>
							)}
						</div>
					</div>
				</div>

				{/* User Details */}
				<div className="space-y-1">
					<h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
						<UserIcon className="h-4 w-4" />
						Account Information
					</h4>

					<DetailRow
						icon={Shield}
						label="User ID"
						value={<span className="font-mono text-xs break-all">{user.id}</span>}
						copyable={user.id}
					/>

					<DetailRow
						icon={Mail}
						label="Email Address"
						value={user.email}
						copyable={user.email}
					/>

					<DetailRow
						icon={CheckCircle2}
						label="Email Verified"
						value={user.emailVerified ? (
							<span className="text-green-600 dark:text-green-400">Yes</span>
						) : (
							<span className="text-muted-foreground">No</span>
						)}
					/>

					<DetailRow
						icon={UserIcon}
						label="Role"
						value={<RoleBadge role={user.role || "user"} />}
					/>

					<DetailRow
						icon={Calendar}
						label="Account Created"
						value={new Date(user.createdAt).toLocaleString('en-US', {
							dateStyle: 'full',
							timeStyle: 'short'
						})}
					/>

					<DetailRow
						icon={Calendar}
						label="Last Updated"
						value={new Date(user.updatedAt).toLocaleString('en-US', {
							dateStyle: 'full',
							timeStyle: 'short'
						})}
					/>

					{user.image && (
						<DetailRow
							icon={Globe}
							label="Profile Image"
							value={
								<a
									href={user.image}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline break-all block"
								>
									{user.image}
								</a>
							}
						/>
					)}

					{(user as any).profileCompleted !== undefined && (
						<DetailRow
							icon={CheckCircle2}
							label="Profile Completed"
							value={(user as any).profileCompleted ? (
								<span className="text-green-600 dark:text-green-400">Yes</span>
							) : (
								<span className="text-muted-foreground">No</span>
							)}
						/>
					)}

					{(user as any).profileCompletedAt && (
						<DetailRow
							icon={Calendar}
							label="Profile Completed At"
							value={new Date((user as any).profileCompletedAt).toLocaleString('en-US', {
								dateStyle: 'full',
								timeStyle: 'short'
							})}
						/>
					)}

					{(user as any).firstLoginAt && (
						<DetailRow
							icon={Calendar}
							label="First Login"
							value={new Date((user as any).firstLoginAt).toLocaleString('en-US', {
								dateStyle: 'full',
								timeStyle: 'short'
							})}
						/>
					)}

					{user.banned && (
						<DetailRow
							icon={BanIcon}
							label="Account Status"
							value={
								<Badge variant="outline" className="gap-1 font-medium text-destructive border-destructive/30 bg-destructive/5">
									<BanIcon className="h-3 w-3" />
									Banned
								</Badge>
							}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
