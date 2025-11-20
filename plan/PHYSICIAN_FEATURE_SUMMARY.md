# Physician Feature - Complete Implementation Summary

**For Frontend Development**

---

## 📋 Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Request/Response Schemas](#requestresponse-schemas)
5. [Frontend Integration Guide](#frontend-integration-guide)
6. [Error Handling](#error-handling)
7. [Testing Data Setup](#testing-data-setup)

---

## High-Level Overview

### What is the Physician Feature?

The physician feature allows healthcare providers (physicians) to:
- **View all their patients** in a single dashboard with 7-day health summaries
- **Monitor individual patient health** with weekly statistics
- **Access detailed daily measurements** for any patient
- **Adjust patient device settings** remotely (measurement frequency, active hours)

### User Roles

**Two Roles:**
1. **`user`** (default) - Regular patients who can view their own data
2. **`physician`** - Healthcare providers who can view multiple patients' data

### Key Concepts

**Patient-Physician Association:**
- Patients can associate themselves with a physician using `physicianId`
- Physicians can only access patients who are associated with them
- One patient → One physician (current implementation)

**Security Model:**
- **Layer 1:** JWT authentication (valid token required)
- **Layer 2:** Role verification (must have `role='physician'`)
- **Layer 3:** Relationship verification (patient must belong to THIS physician)

---

## Authentication & Authorization

### How to Get Physician Access

**Step 1: Register a User**
```bash
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "dr.smith@hospital.com",
  "password": "SecurePass123!",
  "name": "Dr. Smith"
}
```

**Step 2: Set Physician Role (Backend Only)**
```bash
npm run set-physician dr.smith@hospital.com
```

**Step 3: Login as Physician**
```bash
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "dr.smith@hospital.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "dr.smith@hospital.com",
    "name": "Dr. Smith",
    "role": "physician"
  }
}
```

**Step 4: Use Token in All Requests**
```
Authorization: Bearer <jwt-token>
```

---

## API Endpoints Reference

### Base URL
```
http://localhost:4000/api/physicians
```

### All Endpoints

| # | Endpoint | Method | Purpose | Auth Required |
|---|----------|--------|---------|---------------|
| 1 | `/patients` | GET | List all patients with 7-day summaries | JWT + Physician Role |
| 2 | `/patients/:patientId/summary` | GET | Get patient weekly summary | JWT + Physician Role |
| 3 | `/patients/:patientId/daily/:date` | GET | Get patient daily measurements | JWT + Physician Role |
| 4 | `/patients/:patientId/devices/:deviceId/config` | PUT | Update patient device config | JWT + Physician Role |

---

## Request/Response Schemas

### 1. List All Patients

**Endpoint:** `GET /api/physicians/patients`

**Purpose:** Display all patients in physician's dashboard with 7-day health summaries

**Request:**
```http
GET /api/physicians/patients HTTP/1.1
Host: localhost:4000
Authorization: Bearer <physician-jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "summary": {
          "averageHeartRate": 72.5,
          "minHeartRate": 58,
          "maxHeartRate": 105,
          "totalMeasurements": 48,
          "lastMeasurement": "2025-11-19T14:30:00.000Z"
        }
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "summary": {
          "averageHeartRate": 68.2,
          "minHeartRate": 55,
          "maxHeartRate": 98,
          "totalMeasurements": 42,
          "lastMeasurement": "2025-11-19T13:00:00.000Z"
        }
      }
    ],
    "totalPatients": 2
  }
}
```

**Response (No Patients - 200 OK):**
```json
{
  "success": true,
  "data": {
    "patients": [],
    "totalPatients": 0
  }
}
```

**TypeScript Interface:**
```typescript
interface PatientListResponse {
  success: true;
  data: {
    patients: Array<{
      id: string;
      name: string;
      email: string;
      summary: {
        averageHeartRate: number;      // Rounded to 1 decimal
        minHeartRate: number;
        maxHeartRate: number;
        totalMeasurements: number;
        lastMeasurement: string | null; // ISO 8601 timestamp
      };
    }>;
    totalPatients: number;
  };
}
```

**Frontend Usage:**
```typescript
const fetchPatients = async (token: string) => {
  const response = await fetch('http://localhost:4000/api/physicians/patients', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data: PatientListResponse = await response.json();
  return data.data.patients;
};
```

---

### 2. Get Patient Weekly Summary

**Endpoint:** `GET /api/physicians/patients/:patientId/summary`

**Purpose:** View detailed weekly statistics for a specific patient + their devices

**Request:**
```http
GET /api/physicians/patients/507f1f77bcf86cd799439011/summary HTTP/1.1
Host: localhost:4000
Authorization: Bearer <physician-jwt-token>
```

**Path Parameters:**
- `patientId` (required) - The patient's user ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
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
    },
    "devices": [
      {
        "deviceId": "photon-abc123",
        "name": "Living Room Monitor",
        "status": "active",
        "config": {
          "measurementFrequency": 1800,
          "activeStartTime": "06:00",
          "activeEndTime": "22:00",
          "timezone": "America/New_York"
        },
        "lastSeen": "2025-11-19T14:30:00.000Z"
      }
    ]
  }
}
```

**TypeScript Interface:**
```typescript
interface PatientSummaryResponse {
  success: true;
  data: {
    patient: {
      id: string;
      name: string;
      email: string;
    };
    summary: {
      averageHeartRate: number;
      minHeartRate: number;
      maxHeartRate: number;
      averageSpO2: number;
      minSpO2: number;
      maxSpO2: number;
      totalMeasurements: number;
      dateRange: {
        start: string;  // YYYY-MM-DD
        end: string;    // YYYY-MM-DD
      };
    };
    devices: Array<{
      deviceId: string;
      name: string;
      status: 'active' | 'inactive' | 'error';
      config: {
        measurementFrequency: number;  // seconds
        activeStartTime: string;       // HH:MM
        activeEndTime: string;         // HH:MM
        timezone: string;
      };
      lastSeen: string | null;  // ISO 8601 timestamp
    }>;
  };
}
```

**Frontend Usage:**
```typescript
const fetchPatientSummary = async (token: string, patientId: string) => {
  const response = await fetch(
    `http://localhost:4000/api/physicians/patients/${patientId}/summary`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  const data: PatientSummaryResponse = await response.json();
  return data.data;
};
```

---

### 3. Get Patient Daily Measurements

**Endpoint:** `GET /api/physicians/patients/:patientId/daily/:date`

**Purpose:** View all measurements for a specific patient on a specific day

**Request:**
```http
GET /api/physicians/patients/507f1f77bcf86cd799439011/daily/2025-11-19 HTTP/1.1
Host: localhost:4000
Authorization: Bearer <physician-jwt-token>
```

**Path Parameters:**
- `patientId` (required) - The patient's user ID
- `date` (required) - Date in YYYY-MM-DD format

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
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
      {
        "timestamp": "2025-11-19T06:30:00.000Z",
        "heartRate": 68,
        "spO2": 98,
        "quality": "good",
        "confidence": 0.95,
        "deviceId": "photon-abc123"
      },
      {
        "timestamp": "2025-11-19T07:00:00.000Z",
        "heartRate": 72,
        "spO2": 99,
        "quality": "good",
        "confidence": 1.0,
        "deviceId": "photon-abc123"
      }
    ],
    "count": 3
  }
}
```

**TypeScript Interface:**
```typescript
interface PatientDailyResponse {
  success: true;
  data: {
    patient: {
      id: string;
      name: string;
      email: string;
    };
    date: string;  // YYYY-MM-DD
    measurements: Array<{
      timestamp: string;          // ISO 8601 timestamp
      heartRate: number;          // BPM
      spO2: number;              // Percentage
      quality: 'good' | 'fair' | 'poor';
      confidence: number;         // 0.0 - 1.0
      deviceId: string;
    }>;
    count: number;
  };
}
```

**Frontend Usage:**
```typescript
const fetchPatientDaily = async (
  token: string,
  patientId: string,
  date: string  // YYYY-MM-DD
) => {
  const response = await fetch(
    `http://localhost:4000/api/physicians/patients/${patientId}/daily/${date}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  const data: PatientDailyResponse = await response.json();
  return data.data;
};
```

---

### 4. Update Patient Device Configuration

**Endpoint:** `PUT /api/physicians/patients/:patientId/devices/:deviceId/config`

**Purpose:** Allow physician to adjust patient's device measurement frequency and active hours

**Request:**
```http
PUT /api/physicians/patients/507f1f77bcf86cd799439011/devices/photon-abc123/config HTTP/1.1
Host: localhost:4000
Authorization: Bearer <physician-jwt-token>
Content-Type: application/json

