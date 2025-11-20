# Developer Guide: Dashboard Visualization

Quick reference for developers working with the dashboard visualization features.

---

## Quick Start

### Running the Dashboard

```bash
cd web-app
npm run dev
```

Navigate to `http://localhost:3000/dashboard` (requires authentication).

---

## Component Usage

### Stats Cards

```tsx
import { StatsCards } from '@/components/dashboard/stats-cards'

// In your page/component
<StatsCards />
```

Auto-fetches and displays weekly summary statistics.

### Weekly Trends Chart

```tsx
import { WeeklyTrendsChart } from '@/components/dashboard/weekly-trends-chart'

<WeeklyTrendsChart />
```

Shows 7-day bar chart with dual metrics.

### Daily Detailed Chart

```tsx
import { DailyDetailedChart } from '@/components/dashboard/daily-detailed-chart'

<DailyDetailedChart />
```

Shows area chart for a selected day with date navigation.

### Quality Indicator

```tsx
import { QualityIndicator } from '@/components/dashboard/quality-indicator'

<QualityIndicator quality="good" showLabel={true} />
```

### Threshold Alerts

```tsx
import { ThresholdAlerts } from '@/components/dashboard/threshold-alerts'

<ThresholdAlerts measurements={dailyData} />
```

### Export Modal

```tsx
import { ExportModal } from '@/components/dashboard/export-modal'

<ExportModal trigger={<Button>Export</Button>} />
```

---

## Hooks

### useWeeklySummary

```tsx
import { useWeeklySummary } from '@/hooks/use-measurements'

const { data, isLoading, error, refetch } = useWeeklySummary()
```

Auto-refreshes every 60 seconds.

### useDailyMeasurements

```tsx
import { useDailyMeasurements } from '@/hooks/use-measurements'

const date = '2025-11-19'
const { data, isLoading, error } = useDailyMeasurements(date)
```

### useDailyAggregates

```tsx
import { useDailyAggregates } from '@/hooks/use-measurements'

const { data, isLoading, error } = useDailyAggregates(7) // 7 days
```

### useMeasurements

```tsx
import { useMeasurements } from '@/hooks/use-measurements'

const filters = {
  startDate: '2025-11-01',
  endDate: '2025-11-19',
  limit: 1000
}
const { data, isLoading, error } = useMeasurements(filters)
```

---

## API Functions

### Direct API Calls

```tsx
import {
  getWeeklySummary,
  getDailyMeasurements,
  getDailyAggregates,
  getMeasurements
} from '@/lib/api/measurements'

// In an async function or server component
const summary = await getWeeklySummary()
const daily = await getDailyMeasurements('2025-11-19')
const aggregates = await getDailyAggregates(7)
const measurements = await getMeasurements({ limit: 100 })
```

---

## Types

### Import Types

```tsx
import {
  Measurement,
  WeeklySummary,
  DailyMeasurementsResponse,
  DailyAggregate,
  MeasurementQuality,
  HEART_RATE_THRESHOLDS,
  SPO2_THRESHOLDS
} from '@/lib/types/measurement'
```

### Type Definitions

```tsx
type MeasurementQuality = 'good' | 'fair' | 'poor'

interface Measurement {
  _id: string
  userId: string
  deviceId: string
  heartRate: number
  spO2: number
  timestamp: Date | string
  quality: MeasurementQuality
  confidence: number
  createdAt: Date | string
}

interface WeeklySummary {
  averageHeartRate: number
  minHeartRate: number
  maxHeartRate: number
  averageSpO2: number
  minSpO2: number
  maxSpO2: number
  totalMeasurements: number
  dateRange: {
    start: string
    end: string
  }
}
```

---

## Utilities

### Export Functions

```tsx
import { exportToCSV, exportToPDF } from '@/lib/utils/export'

// Export measurements to CSV
exportToCSV(measurements, 'my-health-data.csv')

// Export charts to PDF
await exportToPDF(
  ['weekly-trends-chart', 'daily-detailed-chart'],
  {
    title: 'Health Report',
    stats: [
      { label: 'Avg HR', value: '72 bpm' },
      { label: 'Avg SpO2', value: '98%' }
    ]
  },
  'health-report.pdf'
)
```

### Validation Functions

```tsx
import {
  isAbnormalHeartRate,
  isAbnormalSpO2,
  isCriticalHeartRate,
  isCriticalSpO2
} from '@/lib/types/measurement'

if (isAbnormalHeartRate(heartRate)) {
  // Show warning
}

if (isCriticalHeartRate(heartRate)) {
  // Show critical alert
}
```

---

## Chart Configuration

### Custom Chart Config

```tsx
import { ChartConfig } from '@/components/ui/chart'

const chartConfig = {
  heartRate: {
    label: 'Heart Rate',
    color: 'hsl(var(--chart-1))'
  },
  spO2: {
    label: 'SpO2',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig
```

### Chart Container Usage

```tsx
import { ChartContainer } from '@/components/ui/chart'

<ChartContainer config={chartConfig} className="h-[400px]">
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={chartData}>
      {/* Chart elements */}
    </AreaChart>
  </ResponsiveContainer>
</ChartContainer>
```

