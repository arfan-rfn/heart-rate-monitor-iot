# Physician Patients List API - Request/Response Schema

## Endpoint Details

**Method:** `GET`
**URL:** `/api/physicians/patients`
**Authentication:** Required (JWT)
**Authorization:** Physician role required

---

## Request Schema

### Headers

```typescript
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### Query Parameters

None

### Request Example

```bash
curl -X GET "https://your-api.com/api/physicians/patients" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

---

## Response Schema

### Success Response (200 OK)

```typescript
interface PatientsListResponse {
  success: boolean;
  data: {
    patients: PatientWithStats[];
    totalPatients: number;
  };
}

interface PatientWithStats {
  id: string;                    // Patient's unique user ID (this is the patientId)
  name: string;                  // Patient's full name
  email: string;                 // Patient's email address
  stats: {
    weekly: WeeklyStats;         // Last 7 days statistics
    overview: OverviewStats;     // All-time overview
  };
}

interface WeeklyStats {
  averageHeartRate: number;      // Average heart rate (BPM) - rounded to 1 decimal
  minHeartRate: number;          // Minimum heart rate (BPM) in last 7 days
  maxHeartRate: number;          // Maximum heart rate (BPM) in last 7 days
  averageSpO2: number;           // Average SpO2 (%) - rounded to 1 decimal
  totalMeasurements: number;     // Total measurements in last 7 days
  lastMeasurement: string | null; // ISO 8601 timestamp of most recent measurement
}

interface OverviewStats {
  totalMeasurementsAllTime: number;  // Total measurements across patient's lifetime
  totalDevices: number;              // Total registered devices for patient
  activeDevices: number;             // Number of devices with status='active'
  hasRecentData: boolean;            // True if patient has measurements in last 7 days
  monitoringStatus: MonitoringStatus; // Smart status indicator
}

type MonitoringStatus =
  | 'active'       // Has active devices AND recent data (last 7 days)
  | 'inactive'     // Has active devices BUT no recent data
  | 'no_devices';  // Has no active devices
```

### Example Response - Multiple Patients

```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "usr_abc123xyz",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "stats": {
          "weekly": {
            "averageHeartRate": 72.5,
            "minHeartRate": 58,
            "maxHeartRate": 110,
            "averageSpO2": 97.8,
            "totalMeasurements": 168,
            "lastMeasurement": "2025-11-20T14:30:00.000Z"
          },
          "overview": {
            "totalMeasurementsAllTime": 1248,
            "totalDevices": 2,
            "activeDevices": 2,
            "hasRecentData": true,
            "monitoringStatus": "active"
          }
        }
      },
      {
        "id": "usr_def456uvw",
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "stats": {
          "weekly": {
            "averageHeartRate": 68.3,
            "minHeartRate": 55,
            "maxHeartRate": 95,
            "averageSpO2": 98.2,
            "totalMeasurements": 84,
            "lastMeasurement": "2025-11-19T22:15:00.000Z"
          },
          "overview": {
            "totalMeasurementsAllTime": 542,
            "totalDevices": 1,
            "activeDevices": 1,
            "hasRecentData": true,
            "monitoringStatus": "active"
          }
        }
      },
      {
        "id": "usr_ghi789rst",
        "name": "Bob Wilson",
        "email": "bob.wilson@example.com",
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
            "totalMeasurementsAllTime": 245,
            "totalDevices": 1,
            "activeDevices": 1,
            "hasRecentData": false,
            "monitoringStatus": "inactive"
          }
        }
      },
      {
        "id": "usr_jkl012mno",
        "name": "Alice Brown",
        "email": "alice.brown@example.com",
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
            "totalMeasurementsAllTime": 0,
            "totalDevices": 0,
            "activeDevices": 0,
            "hasRecentData": false,
            "monitoringStatus": "no_devices"
          }
        }
      }
    ],
    "totalPatients": 4
  }
}
```

---

## Field Documentation

### Root Level

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful requests |
| `data` | object | Container for response data |

### Data Object

| Field | Type | Description |
|-------|------|-------------|
| `patients` | PatientWithStats[] | Array of all patients with their statistics |
| `totalPatients` | number | Total count of patients in the array |

### Patient Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Patient's unique user ID (this is the patientId you use for other endpoints) |
| `name` | string | Patient's full name |
| `email` | string | Patient's email address |
| `stats` | object | Container for all patient statistics (weekly + overview) |