{
  "measurementFrequency": 3600
}
```

**Path Parameters:**
- `patientId` (required) - The patient's user ID
- `deviceId` (required) - The device identifier

**Request Body:**
```typescript
interface UpdateDeviceConfigRequest {
  measurementFrequency?: number;  // seconds (900-14400)
  activeStartTime?: string;       // HH:MM format
  activeEndTime?: string;         // HH:MM format
}
```

**Validation Rules:**
- `measurementFrequency`: 900-14400 seconds (15 min - 4 hours)
- `activeStartTime`: HH:MM format (00:00 - 23:59)
- `activeEndTime`: HH:MM format (00:00 - 23:59)
- At least one field must be provided

**Request Examples:**

*Change measurement frequency:*
```json
{
  "measurementFrequency": 3600
}
```

*Change active hours:*
```json
{
  "activeStartTime": "08:00",
  "activeEndTime": "20:00"
}
```

*Change multiple settings:*
```json
{
  "measurementFrequency": 1800,
  "activeStartTime": "06:00",
  "activeEndTime": "22:00"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "device": {
      "deviceId": "photon-abc123",
      "name": "Living Room Monitor",
      "config": {
        "measurementFrequency": 3600,
        "activeStartTime": "06:00",
        "activeEndTime": "22:00",
        "timezone": "America/New_York"
      },
      "updatedAt": "2025-11-19T15:30:00.000Z"
    },
    "message": "Device configuration updated by physician"
  }
}
```

**TypeScript Interface:**
```typescript
interface UpdateDeviceConfigResponse {
  success: true;
  data: {
    device: {
      deviceId: string;
      name: string;
      config: {
        measurementFrequency: number;
        activeStartTime: string;
        activeEndTime: string;
        timezone: string;
      };
      updatedAt: string;
    };
    message: string;
  };
}
```

**Frontend Usage:**
```typescript
const updateDeviceConfig = async (
  token: string,
  patientId: string,
  deviceId: string,
  config: UpdateDeviceConfigRequest
) => {
  const response = await fetch(
    `http://localhost:4000/api/physicians/patients/${patientId}/devices/${deviceId}/config`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    }
  );

  const data: UpdateDeviceConfigResponse = await response.json();
  return data.data;
};
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized - Not Authenticated:**
```json
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHORIZED"
  }
}
```

