# User Dashboard Visualization Features

## Overview

The Heart Rate Monitor IoT application provides comprehensive data visualization features for users to monitor their health metrics in real-time. The dashboard offers interactive charts, detailed statistics, and data export capabilities.

**Last Updated**: November 19, 2025

---

## Features

### 1. Real-Time Statistics Cards

The dashboard displays four key statistics at the top:

- **Average Heart Rate**: 7-day average in BPM
- **Heart Rate Range**: Minimum and maximum values over 7 days
- **Average SpO2**: 7-day oxygen saturation average
- **Total Measurements**: Count of measurements in the past week

**Features**:
- Auto-refreshes every 60 seconds
- Color-coded warnings for abnormal values (red text)
- Shows abnormal values when outside normal ranges:
  - Heart Rate normal: 60-100 bpm
  - SpO2 normal: 95-100%

### 2. Weekly Trends Chart

**Type**: Bar Chart with dual Y-axes

**Purpose**: Shows daily aggregates over the past 7 days

**Features**:
- **Dual Metrics**: Heart Rate (left axis) and SpO2 (right axis) displayed side-by-side
- **Color Coding**:
  - Heart Rate: Red/primary color
  - SpO2: Blue/secondary color
- **Reference Lines**: Dashed lines showing normal range thresholds
- **Interactive Tooltips**: Hover to see exact values and measurement counts
- **Legend**: Clear labeling of both metrics
- **Responsive**: Adjusts to mobile and desktop screens

**Data Source**: `GET /measurements/daily-aggregates?days=7`

### 3. Daily Detailed View Chart

**Type**: Area Chart with dual Y-axes

**Purpose**: Detailed view of measurements for a specific day

**Features**:
- **Date Navigation**:
  - Previous/Next day buttons
  - "Today" quick jump button
  - Cannot navigate beyond current date
- **Dual Y-Axes**:
  - Left: Heart Rate (40-120 bpm range)
  - Right: SpO2 (85-100% range)
- **Gradient Fill**: Beautiful gradient under each line
- **Quality Indicators**: Each heart rate measurement point is color-coded:
  - 🟢 Green = Good quality
  - 🟡 Yellow = Fair quality
  - 🔴 Red = Poor quality
- **Reference Areas**: Shaded zones showing normal ranges
- **Interactive Tooltips**: Shows:
  - Exact time of measurement
  - Heart rate value
  - SpO2 value
  - Quality indicator
  - Confidence percentage
- **Auto-Refresh**: Updates every 60 seconds

**Data Source**: `GET /measurements/daily/:date`

### 4. Threshold Alerts

**Purpose**: Warns users when measurements are outside safe ranges

**Types of Alerts**:

1. **Critical Heart Rate** (Red Alert)
   - Values < 50 bpm or > 120 bpm
   - "Consult a physician" recommendation

2. **Abnormal Heart Rate** (Yellow Warning)
   - Values outside 60-100 bpm but not critical
   - Shows count of occurrences

3. **Critical SpO2** (Red Alert)
   - Values < 90%
   - "Seek immediate medical attention" recommendation

4. **Low SpO2** (Yellow Warning)
   - Values 90-94%
   - Shows count of occurrences

**Features**:
- Displays below the daily detailed chart
- Shows count badges for each alert type
- Different severity levels (critical vs warning)
- When all measurements are normal, shows positive "all clear" message

### 5. Measurement Quality Indicators

**Purpose**: Shows reliability of measurement data

**Quality Levels**:
- **Good**: High confidence, accurate measurement
- **Fair**: Acceptable measurement with minor interference
- **Poor**: Low confidence, may be inaccurate

**Display Locations**:
- Chart points (colored dots on daily detailed chart)
- Tooltips (badge + confidence percentage)
- Quality legend below chart

### 6. Data Export

**Purpose**: Export measurement data for personal records or physician sharing

**Formats**:

