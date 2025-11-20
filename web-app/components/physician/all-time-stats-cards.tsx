'use client'

import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  Droplets,
  Activity,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react'
import type { AllTimeStats } from '@/lib/types/physician'

interface AllTimeStatsCardsProps {
  stats: AllTimeStats
}

export function AllTimeStatsCards({ stats }: AllTimeStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Measurements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Measurements</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMeasurements.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.daysTracked} {stats.daysTracked === 1 ? 'day' : 'days'} tracked
          </p>
        </CardContent>
      </Card>

      {/* Tracking Period */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tracking Period</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.firstMeasurement && stats.lastMeasurement ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">First</p>
                  <p className="text-sm font-medium">
                    {format(new Date(stats.firstMeasurement), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Latest</p>
                  <p className="text-sm font-medium">
                    {format(new Date(stats.lastMeasurement), 'MMM dd, yyyy')}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Heart Rate Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
          <Heart className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.heartRate?.overallAverage?.toFixed(1) ?? '-'}{' '}
            <span className="text-sm font-normal text-muted-foreground">bpm</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <TrendingDown className="h-3 w-3 text-blue-500" />
              <span>{stats.heartRate?.overallMin ?? '-'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-orange-500" />
              <span>{stats.heartRate?.overallMax ?? '-'}</span>
            </div>
          </div>
          {stats.heartRate?.lowestRecorded && stats.heartRate?.highestRecorded && (
            <div className="mt-3 pt-3 border-t space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Lowest</span>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {stats.heartRate.lowestRecorded.value} bpm
                  </Badge>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Highest</span>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {stats.heartRate.highestRecorded.value} bpm
                  </Badge>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SpO2 Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SpO2</CardTitle>
          <Droplets className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.spO2?.overallAverage?.toFixed(1) ?? '-'}{' '}
            <span className="text-sm font-normal text-muted-foreground">%</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <TrendingDown className="h-3 w-3 text-blue-500" />
              <span>{stats.spO2?.overallMin ?? '-'}%</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-orange-500" />
              <span>{stats.spO2?.overallMax ?? '-'}%</span>
            </div>
          </div>
          {stats.spO2?.lowestRecorded && stats.spO2?.highestRecorded && (
            <div className="mt-3 pt-3 border-t space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Lowest</span>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {stats.spO2.lowestRecorded.value}%
                  </Badge>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Highest</span>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {stats.spO2.highestRecorded.value}%
                  </Badge>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
