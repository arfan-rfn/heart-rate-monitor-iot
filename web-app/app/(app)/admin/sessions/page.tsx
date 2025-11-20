"use client"

import { useState } from "react"
import { useListUserSessions } from "@/hooks/use-admin"
import { SessionDataTable } from "@/components/admin/session-management/session-data-table"
import { columns } from "@/components/admin/session-management/columns"

/**
 * Session management page
 */
export default function AdminSessionsPage() {
	const [userId, setUserId] = useState("")

	const { data, isLoading, error, refetch } = useListUserSessions({ userId })

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
				Session Management
			</h1>

			{/* Error Display */}
			{error && (
				<div className="rounded-lg border border-destructive bg-destructive/10 p-4">
					<p className="text-sm text-destructive">Failed to load sessions: {error.message}</p>
				</div>
			)}

			{/* Sessions Table */}
			<SessionDataTable
				columns={columns}
				data={data?.sessions || []}
				isLoading={isLoading}
				onRefresh={refetch}
				searchValue={userId}
				onSearchChange={setUserId}
				searchPlaceholder="Search by user ID..."
			/>
		</div>
	)
}
