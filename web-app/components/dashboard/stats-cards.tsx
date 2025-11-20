'use client'

/**
 * Stats Cards Component
 * Displays weekly summary statistics with real-time data
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, Heart, Droplets, TrendingUp, TrendingDown } from 'lucide-react'
import { useWeeklySummary } from '@/hooks/use-measurements'
import { isAbnormalHeartRate, isAbnormalSpO2 } from '@/lib/types/measurement'

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  trend?: 'up' | 'down'
  isWarning?: boolean
}

function StatCard({ title, value, subtitle, icon, trend, isWarning }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={isWarning ? 'text-red-500' : 'text-muted-foreground'}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${isWarning ? 'text-red-600' : ''}`}>
          {value}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {trend && (
            <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
              {trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
            </span>
          )}
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  deviceId?: string
}

export function StatsCards({ deviceId }: StatsCardsProps) {
  const { data: summary, isLoading, error } = useWeeklySummary(deviceId)

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Unable to load statistics
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasAbnormalHR =
    isAbnormalHeartRate(summary.averageHeartRate) ||
    isAbnormalHeartRate(summary.minHeartRate) ||
    isAbnormalHeartRate(summary.maxHeartRate)

  const hasAbnormalSpO2 =
    isAbnormalSpO2(summary.averageSpO2) ||
    isAbnormalSpO2(summary.minSpO2) ||
    isAbnormalSpO2(summary.maxSpO2)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Avg Heart Rate"
        value={`${Math.round(summary.averageHeartRate)} bpm`}
        subtitle="Last 7 days"
        icon={<Heart className="h-4 w-4" />}
        isWarning={isAbnormalHeartRate(summary.averageHeartRate)}
      />

      <StatCard
        title="Heart Rate Range"
        value={`${summary.minHeartRate}-${summary.maxHeartRate}`}
        subtitle="Min-Max BPM"
        icon={<Activity className="h-4 w-4" />}
        isWarning={hasAbnormalHR}
      />

      <StatCard
        title="Avg SpO2"
        value={`${Math.round(summary.averageSpO2)}%`}
        subtitle="Oxygen saturation"
        icon={<Droplets className="h-4 w-4" />}
        isWarning={isAbnormalSpO2(summary.averageSpO2)}
      />

      <StatCard
        title="Total Measurements"
        value={summary.totalMeasurements}
        subtitle={`${Math.round(summary.totalMeasurements / 7)} per day`}
        icon={<Activity className="h-4 w-4" />}
      />
    </div>
  )
}
