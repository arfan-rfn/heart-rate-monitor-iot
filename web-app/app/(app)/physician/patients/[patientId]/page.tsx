'use client'

import { use } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { usePatientSummary } from '@/hooks/use-physician'
import { PatientSummaryCard } from '@/components/physician/patient-summary-card'
import { DeviceConfigForm } from '@/components/physician/device-config-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertCircle,
  Activity,
  Heart,
  Droplets,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Calendar,
  Wifi,
  WifiOff,
} from 'lucide-react'

interface PatientDetailPageProps {
  params: Promise<{ patientId: string }>
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { patientId } = use(params)
  const { data, isLoading, error } = usePatientSummary(patientId || null)

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error) {
    const isNotFound = error instanceof Error &&
      (error.message.includes('not found') || error.message.includes('404'))

    return (
      <div className="container mx-auto py-8 space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/physician">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {isNotFound ? 'Patient Not Found' : 'Error Loading Patient Data'}
          </AlertTitle>
          <AlertDescription>
            {isNotFound ? (
              <>
                This patient could not be found or is not associated with your account.
                This may happen if:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>The patient has not set you as their physician</li>
                  <li>The patient's account was deleted</li>
                  <li>You don't have permission to view this patient</li>
                </ul>
                <p className="mt-2">Please return to the patient list and try again.</p>
              </>
            ) : (
              error.message || 'Failed to load patient information. Please try again later.'
            )}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) return null

  const { patient, summary, devices } = data

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Breadcrumb */}
      <Button variant="ghost" asChild>
        <Link href="/physician">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Link>
      </Button>

      {/* Patient Info */}
      <PatientSummaryCard
        patient={patient}
        totalMeasurements={summary.totalMeasurements}
        dateRange={summary.dateRange}
      />

      {/* Weekly Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Heart Rate</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.averageHeartRate.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">bpm</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-blue-500" />
                {summary.minHeartRate} bpm
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-orange-500" />
                {summary.maxHeartRate} bpm
              </div>
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
              {summary.averageSpO2.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">%</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-blue-500" />
                {summary.minSpO2}%
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-orange-500" />
                {summary.maxSpO2}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Measurements</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalMeasurements}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Wifi className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.filter((d) => d.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              of {devices.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Daily Measurements</h3>
                <p className="text-sm text-muted-foreground">
                  View detailed charts and measurements by date
                </p>
              </div>
              <Button asChild>
                <Link href={`/physician/patients/${patientId}/daily`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  View Daily
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Analytics & Trends</h3>
                <p className="text-sm text-muted-foreground">
                  View long-term trends and complete history
                </p>
              </div>
              <Button asChild variant="default">
                <Link href={`/physician/patients/${patientId}/analytics`}>
                  <Activity className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Management */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Devices</CardTitle>
          <CardDescription>
            Manage device settings and view device status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No devices registered for this patient</p>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => (
                <Card key={device.deviceId}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{device.name}</h4>
                          <Badge
                            variant={
                              device.status === 'active'
                                ? 'default'
                                : device.status === 'inactive'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {device.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Device ID</p>
                            <p className="font-mono">{device.deviceId}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Frequency</p>
                            <p className="font-medium">
                              {device.config.measurementFrequency / 60} min
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Active Hours</p>
                            <p className="font-medium">
                              {device.config.activeStartTime} - {device.config.activeEndTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Seen</p>
                            <p className="font-medium">
                              {device.lastSeen
                                ? formatDistanceToNow(new Date(device.lastSeen), {
                                    addSuffix: true,
                                  })
                                : 'Never'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <DeviceConfigForm patientId={patientId} device={device} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
