# Enhanced Patient List Endpoint

**Endpoint:** `GET /api/physicians/patients`
**Status:** ✅ Enhanced with comprehensive high-level stats
**Last Updated:** 2025-11-20

---

## Overview

The patient list endpoint now returns **rich statistics** for each patient, enabling you to build informative dashboard cards without additional API calls.

### What's Included

Each patient entry now includes:

1. **Basic Info** - Name, email, ID
2. **Weekly Stats** - 7-day heart rate and SpO2 summary
3. **Overview Stats** - High-level monitoring status
   - Total measurements (all-time)
   - Device counts (total and active)
   - Recent data indicator
   - Monitoring status badge

---

## Enhanced Response Schema

### Request
```http
GET /api/physicians/patients HTTP/1.1
Host: localhost:4000
Authorization: Bearer <physician-jwt-token>
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "stats": {
          "weekly": {
            "averageHeartRate": 72.5,
            "minHeartRate": 58,
            "maxHeartRate": 105,
            "averageSpO2": 97.8,
            "totalMeasurements": 48,
            "lastMeasurement": "2025-11-19T14:30:00.000Z"
          },
          "overview": {
            "totalMeasurementsAllTime": 5432,
            "totalDevices": 2,
            "activeDevices": 1,
            "hasRecentData": true,
            "monitoringStatus": "active"
          }
        }
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "stats": {
          "weekly": {
            "averageHeartRate": 68.2,
            "minHeartRate": 55,
            "maxHeartRate": 98,
            "averageSpO2": 98.1,
            "totalMeasurements": 42,
            "lastMeasurement": "2025-11-19T13:00:00.000Z"
          },
          "overview": {
            "totalMeasurementsAllTime": 3124,
            "totalDevices": 1,
            "activeDevices": 1,
            "hasRecentData": true,
            "monitoringStatus": "active"
          }
        }
      },
      {
        "id": "507f1f77bcf86cd799439013",
        "name": "Bob Johnson",
        "email": "bob.johnson@example.com",
        "stats": {
          "weekly": {
            "averageHeartRate": 0,
            "minHeartRate": 0,
            "maxHeartRate": 0,
            "averageSpO2": 0,
            "totalMeasurements": 0,
            "lastMeasurement": null
          },
          "overview": {
            "totalMeasurementsAllTime": 856,
            "totalDevices": 1,
            "activeDevices": 1,
            "hasRecentData": false,
            "monitoringStatus": "inactive"
          }
        }
      }
    ],
    "totalPatients": 3
  }
}
```

---

## Field Definitions

### Weekly Stats
Statistics from the last 7 days:

| Field | Type | Description |
|-------|------|-------------|
| `averageHeartRate` | number | Average heart rate (BPM) over 7 days |
| `minHeartRate` | number | Minimum heart rate recorded |
| `maxHeartRate` | number | Maximum heart rate recorded |
| `averageSpO2` | number | Average oxygen saturation (%) |
| `totalMeasurements` | number | Number of measurements in last 7 days |
| `lastMeasurement` | string\|null | ISO timestamp of most recent measurement |

### Overview Stats
High-level patient monitoring status:

| Field | Type | Description | Use Case |
|-------|------|-------------|----------|
| `totalMeasurementsAllTime` | number | Total measurements ever recorded | Show patient history depth |
| `totalDevices` | number | Total registered devices | Device management indicator |
| `activeDevices` | number | Devices with status='active' | Active monitoring capability |
| `hasRecentData` | boolean | Has measurements in last 7 days | Data freshness indicator |
| `monitoringStatus` | enum | Current monitoring state | Status badge/color |

### Monitoring Status Values

| Status | Meaning | Criteria |
|--------|---------|----------|
| `active` | Patient is actively monitored | Has active devices AND recent measurements |
| `inactive` | Patient has devices but no recent data | Has active devices BUT no measurements in 7 days |
| `no_devices` | Patient not set up for monitoring | No devices registered |

---

## TypeScript Interface

```typescript
type MonitoringStatus = 'active' | 'inactive' | 'no_devices';

interface WeeklyStats {
  averageHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  averageSpO2: number;
  totalMeasurements: number;
  lastMeasurement: string | null;
}

interface OverviewStats {
  totalMeasurementsAllTime: number;
  totalDevices: number;
  activeDevices: number;
  hasRecentData: boolean;
  monitoringStatus: MonitoringStatus;
}

interface PatientListItem {
  id: string;
  name: string;
  email: string;
  stats: {
    weekly: WeeklyStats;
    overview: OverviewStats;
  };
}

interface PatientListResponse {
  success: true;
  data: {
    patients: PatientListItem[];
    totalPatients: number;
  };
}
```

---

## Frontend Implementation Examples

### 1. Patient Dashboard Table

