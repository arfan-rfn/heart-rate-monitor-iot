'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Heart, TrendingUp, TrendingDown, Activity, Wifi, WifiOff, AlertCircle } from 'lucide-react'
import type { Patient, MonitoringStatus } from '@/lib/types/physician'

interface PatientListTableProps {
  patients: Patient[]
}

const getMonitoringStatusConfig = (status: MonitoringStatus) => {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        variant: 'default' as const,
        icon: Wifi,
        color: 'text-green-500',
      }
    case 'inactive':
      return {
        label: 'Inactive',
        variant: 'secondary' as const,
        icon: AlertCircle,
        color: 'text-yellow-500',
      }
    case 'no_devices':
      return {
        label: 'No Devices',
        variant: 'destructive' as const,
        icon: WifiOff,
        color: 'text-red-500',
      }
  }
}

export function PatientListTable({ patients }: PatientListTableProps) {
  const [statusFilter, setStatusFilter] = useState<MonitoringStatus | 'all'>('all')

  // Filter and sort patients
  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.stats.overview.monitoringStatus === statusFilter)
    }

    // Sort by last measurement (most recent first)
    return [...filtered].sort((a, b) => {
      if (!a.stats.weekly.lastMeasurement) return 1
      if (!b.stats.weekly.lastMeasurement) return -1
      return (
        new Date(b.stats.weekly.lastMeasurement).getTime() -
        new Date(a.stats.weekly.lastMeasurement).getTime()
      )
    })
  }, [patients, statusFilter])

  if (patients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Patients Found</CardTitle>
          <CardDescription>
            You don't have any patients associated with your account yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            Patients can associate themselves with your account using your physician ID.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return {
      all: patients.length,
      active: patients.filter((p) => p.stats.overview.monitoringStatus === 'active').length,
      inactive: patients.filter((p) => p.stats.overview.monitoringStatus === 'inactive').length,
      no_devices: patients.filter((p) => p.stats.overview.monitoringStatus === 'no_devices').length,
    }
  }, [patients])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Patients</CardTitle>
            <CardDescription>
              {patients.length} patient{patients.length === 1 ? '' : 's'} with comprehensive health data
            </CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as MonitoringStatus | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients ({statusCounts.all})</SelectItem>
              <SelectItem value="active">Active ({statusCounts.active})</SelectItem>
              <SelectItem value="inactive">Inactive ({statusCounts.inactive})</SelectItem>
              <SelectItem value="no_devices">No Devices ({statusCounts.no_devices})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Avg HR (7d)</TableHead>
                <TableHead className="text-center">Avg SpO2 (7d)</TableHead>
                <TableHead className="text-center">Measurements (7d)</TableHead>
                <TableHead className="text-center">Devices</TableHead>
                <TableHead>Last Reading</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No patients found{statusFilter !== 'all' ? ' with this status' : ''}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedPatients.map((patient, index) => {
                  const statusConfig = getMonitoringStatusConfig(patient.stats.overview.monitoringStatus)
                  const StatusIcon = statusConfig.icon

                  return (
                    <TableRow key={`patient-${patient.id}-${index}`} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {patient.email}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusConfig.variant}>
                          <StatusIcon className={`h-3 w-3 mr-1 ${statusConfig.color}`} />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="font-medium">
                            {patient.stats.weekly.averageHeartRate > 0
                              ? patient.stats.weekly.averageHeartRate.toFixed(1)
                              : '-'}
                          </span>
                          <span className="text-xs text-muted-foreground">bpm</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">
                            {patient.stats.weekly.averageSpO2 > 0
                              ? patient.stats.weekly.averageSpO2.toFixed(1)
                              : '-'}
                          </span>
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {patient.stats.weekly.totalMeasurements}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-sm font-medium">
                            {patient.stats.overview.activeDevices}/{patient.stats.overview.totalDevices}
                          </span>
                          <span className="text-xs text-muted-foreground">active</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.stats.weekly.lastMeasurement ? (
                          <span className="text-sm">
                            {formatDistanceToNow(
                              new Date(patient.stats.weekly.lastMeasurement),
                              { addSuffix: true }
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">No data</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/physician/patients/${patient.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
