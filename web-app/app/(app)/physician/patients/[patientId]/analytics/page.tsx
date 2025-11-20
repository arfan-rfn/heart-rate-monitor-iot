'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  usePatientSummary,
  usePatientDailyAggregates,
  usePatientHistory,
  usePatientAllTimeStats,
} from '@/hooks/use-physician'
import { PatientSummaryCard } from '@/components/physician/patient-summary-card'
import { AllTimeStatsCards } from '@/components/physician/all-time-stats-cards'
import { PatientTrendCharts } from '@/components/physician/patient-trend-charts'
import { PatientHistoryTable } from '@/components/physician/patient-history-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, AlertCircle, TrendingUp, History, BarChart3 } from 'lucide-react'
import type { HistoryFilters } from '@/lib/types/physician'

interface PatientAnalyticsPageProps {
  params: Promise<{ patientId: string }>
}

export default function PatientAnalyticsPage({ params }: PatientAnalyticsPageProps) {
  const { patientId } = use(params)
  const [selectedDays, setSelectedDays] = useState(30)
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({
    limit: 100,
    page: 1,
  })

  // Fetch data
  const { data: summary } = usePatientSummary(patientId || null)
  const { data: allTimeStats, isLoading: loadingAllTime, error: errorAllTime } = usePatientAllTimeStats(patientId || null)
  const { data: aggregates, isLoading: loadingAggregates, error: errorAggregates } = usePatientDailyAggregates(patientId || null, selectedDays)
  const { data: history, isLoading: loadingHistory, error: errorHistory } = usePatientHistory(patientId || null, historyFilters)

  const handleDaysChange = (days: number) => {
    setSelectedDays(days)
  }

  const handleFilterChange = (filters: HistoryFilters) => {
    setHistoryFilters({
      ...historyFilters,
      ...filters,
      page: 1, // Reset to first page when filters change
    })
  }

  const handlePageChange = (page: number) => {
    setHistoryFilters({
      ...historyFilters,
      page,
    })
  }

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

      {/* All-Time Stats */}
      {loadingAllTime && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {errorAllTime && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Statistics</AlertTitle>
          <AlertDescription>
            {errorAllTime instanceof Error
              ? errorAllTime.message
              : 'Failed to load patient statistics'}
          </AlertDescription>
        </Alert>
      )}

      {allTimeStats && <AllTimeStatsCards stats={allTimeStats.stats} />}

      {/* Tabs for different views */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {loadingAggregates && (
            <div className="space-y-6">
              <Skeleton className="h-[400px]" />
              <Skeleton className="h-[400px]" />
            </div>
          )}

          {errorAggregates && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Trend Data</AlertTitle>
              <AlertDescription>
                {errorAggregates instanceof Error
                  ? errorAggregates.message
                  : 'Failed to load trend analysis'}
              </AlertDescription>
            </Alert>
          )}

          {aggregates && aggregates.aggregates.length === 0 && (
            <Alert>
              <BarChart3 className="h-4 w-4" />
              <AlertTitle>No Data Available</AlertTitle>
              <AlertDescription>
                No measurements found for the selected time period
              </AlertDescription>
            </Alert>
          )}

          {aggregates && aggregates.aggregates.length > 0 && (
            <PatientTrendCharts
              aggregates={aggregates.aggregates}
              defaultDays={selectedDays}
              onDaysChange={handleDaysChange}
            />
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          {loadingHistory && <Skeleton className="h-[600px]" />}

          {errorHistory && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading History</AlertTitle>
              <AlertDescription>
                {errorHistory instanceof Error
                  ? errorHistory.message
                  : 'Failed to load measurement history'}
              </AlertDescription>
            </Alert>
          )}

          {history && (
            <PatientHistoryTable
              patientId={patientId}
              measurements={history.measurements}
              total={history.total}
              page={history.page}
              limit={history.limit}
              hasMore={history.hasMore}
              filters={historyFilters}
              onFilterChange={handleFilterChange}
              onPageChange={handlePageChange}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
