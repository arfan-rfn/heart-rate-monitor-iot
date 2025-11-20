"use client"

/**
 * Dashboard Page
 * Main dashboard with heart rate monitoring visualizations and real-time updates
 */

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"
import { Icons } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { WeeklyTrendsChart } from "@/components/dashboard/weekly-trends-chart"
import { DailyDetailedChart } from "@/components/dashboard/daily-detailed-chart"
import { ExportModal } from "@/components/dashboard/export-modal"
import { RefreshCw } from "lucide-react"
import { useWeeklySummary } from "@/hooks/use-measurements"
import { format } from "date-fns"

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: user, isLoading: userLoading } = useUser()
  const { data: summary, isLoading: summaryLoading, refetch, dataUpdatedAt } = useWeeklySummary()
  const router = useRouter()

  // Combined loading state
  const isLoading = authLoading || userLoading

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage
                src={user?.avatarUrl || undefined}
                alt={user?.name || user?.email}
              />
              <AvatarFallback className="bg-muted" delayMs={50}>
                <Icons.User className="w-8 h-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Health Monitoring Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {dataUpdatedAt && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Updated {format(dataUpdatedAt, 'h:mm a')}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <ExportModal />
          </div>
        </div>

        {/* Real-time Stats Cards */}
        <StatsCards />

        {/* Getting Started Guide (only show if no devices) */}
        {!userLoading && (user?.deviceCount === 0) && (
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
                  <span>Start receiving real-time health data and view your trends</span>
                </li>
              </ol>
              <Button onClick={() => router.push('/devices')}>
                <Icons.Smartphone className="size-4 mr-2" />
                Register Your First Device
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Weekly Trends Chart */}
        <div id="weekly-trends-chart">
          <WeeklyTrendsChart />
        </div>

        {/* Daily Detailed Chart */}
        <div id="daily-detailed-chart">
          <DailyDetailedChart />
        </div>

        {/* Device Management Quick Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Smartphone className="size-5" />
                  Your Devices
                </CardTitle>
                <CardDescription>
                  Manage your monitoring devices
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {user?.deviceCount || 0} {user?.deviceCount === 1 ? 'device' : 'devices'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/devices')}
              >
                <Icons.Smartphone className="size-4 mr-2" />
                Manage Devices
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/settings')}
              >
                <Icons.Settings className="size-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Auto-refresh notice */}
        <div className="text-center text-xs text-muted-foreground pb-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Dashboard auto-refreshes every 60 seconds</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        {/* Charts Skeleton */}
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[500px]" />
      </div>
    </div>
  )
}
