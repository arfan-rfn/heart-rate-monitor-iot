"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Icons } from "@/components/icons"
import { ProfileSkeleton } from "@/components/ui/skeletons"

interface DashboardLayoutProps {
  children: ReactNode
  profileModal: ReactNode
  welcomeModal: ReactNode
}

export default function DashboardLayout({
  children,
  profileModal,
  welcomeModal,
}: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/sign-in")
    }
  }, [isAuthenticated, router, isLoading])

  // Show loading state while checking authentication
  if (isLoading) {
    return <ProfileSkeleton />
  }

  // Don't render dashboard content for unauthenticated users
  if (!isAuthenticated) {
    return null
  }

  return (
    <div>
      {children}
      {profileModal}
      {welcomeModal}
    </div>
  )
}