### Weekly Stats (Last 7 Days)

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `averageHeartRate` | number | 0-220 | Average heart rate in BPM, rounded to 1 decimal. Returns 0 if no measurements. |
| `minHeartRate` | number | 0-220 | Minimum heart rate in BPM in last 7 days. Returns 0 if no measurements. |
| `maxHeartRate` | number | 0-220 | Maximum heart rate in BPM in last 7 days. Returns 0 if no measurements. |
| `averageSpO2` | number | 0-100 | Average blood oxygen saturation in %, rounded to 1 decimal. Returns 0 if no measurements. |
| `totalMeasurements` | number | ≥0 | Total number of measurements in last 7 days |
| `lastMeasurement` | string \| null | ISO 8601 | Timestamp of most recent measurement, or null if none exist |

### Overview Stats (All-Time)

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `totalMeasurementsAllTime` | number | ≥0 | Total measurements across patient's entire history |
| `totalDevices` | number | ≥0 | Total number of devices registered to this patient |
| `activeDevices` | number | ≥0 | Number of devices with `status='active'` |
| `hasRecentData` | boolean | true/false | `true` if patient has any measurements in last 7 days |
| `monitoringStatus` | string | enum | Smart status indicator (see below) |

### Monitoring Status Logic

| Status | Condition | Badge Color | Meaning |
|--------|-----------|-------------|---------|
| `active` | `activeDevices > 0` AND `hasRecentData = true` | Green | Patient is actively monitored with recent data |
| `inactive` | `activeDevices > 0` AND `hasRecentData = false` | Yellow/Orange | Patient has devices but hasn't sent data recently |
| `no_devices` | `activeDevices = 0` | Gray/Red | Patient has no active devices registered |

---

## Error Responses

### 401 Unauthorized - Missing or Invalid Token

```json
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHORIZED"
  }
}
```

### 403 Forbidden - Not a Physician

```json
{
  "success": false,
  "error": {
    "message": "Access denied: Physician role required",
    "code": "FORBIDDEN"
  }
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_SERVER_ERROR"
  }
}
```

---

## Frontend TypeScript Interfaces

```typescript
// Complete type definitions for frontend integration

export interface PatientsListResponse {
  success: boolean;
  data: {
    patients: PatientWithStats[];
    totalPatients: number;
  };
}

export interface PatientWithStats {
  id: string;
  name: string;
  email: string;
  stats: PatientStats;
}

export interface PatientStats {
  weekly: WeeklyStats;
  overview: OverviewStats;
}

export interface WeeklyStats {
  averageHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  averageSpO2: number;
  totalMeasurements: number;
  lastMeasurement: string | null;
}

export interface OverviewStats {
  totalMeasurementsAllTime: number;
  totalDevices: number;
  activeDevices: number;
  hasRecentData: boolean;
  monitoringStatus: MonitoringStatus;
}

export type MonitoringStatus = 'active' | 'inactive' | 'no_devices';

// Helper type guards
export const isActivePatient = (patient: PatientWithStats): boolean => {
  return patient.stats.overview.monitoringStatus === 'active';
};

export const hasDevices = (patient: PatientWithStats): boolean => {
  return patient.stats.overview.totalDevices > 0;
};
```

---

## Usage Examples

### React Hook for Fetching Patients

```typescript
import { useState, useEffect } from 'react';
import type { PatientsListResponse } from './types';

export function usePatientsList() {
  const [data, setData] = useState<PatientsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch('/api/physicians/patients', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  return { data, loading, error };
}
```

### Axios Example

```typescript
import axios from 'axios';
import type { PatientsListResponse } from './types';

async function fetchPatientsList(): Promise<PatientsListResponse> {
  const token = localStorage.getItem('jwt_token');

  const response = await axios.get<PatientsListResponse>(
    '/api/physicians/patients',
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}
```

---

## Notes

### Data Freshness
- Weekly stats are calculated from measurements in the last 7 days (from current date/time)
- Overview stats include all-time historical data
- Monitoring status is computed in real-time based on device status and data presence

### Performance
- All patient queries run in parallel using `Promise.all()`
- Single database query per patient for weekly stats
- Additional queries for device counts and all-time measurements
- Expected response time: 200-800ms depending on patient count

### Sorting
- Patients are returned sorted alphabetically by name (A-Z)
- Frontend can implement additional sorting by any stat field

### Filtering
- Endpoint returns ALL patients with `role='user'`
- Does not filter by physician association (per ECE 513 requirements)
- Frontend should implement filtering by monitoring status if needed

### Zero Values
- When no measurements exist in last 7 days, all weekly stats return 0
- `lastMeasurement` returns `null` when patient has no measurements
- This makes it easy to detect "no data" scenarios in the UI
