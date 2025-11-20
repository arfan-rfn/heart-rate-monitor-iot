"use client"

import { useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUpdateUser } from "@/hooks/use-admin"
import type { User } from "@/lib/types/auth"

const editUserSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
})

type EditUserForm = z.infer<typeof editUserSchema>

interface EditUserDialogProps {
	user: User
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Dialog to edit user details
 */
export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
	const { mutate: updateUser, isPending } = useUpdateUser()

	const form = useForm<EditUserForm>({
		resolver: zodResolver(editUserSchema),
		defaultValues: {
			name: user.name,
			email: user.email,
		},
	})

	// Update form when user changes
	useEffect(() => {
		form.reset({
			name: user.name,
			email: user.email,
		})
	}, [user, form])

	const onSubmit = (data: EditUserForm) => {
		updateUser(
			{
				userId: user.id,
				data,
			},
			{
				onSuccess: () => {
					onOpenChange(false)
				},
			}
		)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit User</DialogTitle>
					<DialogDescription>
						Update user information. Changes will take effect immediately.
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

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? 'Saving...' : 'Save Changes'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