1. **CSV Export**
   - Raw tabular data
   - Columns: Date, Time, Heart Rate, SpO2, Quality, Confidence, Device ID
   - Opens in Excel, Google Sheets, or any spreadsheet application
   - Includes estimated file size preview

2. **PDF Export**
   - Visual health report
   - Includes:
     - Report title and generation date
     - Summary statistics
     - Weekly trends chart
     - Daily detailed chart
   - Professional formatting for sharing with doctors

**Date Range Options**:
- Last 7 days
- Last 30 days
- Last 90 days
- All time

**Access**: Click "Export Data" button in dashboard header

### 7. Real-Time Updates

**Auto-Refresh System**:
- Charts and stats automatically refresh every 60 seconds
- Visual indicator: Green pulsing dot at bottom of page
- Shows last update time in header
- Manual refresh button available
- Data considered "stale" after 30 seconds

**Benefits**:
- Always see latest measurements from IoT devices
- No need to reload page
- Smooth transitions and animations

---

## Technical Implementation

### Architecture

**Frontend Stack**:
- Next.js 15 with App Router
- React 19
- TypeScript (strict mode)
- Recharts (via shadcn/ui charts)
- TanStack Query for data fetching

**Key Files**:
```
web-app/
├── app/(app)/dashboard/page.tsx          # Main dashboard page
├── components/dashboard/
│   ├── stats-cards.tsx                   # Statistics cards
│   ├── weekly-trends-chart.tsx           # Bar chart component
│   ├── daily-detailed-chart.tsx          # Area chart component
│   ├── quality-indicator.tsx             # Quality badges
│   ├── threshold-alerts.tsx              # Alert components
│   └── export-modal.tsx                  # Export dialog
├── hooks/use-measurements.ts             # React Query hooks
├── lib/
│   ├── api/measurements.ts               # API client functions
│   ├── types/measurement.ts              # TypeScript types
│   └── utils/export.ts                   # CSV/PDF export utilities
```

### API Endpoints

All endpoints use JWT authentication and return data specific to the logged-in user.

#### 1. Weekly Summary
```
GET /measurements/weekly/summary
```
Returns 7-day aggregate statistics.

**Response**:
```json
{
  "summary": {
    "averageHeartRate": 72.5,
    "minHeartRate": 58,
    "maxHeartRate": 105,
    "averageSpO2": 97.8,
    "minSpO2": 95,
    "maxSpO2": 100,
    "totalMeasurements": 48,
    "dateRange": {
      "start": "2025-11-12",
      "end": "2025-11-19"
    }
  }
}
```

#### 2. Daily Aggregates
```
GET /measurements/daily-aggregates?days=7
```
Returns day-by-day summaries for trend visualization.

**Response**:
```json
{
  "aggregates": [
    {
      "date": "2025-11-13T00:00:00.000Z",
      "averageHeartRate": 70.5,
      "minHeartRate": 60,
      "maxHeartRate": 92,
      "averageSpO2": 97.8,
      "count": 18
    },
    // ... 6 more days
  ],
  "days": 7
}
```

#### 3. Daily Measurements
```
GET /measurements/daily/:date
```
Returns all measurements for a specific date (YYYY-MM-DD format).

**Response**:
```json
{
  "date": "2025-11-19",
  "measurements": [
    {
      "timestamp": "2025-11-19T06:00:00.000Z",
      "heartRate": 65,
      "spO2": 97,
      "quality": "good",
      "confidence": 1.0,
      "deviceId": "photon-abc123"
    },
    // ... more measurements
  ],
  "count": 24
}
```

#### 4. Measurements List (for export)
```
GET /measurements?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=10000
```
Returns paginated measurements with filtering.

### Data Flow

1. **Component Mount**: React Query fetches initial data
2. **Auto-Refresh**: Every 60 seconds, queries refetch data
3. **User Interaction**: Manual refresh or date change triggers new fetch
4. **Cache Management**: TanStack Query caches responses for 30 seconds
5. **Real-time Display**: UI updates automatically when new data arrives

### State Management