**403 Forbidden - Not a Physician:**
```json
{
  "success": false,
  "error": {
    "message": "Access denied. Required role: physician",
    "code": "FORBIDDEN"
  }
}
```

**403 Forbidden - Wrong Patient:**
```json
{
  "success": false,
  "error": {
    "message": "Access denied: Patient is not associated with this physician",
    "code": "FORBIDDEN"
  }
}
```

**404 Not Found - Patient Doesn't Exist:**
```json
{
  "success": false,
  "error": {
    "message": "Patient not found",
    "code": "PATIENT_NOT_FOUND"
  }
}
```

**404 Not Found - Device Doesn't Exist:**
```json
{
  "success": false,
  "error": {
    "message": "Device not found or does not belong to this patient",
    "code": "DEVICE_NOT_FOUND"
  }
}
```

**400 Bad Request - Invalid Frequency:**
```json
{
  "success": false,
  "error": {
    "message": "Measurement frequency must be between 900 and 14400 seconds (15 min - 4 hours)",
    "code": "INVALID_INPUT"
  }
}
```

**400 Bad Request - Invalid Time Format:**
```json
{
  "success": false,
  "error": {
    "message": "Active start time must be in HH:MM format",
    "code": "INVALID_INPUT"
  }
}
```

### Error Handling in Frontend

```typescript
const handleApiCall = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  try {
    const response = await apiCall();
    return response;
  } catch (error: any) {
    if (error.status === 401) {
      // Redirect to login
      router.push('/login');
    } else if (error.status === 403) {
      // Show permission denied message
      toast.error('You do not have permission to access this resource');
    } else if (error.status === 404) {
      // Show not found message
      toast.error('Resource not found');
    } else {
      // Generic error
      toast.error('An error occurred. Please try again.');
    }
    throw error;
  }
};
```

---

## Frontend Integration Guide

### Recommended Page Structure

**1. Physician Dashboard (`/physician/dashboard`)**
- Display patient list table
- Show 7-day summary for each patient
- Click row to navigate to patient detail
- Use: `GET /api/physicians/patients`

**2. Patient Detail Page (`/physician/patients/:patientId`)**
- Show patient info (name, email)
- Display weekly summary stats
- List devices with config controls
- Link to daily view
- Use: `GET /api/physicians/patients/:patientId/summary`
- Use: `PUT /api/physicians/patients/:patientId/devices/:deviceId/config`

**3. Patient Daily View (`/physician/patients/:patientId/daily`)**
- Date picker for navigation
- Heart rate chart (same as user view)
- SpO2 chart (same as user view)
- Table of all measurements
- Use: `GET /api/physicians/patients/:patientId/daily/:date`

### Example React Components

