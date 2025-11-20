"use client"

import { useState, useEffect } from "react"
import { useListUsers } from "@/hooks/use-admin"
import { DataTable } from "./data-table"
import { columns } from "./columns"

const PAGE_SIZE = 20

/**
 * User list with data table
 */
export function UserList() {
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(0)
	const [debouncedSearch, setDebouncedSearch] = useState("")

	// Debounce search to avoid too many API calls
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search)
			setPage(0) // Reset to first page when search changes
		}, 300)

		return () => clearTimeout(timer)
	}, [search])

	const { data, isLoading, error } = useListUsers({
		search: debouncedSearch.toLowerCase(),
		limit: PAGE_SIZE,
		offset: page * PAGE_SIZE,
		sortBy: "createdAt",
		sortDirection: "desc"
	})

	const pageCount = data?.total ? Math.ceil(data.total / PAGE_SIZE) : 0

	if (error) {
		return (
			<div className="rounded-lg border border-destructive bg-destructive/10 p-4">
				<p className="text-sm text-destructive">Failed to load users: {error.message}</p>
			</div>
		)
	}

	return (
		<div className="p-6">
			<DataTable
				columns={columns}
				data={data?.users || []}
				searchPlaceholder="Search by name or email..."
				pageCount={pageCount}
				pageIndex={page}
				pageSize={PAGE_SIZE}
				totalCount={data?.total || 0}
				onSearchChange={setSearch}
				onPageChange={setPage}
				searchValue={search}
				isLoading={isLoading}
			/>
		</div>
	)
}
