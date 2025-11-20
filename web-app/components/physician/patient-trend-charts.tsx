'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { HEART_RATE_THRESHOLDS, SPO2_THRESHOLDS } from '@/lib/types/measurement'
import { TREND_DAYS_OPTIONS, type DailyAggregate } from '@/lib/types/physician'

interface PatientTrendChartsProps {
  aggregates: DailyAggregate[]
  defaultDays?: number
  onDaysChange?: (days: number) => void
}

export function PatientTrendCharts({
  aggregates,
  defaultDays = 30,
  onDaysChange,
}: PatientTrendChartsProps) {
  const [selectedDays, setSelectedDays] = useState(defaultDays.toString())

  const handleDaysChange = (value: string) => {
    setSelectedDays(value)
    onDaysChange?.(Number(value))
  }

  // Transform aggregates for charts
  const chartData = aggregates.map((agg) => ({
    date: format(parseISO(agg.date), 'MMM dd'),
    fullDate: agg.date,
    heartRate: agg.averageHeartRate,
    heartRateMin: agg.minHeartRate,
    heartRateMax: agg.maxHeartRate,
    spO2: agg.averageSpO2,
    spO2Min: agg.minSpO2,
    spO2Max: agg.maxSpO2,
    count: agg.count,
  }))

  return (
    <div className="space-y-6">
      {/* Days Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Trend Analysis</h3>
          <p className="text-sm text-muted-foreground">
            View health metrics over different time periods
          </p>
        </div>
        <Select value={selectedDays} onValueChange={handleDaysChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {TREND_DAYS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Heart Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Heart Rate Trend</CardTitle>
          <CardDescription>
            Average daily heart rate with min/max ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis domain={[40, 120]} tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-sm">
                        <p className="text-sm font-medium mb-2">{data.fullDate}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-red-500">
                            Avg: {data.heartRate.toFixed(1)} bpm
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Range: {data.heartRateMin} - {data.heartRateMax} bpm
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.count} measurements
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <ReferenceLine
                y={HEART_RATE_THRESHOLDS.normal.max}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: 'High', fontSize: 10, position: 'right' }}
              />
              <ReferenceLine
                y={HEART_RATE_THRESHOLDS.normal.min}
                stroke="#3b82f6"
                strokeDasharray="3 3"
                label={{ value: 'Low', fontSize: 10, position: 'right' }}
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Avg Heart Rate"
              />
              <Line
                type="monotone"
                dataKey="heartRateMax"
                stroke="#ef4444"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Max"
              />
              <Line
                type="monotone"
                dataKey="heartRateMin"
                stroke="#3b82f6"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Min"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* SpO2 Trend */}
      <Card>
        <CardHeader>
          <CardTitle>SpO2 Trend</CardTitle>
          <CardDescription>
            Average daily oxygen saturation with min/max ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis domain={[85, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-sm">
                        <p className="text-sm font-medium mb-2">{data.fullDate}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-blue-500">
                            Avg: {data.spO2.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Range: {data.spO2Min}% - {data.spO2Max}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.count} measurements
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <ReferenceLine
                y={SPO2_THRESHOLDS.normal.min}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: 'Low', fontSize: 10, position: 'right' }}
              />
              <Line
                type="monotone"
                dataKey="spO2"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Avg SpO2"
              />
              <Line
                type="monotone"
                dataKey="spO2Max"
                stroke="#0ea5e9"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Max"
              />
              <Line
                type="monotone"
                dataKey="spO2Min"
                stroke="#0284c7"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Min"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
