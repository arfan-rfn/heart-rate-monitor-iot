'use client'

import { useMemo } from 'react'
import { usePhysicianPatients } from '@/hooks/use-physician'
import { PatientListTable } from '@/components/physician/patient-list-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Users, Wifi, WifiOff, Activity } from 'lucide-react'

export default function PhysicianDashboardPage() {
  const { data, isLoading, error } = usePhysicianPatients()

  // Calculate overview statistics
  const stats = useMemo(() => {
    if (!data) return null

    const totalPatients = data.patients.length
    const activePatients = data.patients.filter(
      (p) => p.stats.overview.monitoringStatus === 'active'
    ).length
    const inactivePatients = data.patients.filter(
      (p) => p.stats.overview.monitoringStatus === 'inactive'
    ).length
    const noDevicePatients = data.patients.filter(
      (p) => p.stats.overview.monitoringStatus === 'no_devices'
    ).length
    const totalMeasurements = data.patients.reduce(
      (sum, p) => sum + p.stats.overview.totalMeasurementsAllTime,
      0
    )

    return {
      totalPatients,
      activePatients,
      inactivePatients,
      noDevicePatients,
      totalMeasurements,
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Patients</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : 'Failed to load patient list. Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
        </div>
        <p className="text-muted-foreground">
          View and manage health data for all your patients
        </p>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Under your care
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Monitoring</CardTitle>
              <Wifi className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePatients}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Actively sending data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
              <WifiOff className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.inactivePatients + stats.noDevicePatients}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.inactivePatients} inactive, {stats.noDevicePatients} no devices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Measurements</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalMeasurements.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time across all patients
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {data && <PatientListTable patients={data.patients} />}
    </div>
  )
}
