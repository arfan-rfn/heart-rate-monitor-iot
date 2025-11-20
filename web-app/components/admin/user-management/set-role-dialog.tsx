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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useSetUserRole } from "@/hooks/use-admin"
import type { User, SetRoleInput } from "@/lib/types/auth"

const setRoleSchema = z.object({
	role: z.enum(["user", "admin", "moderator"]),
}) satisfies z.ZodType<Pick<SetRoleInput, "role">>

type SetRoleForm = z.infer<typeof setRoleSchema>

interface SetRoleDialogProps {
	user: User
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Dialog to change user role
 */
export function SetRoleDialog({ user, open, onOpenChange }: SetRoleDialogProps) {
	const { mutate: setRole, isPending } = useSetUserRole()

	const form = useForm<SetRoleForm>({
		resolver: zodResolver(setRoleSchema),
		defaultValues: {
			role: (user.role as SetRoleInput["role"]) || "user",
		},
	})

	// Update form when user changes
	useEffect(() => {
		form.reset({
			role: (user.role as SetRoleInput["role"]) || "user",
		})
	}, [user, form])

	const onSubmit = (data: SetRoleForm) => {
		setRole(
			{
				userId: user.id,
				role: data.role,
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
					<DialogTitle>Change User Role</DialogTitle>
					<DialogDescription>
						Update the role for {user.name}. This will change their permissions immediately.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a role" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="user">User</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
											<SelectItem value="moderator">Moderator</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? 'Updating...' : 'Update Role'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
