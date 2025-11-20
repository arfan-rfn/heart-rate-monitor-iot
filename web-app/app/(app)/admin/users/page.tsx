"use client"

import { useState } from "react"
import { UserList } from "@/components/admin/user-management/user-list"
import { CreateUserDialog } from "@/components/admin/user-management/create-user-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import { usePermission } from "@/hooks/use-permission"
import { PERMISSIONS } from "@/lib/constants/permissions"

/**
 * User management page
 */
export default function AdminUsersPage() {
	const [createOpen, setCreateOpen] = useState(false)
	const { data: canCreate = false } = usePermission(...PERMISSIONS.USER.CREATE)

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
					User Management
				</h1>
				{canCreate && (
					<Button
						onClick={() => setCreateOpen(true)}
						size="lg"
						className="gap-2 shadow-sm hover:shadow-md transition-shadow"
					>
						<PlusCircle className="h-4 w-4" />
						Create User
					</Button>
				)}
			</div>

			{/* User List */}
			<Card className="border-border/40 overflow-hidden">
				<UserList />
			</Card>

			<CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	)
}
