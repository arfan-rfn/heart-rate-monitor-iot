"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { useUser } from "@/hooks/use-user"
import { useUserProfile } from "@/hooks/use-user-management"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Icons } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: user, isLoading: userLoading } = useUser()
  const { data: profile, isLoading: profileLoading } = useUserProfile()
  const router = useRouter()

  // Combined loading state
  const isLoading = authLoading || userLoading

  // Show welcome modal for users with incomplete profiles
  useEffect(() => {
    if (user && !user.profileCompleted && isAuthenticated && !isLoading) {
      router.push('/dashboard/welcome')
    }
  }, [user, isAuthenticated, isLoading, router])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Centered Profile Section */}
        <div className="pt-12 sm:pt-20">
          <div className="text-center space-y-6">
            <Avatar className="size-24 mx-auto">
              <AvatarImage
                src={user?.avatarUrl || undefined}
                alt={user?.name || user?.email}
              />
              <AvatarFallback className="bg-muted" delayMs={50}>
                <Icons.User className="w-10 h-10 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-foreground">
                {profile?.user.name || user?.name || 'User'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {profile?.user.email || user?.email}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => router.push('/dashboard/edit')}
                className="flex-1 max-w-[150px]"
              >
                <Icons.Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                onClick={() => router.push('/settings')}
                variant="outline"
                className="flex-1 max-w-[150px]"
              >
                <Icons.Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Health Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Devices Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Registered Devices
              </CardTitle>
              <Icons.Smartphone className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profileLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  profile?.stats.deviceCount || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active monitoring devices
              </p>
              <Button
                variant="link"
                className="px-0 mt-2 h-auto text-xs"
                onClick={() => router.push('/devices')}
              >
                Manage devices
                <Icons.ChevronRight className="size-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Recent Measurements Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Measurements
              </CardTitle>
              <Icons.Heart className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profileLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  profile?.stats.recentMeasurementCount || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last 7 days
              </p>
              <Button
                variant="link"
                className="px-0 mt-2 h-auto text-xs"
                onClick={() => router.push('/measurements')}
              >
                View history
                <Icons.ChevronRight className="size-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Health Status Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Health Status
              </CardTitle>
              <Icons.BarChart className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Good
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All metrics within normal range
              </p>
              <Button
                variant="link"
                className="px-0 mt-2 h-auto text-xs"
                onClick={() => router.push('/analytics')}
              >
                View analytics
                <Icons.ChevronRight className="size-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.Settings className="size-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => router.push('/settings/profile')}
              >
                <Icons.User className="size-4 mr-2" />
                <span>Update Profile</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => router.push('/settings/security')}
              >
                <Icons.Lock className="size-4 mr-2" />
                <span>Change Password</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => router.push('/devices')}
              >
                <Icons.Smartphone className="size-4 mr-2" />
                <span>Add Device</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => router.push('/measurements')}
              >
                <Icons.Heart className="size-4 mr-2" />
                <span>View Measurements</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Guide (only show if no devices) */}
        {!profileLoading && (profile?.stats.deviceCount === 0) && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.AlertCircle className="size-5 text-primary" />
                Getting Started
              </CardTitle>
              <CardDescription>
                Set up your first device to start monitoring your health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary shrink-0">1.</span>
                  <span>Register your IoT heart rate monitoring device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary shrink-0">2.</span>
                  <span>Configure device settings and measurement frequency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary shrink-0">3.</span>
                  <span>Start receiving real-time health data</span>
                </li>
              </ol>
              <Button onClick={() => router.push('/devices')}>
                <Icons.Smartphone className="size-4 mr-2" />
                Register Your First Device
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="pt-12 sm:pt-20">
          <div className="text-center space-y-8">
            <Skeleton className="size-24 rounded-full mx-auto" />
            <div className="space-y-2 flex flex-col items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
            <div className="flex gap-3 justify-center">
              <Skeleton className="h-10 w-[150px]" />
              <Skeleton className="h-10 w-[150px]" />
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-48" />
      </div>
    </div>
  )
}