---

## Styling

### Color Variables

```css
/* Chart colors (in globals.css) */
--chart-1: 0 100% 60%;    /* Primary (red for HR) */
--chart-2: 210 100% 60%;  /* Secondary (blue for SpO2) */
--chart-3: 120 100% 60%;  /* Success (green) */
--chart-4: 45 100% 60%;   /* Warning (yellow) */
--chart-5: 0 0% 60%;      /* Muted (gray) */
```

### Quality Colors

```tsx
import { QUALITY_COLORS } from '@/lib/types/measurement'

QUALITY_COLORS.good  // '#10b981' (green)
QUALITY_COLORS.fair  // '#f59e0b' (yellow)
QUALITY_COLORS.poor  // '#ef4444' (red)
```

---

## Testing

### Mock Data

```tsx
const mockMeasurement: Measurement = {
  _id: '123',
  userId: 'user123',
  deviceId: 'device123',
  heartRate: 72,
  spO2: 98,
  timestamp: new Date().toISOString(),
  quality: 'good',
  confidence: 0.95,
  createdAt: new Date().toISOString()
}

const mockSummary: WeeklySummary = {
  averageHeartRate: 72,
  minHeartRate: 60,
  maxHeartRate: 100,
  averageSpO2: 98,
  minSpO2: 95,
  maxSpO2: 100,
  totalMeasurements: 100,
  dateRange: {
    start: '2025-11-12',
    end: '2025-11-19'
  }
}
```

### Testing with React Query

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
})

// Wrap component in tests
<QueryClientProvider client={queryClient}>
  <YourComponent />
</QueryClientProvider>
```

---

## Debugging

### Enable React Query DevTools

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// In your layout or app component
<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Check Query Cache

Open React Query DevTools and inspect:
- Query keys
- Data state
- Refetch intervals
- Stale time

### Common Issues

**Charts not rendering?**
- Check if data is loading: `isLoading` state
- Verify API responses in Network tab
- Ensure chart has proper dimensions
- Check for TypeScript errors

**Data not updating?**
- Verify refetch interval is set (60s)
- Check if browser tab is active
- Inspect React Query cache
- Look for API errors in console

**Export not working?**
- Check if measurements exist
- Verify chart element IDs match
- Check browser console for errors
- Ensure popup blocker is disabled

---

## Performance Tips

1. **Memoize Chart Data**:
```tsx
const chartData = useMemo(() =>
  transformData(rawData),
  [rawData]
)
```

2. **Debounce Updates**:
```tsx
import { useDebouncedValue } from '@/hooks/use-debounced-value'

const debouncedDate = useDebouncedValue(selectedDate, 300)
```

3. **Lazy Load Export**:
```tsx
const ExportModal = dynamic(() =>
  import('@/components/dashboard/export-modal'),
  { ssr: false }
)
```

4. **Optimize Chart Rendering**:
- Use `ResponsiveContainer` for auto-sizing
- Set reasonable data point limits
- Use `isAnimationActive={false}` for large datasets

---

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## File Structure Reference

```
web-app/
├── app/(app)/dashboard/
│   └── page.tsx                        # Main dashboard page
├── components/
│   ├── ui/
│   │   ├── chart.tsx                   # shadcn chart components
│   │   ├── card.tsx                    # Card component
│   │   ├── button.tsx                  # Button component
│   │   └── ...                         # Other UI components
│   └── dashboard/
│       ├── stats-cards.tsx             # Statistics display
│       ├── weekly-trends-chart.tsx     # Bar chart
│       ├── daily-detailed-chart.tsx    # Area chart
│       ├── quality-indicator.tsx       # Quality badges
│       ├── threshold-alerts.tsx        # Alert system
│       └── export-modal.tsx            # Export dialog
├── hooks/
│   └── use-measurements.ts             # React Query hooks
├── lib/
│   ├── api/
│   │   ├── client.ts                   # Base API client
│   │   ├── measurements.ts             # Measurement endpoints
│   │   └── index.ts                    # API exports
│   ├── types/
│   │   └── measurement.ts              # TypeScript types
│   └── utils/
│       └── export.ts                   # Export utilities
└── docs/
    ├── user-dashboard-visualization.md  # User documentation
    └── developer-guide-visualization.md # This file
```

---

## Git Workflow

### Commit Message Format

```
feat(dashboard): add weekly trends chart
fix(export): resolve PDF generation issue
docs(visualization): update user guide
style(charts): improve mobile responsiveness
```

### Branch Naming

```
feature/dashboard-visualization
bugfix/chart-rendering
docs/visualization-guide
```

---

## Resources

- [Recharts Documentation](https://recharts.org/)
- [shadcn/ui Charts](https://ui.shadcn.com/charts)
- [TanStack Query](https://tanstack.com/query/latest)
- [date-fns](https://date-fns.org/)
- [Papa Parse](https://www.papaparse.com/)
- [jsPDF](https://github.com/parallax/jsPDF)

---

## Support

For questions or issues:
- Check the main user documentation
- Review API server logs
- Inspect browser console
- Test API endpoints directly
- Check React Query DevTools

---

**Last Updated**: November 19, 2025
