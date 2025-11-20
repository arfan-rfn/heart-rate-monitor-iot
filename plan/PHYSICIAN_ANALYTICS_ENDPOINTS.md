# Physician Analytics Endpoints - Complete Reference

**Last Updated:** 2025-11-20
**Purpose:** Comprehensive analytics and measurement history for physician portal

---

## 📊 New Analytics Endpoints

### Overview

Three new powerful endpoints have been added to give physicians complete visibility into patient health data:

| Endpoint | Purpose | Use Case |
|----------|---------|----------|
| `GET /analytics/daily-aggregates` | Daily trend data for charting | Line charts showing 30/60/90 day trends |
| `GET /analytics/history` | Full measurement history | Complete patient record, exportable data |
| `GET /analytics/all-time` | Lifetime statistics | Overall health metrics since first measurement |

---

## 1. Daily Aggregates (For Trend Charts)

### Endpoint
```
GET /api/physicians/patients/:patientId/analytics/daily-aggregates?days=30
```

### Purpose
Provides aggregated daily statistics perfect for creating trend line charts. Shows heart rate and SpO2 patterns over time.

### Query Parameters
- `days` (optional) - Number of days to retrieve (default: 30)
  - Common values: 7, 30, 60, 90, 365

### Request Example
```http
GET /api/physicians/patients/507f1f77bcf86cd799439011/analytics/daily-aggregates?days=30
Authorization: Bearer <physician-jwt-token>
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "aggregates": [
      {
        "date": "2025-10-20T00:00:00.000Z",
        "averageHeartRate": 72.5,
        "minHeartRate": 65,
        "maxHeartRate": 85,
        "averageSpO2": 97.8,
        "count": 24
      },
      {
        "date": "2025-10-21T00:00:00.000Z",
        "averageHeartRate": 71.2,
        "minHeartRate": 62,
        "maxHeartRate": 82,
        "averageSpO2": 98.1,
        "count": 22
      }
      // ... more days
    ],
    "days": 30
  }
}
```

### TypeScript Interface
```typescript
interface DailyAggregate {
  date: string;           // ISO 8601 timestamp
  averageHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  averageSpO2: number;
  count: number;          // Number of measurements that day
}

interface PatientDailyAggregatesResponse {
  success: true;
  data: {
    patient: {
      id: string;
      name: string;
      email: string;
    };
    aggregates: DailyAggregate[];
    days: number;
  };
}
```

### Frontend Usage
```typescript
// Perfect for Chart.js or Recharts
const fetchTrendData = async (patientId: string, days: number = 30) => {
  const response = await fetch(
    `http://localhost:4000/api/physicians/patients/${patientId}/analytics/daily-aggregates?days=${days}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  const data = await response.json();

  // Transform for Chart.js
  const chartData = {
    labels: data.data.aggregates.map(a => new Date(a.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Average Heart Rate',
        data: data.data.aggregates.map(a => a.averageHeartRate),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Min Heart Rate',
        data: data.data.aggregates.map(a => a.minHeartRate),
        borderColor: 'rgb(54, 162, 235)',
        borderDash: [5, 5],
      },
      {
        label: 'Max Heart Rate',
        data: data.data.aggregates.map(a => a.maxHeartRate),
        borderColor: 'rgb(255, 206, 86)',
        borderDash: [5, 5],
      }
    ]
  };

  return chartData;
};
```

---

## 2. Full Measurement History

### Endpoint
```
GET /api/physicians/patients/:patientId/analytics/history?startDate=2025-01-01&endDate=2025-12-31&limit=1000&page=1
```

### Purpose
Access complete patient measurement history with optional date range filtering. Supports pagination for large datasets. Perfect for:
- Exporting patient data
- Detailed analysis
- Compliance/auditing
- Historical comparisons

### Query Parameters
- `startDate` (optional) - Start date in YYYY-MM-DD format
- `endDate` (optional) - End date in YYYY-MM-DD format
- `limit` (optional) - Number of measurements per page (default: 1000)
- `page` (optional) - Page number (default: 1)

### Request Examples

**Get all measurements:**
```http
GET /api/physicians/patients/507f1f77bcf86cd799439011/analytics/history
Authorization: Bearer <physician-jwt-token>
```

**Get measurements for specific date range:**
```http
GET /api/physicians/patients/507f1f77bcf86cd799439011/analytics/history?startDate=2025-01-01&endDate=2025-03-31
Authorization: Bearer <physician-jwt-token>
```

**Paginated request:**
```http
GET /api/physicians/patients/507f1f77bcf86cd799439011/analytics/history?limit=100&page=2
Authorization: Bearer <physician-jwt-token>
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "measurements": [
      {
        "timestamp": "2025-11-19T14:30:00.000Z",
        "heartRate": 72,
        "spO2": 98,
        "quality": "good",
        "confidence": 1.0,
        "deviceId": "photon-abc123"
      },
      {
        "timestamp": "2025-11-19T14:00:00.000Z",
        "heartRate": 68,
        "spO2": 97,
        "quality": "good",
        "confidence": 0.95,
        "deviceId": "photon-abc123"
      }
      // ... more measurements (sorted newest first)
    ],
    "pagination": {
      "total": 5432,
      "page": 1,
      "limit": 1000,
      "pages": 6
    }
  }
}
```

### TypeScript Interface
```typescript
interface Measurement {
  timestamp: string;
  heartRate: number;
  spO2: number;
  quality: 'good' | 'fair' | 'poor';
  confidence: number;
  deviceId: string;
}

