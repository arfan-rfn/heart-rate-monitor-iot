'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { format, subDays, addDays } from 'date-fns'
import { usePatientDaily, usePatientSummary } from '@/hooks/use-physician'
import { PatientSummaryCard } from '@/components/physician/patient-summary-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Heart,
  Droplets,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  Legend,
} from 'recharts'
import { HEART_RATE_THRESHOLDS, SPO2_THRESHOLDS } from '@/lib/types/measurement'

interface PatientDailyPageProps {
  params: Promise<{ patientId: string }>
}

export default function PatientDailyPage({ params }: PatientDailyPageProps) {
  const { patientId } = use(params)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data: summary } = usePatientSummary(patientId || null)
  const { data, isLoading, error } = usePatientDaily(patientId || null, selectedDate)

  const handlePreviousDay = () => {
    setSelectedDate((current) => {
      const prevDay = subDays(new Date(current), 1)
      return format(prevDay, 'yyyy-MM-dd')
    })
  }

  const handleNextDay = () => {
    setSelectedDate((current) => {
      const nextDay = addDays(new Date(current), 1)
      return format(nextDay, 'yyyy-MM-dd')
    })
  }

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd')

  // Transform measurements for chart
  const chartData =
    data?.measurements.map((m) => ({
      timestamp: format(new Date(m.timestamp), 'HH:mm'),
      heartRate: m.heartRate,
      spO2: m.spO2,
      fullTimestamp: m.timestamp,
    })) || []

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Breadcrumb */}
      <Button variant="ghost" asChild>
        <Link href={`/physician/patients/${patientId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patient Details
        </Link>
      </Button>

      {/* Patient Info */}
      {summary && (
        <PatientSummaryCard
          patient={summary.patient}
          totalMeasurements={summary.summary.totalMeasurements}
          dateRange={summary.summary.dateRange}
        />
      )}

      {/* Date Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Daily Measurements</CardTitle>
              <CardDescription>View detailed measurements by date</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousDay}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-[180px] justify-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {format(new Date(selectedDate), 'MMM dd, yyyy')}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextDay}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Measurements</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : 'Failed to load daily measurements. Please try again later.'}
          </AlertDescription>
        </Alert>
      )}

      {/* No Data State */}
      {!isLoading && !error && data && data.measurements.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No measurements for this date</p>
              <p className="text-sm mt-2">
                Try selecting a different date or check if the patient&apos;s device is active
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {!isLoading && !error && data && data.measurements.length > 0 && (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Heart Rate</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    data.measurements.reduce((sum, m) => sum + m.heartRate, 0) /
                    data.measurements.length
                  ).toFixed(1)}{' '}
                  <span className="text-sm font-normal text-muted-foreground">bpm</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg SpO2</CardTitle>
                <Droplets className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    data.measurements.reduce((sum, m) => sum + m.spO2, 0) /
                    data.measurements.length
                  ).toFixed(1)}{' '}
                  <span className="text-sm font-normal text-muted-foreground">%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.count}</div>
              </CardContent>
            </Card>
          </div>

          {/* Heart Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Heart Rate Over Time</CardTitle>
              <CardDescription>Heart rate measurements throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHeartRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[40, 120]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-sm">
                            <p className="text-sm font-medium">{payload[0].payload.timestamp}</p>
                            <p className="text-sm text-red-500">
                              {payload[0].value} bpm
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <ReferenceLine
                    y={HEART_RATE_THRESHOLDS.normal.max}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    label={{ value: 'High', position: 'right', fontSize: 12 }}
                  />
                  <ReferenceLine
                    y={HEART_RATE_THRESHOLDS.normal.min}
                    stroke="#3b82f6"
                    strokeDasharray="3 3"
                    label={{ value: 'Low', position: 'right', fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#f97316"
                    fillOpacity={1}
                    fill="url(#colorHeartRate)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* SpO2 Chart */}
          <Card>
            <CardHeader>
              <CardTitle>SpO2 Over Time</CardTitle>
              <CardDescription>Oxygen saturation measurements throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSpO2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[85, 100]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-sm">
                            <p className="text-sm font-medium">{payload[0].payload.timestamp}</p>
                            <p className="text-sm text-blue-500">
                              {payload[0].value}%
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <ReferenceLine
                    y={SPO2_THRESHOLDS.normal.min}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    label={{ value: 'Low', position: 'right', fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="spO2"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#colorSpO2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Measurements Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Measurements</CardTitle>
              <CardDescription>Detailed view of all measurements for this day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Heart Rate</TableHead>
                      <TableHead>SpO2</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Device</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.measurements.map((measurement, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {format(new Date(measurement.timestamp), 'HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-red-500" />
                            {measurement.heartRate} bpm
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            {measurement.spO2}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              measurement.quality === 'good'
                                ? 'default'
                                : measurement.quality === 'fair'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {measurement.quality}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(measurement.confidence * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {measurement.deviceId}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
