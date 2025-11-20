'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Input } from '@/components/ui/input'
import { Download, Calendar, Loader2, Heart, Droplets, ChevronLeft, ChevronRight } from 'lucide-react'
import { useExportPatientHistory } from '@/hooks/use-physician'
import type { HistoricalMeasurement, HistoryFilters } from '@/lib/types/physician'

interface PatientHistoryTableProps {
  patientId: string
  measurements: HistoricalMeasurement[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  filters?: HistoryFilters
  onFilterChange?: (filters: HistoryFilters) => void
  onPageChange?: (page: number) => void
}

export function PatientHistoryTable({
  patientId,
  measurements,
  total,
  page,
  limit,
  hasMore,
  filters,
  onFilterChange,
  onPageChange,
}: PatientHistoryTableProps) {
  const [startDate, setStartDate] = useState(filters?.startDate || '')
  const [endDate, setEndDate] = useState(filters?.endDate || '')
  const exportHistory = useExportPatientHistory()

  const handleApplyFilters = () => {
    onFilterChange?.({
      ...filters,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  }

  const handleClearFilters = () => {
    setStartDate('')
    setEndDate('')
    onFilterChange?.({
      ...filters,
      startDate: undefined,
      endDate: undefined,
    })
  }

  const handleExport = () => {
    exportHistory.mutate({
      patientId,
      filters: {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
    })
  }

  const currentPage = page
  const totalPages = Math.ceil(total / limit)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Measurement History</CardTitle>
            <CardDescription>
              Complete record of all measurements{' '}
              {total > 0 && `(${total.toLocaleString()} total)`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportHistory.isPending || measurements.length === 0}
          >
            {exportHistory.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1 block">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start date"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1 block">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End date"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters}>
              <Calendar className="mr-2 h-4 w-4" />
              Apply
            </Button>
            {(startDate || endDate) && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Heart Rate</TableHead>
                <TableHead>SpO2</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Device</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {measurements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No measurements found for the selected filters
                  </TableCell>
                </TableRow>
              ) : (
                measurements.map((measurement, index) => (
                  <TableRow key={`${measurement.timestamp}-${index}`}>
                    <TableCell className="font-medium">
                      {format(new Date(measurement.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>{measurement.heartRate} bpm</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span>{measurement.spO2}%</span>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={!hasMore}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
