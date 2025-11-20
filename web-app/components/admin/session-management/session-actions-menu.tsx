"use client"

import { MoreHorizontal, Ban, Eye } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useRevokeSession } from "@/hooks/use-admin"
import { usePermission } from "@/hooks/use-permission"
import { PERMISSIONS } from "@/lib/constants/permissions"
import type { Session } from "@/lib/types/auth"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface SessionActionsMenuProps {
	session: Session
	onViewDetails?: (session: Session) => void
}

/**
 * Dropdown menu with actions for a session
 */
export function SessionActionsMenu({ session, onViewDetails }: SessionActionsMenuProps) {
	const [revokeOpen, setRevokeOpen] = useState(false)

	// Permission check
	const { data: canRevoke = false } = usePermission(...PERMISSIONS.SESSION.REVOKE)

	const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession()

	const handleRevoke = () => {
		revokeSession({ sessionId: session.id })
		setRevokeOpen(false)
	}

	// Check if session is already expired
	const isExpired = new Date(session.expiresAt) < new Date()

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="h-8 w-8 p-0 border-border/40 hover:bg-muted hover:border-border"
						onClick={(e) => e.stopPropagation()}
					>
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />

					{/* View Details - always available */}
					<DropdownMenuItem onClick={() => onViewDetails?.(session)}>
						<Eye className="mr-2 h-4 w-4" />
						View Details
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					{/* Revoke session */}
					{canRevoke && !isExpired && (
						<DropdownMenuItem
							onClick={() => setRevokeOpen(true)}
							className="text-destructive focus:text-destructive"
						>
							<Ban className="mr-2 h-4 w-4" />
							Revoke Session
						</DropdownMenuItem>
					)}

					{isExpired && (
						<DropdownMenuItem disabled>
							<Ban className="mr-2 h-4 w-4" />
							Already Expired
						</DropdownMenuItem>
					)}

					{!canRevoke && (
						<DropdownMenuItem disabled>
							No actions available
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Revoke confirmation */}
			<AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
				<AlertDialogContent onClick={(e) => e.stopPropagation()}>
					<AlertDialogHeader>
						<AlertDialogTitle>Revoke Session?</AlertDialogTitle>
						<AlertDialogDescription>
							This will immediately revoke this session and log the user out.
							The user will need to sign in again.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRevoke}
							disabled={isRevoking}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isRevoking ? 'Revoking...' : 'Revoke Session'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
