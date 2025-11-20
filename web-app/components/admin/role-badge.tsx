import { Badge } from "@/components/ui/badge"
import { Shield, ShieldAlert, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoleBadgeProps {
	role: string
	className?: string
}

/**
 * Display user role as a styled badge with icon
 */
export function RoleBadge({ role, className }: RoleBadgeProps) {
	const getRoleConfig = (role: string) => {
		switch (role.toLowerCase()) {
			case 'admin':
				return {
					icon: Shield,
					color: 'bg-primary/10 text-primary border-primary/20',
					label: 'Admin'
				}
			case 'moderator':
				return {
					icon: ShieldAlert,
					color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900',
					label: 'Moderator'
				}
			case 'user':
				return {
					icon: User,
					color: 'bg-muted text-muted-foreground border-border',
					label: 'User'
				}
			default:
				return {
					icon: User,
					color: 'bg-muted text-muted-foreground border-border',
					label: role
				}
		}
	}

	const config = getRoleConfig(role)
	const Icon = config.icon

	return (
		<Badge
			variant="outline"
			className={cn(
				"gap-1 font-medium",
				config.color,
				className
			)}
		>
			<Icon className="h-3 w-3" />
			{config.label}
		</Badge>
	)
}
