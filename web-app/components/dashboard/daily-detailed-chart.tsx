'use client'

/**
 * Daily Detailed Chart Component
 * Area chart with dual Y-axes showing detailed heart rate and SpO2 for a specific day
 */

import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { useDailyMeasurements } from '@/hooks/use-measurements'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Dot
} from 'recharts'
import {
  HEART_RATE_THRESHOLDS,
  SPO2_THRESHOLDS,
  QUALITY_COLORS,
  type MeasurementQuality
} from '@/lib/types/measurement'
import { format, parseISO, subDays } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { QualityIndicator } from './quality-indicator'
import { ThresholdAlerts } from './threshold-alerts'

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

// Custom dot component to show quality colors
function QualityDot(props: any) {
  const { cx, cy, payload } = props
  if (!payload || !payload.quality) return null

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={3}
      fill={QUALITY_COLORS[payload.quality as MeasurementQuality]}
      stroke="white"
      strokeWidth={1}
    />
  )
}

export function DailyDetailedChart() {
  // Default to today
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  const { data: dailyData, isLoading, error } = useDailyMeasurements(dateStr)

  const goToPreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1))
  }

  const goToNextDay = () => {
    setSelectedDate((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() + 1)
      // Don't go beyond today
      return next <= new Date() ? next : prev
    })
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !dailyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Detailed View</CardTitle>
          <CardDescription>
            Detailed measurements for {format(selectedDate, 'MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Unable to load measurements
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for chart
  const chartData = dailyData.measurements.map((m) => ({
    time: format(parseISO(m.timestamp), 'HH:mm'),
    fullTime: format(parseISO(m.timestamp), 'h:mm a'),
    heartRate: m.heartRate,
    spO2: m.spO2,
    quality: m.quality,
    confidence: m.confidence
  }))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily Detailed View</CardTitle>
              <CardDescription>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')} • {dailyData.count} measurements
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousDay}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                disabled={isToday}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Today
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNextDay}
                disabled={isToday}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No measurements for this day
            </div>
          ) : (
            <>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorHeartRate" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#f97316"
                          stopOpacity={0.7}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f97316"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                      <linearGradient id="colorSpO2" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#06b6d4"
                          stopOpacity={0.7}
                        />
                        <stop
                          offset="95%"
                          stopColor="#06b6d4"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    {/* Normal range reference areas */}
                    <ReferenceArea
                      yAxisId="left"
                      y1={HEART_RATE_THRESHOLDS.normal.min}
                      y2={HEART_RATE_THRESHOLDS.normal.max}
                      fill="hsl(var(--muted))"
                      fillOpacity={0.1}
                    />
                    <ReferenceArea
                      yAxisId="right"
                      y1={SPO2_THRESHOLDS.normal.min}
                      y2={100}
                      fill="hsl(var(--muted))"
                      fillOpacity={0.1}
                    />

                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                      interval="preserveStartEnd"
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

                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value, payload) => {
                            if (payload && payload[0]) {
                              return payload[0].payload.fullTime
                            }
                            return value
                          }}
                          formatter={(value, name, item) => {
                            const quality = item.payload.quality
                            const confidence = item.payload.confidence

                            if (name === 'heartRate') {
                              return [
                                <div key="hr" className="flex items-center gap-2">
                                  <span>{value} bpm</span>
                                  <QualityIndicator quality={quality} showLabel={false} />
                                  <span className="text-muted-foreground text-xs">
                                    ({Math.round(confidence * 100)}%)
                                  </span>
                                </div>,
                                'Heart Rate'
                              ]
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

                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="heartRate"
                      stroke="#f97316"
                      fill="url(#colorHeartRate)"
                      strokeWidth={2.5}
                      dot={<QualityDot />}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="spO2"
                      stroke="#06b6d4"
                      fill="url(#colorSpO2)"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Quality legend */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <span>Quality:</span>
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: QUALITY_COLORS.good }}
                  />
                  <span>Good</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: QUALITY_COLORS.fair }}
                  />
                  <span>Fair</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: QUALITY_COLORS.poor }}
                  />
                  <span>Poor</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Threshold alerts for the selected day */}
      {dailyData && dailyData.measurements.length > 0 && (
        <ThresholdAlerts measurements={dailyData} />
      )}
    </div>
  )
}