**Physician Dashboard:**
```tsx
import React, { useEffect, useState } from 'react';

interface Patient {
  id: string;
  name: string;
  email: string;
  summary: {
    averageHeartRate: number;
    minHeartRate: number;
    maxHeartRate: number;
    totalMeasurements: number;
    lastMeasurement: string | null;
  };
}

const PhysicianDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/physicians/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPatients(data.data.patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="physician-dashboard">
      <h1>My Patients</h1>
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Email</th>
            <th>Avg Heart Rate</th>
            <th>Min/Max</th>
            <th>Measurements (7d)</th>
            <th>Last Reading</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id}>
              <td>{patient.name}</td>
              <td>{patient.email}</td>
              <td>{patient.summary.averageHeartRate} bpm</td>
              <td>
                {patient.summary.minHeartRate} / {patient.summary.maxHeartRate} bpm
              </td>
              <td>{patient.summary.totalMeasurements}</td>
              <td>
                {patient.summary.lastMeasurement
                  ? new Date(patient.summary.lastMeasurement).toLocaleString()
                  : 'No data'}
              </td>
              <td>
                <button onClick={() => viewPatient(patient.id)}>
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

export default PhysicianDashboard;
```

**Device Config Update Component:**
```tsx
import React, { useState } from 'react';

interface DeviceConfigProps {
  patientId: string;
  deviceId: string;
  currentConfig: {
    measurementFrequency: number;
    activeStartTime: string;
    activeEndTime: string;
  };
  onUpdate: () => void;
}

const DeviceConfigUpdate: React.FC<DeviceConfigProps> = ({
  patientId,
  deviceId,
  currentConfig,
  onUpdate
}) => {
  const [frequency, setFrequency] = useState(currentConfig.measurementFrequency);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('authToken');

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/physicians/patients/${patientId}/devices/${deviceId}/config`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            measurementFrequency: frequency
          })
        }
      );

      if (response.ok) {
        alert('Device configuration updated successfully!');
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error.message}`);
      }
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Failed to update device configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="device-config">
      <h3>Adjust Measurement Frequency</h3>
      <select
        value={frequency}
        onChange={(e) => setFrequency(Number(e.target.value))}
        disabled={loading}
      >
        <option value={900}>Every 15 minutes</option>
        <option value={1800}>Every 30 minutes</option>
        <option value={3600}>Every hour</option>
        <option value={7200}>Every 2 hours</option>
        <option value={14400}>Every 4 hours</option>
      </select>
      <button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Updating...' : 'Update Configuration'}
      </button>
    </div>
  );
};

export default DeviceConfigUpdate;
```

---

## Testing Data Setup

### How to Set Up Test Data

**1. Create a Physician Account:**
```bash
# Register
curl -X POST http://localhost:4000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email": "dr.smith@hospital.com", "password": "SecurePass123!", "name": "Dr. Smith"}'

# Set physician role (run on server)
npm run set-physician dr.smith@hospital.com
```

**2. Create a Patient Account:**
```bash
curl -X POST http://localhost:4000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email": "patient1@example.com", "password": "SecurePass123!", "name": "John Doe"}'
```

**3. Get Physician User ID:**

Login as physician and extract the `id` from the response, or check MongoDB:
```javascript
db.user.findOne({ email: "dr.smith@hospital.com" }, { id: 1 })
```

**4. Associate Patient with Physician:**
```bash
# Login as patient first
export PATIENT_TOKEN="<patient-jwt-token>"
export PHYSICIAN_ID="<physician-user-id>"

curl -X PUT http://localhost:4000/api/users/physician \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"physicianId\": \"$PHYSICIAN_ID\"}"
```

**5. Register a Device for Patient:**
```bash
curl -X POST http://localhost:4000/api/devices \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test-device-001", "name": "Test Monitor"}'
```

**6. Submit Test Measurements:**
```bash
export DEVICE_API_KEY="<device-api-key-from-step-5>"

curl -X POST http://localhost:4000/api/measurements \
  -H "X-API-Key: $DEVICE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test-device-001", "heartRate": 72, "spO2": 98}'
```

---

## Quick Reference

### Measurement Frequency Options

| Minutes | Seconds | Description |
|---------|---------|-------------|
| 15 | 900 | Minimum (Most frequent) |
| 30 | 1800 | Default |
| 60 | 3600 | Every hour |
| 120 | 7200 | Every 2 hours |
| 240 | 14400 | Maximum (Least frequent) |

### Time Format

- **Format:** `HH:MM` (24-hour format)
- **Examples:** `06:00`, `14:30`, `22:00`
- **Range:** `00:00` - `23:59`

