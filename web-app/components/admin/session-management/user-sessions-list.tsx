"use client"

import { useListUserSessions } from "@/hooks/use-admin"
import { SessionDataTable } from "./session-data-table"
import { columns } from "./columns"

interface UserSessionsListProps {
	userId: string
}

/**
 * Table displaying all sessions for a specific user
 */
export function UserSessionsList({ userId }: UserSessionsListProps) {
	const { data, isLoading, error, refetch } = useListUserSessions({ userId })

	if (error) {
		return (
			<div className="rounded-lg border border-destructive bg-destructive/10 p-4">
				<p className="text-sm text-destructive">Failed to load sessions: {error.message}</p>
			</div>
		)
	}

	return (
		<SessionDataTable
			columns={columns}
			data={data?.sessions || []}
			isLoading={isLoading}
			onRefresh={refetch}
		/>
	)
}
