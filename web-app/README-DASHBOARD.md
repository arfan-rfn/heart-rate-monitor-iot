# Dashboard Visualization - Quick Start

## 🎉 What's New

The user dashboard now includes comprehensive data visualization features:

- ✅ Real-time statistics cards (avg HR, range, SpO2, total measurements)
- ✅ Weekly trends bar chart (7-day aggregates)
- ✅ Daily detailed area chart with date navigation
- ✅ Measurement quality indicators (good/fair/poor)
- ✅ Threshold alerts for abnormal readings
- ✅ CSV/PDF export functionality
- ✅ Auto-refresh every 60 seconds
- ✅ Mobile responsive design

## 🚀 Running the Dashboard

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:3000/dashboard
```

**Note**: You must be logged in to view the dashboard.

## 📊 Features Overview

### 1. Stats Cards
Four cards showing key metrics:
- Average Heart Rate (last 7 days)
- Heart Rate Range (min-max)
- Average SpO2
- Total Measurements

### 2. Weekly Trends Chart
Bar chart showing daily averages over the past week.
- Dual Y-axes for Heart Rate and SpO2
- Reference lines for normal ranges
- Interactive tooltips

### 3. Daily Detailed Chart
Area chart showing measurements for a specific day.
- Quality-colored dots on each measurement
- Date navigation (previous/next/today)
- Dual Y-axes with gradient fills
- Threshold alerts below chart

### 4. Export Data
Export your measurements to CSV or PDF:
- Choose date range (7/30/90 days, all time)
- CSV: Raw data for spreadsheets
- PDF: Visual report with charts

## 🔧 Requirements

### Backend API Endpoints

Ensure your API server has these endpoints:

```
GET /measurements/weekly/summary
GET /measurements/daily-aggregates?days=7
GET /measurements/daily/:date
GET /measurements?filters
```

**Note**: The API client automatically handles the base URL, so these paths are relative to your `NEXT_PUBLIC_API_URL`.

See [API Documentation](../api-server/README.md) for details.

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 📁 New Files Created

```
web-app/
├── components/dashboard/
│   ├── stats-cards.tsx              ✅ Stats display
│   ├── weekly-trends-chart.tsx      ✅ Bar chart
│   ├── daily-detailed-chart.tsx     ✅ Area chart
│   ├── quality-indicator.tsx        ✅ Quality badges
│   ├── threshold-alerts.tsx         ✅ Alert system
│   └── export-modal.tsx             ✅ Export dialog
├── hooks/
│   └── use-measurements.ts          ✅ React Query hooks
├── lib/
│   ├── api/measurements.ts          ✅ API functions
│   ├── types/measurement.ts         ✅ TypeScript types
│   └── utils/export.ts              ✅ Export utilities
└── docs/
    ├── user-dashboard-visualization.md      ✅ User guide
    └── developer-guide-visualization.md     ✅ Dev docs
```

## 🧪 Testing

### With Real Data

1. Start API server
2. Register a device
3. Send test measurements via API
4. View dashboard to see visualizations

### With Mock Data

For testing without a backend:
- Modify hooks to return mock data
- See `docs/developer-guide-visualization.md` for mock examples

## 🐛 Troubleshooting

### Charts Not Loading?
- Check API server is running
- Verify endpoints are accessible
- Check browser console for errors
- Ensure user is authenticated

### Data Not Updating?
- Click manual "Refresh" button
- Check network tab for API calls
- Verify measurements exist in database

### Type Errors?
```bash
npm run typecheck
```

## 📚 Documentation

- **User Guide**: `docs/user-dashboard-visualization.md`
- **Developer Guide**: `docs/developer-guide-visualization.md`
- **Implementation Summary**: `plan/user-dashboard-implementation-summary.md`

## 🎨 Customization

### Change Chart Colors

Edit `app/globals.css`:
```css
--chart-1: 0 100% 60%;    /* Primary (Heart Rate) */
--chart-2: 210 100% 60%;  /* Secondary (SpO2) */
```

### Modify Thresholds

Edit `lib/types/measurement.ts`:
```typescript
export const HEART_RATE_THRESHOLDS = {
  normal: { min: 60, max: 100 },
  // ...
}
```

### Change Refresh Interval

Edit `hooks/use-measurements.ts`:
```typescript
const REFETCH_INTERVAL = 60 * 1000  // 60 seconds
```

## 🔄 Real-Time Updates

The dashboard automatically refreshes every 60 seconds. You'll see:
- Green pulsing dot at bottom of page
- "Updated at [time]" in header
- Smooth chart animations on data changes

## 📱 Mobile Support

Fully responsive design:
- Stats cards stack vertically
- Charts adjust to screen size
- Touch-friendly date navigation
- Optimized tooltips for mobile

## 🚧 Known Limitations

1. Cannot navigate to future dates
2. PDF export requires charts to be visible on page
3. Large datasets (>10,000) may be slow to export
4. Auto-refresh pauses when tab is inactive

## 🎯 Next Steps

1. **Test with real data**: Send measurements from IoT device
2. **Customize thresholds**: Adjust normal ranges if needed
3. **Add more metrics**: Extend with blood pressure, temperature, etc.
4. **Physician Portal**: Implement analytics view for doctors

## 💡 Tips

- Use landscape orientation on mobile for better chart viewing
- Export regularly to keep records for doctor visits
- Pay attention to quality indicators (colored dots)
- Address critical alerts promptly (red warnings)
- Compare weekly trends to identify patterns

## 🆘 Support

If you encounter issues:
1. Check documentation in `/docs`
2. Review API server logs
3. Inspect browser console
4. Verify environment variables
5. Test API endpoints directly

## 📊 Chart Types Used

Based on shadcn/ui charts (Recharts):
- **Weekly Trends**: BarChart with dual Y-axes
- **Daily Detailed**: AreaChart with gradient fills
- **Both metrics**: Combined on same chart

## ✨ Future Enhancements

Potential improvements:
- Customizable alert thresholds
- Predictive health insights
- Share reports with physicians
- Goals and tracking
- Push notifications

---

**Status**: ✅ Complete and Ready for Testing

**Last Updated**: November 19, 2025