### HTTP Status Codes

- **200** - Success (GET, PUT)
- **400** - Bad Request (invalid input)
- **401** - Unauthorized (no token or expired)
- **403** - Forbidden (wrong role or wrong patient)
- **404** - Not Found (patient/device doesn't exist)
- **500** - Server Error

---

## Complete TypeScript Types

```typescript
// ===== Common Types =====

type Role = 'user' | 'physician';
type DeviceStatus = 'active' | 'inactive' | 'error';
type MeasurementQuality = 'good' | 'fair' | 'poor';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

// ===== Physician Dashboard =====

interface PatientSummary {
  averageHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  totalMeasurements: number;
  lastMeasurement: string | null;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  summary: PatientSummary;
}

interface PatientListResponse extends ApiResponse<{
  patients: Patient[];
  totalPatients: number;
}> {}

// ===== Patient Detail =====

interface WeeklySummary {
  averageHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  averageSpO2: number;
  minSpO2: number;
  maxSpO2: number;
  totalMeasurements: number;
  dateRange: {
    start: string;
    end: string;
  };
}

interface DeviceConfig {
  measurementFrequency: number;
  activeStartTime: string;
  activeEndTime: string;
  timezone: string;
}

interface PatientDevice {
  deviceId: string;
  name: string;
  status: DeviceStatus;
  config: DeviceConfig;
  lastSeen: string | null;
}

interface PatientInfo {
  id: string;
  name: string;
  email: string;
}

interface PatientDetailResponse extends ApiResponse<{
  patient: PatientInfo;
  summary: WeeklySummary;
  devices: PatientDevice[];
}> {}

// ===== Daily Measurements =====

interface Measurement {
  timestamp: string;
  heartRate: number;
  spO2: number;
  quality: MeasurementQuality;
  confidence: number;
  deviceId: string;
}

interface PatientDailyResponse extends ApiResponse<{
  patient: PatientInfo;
  date: string;
  measurements: Measurement[];
  count: number;
}> {}

// ===== Device Config Update =====

interface UpdateDeviceConfigRequest {
  measurementFrequency?: number;
  activeStartTime?: string;
  activeEndTime?: string;
}

interface UpdateDeviceConfigResponse extends ApiResponse<{
  device: {
    deviceId: string;
    name: string;
    config: DeviceConfig;
    updatedAt: string;
  };
  message: string;
}> {}

// ===== API Client =====

class PhysicianApiClient {
  constructor(private baseUrl: string, private token: string) {}

  async getPatients(): Promise<Patient[]> {
    const response = await fetch(`${this.baseUrl}/api/physicians/patients`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    const data: PatientListResponse = await response.json();
    if (!data.success) throw new Error(data.error?.message);
    return data.data!.patients;
  }

  async getPatientSummary(patientId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/physicians/patients/${patientId}/summary`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );
    const data: PatientDetailResponse = await response.json();
    if (!data.success) throw new Error(data.error?.message);
    return data.data!;
  }

  async getPatientDaily(patientId: string, date: string) {
    const response = await fetch(
      `${this.baseUrl}/api/physicians/patients/${patientId}/daily/${date}`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );
    const data: PatientDailyResponse = await response.json();
    if (!data.success) throw new Error(data.error?.message);
    return data.data!;
  }

  async updateDeviceConfig(
    patientId: string,
    deviceId: string,
    config: UpdateDeviceConfigRequest
  ) {
    const response = await fetch(
      `${this.baseUrl}/api/physicians/patients/${patientId}/devices/${deviceId}/config`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      }
    );
    const data: UpdateDeviceConfigResponse = await response.json();
    if (!data.success) throw new Error(data.error?.message);
    return data.data!;
  }
}
```

---

## Summary Checklist

**Backend Implementation:**
- ✅ 4 physician endpoints fully implemented
- ✅ Three-layer security (JWT → Role → Relationship)
- ✅ Direct MongoDB queries for user management
- ✅ Proper error handling and validation
- ✅ Utility script to set physician role

**Frontend Integration Needs:**
- 📋 Patient dashboard page (list all patients)
- 📋 Patient detail page (weekly summary + device controls)
- 📋 Patient daily view page (charts + measurements)
- 📋 Device config update component
- 📋 Error handling and loading states
- 📋 Authentication state management

**Testing:**
- ✅ All endpoints tested with curl
- ✅ Authorization tests passed
- ✅ Validation tests passed
- 📋 Frontend integration testing needed

---

**Last Updated:** 2025-11-20
**Status:** Backend Complete - Ready for Frontend Integration
**Documentation:** Comprehensive with TypeScript types and React examples
