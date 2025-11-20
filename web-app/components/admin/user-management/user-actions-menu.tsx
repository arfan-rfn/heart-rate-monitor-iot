"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Shield, Ban, Trash2, Eye, UserCheck, UserCog } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { EditUserDialog } from "./edit-user-dialog"
import { SetRoleDialog } from "./set-role-dialog"
import { BanUserDialog } from "./ban-user-dialog"
import { useRemoveUser, useUnbanUser, useImpersonateUser } from "@/hooks/use-admin"
import { usePermission } from "@/hooks/use-permission"
import { PERMISSIONS } from "@/lib/constants/permissions"
import { canPerformActionOnUser } from "@/lib/constants/roles"
import { useSession } from "@/lib/auth"
import type { User } from "@/lib/types/auth"
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

interface UserActionsMenuProps {
	user: User
	onViewProfile?: (user: User) => void
}

/**
 * Dropdown menu with actions for a user
 */
export function UserActionsMenu({ user, onViewProfile }: UserActionsMenuProps) {
	const [editOpen, setEditOpen] = useState(false)
	const [roleOpen, setRoleOpen] = useState(false)
	const [banOpen, setBanOpen] = useState(false)
	const [deleteOpen, setDeleteOpen] = useState(false)

	// Get current user's session to check their role
	const { data: session } = useSession()
	const currentUserRole = session?.user?.role

	// Permission checks - these check if the user has the permission
	const { data: canUpdatePerm = false } = usePermission(...PERMISSIONS.USER.UPDATE)
	const { data: canSetRolePerm = false } = usePermission(...PERMISSIONS.USER.SET_ROLE)
	const { data: canBanPerm = false } = usePermission(...PERMISSIONS.USER.BAN)
	const { data: canDeletePerm = false } = usePermission(...PERMISSIONS.USER.DELETE)
	const { data: canImpersonatePerm = false } = usePermission(...PERMISSIONS.USER.IMPERSONATE)

	// Role hierarchy checks - combine permission AND hierarchy for ALL actions
	// This prevents privilege escalation (moderator acting on admin/other moderators)
	const canActOnUser = canPerformActionOnUser(currentUserRole, user.role)

	const canUpdate = canUpdatePerm && canActOnUser
	const canSetRole = canSetRolePerm && canActOnUser
	const canBan = canBanPerm && canActOnUser
	const canDelete = canDeletePerm && canActOnUser
	const canImpersonate = canImpersonatePerm && canActOnUser

	const { mutate: removeUser, isPending: isDeleting } = useRemoveUser()
	const { mutate: unbanUser, isPending: isUnbanning } = useUnbanUser()
	const { mutate: impersonate, isPending: isImpersonating } = useImpersonateUser()


	const handleDelete = () => {
		removeUser({ userId: user.id })
		setDeleteOpen(false)
	}

	const handleUnban = () => {
		unbanUser({ userId: user.id })
	}

	const handleImpersonate = () => {
		impersonate({ userId: user.id })
	}

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

					{/* View Profile - always available */}
					<DropdownMenuItem onClick={() => onViewProfile?.(user)}>
						<Eye className="mr-2 h-4 w-4" />
						View Profile
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					{/* Edit - requires permission + role hierarchy check */}
					{canUpdate && (
						<DropdownMenuItem onClick={() => setEditOpen(true)}>
							<Edit className="mr-2 h-4 w-4" />
							Edit User
						</DropdownMenuItem>
					)}

					{/* Change Role - requires permission + role hierarchy check */}
					{canSetRole && (
						<DropdownMenuItem onClick={() => setRoleOpen(true)}>
							<Shield className="mr-2 h-4 w-4" />
							Change Role
						</DropdownMenuItem>
					)}

					{(canUpdate || canSetRole) && <DropdownMenuSeparator />}

					{/* Ban/Unban - requires permission + role hierarchy check */}
					{canBan && (
						user.banned ? (
							<DropdownMenuItem onClick={handleUnban} disabled={isUnbanning}>
								<UserCheck className="mr-2 h-4 w-4" />
								{isUnbanning ? 'Unbanning...' : 'Unban User'}
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem onClick={() => setBanOpen(true)}>
								<Ban className="mr-2 h-4 w-4" />
								Ban User
							</DropdownMenuItem>
						)
					)}

					{/* Impersonate - requires permission + role hierarchy check */}
					{canImpersonate && (
						<DropdownMenuItem onClick={handleImpersonate} disabled={isImpersonating}>
							<UserCog className="mr-2 h-4 w-4" />
							{isImpersonating ? 'Impersonating...' : 'Impersonate'}
						</DropdownMenuItem>
					)}

					{(canBan || canImpersonate) && canDelete && <DropdownMenuSeparator />}

					{/* Delete - requires permission + role hierarchy check */}
					{canDelete && (
						<DropdownMenuItem
							onClick={() => setDeleteOpen(true)}
							className="text-destructive focus:text-destructive"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete User
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Dialogs */}
			<EditUserDialog user={user} open={editOpen} onOpenChange={setEditOpen} />
			<SetRoleDialog user={user} open={roleOpen} onOpenChange={setRoleOpen} />
			<BanUserDialog user={user} open={banOpen} onOpenChange={setBanOpen} />

			{/* Delete confirmation */}
			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the user <strong>{user.name}</strong> ({user.email}).
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? 'Deleting...' : 'Delete User'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
