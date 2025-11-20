"use client"

import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { ImpersonationBanner } from "@/components/admin/impersonation-banner"
import { useIsImpersonating } from "@/hooks/use-admin"

interface AppLayoutProps {
	children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
	const { isImpersonating } = useIsImpersonating()

	return (
		<>
			<ImpersonationBanner />
			{/* Add top padding when impersonating to prevent banner overlap */}
			<div className={isImpersonating ? "pt-12" : ""}>
				<SiteHeader />
				<div className="container flex-1">{children}</div>
				<Footer />
			</div>
		</>
	)
}