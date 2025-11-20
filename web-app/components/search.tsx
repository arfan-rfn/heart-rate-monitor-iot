"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AlertDialogProps } from "@radix-ui/react-alert-dialog"
import { useTheme } from "next-themes"
import { Icons } from "./icons"

import { cn } from "@/lib/utils"
import { searchSuggestion } from "@/config/search-suggestion"
import { useSearch, useLoadMore, type CategoryState } from "@/hooks/use-search"
import type { UserSearchResult } from "@/lib/types/search"

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "./ui/command"
import { Button } from "./ui/button"
import { Kbd, KbdGroup } from "./ui/kbd"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"

export function Search({ ...props }: AlertDialogProps) {
	const router = useRouter()
	const [open, setOpen] = React.useState(false)
	const { setTheme } = useTheme()
	const [isMac, setIsMac] = React.useState(false)
	const [searchQuery, setSearchQuery] = React.useState("")

	// State for users pagination
	const [usersState, setUsersState] = React.useState<CategoryState<UserSearchResult>>({
		items: [],
		page: 1,
		hasMore: false,
		isLoadingMore: false,
	})

	// Main search hook
	const { data: searchData, isLoading, error } = useSearch(searchQuery, {
		category: "all",
		limit: 5,
	})

	// Always enable filtering for static suggestions
	// cmdk will filter both static suggestions and API results
	const shouldFilter = true

	// Load more hook for users
	const { data: loadMoreData, refetch: loadMoreUsers } = useLoadMore(
		searchQuery,
		"users",
		usersState.page + 1
	)

	React.useEffect(() => {
		// Detect OS
		setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform))
	}, [])

	// Update users state when search results change
	React.useEffect(() => {
		if (searchData?.results.users) {
			setUsersState({
				items: searchData.results.users.items,
				page: searchData.results.users.page,
				hasMore: searchData.results.users.hasMore,
				isLoadingMore: false,
			})
		} else {
			// Reset state when no results
			setUsersState({
				items: [],
				page: 1,
				hasMore: false,
				isLoadingMore: false,
			})
		}
	}, [searchData])

	// Handle load more data
	React.useEffect(() => {
		if (loadMoreData?.results.users) {
			setUsersState((prev) => ({
				items: [...prev.items, ...loadMoreData.results.users!.items],
				page: loadMoreData.results.users!.page,
				hasMore: loadMoreData.results.users!.hasMore,
				isLoadingMore: false,
			}))
		}
	}, [loadMoreData])

	// Reset search query when dialog closes
	React.useEffect(() => {
		if (!open) {
			setSearchQuery("")
		}
	}, [open])

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
				if (
					(e.target instanceof HTMLElement && e.target.isContentEditable) ||
					e.target instanceof HTMLInputElement ||
					e.target instanceof HTMLTextAreaElement ||
					e.target instanceof HTMLSelectElement
				) {
					return
				}

				e.preventDefault()
				setOpen((open) => !open)
			}
		}

		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down)
	}, [])

	const runCommand = React.useCallback((command: () => unknown) => {
		setOpen(false)
		command()
	}, [])

	const handleLoadMore = React.useCallback(async () => {
		if (usersState.isLoadingMore || !usersState.hasMore) return

		setUsersState((prev) => ({ ...prev, isLoadingMore: true }))
		await loadMoreUsers()
	}, [usersState.isLoadingMore, usersState.hasMore, loadMoreUsers])

	return (
		<>
			<Button
				variant="outline"
				className={cn(
					"relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
				)}
				onClick={() => setOpen(true)}
				{...props}
			>
				<Icons.Search className="mr-2 size-4" />
				<span className="inline-flex">Search...</span>
				<KbdGroup className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden sm:inline-flex">
					<Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
					<Kbd>K</Kbd>
				</KbdGroup>
			</Button>
			<CommandDialog open={open} onOpenChange={setOpen} shouldFilter={shouldFilter}>
				<CommandInput
					placeholder="Type a command or search..."
					value={searchQuery}
					onValueChange={setSearchQuery}
				/>
				<CommandList>
					<CommandEmpty>
						{searchQuery.length === 0 ? "Type a command or search..." :
						 searchQuery.length === 1 ? "Type at least 2 characters to search..." :
						 "No results found."}
					</CommandEmpty>

					{/* Static Suggestions - Always visible and filtered by cmdk */}
					{searchSuggestion.map((group) => (
						<CommandGroup key={group.title} heading={group.title}>
							{group.items && group.items.map((navItem) => (
								<CommandItem
									key={navItem.href}
									value={navItem.title}
									onSelect={() => {
										runCommand(() => router.push(navItem.href as string))
									}}
								>
									<div className="mr-2 flex size-4 items-center justify-center">
										<Icons.Circle className="size-3" />
									</div>
									{navItem.title}
								</CommandItem>
							))}
						</CommandGroup>
					))}

					{/* Theme Switcher - Always visible */}
					<CommandSeparator />
					<CommandGroup heading="Theme">
						<CommandItem value="Light theme" onSelect={() => runCommand(() => setTheme("light"))}>
							<Icons.Sun className="mr-2 size-4" />
							Light
						</CommandItem>
						<CommandItem value="Dark theme" onSelect={() => runCommand(() => setTheme("dark"))}>
							<Icons.Moon className="mr-2 size-4" />
							Dark
						</CommandItem>
						<CommandItem value="System theme" onSelect={() => runCommand(() => setTheme("system"))}>
							<Icons.System className="mr-2 size-4" />
							System
						</CommandItem>
					</CommandGroup>

					{/* API Search Results - Show when query >= 2 and loading/loaded */}
					{searchQuery.length >= 2 && (
						<>
							{isLoading ? (
								<CommandGroup heading="Users">
									<div className="flex items-center justify-center py-6">
										<Icons.Spinner className="h-6 w-6 animate-spin" />
									</div>
								</CommandGroup>
							) : error ? (
								<CommandGroup heading="Users">
									<div className="flex flex-col items-center gap-2 py-4">
										<Icons.AlertCircle className="h-8 w-8 text-destructive" />
										<p className="text-sm">Failed to fetch search results</p>
									</div>
								</CommandGroup>
							) : usersState.items.length > 0 ? (
								<>
									<CommandSeparator />
									<CommandGroup heading={`Users (${searchData?.results.users?.total || 0})`}>
										{usersState.items.map((user) => (
											<CommandItem
												key={user.id}
												value={`${user.name} ${user.email}`}
												onSelect={() => {
													if (user.url) {
														runCommand(() => router.push(user.url!))
													}
												}}
											>
												<Avatar className="mr-2 h-6 w-6">
													<AvatarImage src={user.image || undefined} alt={user.name} />
													<AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
												</Avatar>
												<div className="flex-1">
													<div className="font-medium">{user.name}</div>
													<div className="text-xs text-muted-foreground">{user.email}</div>
												</div>
												{user.role && (
													<Badge variant="secondary">{user.role}</Badge>
												)}
											</CommandItem>
										))}
										{/* Load More Button */}
										{usersState.hasMore && (
											<CommandItem
												value="load-more-users"
												onSelect={handleLoadMore}
												disabled={usersState.isLoadingMore}
											>
												<div className="flex items-center gap-2 w-full justify-center">
													{usersState.isLoadingMore ? (
														<>
															<Icons.Spinner className="h-4 w-4 animate-spin" />
															<span>Loading...</span>
														</>
													) : (
														<>
															<Icons.ChevronDown className="h-4 w-4" />
															<span>
																Load {(searchData?.results.users?.total || 0) - usersState.items.length} more users
															</span>
														</>
													)}
												</div>
											</CommandItem>
										)}
									</CommandGroup>
								</>
							) : null}
						</>
					)}
				</CommandList>
			</CommandDialog>
		</>
	)
}