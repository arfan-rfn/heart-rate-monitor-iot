"use client"

import { useSession } from "@/lib/auth"
import { useStopImpersonating } from "@/hooks/use-admin"
import { Button } from "@/components/ui/button"
import { Shield, X } from "lucide-react"

/**
 * Banner shown when admin is impersonating a user
 * Fixed at top of page with prominent warning styling
 */
export function ImpersonationBanner() {
	const { data: session } = useSession()
	const { mutate: stopImpersonating, isPending } = useStopImpersonating()

	// Better Auth returns session as: { session: {...}, user: {...} }
	// The impersonatedBy field is on session.session, not session directly
	// @ts-ignore - impersonatedBy is added by Better Auth admin plugin
	const impersonatedBy = session?.session?.impersonatedBy

	// Don't render if not impersonating
	if (!impersonatedBy) {
		return null
	}

	return (
		<div className="fixed top-0 left-0 right-0 z-50 bg-destructive/80 text-destructive-foreground border-b shadow-md">
			<div className="container">
				<div className="flex items-center justify-between gap-3 py-2.5 px-4">
					<div className="flex items-center gap-2.5 flex-1 min-w-0">
						<div className="flex-shrink-0 p-1 bg-background/10 rounded">
							<Shield className="h-3.5 w-3.5" />
						</div>
						<div className="flex items-center gap-2 text-sm font-medium min-w-0">
							<span className="hidden sm:inline">Impersonating:</span>
							<span className="font-semibold truncate">
								{session.user?.name || session.user?.email}
							</span>
						</div>
					</div>
					<Button
						variant="default"
						// size="sm"
						onClick={() => stopImpersonating()}
						disabled={isPending}
						className="flex-shrink-0 h-8"
					>
						{isPending ? (
							<span className="text-xs">Stopping...</span>
						) : (
							<>
								<X className="h-3.5 w-3.5 sm:mr-1.5" />
								<span className="hidden sm:inline text-xs font-semibold">Stop Impersonating</span>
								<span className="sm:hidden text-xs font-semibold">Exit</span>
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	)
}