- **Server State**: TanStack Query (React Query)
- **UI State**: React hooks (useState, useEffect)
- **Auth State**: Custom hooks (useAuth, useUser)

---

## User Guide

### Getting Started

1. **Register a Device**:
   - Click "Register Your First Device" button
   - Follow device setup instructions
   - Device will start sending measurements

2. **View Dashboard**:
   - Navigate to Dashboard from main menu
   - Stats and charts load automatically
   - Data refreshes every 60 seconds

3. **Navigate Dates**:
   - Use Previous/Next buttons on daily chart
   - Click "Today" to return to current day
   - Charts update based on selected date

4. **Export Data**:
   - Click "Export Data" button
   - Select format (CSV or PDF)
   - Choose date range
   - Click "Export" to download

### Interpreting Charts

**Weekly Trends**:
- Higher bars = higher average for that day
- Compare bars across days to see trends
- Look for patterns (e.g., higher on weekdays)

**Daily Detailed**:
- Lines show continuous trends throughout day
- Colored dots indicate measurement quality
- Shaded areas show normal ranges
- Spikes may indicate exercise or stress

**Alerts**:
- Red alerts = seek medical attention
- Yellow warnings = monitor closely
- Green "all clear" = everything normal

### Best Practices

1. **Regular Monitoring**: Check dashboard daily
2. **Quality Matters**: Pay attention to poor-quality measurements
3. **Track Trends**: Look for patterns over weeks, not single days
4. **Export Regularly**: Keep records for doctor visits
5. **Address Alerts**: Don't ignore critical warnings

---

## Troubleshooting

### Charts Not Loading

**Issue**: Charts show "Unable to load chart data"

**Solutions**:
1. Check internet connection
2. Click "Refresh" button
3. Verify device is sending measurements
4. Ensure you're logged in
5. Check browser console for errors

### Data Not Updating

**Issue**: Dashboard shows old data

**Solutions**:
1. Click manual "Refresh" button
2. Check "Updated" timestamp in header
3. Verify auto-refresh is not blocked
4. Ensure browser tab is active (browsers pause inactive tabs)
5. Check if device is actively sending measurements

### Export Fails

**Issue**: Export button does nothing or shows error

**Solutions**:
1. Ensure measurements exist in selected date range
2. Check browser popup blocker settings
3. Try different date range or format
4. Check browser console for specific error
5. Verify sufficient browser storage/memory

### Slow Performance

**Issue**: Charts lag or page is slow

**Solutions**:
1. Close other browser tabs
2. Clear browser cache
3. Try smaller date ranges for export
4. Update to latest browser version
5. Check device/internet speed

---

## Mobile Responsiveness

The dashboard is fully responsive and optimized for mobile devices:

- **Stats Cards**: Stack vertically on mobile
- **Charts**: Adjust height and width for small screens
- **Tooltips**: Touch-friendly on mobile devices
- **Navigation**: Buttons sized for touch interaction
- **Export**: Optimized file downloads on mobile browsers

**Recommended**: Use landscape orientation for best chart viewing on mobile.

---

## Privacy & Security

- All data is encrypted in transit (HTTPS)
- Measurements are user-specific (JWT authentication)
- Exports contain only your own data
- No data shared with third parties
- Session expires after inactivity

---

## Future Enhancements

Planned features for future releases:

1. **Customizable Alerts**: Set personal thresholds
2. **Trends Analysis**: AI-powered insights
3. **Sharing**: Share reports with physicians directly
4. **Comparison**: Compare current vs previous weeks
5. **Goals**: Set and track health goals
6. **Notifications**: Real-time alerts for critical measurements

---

## Support

For questions or issues:
- Check API server README for backend setup
- Verify measurement API endpoints are working
- Ensure device is registered and sending data
- Check browser console for JavaScript errors

## Related Documentation

- [API Server Documentation](../api-server/README.md)
- [Device Management Guide](./device-management.md)
- [Measurement Analytics (Physician)](../plan/measurement-analytics-part2-physician.md)
