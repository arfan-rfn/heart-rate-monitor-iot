'use client'

/**
 * Export Modal Component
 * Allows users to export their measurement data to CSV or PDF
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import { useMeasurements, useWeeklySummary } from '@/hooks/use-measurements'
import { exportToCSV, exportToPDF, getEstimatedFileSize } from '@/lib/utils/export'
import { format, subDays } from 'date-fns'
import { toast } from 'sonner'

type ExportFormat = 'csv' | 'pdf'
type DateRange = '7' | '30' | '90' | 'all'

interface ExportModalProps {
  trigger?: React.ReactNode
}

export function ExportModal({ trigger }: ExportModalProps) {
  const [open, setOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [dateRange, setDateRange] = useState<DateRange>('30')
  const [isExporting, setIsExporting] = useState(false)

  // Calculate date range filters
  const getDateFilters = () => {
    if (dateRange === 'all') return {}

    const days = parseInt(dateRange)
    const endDate = format(new Date(), 'yyyy-MM-dd')
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd')

    return { startDate, endDate, limit: 10000 }
  }

  const filters = getDateFilters()
  const { data: measurementsData } = useMeasurements(filters, { enabled: open })
  const { data: summary } = useWeeklySummary({ enabled: open && exportFormat === 'pdf' })

  const measurements = measurementsData?.measurements || []
  const estimatedSize = getEstimatedFileSize(measurements.length)

  const handleExport = async () => {
    if (measurements.length === 0) {
      toast.error('No data to export', {
        description: 'There are no measurements in the selected date range.'
      })
      return
    }

    setIsExporting(true)

    try {
      if (exportFormat === 'csv') {
        exportToCSV(measurements)
        toast.success('Export successful', {
          description: `Exported ${measurements.length} measurements to CSV.`
        })
      } else {
        // PDF export with charts
        const summaryStats = summary
          ? [
              {
                label: 'Average Heart Rate',
                value: `${Math.round(summary.averageHeartRate)} bpm`
              },
              {
                label: 'Heart Rate Range',
                value: `${summary.minHeartRate}-${summary.maxHeartRate} bpm`
              },
              {
                label: 'Average SpO2',
                value: `${Math.round(summary.averageSpO2)}%`
              },
              {
                label: 'Total Measurements',
                value: summary.totalMeasurements.toString()
              },
              {
                label: 'Date Range',
                value: `${summary.dateRange.start} to ${summary.dateRange.end}`
              }
            ]
          : []

        await exportToPDF(
          ['weekly-trends-chart', 'daily-detailed-chart'],
          {
            title: 'Heart Rate Monitoring Report',
            stats: summaryStats
          }
        )

        toast.success('Export successful', {
          description: 'Your health report has been downloaded as PDF.'
        })
      }

      setOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'An error occurred during export.'
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Measurements</DialogTitle>
          <DialogDescription>
            Download your health measurement data for personal records or sharing with your
            physician.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  <div>
                    <div className="font-medium">CSV (Spreadsheet)</div>
                    <div className="text-xs text-muted-foreground">
                      Raw data for analysis in Excel or Sheets
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="font-medium">PDF (Report)</div>
                    <div className="text-xs text-muted-foreground">
                      Visual report with charts and statistics
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-3">
            <Label>Date Range</Label>
            <RadioGroup
              value={dateRange}
              onValueChange={(v) => setDateRange(v as DateRange)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7" id="7days" />
                <Label htmlFor="7days" className="cursor-pointer">
                  Last 7 days
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30" id="30days" />
                <Label htmlFor="30days" className="cursor-pointer">
                  Last 30 days
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="90" id="90days" />
                <Label htmlFor="90days" className="cursor-pointer">
                  Last 90 days
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer">
                  All time
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Export Info */}
          <div className="rounded-lg border p-3 text-sm">
            {measurements.length === 0 ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <div className="space-y-1 text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">
                    {measurements.length}
                  </span>{' '}
                  measurements
                </div>
                {exportFormat === 'csv' && (
                  <div>
                    Estimated size: <span className="font-medium">{estimatedSize} KB</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || measurements.length === 0}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
