"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCreateUser } from "@/hooks/use-admin"
import { useSession } from "@/lib/auth"
import { canPerformActionOnUser } from "@/lib/constants/roles"
import { toast } from "sonner"

const createUserSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	role: z.enum(["user", "admin"]).optional(),  // Better Auth API only supports user and admin
})

type CreateUserForm = z.infer<typeof createUserSchema>

interface CreateUserDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Dialog to create a new user
 */
export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
	const { mutate: createUser, isPending } = useCreateUser()
	const { data: session } = useSession()
	const currentUserRole = session?.user?.role

	const form = useForm<CreateUserForm>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			role: "user",
		},
	})

	const onSubmit = (data: CreateUserForm) => {
		// Validate role hierarchy before creating user
		const targetRole = data.role || 'user'

		if (!canPerformActionOnUser(currentUserRole, targetRole)) {
			toast.error(
				`Cannot create users with ${targetRole} role. You can only create users with lower privileges than your own.`
			)
			return
		}

		createUser(data, {
			onSuccess: () => {
				form.reset()
				onOpenChange(false)
			},
		})
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New User</DialogTitle>
					<DialogDescription>
						Add a new user to the system. They will be able to sign in immediately.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="John Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="john@example.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="••••••••" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="role"
							render={({ field }) => {
								// Filter roles based on current user's privilege
								// Note: Better Auth API only supports creating users with 'user' or 'admin' roles
								// To create moderators, create as user first then use set-role
								const availableRoles = [
									{ value: 'user', label: 'User' },
									{ value: 'admin', label: 'Admin' },
								].filter(role =>
									canPerformActionOnUser(currentUserRole, role.value)
								)

								return (
									<FormItem>
										<FormLabel>Role</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a role" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{availableRoles.map(role => (
													<SelectItem key={role.value} value={role.value}>
														{role.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)
							}}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? 'Creating...' : 'Create User'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
