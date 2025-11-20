'use client'

/**
 * Weekly Trends Chart Component
 * Bar chart showing 7-day heart rate and SpO2 trends
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useDailyAggregates } from '@/hooks/use-measurements'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts'
import { HEART_RATE_THRESHOLDS, SPO2_THRESHOLDS } from '@/lib/types/measurement'
import { format, parseISO } from 'date-fns'

const chartConfig = {
  heartRate: {
    label: 'Heart Rate',
    color: '#f97316' // Warm orange for heart rate
  },
  spO2: {
    label: 'SpO2',
    color: '#06b6d4' // Soft cyan for SpO2
  }
} satisfies ChartConfig

interface WeeklyTrendsChartProps {
  deviceId?: string
}

export function WeeklyTrendsChart({ deviceId }: WeeklyTrendsChartProps) {
  const { data: aggregates, isLoading, error } = useDailyAggregates(7, deviceId)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !aggregates || aggregates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Trends</CardTitle>
          <CardDescription>7-day heart rate and SpO2 overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            {error ? 'Unable to load chart data' : 'No data available for the past 7 days'}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for chart
  const chartData = aggregates.map((day) => ({
    date: format(parseISO(day.date), 'EEE'), // Mon, Tue, etc.
    fullDate: format(parseISO(day.date), 'MMM d'), // Jan 15
    heartRate: Math.round(day.averageHeartRate),
    spO2: Math.round(day.averageSpO2),
    count: day.count
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Trends</CardTitle>
        <CardDescription>
          Daily average heart rate and oxygen saturation over the past 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />

              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#f97316"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                domain={[40, 120]}
                label={{
                  value: 'Heart Rate (bpm)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12, fill: '#f97316' }
                }}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#06b6d4"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                domain={[85, 100]}
                label={{
                  value: 'SpO2 (%)',
                  angle: 90,
                  position: 'insideRight',
                  style: { fontSize: 12, fill: '#06b6d4' }
                }}
              />

              {/* Normal range reference lines */}
              <ReferenceLine
                yAxisId="left"
                y={HEART_RATE_THRESHOLDS.normal.min}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                strokeOpacity={0.3}
              />
              <ReferenceLine
                yAxisId="left"
                y={HEART_RATE_THRESHOLDS.normal.max}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                strokeOpacity={0.3}
              />
              <ReferenceLine
                yAxisId="right"
                y={SPO2_THRESHOLDS.normal.min}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                strokeOpacity={0.3}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value, payload) => {
                      if (payload && payload[0]) {
                        return `${payload[0].payload.fullDate} (${payload[0].payload.count} measurements)`
                      }
                      return value
                    }}
                    formatter={(value, name) => {
                      if (name === 'heartRate') {
                        return [`${value} bpm`, 'Heart Rate']
                      }
                      if (name === 'spO2') {
                        return [`${value}%`, 'SpO2']
                      }
                      return [value, name]
                    }}
                  />
                }
              />

              <ChartLegend content={<ChartLegendContent />} />

              <Bar
                yAxisId="left"
                dataKey="heartRate"
                fill="var(--color-heartRate)"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                yAxisId="right"
                dataKey="spO2"
                fill="var(--color-spO2)"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