```tsx
import React, { useEffect, useState } from 'react';

const PatientDashboard: React.FC = () => {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const response = await fetch('http://localhost:4000/api/physicians/patients', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data: PatientListResponse = await response.json();
    setPatients(data.data.patients);
  };

  const getStatusBadge = (status: MonitoringStatus) => {
    const badges = {
      active: { text: 'Active', color: 'green' },
      inactive: { text: 'Inactive', color: 'orange' },
      no_devices: { text: 'No Devices', color: 'gray' }
    };
    const badge = badges[status];
    return (
      <span className={`badge bg-${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="patient-dashboard">
      <h1>My Patients ({patients.length})</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Status</th>
            <th>Avg HR (7d)</th>
            <th>Avg SpO2 (7d)</th>
            <th>Devices</th>
            <th>Total Readings</th>
            <th>Last Reading</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id}>
              <td>
                <div>
                  <strong>{patient.name}</strong>
                  <br />
                  <small className="text-muted">{patient.email}</small>
                </div>
              </td>
              <td>
                {getStatusBadge(patient.stats.overview.monitoringStatus)}
              </td>
              <td>
                {patient.stats.weekly.averageHeartRate > 0
                  ? `${patient.stats.weekly.averageHeartRate} bpm`
                  : 'No data'}
                {patient.stats.weekly.totalMeasurements > 0 && (
                  <small className="text-muted d-block">
                    {patient.stats.weekly.minHeartRate}-
                    {patient.stats.weekly.maxHeartRate} bpm
                  </small>
                )}
              </td>
              <td>
                {patient.stats.weekly.averageSpO2 > 0
                  ? `${patient.stats.weekly.averageSpO2}%`
                  : 'No data'}
              </td>
              <td>
                {patient.stats.overview.activeDevices} / {patient.stats.overview.totalDevices}
                <small className="text-muted d-block">
                  {patient.stats.overview.activeDevices} active
                </small>
              </td>
              <td>
                {patient.stats.overview.totalMeasurementsAllTime.toLocaleString()}
                <small className="text-muted d-block">
                  {patient.stats.weekly.totalMeasurements} this week
                </small>
              </td>
              <td>
                {patient.stats.weekly.lastMeasurement
                  ? new Date(patient.stats.weekly.lastMeasurement).toLocaleString()
                  : 'Never'}
              </td>
              <td>
                <button
                  onClick={() => viewPatient(patient.id)}
                  className="btn btn-primary btn-sm"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientDashboard;
