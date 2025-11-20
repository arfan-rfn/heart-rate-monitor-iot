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
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Activity, SlidersHorizontal, RefreshCw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SessionDetailsDialog } from "./session-details-dialog"
import type { Session } from "@/lib/types/auth"

interface SessionDataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	isLoading?: boolean
	onRefresh?: () => void
	searchValue?: string
	onSearchChange?: (value: string) => void
	searchPlaceholder?: string
}

export function SessionDataTable<TData, TValue>({
	columns,
	data,
	isLoading,
	onRefresh,
	searchValue = "",
	onSearchChange,
	searchPlaceholder = "Search by user ID...",
}: SessionDataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
	const [selectedSession, setSelectedSession] = React.useState<Session | null>(null)
	const [dialogOpen, setDialogOpen] = React.useState(false)

	const handleSessionClick = (session: TData) => {
		setSelectedSession(session as unknown as Session)
		setDialogOpen(true)
	}

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnVisibility,
		},
		meta: {
			onSessionClick: handleSessionClick,
		},
	})

	return (
		<div className="space-y-4">
			{/* Toolbar */}
			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-1 items-center gap-2">
					{onSearchChange ? (
						<div className="relative w-full max-w-sm">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder={searchPlaceholder}
								value={searchValue}
								onChange={(event) => onSearchChange(event.target.value)}
								className="pl-10 h-10"
							/>
						</div>
					) : (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Activity className="h-4 w-4" />
							<span>{data.length} active {data.length === 1 ? 'session' : 'sessions'}</span>
						</div>
					)}
				</div>
				<div className="flex items-center gap-2">
					{onRefresh && (
						<Button
							variant="outline"
							size="sm"
							onClick={onRefresh}
							disabled={isLoading}
							className="h-10 gap-2"
						>
							<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
							Refresh
						</Button>
					)}
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
										<Activity className="h-8 w-8 mb-2 opacity-50" />
										<p>No active sessions</p>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Results count */}
			{data.length > 0 && (
				<div className="text-sm text-muted-foreground">
					{data.length} active {data.length === 1 ? 'session' : 'sessions'}
				</div>
			)}

			{/* Session Details Dialog */}
			<SessionDetailsDialog
				session={selectedSession}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
			/>
		</div>
	)
}