interface PatientHistoryResponse {
  success: true;
  data: {
    patient: {
      id: string;
      name: string;
      email: string;
    };
    measurements: Measurement[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}
```

### Frontend Usage
```typescript
// Export patient data to CSV
const exportPatientData = async (patientId: string) => {
  const response = await fetch(
    `http://localhost:4000/api/physicians/patients/${patientId}/analytics/history?limit=10000`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  const data: PatientHistoryResponse = await response.json();

  // Convert to CSV
  const csv = [
    ['Timestamp', 'Heart Rate', 'SpO2', 'Quality', 'Confidence', 'Device'],
    ...data.data.measurements.map(m => [
      m.timestamp,
      m.heartRate,
      m.spO2,
      m.quality,
      m.confidence,
      m.deviceId
    ])
  ].map(row => row.join(',')).join('\n');

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `patient-${patientId}-history.csv`;
  a.click();
};

// Paginated table view
const PatientHistoryTable: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<PatientHistoryResponse['data']>();

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    const response = await fetch(
      `http://localhost:4000/api/physicians/patients/${patientId}/analytics/history?page=${page}&limit=50`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await response.json();
    setHistory(data.data);
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Heart Rate</th>
            <th>SpO2</th>
            <th>Quality</th>
          </tr>
        </thead>
        <tbody>
          {history?.measurements.map(m => (
            <tr key={m.timestamp}>
              <td>{new Date(m.timestamp).toLocaleString()}</td>
              <td>{m.heartRate} bpm</td>
              <td>{m.spO2}%</td>
              <td>{m.quality}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {history?.pagination.pages}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page === history?.pagination.pages}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

---

## 3. All-Time Statistics

### Endpoint
```
GET /api/physicians/patients/:patientId/analytics/all-time
```

### Purpose
Comprehensive lifetime health metrics for the patient. Shows overall health patterns since the first measurement. Perfect for:
- Patient health summary cards
- Long-term trend analysis
- Baseline health metrics
- Overall patient health status

### Request Example
```http
GET /api/physicians/patients/507f1f77bcf86cd799439011/analytics/all-time
Authorization: Bearer <physician-jwt-token>
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "stats": {
      "totalMeasurements": 5432,
      "heartRate": {
        "average": 72.5,
        "min": 52,
        "max": 145
      },
      "spO2": {
        "average": 97.8,
        "min": 92,
        "max": 100
      },
      "dateRange": {
        "first": "2024-01-15T08:00:00.000Z",
        "last": "2025-11-19T14:30:00.000Z"
      }
    }
  }
}
```

### TypeScript Interface
```typescript
interface AllTimeStats {
  totalMeasurements: number;
  heartRate: {
    average: number;
    min: number;
    max: number;
  };
  spO2: {
    average: number;
    min: number;
    max: number;
  };
  dateRange: {
    first: string | null;
    last: string | null;
  };
}

interface PatientAllTimeStatsResponse {
  success: true;
  data: {
    patient: {
      id: string;
      name: string;
      email: string;
    };
    stats: AllTimeStats;
  };
}
```

### Frontend Usage
```typescript
// Health summary card
const PatientHealthSummary: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [stats, setStats] = useState<AllTimeStats>();

  useEffect(() => {
    fetchStats();
  }, [patientId]);

  const fetchStats = async () => {
    const response = await fetch(
      `http://localhost:4000/api/physicians/patients/${patientId}/analytics/all-time`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data: PatientAllTimeStatsResponse = await response.json();
    setStats(data.data.stats);
  };

  if (!stats) return <div>Loading...</div>;

  const monitoringDuration = stats.dateRange.first && stats.dateRange.last
    ? Math.ceil(
        (new Date(stats.dateRange.last).getTime() - new Date(stats.dateRange.first).getTime())
        / (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="health-summary-card">
      <h2>Lifetime Health Statistics</h2>

      <div className="stat-grid">
        <div className="stat">
          <h3>Total Measurements</h3>
          <p className="value">{stats.totalMeasurements.toLocaleString()}</p>
        </div>

        <div className="stat">
          <h3>Monitoring Duration</h3>
          <p className="value">{monitoringDuration} days</p>
        </div>

        <div className="stat">
          <h3>Average Heart Rate</h3>
          <p className="value">{stats.heartRate.average} bpm</p>
          <p className="range">
            Range: {stats.heartRate.min} - {stats.heartRate.max} bpm
          </p>
        </div>

        <div className="stat">
          <h3>Average SpO2</h3>
          <p className="value">{stats.spO2.average}%</p>
          <p className="range">
            Range: {stats.spO2.min} - {stats.spO2.max}%
          </p>
        </div>
      </div>

      <div className="date-range">
        <p>First measurement: {new Date(stats.dateRange.first!).toLocaleDateString()}</p>
        <p>Last measurement: {new Date(stats.dateRange.last!).toLocaleDateString()}</p>
      </div>
    </div>
  );
};
```

---

## Complete Endpoint Summary

### All Physician Endpoints (7 Total)

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 1 | `/patients` | GET | List all patients with 7-day summaries |
| 2 | `/patients/:id/summary` | GET | Patient weekly summary + devices |
| 3 | `/patients/:id/daily/:date` | GET | Daily measurements for specific date |
| **4** | `/patients/:id/analytics/daily-aggregates` | GET | **Daily trend data (NEW)** |
| **5** | `/patients/:id/analytics/history` | GET | **Full measurement history (NEW)** |
| **6** | `/patients/:id/analytics/all-time` | GET | **Lifetime statistics (NEW)** |
| 7 | `/patients/:id/devices/:id/config` | PUT | Update device configuration |

---

## Use Cases by Feature

### Dashboard View
- **Endpoint:** `GET /patients`
- **Shows:** All patients with 7-day summaries
- **UI:** Patient list table

### Patient Detail View
- **Endpoint:** `GET /patients/:id/summary`
- **Shows:** Weekly stats, devices, device controls
- **UI:** Patient detail page with cards

### Daily Detail View
- **Endpoint:** `GET /patients/:id/daily/:date`
- **Shows:** All measurements for one day
- **UI:** Daily measurement charts

### **Trend Charts (NEW)**
- **Endpoint:** `GET /patients/:id/analytics/daily-aggregates?days=30`
- **Shows:** 30/60/90 day trends
- **UI:** Line charts with average, min, max

### **Patient History Export (NEW)**
- **Endpoint:** `GET /patients/:id/analytics/history`
- **Shows:** Complete measurement record
- **UI:** Downloadable CSV, paginated table

### **Overall Health Status (NEW)**
- **Endpoint:** `GET /patients/:id/analytics/all-time`
- **Shows:** Lifetime health metrics
- **UI:** Summary cards, health overview

---

## Error Handling

All analytics endpoints use the same error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHORIZED"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "message": "Access denied: Patient is not associated with this physician",
    "code": "FORBIDDEN"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "message": "Patient not found",
    "code": "PATIENT_NOT_FOUND"
  }
}
```

---

## Performance Considerations

### Daily Aggregates
- **Query Time:** Fast (uses indexes)
- **Data Size:** Small (one record per day)
- **Recommended:** Use for charts and trends

### History
- **Query Time:** Can be slow for large datasets
- **Data Size:** Can be very large (use pagination!)
- **Recommended:**
  - Limit to 1000 records per request
  - Use date range filtering when possible
  - Implement lazy loading/infinite scroll

### All-Time Stats
- **Query Time:** Fast (single aggregation)
- **Data Size:** Tiny (one summary object)
- **Recommended:** Cache on frontend, perfect for summary cards

---

## Complete TypeScript API Client

```typescript
class PhysicianAnalyticsClient {
  constructor(private baseUrl: string, private token: string) {}

  // Get daily aggregates for trend charts
  async getDailyAggregates(patientId: string, days: number = 30) {
    const response = await fetch(
      `${this.baseUrl}/api/physicians/patients/${patientId}/analytics/daily-aggregates?days=${days}`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );
    const data: PatientDailyAggregatesResponse = await response.json();
    if (!data.success) throw new Error(data.error?.message);
    return data.data;
  }

  // Get full measurement history
  async getHistory(
    patientId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      page?: number;
    }
  ) {
    const params = new URLSearchParams();
    if (options?.startDate) params.set('startDate', options.startDate);
    if (options?.endDate) params.set('endDate', options.endDate);
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.page) params.set('page', options.page.toString());

    const response = await fetch(
      `${this.baseUrl}/api/physicians/patients/${patientId}/analytics/history?${params}`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );
    const data: PatientHistoryResponse = await response.json();
    if (!data.success) throw new Error(data.error?.message);
    return data.data;
  }

  // Get all-time statistics
  async getAllTimeStats(patientId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/physicians/patients/${patientId}/analytics/all-time`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );
    const data: PatientAllTimeStatsResponse = await response.json();
    if (!data.success) throw new Error(data.error?.message);
    return data.data;
  }
}
```

---

**Summary:** Three powerful new analytics endpoints provide physicians with complete visibility into patient health data - from daily trends to lifetime statistics to full measurement history. Perfect for comprehensive patient monitoring and analysis.