```

### 2. Patient Card Grid View

```tsx
const PatientCardGrid: React.FC = () => {
  const [patients, setPatients] = useState<PatientListItem[]>([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const response = await fetch('http://localhost:4000/api/physicians/patients', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data: PatientListResponse = await response.json();
    setPatients(data.data.patients);
  };

  return (
    <div className="patient-grid">
      {patients.map(patient => (
        <div key={patient.id} className="patient-card">
          <div className="card-header">
            <h3>{patient.name}</h3>
            <span className={`status-badge ${patient.stats.overview.monitoringStatus}`}>
              {patient.stats.overview.monitoringStatus}
            </span>
          </div>

          <div className="card-body">
            {/* Weekly Stats */}
            <div className="stats-row">
              <div className="stat">
                <label>Avg Heart Rate</label>
                <div className="value">
                  {patient.stats.weekly.averageHeartRate || 'N/A'}
                  {patient.stats.weekly.averageHeartRate > 0 && ' bpm'}
                </div>
                {patient.stats.weekly.totalMeasurements > 0 && (
                  <div className="range">
                    {patient.stats.weekly.minHeartRate}-
                    {patient.stats.weekly.maxHeartRate}
                  </div>
                )}
              </div>

              <div className="stat">
                <label>Avg SpO2</label>
                <div className="value">
                  {patient.stats.weekly.averageSpO2 || 'N/A'}
                  {patient.stats.weekly.averageSpO2 > 0 && '%'}
                </div>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="overview-stats">
              <div className="overview-item">
                <span className="icon">📊</span>
                <span className="text">
                  {patient.stats.overview.totalMeasurementsAllTime.toLocaleString()} total readings
                </span>
              </div>

              <div className="overview-item">
                <span className="icon">📱</span>
                <span className="text">
                  {patient.stats.overview.activeDevices} of {patient.stats.overview.totalDevices} devices active
                </span>
              </div>

              {patient.stats.weekly.lastMeasurement && (
                <div className="overview-item">
                  <span className="icon">🕐</span>
                  <span className="text">
                    Last: {new Date(patient.stats.weekly.lastMeasurement).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="card-footer">
            <button onClick={() => viewPatient(patient.id)}>
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### 3. Status Filter & Sort

```tsx
const PatientDashboardWithFilters: React.FC = () => {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [filter, setFilter] = useState<MonitoringStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastReading' | 'avgHR'>('name');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const response = await fetch('http://localhost:4000/api/physicians/patients', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data: PatientListResponse = await response.json();
    setPatients(data.data.patients);
  };

  const filteredPatients = patients.filter(p =>
    filter === 'all' ? true : p.stats.overview.monitoringStatus === filter
  );

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'lastReading':
        const aTime = a.stats.weekly.lastMeasurement
          ? new Date(a.stats.weekly.lastMeasurement).getTime()
          : 0;
        const bTime = b.stats.weekly.lastMeasurement
          ? new Date(b.stats.weekly.lastMeasurement).getTime()
          : 0;
        return bTime - aTime; // Most recent first
      case 'avgHR':
        return b.stats.weekly.averageHeartRate - a.stats.weekly.averageHeartRate;
      default:
        return 0;
    }
  });

  const statusCounts = {
    all: patients.length,
    active: patients.filter(p => p.stats.overview.monitoringStatus === 'active').length,
    inactive: patients.filter(p => p.stats.overview.monitoringStatus === 'inactive').length,
    no_devices: patients.filter(p => p.stats.overview.monitoringStatus === 'no_devices').length,
  };

  return (
    <div>
      <div className="filters">
        <div className="status-tabs">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Patients ({statusCounts.all})
          </button>
          <button
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active ({statusCounts.active})
          </button>
          <button
            className={filter === 'inactive' ? 'active' : ''}
            onClick={() => setFilter('inactive')}
          >
            Inactive ({statusCounts.inactive})
          </button>
          <button
            className={filter === 'no_devices' ? 'active' : ''}
            onClick={() => setFilter('no_devices')}
          >
            No Devices ({statusCounts.no_devices})
          </button>
        </div>

        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
            <option value="name">Name</option>
            <option value="lastReading">Last Reading</option>
            <option value="avgHR">Avg Heart Rate</option>
          </select>
        </div>
      </div>

      {/* Render sorted and filtered patients */}
      <div className="patient-list">
        {sortedPatients.map(patient => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </div>
  );
};
```

### 4. Summary Statistics Dashboard

```tsx
const DashboardSummary: React.FC<{ patients: PatientListItem[] }> = ({ patients }) => {
  const stats = {
    total: patients.length,
    active: patients.filter(p => p.stats.overview.monitoringStatus === 'active').length,
    inactive: patients.filter(p => p.stats.overview.monitoringStatus === 'inactive').length,
    noDevices: patients.filter(p => p.stats.overview.monitoringStatus === 'no_devices').length,
    totalMeasurements: patients.reduce((sum, p) => sum + p.stats.overview.totalMeasurementsAllTime, 0),
    patientsWithRecentData: patients.filter(p => p.stats.overview.hasRecentData).length,
    avgHeartRate: patients
      .filter(p => p.stats.weekly.averageHeartRate > 0)
      .reduce((sum, p) => sum + p.stats.weekly.averageHeartRate, 0) /
      patients.filter(p => p.stats.weekly.averageHeartRate > 0).length || 0,
  };

  return (
    <div className="dashboard-summary">
      <div className="summary-card">
        <h3>Total Patients</h3>
        <div className="value">{stats.total}</div>
        <div className="breakdown">
          <span className="active">{stats.active} active</span>
          <span className="inactive">{stats.inactive} inactive</span>
          <span className="no-devices">{stats.noDevices} no devices</span>
        </div>
      </div>

      <div className="summary-card">
        <h3>Recent Data</h3>
        <div className="value">{stats.patientsWithRecentData}</div>
        <div className="subtitle">
          patients with data in last 7 days
        </div>
      </div>

      <div className="summary-card">
        <h3>Total Measurements</h3>
        <div className="value">{stats.totalMeasurements.toLocaleString()}</div>
        <div className="subtitle">across all patients</div>
      </div>

      <div className="summary-card">
        <h3>Avg Heart Rate</h3>
        <div className="value">{Math.round(stats.avgHeartRate * 10) / 10} bpm</div>
        <div className="subtitle">across active patients</div>
      </div>
    </div>
  );
};
```

---

## Benefits of Enhanced Data

### 1. **Fewer API Calls**
- All overview data in one request
- No need for separate device/measurement count queries
- Faster dashboard load times

### 2. **Rich UI Possibilities**
- Status badges (active/inactive/no devices)
- Color-coded patient cards
- Sortable/filterable patient lists
- Summary statistics

### 3. **Better UX**
- Instant visibility into patient status
- Quick identification of patients needing attention
- Clear monitoring status indicators

### 4. **Data-Driven Insights**
- See which patients are actively monitored
- Identify patients with inactive devices
- Track overall measurement volume

---

## Performance Notes

The enhanced endpoint fetches additional data for each patient:
- Weekly summary (already included)
- Total measurement count (1 query per patient)
- Device counts (2 queries per patient)

**All queries run in parallel** using `Promise.all()`, so the response time is minimal (typically < 500ms for 10-20 patients).

For practices with 50+ patients, consider adding pagination or caching.

---

## Summary

✅ **Weekly Stats** - 7-day heart rate and SpO2 summary
✅ **Overview Stats** - Device counts, total measurements, status
✅ **Monitoring Status** - Instant visibility into patient monitoring state
✅ **All in one request** - No additional API calls needed
✅ **Perfect for dashboards** - Rich data for cards, tables, filters

The enhanced patient list endpoint gives you everything needed to build a comprehensive, informative physician dashboard!
