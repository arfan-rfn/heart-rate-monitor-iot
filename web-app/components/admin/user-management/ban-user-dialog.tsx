"use client"

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
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useBanUser } from "@/hooks/use-admin"
import type { User } from "@/lib/types/auth"

const banUserSchema = z.object({
	reason: z.string().optional(),
	expiresAt: z.string().optional(),
})

type BanUserForm = z.infer<typeof banUserSchema>

interface BanUserDialogProps {
	user: User
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Dialog to ban a user with optional reason and expiration
 */
export function BanUserDialog({ user, open, onOpenChange }: BanUserDialogProps) {
	const { mutate: banUser, isPending } = useBanUser()

	const form = useForm<BanUserForm>({
		resolver: zodResolver(banUserSchema),
		defaultValues: {
			reason: "",
			expiresAt: "",
		},
	})

	const onSubmit = (data: BanUserForm) => {
		banUser(
			{
				userId: user.id,
				reason: data.reason || undefined,
				expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
			},
			{
				onSuccess: () => {
					form.reset()
					onOpenChange(false)
				},
			}
		)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Ban User</DialogTitle>
					<DialogDescription>
						Ban {user.name} from accessing the system. You can optionally set a reason and expiration date.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="reason"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Reason (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Reason for banning this user..."
											{...field}
										/>
									</FormControl>
									<FormDescription>
										The reason will be visible to administrators
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="expiresAt"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Expires At (Optional)</FormLabel>
									<FormControl>
										<Input type="datetime-local" {...field} />
									</FormControl>
									<FormDescription>
										Leave empty for permanent ban
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isPending}
								variant="destructive"
							>
								{isPending ? 'Banning...' : 'Ban User'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
