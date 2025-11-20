"use client"

import * as React from "react"
import {
	ColumnDef,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"
import { UserDetailsDialog } from "./user-details-dialog"
import type { User } from "@/lib/types/auth"

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	searchPlaceholder?: string
	pageCount: number
	pageIndex: number
	pageSize: number
	totalCount: number
	onSearchChange: (search: string) => void
	onPageChange: (page: number) => void
	searchValue: string
	isLoading?: boolean
}

export function DataTable<TData, TValue>({
	columns,
	data,
	searchPlaceholder = "Search...",
	pageCount,
	pageIndex,
	pageSize,
	totalCount,
	onSearchChange,
	onPageChange,
	searchValue,
	isLoading,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
	const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
	const [dialogOpen, setDialogOpen] = React.useState(false)

	const handleUserClick = (user: TData) => {
		setSelectedUser(user as unknown as User)
		setDialogOpen(true)
	}

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		manualPagination: true,
		pageCount,
		state: {
			sorting,
			columnVisibility,
			pagination: {
				pageIndex,
				pageSize,
			},
		},
		meta: {
			onUserClick: handleUserClick,
		},
	})

	return (
		<div className="space-y-4">
			{/* Toolbar */}
			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-1 items-center gap-2">
					<div className="relative w-full max-w-sm">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={searchPlaceholder}
							value={searchValue}
							onChange={(event) => onSearchChange(event.target.value)}
							className="pl-10 h-10"
						/>
					</div>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm" className="h-10 gap-2">
							<SlidersHorizontal className="h-4 w-4" />
							View
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-[200px]">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) => column.toggleVisibility(!!value)}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								)
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Table */}
			<div className="rounded-md border border-border/40">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									<div className="flex items-center justify-center">
										<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
									</div>
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="hover:bg-muted/50 transition-colors"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									<div className="flex flex-col items-center justify-center text-muted-foreground">
										<Search className="h-8 w-8 mb-2 opacity-50" />
										<p>No results found</p>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					{totalCount > 0 ? (
						<>
							Showing {pageIndex * pageSize + 1} to{" "}
							{Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount} user(s)
						</>
					) : (
						"0 users"
					)}
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(pageIndex - 1)}
						disabled={pageIndex === 0 || isLoading}
					>
						<ChevronLeft className="h-4 w-4 mr-1" />
						Previous
					</Button>
					<div className="text-sm text-muted-foreground">
						Page {pageIndex + 1} of {pageCount || 1}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(pageIndex + 1)}
						disabled={pageIndex >= pageCount - 1 || isLoading}
					>
						Next
						<ChevronRight className="h-4 w-4 ml-1" />
					</Button>
				</div>
			</div>

			{/* User Details Dialog */}
			<UserDetailsDialog
				user={selectedUser}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
			/>
		</div>
	)
}
