# Part 2: Physician-Level Measurement Analytics

**Analysis Date:** 2025-11-19
**Scope:** Physician portal measurement endpoints for patient monitoring
**Target Audience:** Physicians (ECE 513 requirement) viewing patient health data
**Status:** ❌ 0% Complete - All physician endpoints need implementation

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Physician Requirements](#physician-requirements)
3. [Missing Implementation](#missing-implementation)
4. [Complete Implementation Plan](#complete-implementation-plan)
5. [Endpoint Specifications](#endpoint-specifications)
6. [Database Queries](#database-queries)
7. [Security & Authorization](#security--authorization)
8. [Testing Guide](#testing-guide)

---

## Executive Summary

### ECE 513 Mandatory Requirements

Physicians need the ability to:
- ✅ Register separate physician accounts (infrastructure ready)
- ❌ View list of all their patients with 7-day summaries (**NOT implemented**)
- ❌ View individual patient weekly summary (**NOT implemented**)
- ❌ View individual patient daily measurements (**NOT implemented**)
- ❌ Adjust patient device measurement frequency (**NOT implemented**)

### Current Status

**Infrastructure (Ready):**
- ✅ Role-based middleware (`requirePhysician`)
- ✅ User model supports `role='physician'`
- ✅ Patient-physician association via `physicianId` field
- ✅ Authentication system with role verification

**Missing (To Implement):**
- ❌ `/api/physicians` route module
- ❌ Physician controller functions (4 endpoints)
- ❌ Patient-physician relationship verification
- ❌ Physician-specific measurement aggregation

**Effort Estimate:** 6-8 hours of focused work

---

## Physician Requirements

### From ECE 513 Specification

**1. Physician Portal: All-Patient View**
> "The all-patient view will list all patients by name with their 7-day average, maximum, and minimum heart rate."

**Required Data:**
- Patient name
- Patient email (optional but useful)
- 7-day average heart rate
- 7-day minimum heart rate
- 7-day maximum heart rate

**2. Physician Portal: Patient Summary View**
> "The patient's summary view is similar to the weekly summary view for a user, but also includes controls that allow the physician to adjust the frequency of measurement."

**Required Data:**
- Same as user weekly summary
- Controls to adjust measurement frequency

**3. Physician Portal: Patient Detailed Daily View**
> "The patient's detailed day view will present the same information as the detailed day view for the user."

**Required Data:**
- All measurements for selected day
- Same charting format as user view

**4. Physician Can Adjust Patient Config**
> "Controls that allow the physician to adjust the frequency of measurement."

**Required Functionality:**
- Update patient's device configuration
- Change measurement frequency
- Optionally adjust time range

---

## Missing Implementation

### File Structure to Create

```
api-server/src/routes/physicians/
├── index.ts           # Export routes and controller
├── routes.ts          # Route definitions with middleware
├── controller.ts      # Business logic (4 functions)
└── helpers.ts         # Utility functions (verification)
```

### Endpoints to Implement

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 1 | `/api/physicians/patients` | GET | List all patients | ❌ Not implemented |
| 2 | `/api/physicians/patients/:patientId/summary` | GET | Patient weekly summary | ❌ Not implemented |
| 3 | `/api/physicians/patients/:patientId/daily/:date` | GET | Patient daily view | ❌ Not implemented |
| 4 | `/api/physicians/patients/:patientId/devices/:deviceId/config` | PUT | Adjust device config | ❌ Not implemented |

---

## Complete Implementation Plan

### Step 1: Create Helper Functions

**File:** `src/routes/physicians/helpers.ts`

```typescript
import { AppError } from '../../middleware/error/index.js';
import { auth } from '../../config/auth.js';

/**
 * Verify patient belongs to physician
 * @throws AppError if patient not found or not associated with physician
 */
export async function verifyPhysicianPatientRelationship(
  physicianId: string,
  patientId: string
): Promise<void> {
  // Get patient from Better Auth
  const patient = await auth.api.getUser({
    headers: new Headers(),
    params: { id: patientId }
  });

  if (!patient) {
    throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
  }

  // Check if patient is associated with this physician
  if (patient.physicianId !== physicianId) {
    throw new AppError(
      'Access denied: Patient is not associated with this physician',
      403,
      'FORBIDDEN'
    );
  }
}

/**
 * Get all patients for a physician
 */
export async function getPatientsForPhysician(physicianId: string) {
  // Query Better Auth for users where physicianId matches
  const users = await auth.api.listUsers({
    headers: new Headers(),
    query: {}
  });

  // Filter patients by physicianId
  const patients = users.filter(user =>
    user.physicianId === physicianId && user.role === 'user'
  );

  return patients;
}
```

---

### Step 2: Create Physician Controller

**File:** `src/routes/physicians/controller.ts`

```typescript
import { Request, Response } from 'express';
import { Measurement } from '../../models/measurements/index.js';
import { Device } from '../../models/devices/index.js';
import { asyncHandler, AppError } from '../../middleware/error/index.js';
import {
  verifyPhysicianPatientRelationship,
  getPatientsForPhysician
} from './helpers.js';

/**
 * Get all patients with their 7-day summaries
 * GET /api/physicians/patients
 * Auth: JWT + requirePhysician middleware
 */
export const getAllPatients = asyncHandler(async (req: Request, res: Response) => {
  const physicianId = req.user?.id;

  if (!physicianId) {
    throw new AppError('Physician not authenticated', 401, 'UNAUTHORIZED');
  }

  // Get all patients associated with this physician
  const patients = await getPatientsForPhysician(physicianId);

  if (patients.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        patients: [],
        totalPatients: 0
      }
    });
  }

  // Get 7-day summary for each patient
  const patientSummaries = await Promise.all(
    patients.map(async (patient) => {
      const summary = await Measurement.getWeeklySummary(patient.id);

      return {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        summary: summary ? {
          averageHeartRate: Math.round(summary.averageHeartRate * 10) / 10,
          minHeartRate: summary.minHeartRate,
          maxHeartRate: summary.maxHeartRate,
          totalMeasurements: summary.totalMeasurements,
          lastMeasurement: summary.lastMeasurement?.toISOString()
        } : {
          averageHeartRate: 0,
          minHeartRate: 0,
          maxHeartRate: 0,
          totalMeasurements: 0,
          lastMeasurement: null
        }
      };
    })
  );

  // Sort by name
  patientSummaries.sort((a, b) => a.name.localeCompare(b.name));

  res.status(200).json({
    success: true,
    data: {
      patients: patientSummaries,
      totalPatients: patientSummaries.length
    }
  });
});

/**
 * Get specific patient's weekly summary
 * GET /api/physicians/patients/:patientId/summary
 * Auth: JWT + requirePhysician + patient verification
 */
export const getPatientSummary = asyncHandler(async (req: Request, res: Response) => {
  const physicianId = req.user?.id;
  const { patientId } = req.params;

  if (!physicianId) {
    throw new AppError('Physician not authenticated', 401, 'UNAUTHORIZED');
  }

  // Verify patient belongs to physician
  await verifyPhysicianPatientRelationship(physicianId, patientId);

  // Get patient info
  const patient = await auth.api.getUser({
    headers: new Headers(),
    params: { id: patientId }
  });

  // Get weekly summary
  const summary = await Measurement.getWeeklySummary(patientId);

  // Get patient's devices
  const devices = await Device.find({ userId: patientId }).select(
    'deviceId name status config lastSeen'
  );

  res.status(200).json({
    success: true,
    data: {
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email
      },
      summary: summary ? {
        averageHeartRate: Math.round(summary.averageHeartRate * 10) / 10,
        minHeartRate: summary.minHeartRate,
        maxHeartRate: summary.maxHeartRate,
        averageSpO2: Math.round(summary.averageSpO2 * 10) / 10,
        minSpO2: summary.minSpO2,
        maxSpO2: summary.maxSpO2,
        totalMeasurements: summary.totalMeasurements,
        dateRange: {
          start: summary.firstMeasurement?.toISOString().split('T')[0],
          end: summary.lastMeasurement?.toISOString().split('T')[0]
        }
      } : {
        averageHeartRate: 0,
        minHeartRate: 0,
        maxHeartRate: 0,
        averageSpO2: 0,
        minSpO2: 0,
        maxSpO2: 0,
        totalMeasurements: 0,
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        }
      },
      devices: devices.map(d => ({
        deviceId: d.deviceId,
        name: d.name,
        status: d.status,
        config: d.config,
        lastSeen: d.lastSeen?.toISOString()
      }))
    }
  });
});

/**
 * Get patient's daily measurements
 * GET /api/physicians/patients/:patientId/daily/:date
 * Auth: JWT + requirePhysician + patient verification
 */
export const getPatientDailyMeasurements = asyncHandler(
  async (req: Request, res: Response) => {
    const physicianId = req.user?.id;
    const { patientId, date } = req.params;

    if (!physicianId) {
      throw new AppError('Physician not authenticated', 401, 'UNAUTHORIZED');
    }

    if (!date) {
      throw new AppError('Date parameter is required', 400, 'INVALID_INPUT');
    }

    // Verify patient belongs to physician
    await verifyPhysicianPatientRelationship(physicianId, patientId);

    // Get patient info
    const patient = await auth.api.getUser({
      headers: new Headers(),
      params: { id: patientId }
    });

    // Get daily measurements
    const targetDate = new Date(date);
    const measurements = await Measurement.findDailyMeasurements(patientId, targetDate);

    res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          name: patient.name,
          email: patient.email
        },
        date: targetDate.toISOString().split('T')[0],
        measurements: measurements.map((m) => ({
          timestamp: m.timestamp,
          heartRate: m.heartRate,
          spO2: m.spO2,
          quality: m.quality,
          confidence: m.confidence,
          deviceId: m.deviceId
        })),
        count: measurements.length
      }
    });
  }
);

/**
 * Update patient's device configuration
 * PUT /api/physicians/patients/:patientId/devices/:deviceId/config
 * Auth: JWT + requirePhysician + patient verification
 */
export const updatePatientDeviceConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const physicianId = req.user?.id;
    const { patientId, deviceId } = req.params;
    const { measurementFrequency, activeStartTime, activeEndTime } = req.body;

    if (!physicianId) {
      throw new AppError('Physician not authenticated', 401, 'UNAUTHORIZED');
    }

    // Verify patient belongs to physician
    await verifyPhysicianPatientRelationship(physicianId, patientId);

    // Find device
    const device = await Device.findOne({ deviceId, userId: patientId });

    if (!device) {
      throw new AppError(
        'Device not found or does not belong to this patient',
        404,
        'DEVICE_NOT_FOUND'
      );
    }

    // Update configuration
    let updated = false;

    if (measurementFrequency !== undefined) {
      // Validate frequency (15 minutes to 4 hours)
      if (measurementFrequency < 900 || measurementFrequency > 14400) {
        throw new AppError(
          'Measurement frequency must be between 900 and 14400 seconds (15 min - 4 hours)',
          400,
          'INVALID_INPUT'
        );
      }
      device.config.measurementFrequency = measurementFrequency;
      updated = true;
    }

    if (activeStartTime !== undefined) {
      // Validate time format (HH:MM)
      if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(activeStartTime)) {
        throw new AppError(
          'Active start time must be in HH:MM format',
          400,
          'INVALID_INPUT'
        );
      }
      device.config.activeStartTime = activeStartTime;
      updated = true;
    }

    if (activeEndTime !== undefined) {
      // Validate time format (HH:MM)
      if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(activeEndTime)) {
        throw new AppError(
          'Active end time must be in HH:MM format',
          400,
          'INVALID_INPUT'
        );
      }
      device.config.activeEndTime = activeEndTime;
      updated = true;
    }

    if (!updated) {
      throw new AppError(
        'No valid configuration parameters provided',
        400,
        'INVALID_INPUT'
      );
    }

    await device.save();

    res.status(200).json({
      success: true,
      data: {
        device: {
          deviceId: device.deviceId,
          name: device.name,
          config: device.config,
          updatedAt: device.updatedAt
        },
        message: 'Device configuration updated by physician'
      }
    });
  }
);
```

---

### Step 3: Create Physician Routes

**File:** `src/routes/physicians/routes.ts`

```typescript
import { Router } from 'express';
import {
  getAllPatients,
  getPatientSummary,
  getPatientDailyMeasurements,
  updatePatientDeviceConfig
} from './controller.js';
import { authenticate } from '../../middleware/auth/index.js';
import { requirePhysician } from '../../middleware/role/index.js';

const router = Router();

/**
 * All physician routes require:
 * 1. User authentication (JWT)
 * 2. Physician role verification
 */
router.use(authenticate, requirePhysician);

/**
 * Physician Portal Routes
 */

// Get all patients with 7-day summaries
// Required by ECE 513 spec: "list all patients by name with their 7-day average, maximum, and minimum heart rate"
router.get('/patients', getAllPatients);

// Get specific patient's weekly summary
// Required by ECE 513 spec: "patient's summary view similar to weekly summary view"
router.get('/patients/:patientId/summary', getPatientSummary);

// Get specific patient's daily measurements
// Required by ECE 513 spec: "patient's detailed day view"
router.get('/patients/:patientId/daily/:date', getPatientDailyMeasurements);

// Update patient's device configuration
// Required by ECE 513 spec: "allow the physician to adjust the frequency of measurement"
router.put('/patients/:patientId/devices/:deviceId/config', updatePatientDeviceConfig);

export default router;
```

---

### Step 4: Create Index Export

**File:** `src/routes/physicians/index.ts`

```typescript
export { default } from './routes.js';
export * from './controller.js';
export * from './helpers.js';
```

---

### Step 5: Mount Routes in App

**File:** `src/app.ts`

Add the following to mount physician routes:

```typescript
// Add import at top of file
import physicianRoutes from './routes/physicians/index.js';

// Mount routes (add after other route declarations)
app.use('/api/physicians', physicianRoutes);
```

---

## Endpoint Specifications

### 1. Get All Patients with Summaries

**Endpoint:** `GET /api/physicians/patients`
**Authentication:** JWT + Physician role
**Purpose:** List all patients associated with physician (REQUIRED by spec)

#### Request Headers
```
Authorization: Bearer <physician-jwt-token>
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "user-507f1f77bcf86cd799439011",
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
        "id": "user-507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "summary": {
          "averageHeartRate": 68.2,
          "minHeartRate": 55,
          "maxHeartRate": 98,
          "totalMeasurements": 42,
          "lastMeasurement": "2025-11-19T13:00:00.000Z"
        }
      },
      {
        "id": "user-507f1f77bcf86cd799439013",
        "name": "Bob Johnson",
        "email": "bob.johnson@example.com",
        "summary": {
          "averageHeartRate": 75.8,
          "minHeartRate": 62,
          "maxHeartRate": 112,
          "totalMeasurements": 36,
          "lastMeasurement": "2025-11-19T12:15:00.000Z"
        }
      }
    ],
    "totalPatients": 3
  }
}
```

#### Response (No Patients - 200 OK)
```json
{
  "success": true,
  "data": {
    "patients": [],
    "totalPatients": 0
  }
}
```

#### Error Response (403 Forbidden)
```json
{
  "success": false,
  "error": {
    "message": "Access denied. Required role: physician",
    "code": "FORBIDDEN"
  }
}
```

#### Example Usage (Frontend)
```typescript
// Fetch all patients for physician dashboard
async function fetchPatientList() {
  const response = await fetch('/api/physicians/patients', {
    headers: {
      'Authorization': `Bearer ${physicianToken}`
    }
  });

  const { data } = await response.json();

  // Render patient table
  renderPatientTable(data.patients);
}

function renderPatientTable(patients) {
  return (
    <table className="patient-list">
      <thead>
        <tr>
          <th>Patient Name</th>
          <th>Avg Heart Rate</th>
          <th>Min/Max</th>
          <th>Measurements</th>
          <th>Last Reading</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {patients.map(patient => (
          <tr key={patient.id}>
            <td>{patient.name}</td>
            <td>{patient.summary.averageHeartRate} bpm</td>
            <td>{patient.summary.minHeartRate} / {patient.summary.maxHeartRate}</td>
            <td>{patient.summary.totalMeasurements}</td>
            <td>{new Date(patient.summary.lastMeasurement).toLocaleString()}</td>
            <td>
              <button onClick={() => viewPatientDetails(patient.id)}>
                View Details
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

#### Database Query
```typescript
// Step 1: Get all patients for physician
const patients = await getPatientsForPhysician(physicianId);

// Step 2: Parallel aggregation for all patients
const patientSummaries = await Promise.all(
  patients.map(async (patient) => {
    const summary = await Measurement.getWeeklySummary(patient.id);
    return {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      summary: summary || defaultSummary
    };
  })
);
```

**Performance Consideration:**
- For physicians with 10+ patients, consider caching summaries
- For 50+ patients, implement pagination or use single aggregation query

---

### 2. Get Patient Weekly Summary

**Endpoint:** `GET /api/physicians/patients/:patientId/summary`
**Authentication:** JWT + Physician role + Patient verification
**Purpose:** View patient's weekly summary (REQUIRED by spec)

#### Request Headers
```
Authorization: Bearer <physician-jwt-token>
```

#### Path Parameters
- `patientId` - Patient user ID

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "user-507f1f77bcf86cd799439011",
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

#### Error Response (403 Forbidden)
```json
{
  "success": false,
  "error": {
    "message": "Access denied: Patient is not associated with this physician",
    "code": "FORBIDDEN"
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "error": {
    "message": "Patient not found",
    "code": "PATIENT_NOT_FOUND"
  }
}
```

#### Example Usage (Frontend)
```typescript
// View patient summary with device controls
async function viewPatientSummary(patientId: string) {
  const response = await fetch(`/api/physicians/patients/${patientId}/summary`, {
    headers: {
      'Authorization': `Bearer ${physicianToken}`
    }
  });

  const { data } = await response.json();

  return (
    <div className="patient-summary">
      <h2>{data.patient.name}'s Health Summary</h2>

      {/* Weekly Statistics */}
      <section className="weekly-stats">
        <div className="stat-card">
          <h3>Average Heart Rate</h3>
          <p className="value">{data.summary.averageHeartRate} bpm</p>
        </div>
        <div className="stat-card">
          <h3>Heart Rate Range</h3>
          <p className="value">
            {data.summary.minHeartRate} - {data.summary.maxHeartRate} bpm
          </p>
        </div>
        <div className="stat-card">
          <h3>Average SpO2</h3>
          <p className="value">{data.summary.averageSpO2}%</p>
        </div>
        <div className="stat-card">
          <h3>Total Measurements</h3>
          <p className="value">{data.summary.totalMeasurements}</p>
        </div>
      </section>

      {/* Device Configuration Controls */}
      <section className="device-controls">
        <h3>Devices</h3>
        {data.devices.map(device => (
          <div key={device.deviceId} className="device-card">
            <h4>{device.name}</h4>
            <p>Status: {device.status}</p>
            <p>Last seen: {new Date(device.lastSeen).toLocaleString()}</p>

            {/* Physician controls to adjust frequency */}
            <div className="config-controls">
              <label>Measurement Frequency (minutes):</label>
              <select
                value={device.config.measurementFrequency / 60}
                onChange={(e) => updateDeviceFrequency(
                  patientId,
                  device.deviceId,
                  parseInt(e.target.value) * 60
                )}
              >
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every hour</option>
                <option value="120">Every 2 hours</option>
                <option value="240">Every 4 hours</option>
              </select>

              <button onClick={() => updateDeviceFrequency(...)}>
                Update Configuration
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
```

---

### 3. Get Patient Daily Measurements

**Endpoint:** `GET /api/physicians/patients/:patientId/daily/:date`
**Authentication:** JWT + Physician role + Patient verification
**Purpose:** View patient's daily detail (REQUIRED by spec)

#### Request Headers
```
Authorization: Bearer <physician-jwt-token>
```

#### Path Parameters
- `patientId` - Patient user ID
- `date` - Date in YYYY-MM-DD format

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "user-507f1f77bcf86cd799439011",
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
      }
      // ... more measurements
    ],
    "count": 24
  }
}
```

#### Example Usage (Frontend)
```typescript
// View patient daily charts (same as user view, but with patient context)
async function viewPatientDailyData(patientId: string, date: string) {
  const response = await fetch(
    `/api/physicians/patients/${patientId}/daily/${date}`,
    {
      headers: { 'Authorization': `Bearer ${physicianToken}` }
    }
  );

  const { data } = await response.json();

  // Render charts (same as user daily view)
  renderHeartRateChart(data.measurements);
  renderSpO2Chart(data.measurements);

  return (
    <div className="patient-daily-view">
      <h2>{data.patient.name} - {data.date}</h2>
      <p>{data.count} measurements recorded</p>

      <div className="charts">
        <canvas id="heartRateChart"></canvas>
        <canvas id="spO2Chart"></canvas>
      </div>
    </div>
  );
}
```

---

### 4. Update Patient Device Configuration

**Endpoint:** `PUT /api/physicians/patients/:patientId/devices/:deviceId/config`
**Authentication:** JWT + Physician role + Patient verification
**Purpose:** Adjust measurement frequency (REQUIRED by spec)

#### Request Headers
```
Authorization: Bearer <physician-jwt-token>
Content-Type: application/json
```

#### Path Parameters
- `patientId` - Patient user ID
- `deviceId` - Device identifier

#### Request Body
```json
{
  "measurementFrequency": 3600,     // Optional - in seconds (900-14400)
  "activeStartTime": "06:00",       // Optional - HH:MM format
  "activeEndTime": "22:00"          // Optional - HH:MM format
}
```

#### Validation Rules
- `measurementFrequency`: 900-14400 seconds (15 min - 4 hours)
- `activeStartTime`: HH:MM format (00:00 - 23:59)
- `activeEndTime`: HH:MM format (00:00 - 23:59)
- At least one field must be provided

#### Response (200 OK)
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

#### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "message": "Measurement frequency must be between 900 and 14400 seconds (15 min - 4 hours)",
    "code": "INVALID_INPUT"
  }
}
```

#### Example Usage (Frontend)
```typescript
// Update patient device frequency
async function updateDeviceFrequency(
  patientId: string,
  deviceId: string,
  frequencyMinutes: number
) {
  const response = await fetch(
    `/api/physicians/patients/${patientId}/devices/${deviceId}/config`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${physicianToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        measurementFrequency: frequencyMinutes * 60  // Convert to seconds
      })
    }
  );

  if (response.ok) {
    const { data } = await response.json();
    alert(`Device configuration updated: ${data.message}`);
    // Refresh patient summary
    await viewPatientSummary(patientId);
  } else {
    const { error } = await response.json();
    alert(`Error: ${error.message}`);
  }
}

// Usage in UI
<select onChange={(e) => {
  const minutes = parseInt(e.target.value);
  updateDeviceFrequency(patientId, deviceId, minutes);
}}>
  <option value="15">Every 15 minutes</option>
  <option value="30">Every 30 minutes (default)</option>
  <option value="60">Every hour</option>
  <option value="120">Every 2 hours</option>
  <option value="240">Every 4 hours</option>
</select>
```

---

## Database Queries

### Query 1: Get All Patients for Physician

```typescript
// Using Better Auth API
const users = await auth.api.listUsers({
  headers: new Headers(),
  query: {}
});

// Filter by physicianId
const patients = users.filter(user =>
  user.physicianId === physicianId && user.role === 'user'
);
```

**Alternative (if using MongoDB directly):**
```javascript
const patients = await User.find({
  physicianId: physicianId,
  role: 'user'
}).select('_id name email');
```

---

### Query 2: Bulk Patient Summaries (Optimized)

**Current Approach (Works for <20 patients):**
```typescript
const patientSummaries = await Promise.all(
  patients.map(patient => Measurement.getWeeklySummary(patient.id))
);
```

**Optimized Approach (For 20+ patients):**
```typescript
// Single aggregation query for all patients
const patientIds = patients.map(p => p.id);
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const summaries = await Measurement.aggregate([
  {
    $match: {
      userId: { $in: patientIds },
      timestamp: { $gte: sevenDaysAgo }
    }
  },
  {
    $group: {
      _id: '$userId',
      averageHeartRate: { $avg: '$heartRate' },
      minHeartRate: { $min: '$heartRate' },
      maxHeartRate: { $max: '$heartRate' },
      totalMeasurements: { $sum: 1 },
      lastMeasurement: { $max: '$timestamp' }
    }
  }
]);

// Map summaries back to patients
const summaryMap = new Map(
  summaries.map(s => [s._id, s])
);

const patientSummaries = patients.map(patient => ({
  id: patient.id,
  name: patient.name,
  email: patient.email,
  summary: summaryMap.get(patient.id) || defaultSummary
}));
```

---

### Query 3: Verify Patient-Physician Relationship

```typescript
// Get patient from Better Auth
const patient = await auth.api.getUser({
  headers: new Headers(),
  params: { id: patientId }
});

// Check relationship
if (!patient || patient.physicianId !== physicianId) {
  throw new AppError(
    'Access denied: Patient not associated with this physician',
    403,
    'FORBIDDEN'
  );
}
```

---

## Security & Authorization

### Authorization Flow

```
1. User makes request to physician endpoint
   ↓
2. authenticate middleware verifies JWT
   ↓
3. requirePhysician middleware checks role === 'physician'
   ↓
4. Controller verifies patient-physician relationship
   ↓
5. If all checks pass, execute query and return data
```

### Role-Based Access Control

**Middleware:** `src/middleware/role/index.ts`

```typescript
// Already implemented
export const requirePhysician = requireRole('physician');
```

**Usage in routes:**
```typescript
router.use(authenticate, requirePhysician);
```

### Patient Relationship Verification

**Critical Security Check:**
```typescript
// ALWAYS verify before accessing patient data
await verifyPhysicianPatientRelationship(physicianId, patientId);
```

**What it prevents:**
- Physician A accessing Physician B's patients
- Users pretending to be physicians
- Cross-physician data leakage

---

## Testing Guide

### Manual Testing with curl

**1. Get Physician JWT Token:**
```bash
# Login as physician
curl -X POST http://localhost:4000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@hospital.com",
    "password": "SecurePass123!"
  }'

# Extract token from response
PHYSICIAN_TOKEN="<jwt-token-from-response>"
```

**2. Test Get All Patients:**
```bash
curl -X GET http://localhost:4000/api/physicians/patients \
  -H "Authorization: Bearer $PHYSICIAN_TOKEN"
```

**3. Test Get Patient Summary:**
```bash
PATIENT_ID="<patient-user-id>"

curl -X GET "http://localhost:4000/api/physicians/patients/$PATIENT_ID/summary" \
  -H "Authorization: Bearer $PHYSICIAN_TOKEN"
```

**4. Test Get Patient Daily Measurements:**
```bash
curl -X GET "http://localhost:4000/api/physicians/patients/$PATIENT_ID/daily/2025-11-19" \
  -H "Authorization: Bearer $PHYSICIAN_TOKEN"
```

**5. Test Update Device Configuration:**
```bash
DEVICE_ID="photon-abc123"

curl -X PUT "http://localhost:4000/api/physicians/patients/$PATIENT_ID/devices/$DEVICE_ID/config" \
  -H "Authorization: Bearer $PHYSICIAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "measurementFrequency": 3600
  }'
```

---

### Unit Tests

**File:** `api-server/tests/routes/physicians.test.ts`

```typescript
import request from 'supertest';
import app from '../../src/app';

describe('Physician Portal Endpoints', () => {
  let physicianToken: string;
  let patientId: string;
  let deviceId: string;

  beforeAll(async () => {
    // Setup: Create physician, patient, and device
    // Login as physician and get token
  });

  describe('GET /api/physicians/patients', () => {
    it('should return list of all patients with summaries', async () => {
      const response = await request(app)
        .get('/api/physicians/patients')
        .set('Authorization', `Bearer ${physicianToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.patients)).toBe(true);
    });

    it('should deny access to non-physician users', async () => {
      const userToken = '<regular-user-token>';

      await request(app)
        .get('/api/physicians/patients')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/physicians/patients/:patientId/summary', () => {
    it('should return patient weekly summary', async () => {
      const response = await request(app)
        .get(`/api/physicians/patients/${patientId}/summary`)
        .set('Authorization', `Bearer ${physicianToken}`)
        .expect(200);

      expect(response.body.data.patient).toBeDefined();
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.devices).toBeDefined();
    });

    it('should deny access to non-associated patient', async () => {
      const otherPatientId = '<different-patient-id>';

      await request(app)
        .get(`/api/physicians/patients/${otherPatientId}/summary`)
        .set('Authorization', `Bearer ${physicianToken}`)
        .expect(403);
    });
  });

  describe('PUT /api/physicians/patients/:patientId/devices/:deviceId/config', () => {
    it('should update device configuration', async () => {
      const response = await request(app)
        .put(`/api/physicians/patients/${patientId}/devices/${deviceId}/config`)
        .set('Authorization', `Bearer ${physicianToken}`)
        .send({ measurementFrequency: 3600 })
        .expect(200);

      expect(response.body.data.device.config.measurementFrequency).toBe(3600);
    });

    it('should reject invalid frequency', async () => {
      await request(app)
        .put(`/api/physicians/patients/${patientId}/devices/${deviceId}/config`)
        .set('Authorization', `Bearer ${physicianToken}`)
        .send({ measurementFrequency: 300 })  // Too short
        .expect(400);
    });
  });
});
```

---

## Implementation Checklist

### Phase 1: File Creation
- [ ] Create `src/routes/physicians/` directory
- [ ] Create `helpers.ts` with verification functions
- [ ] Create `controller.ts` with 4 endpoint functions
- [ ] Create `routes.ts` with route definitions
- [ ] Create `index.ts` for exports

### Phase 2: Code Implementation
- [ ] Implement `verifyPhysicianPatientRelationship` helper
- [ ] Implement `getPatientsForPhysician` helper
- [ ] Implement `getAllPatients` controller
- [ ] Implement `getPatientSummary` controller
- [ ] Implement `getPatientDailyMeasurements` controller
- [ ] Implement `updatePatientDeviceConfig` controller

### Phase 3: Integration
- [ ] Mount physician routes in `src/app.ts`
- [ ] Test with physician JWT token
- [ ] Verify role-based access control
- [ ] Verify patient relationship verification

### Phase 4: Testing
- [ ] Test all 4 endpoints with curl
- [ ] Test authorization (deny non-physicians)
- [ ] Test relationship verification (deny wrong patients)
- [ ] Test with multiple patients
- [ ] Test device configuration updates
- [ ] Write unit tests

### Phase 5: Documentation
- [ ] Add OpenAPI/Swagger documentation
- [ ] Update API documentation
- [ ] Add example requests/responses
- [ ] Document frontend integration

---

## Summary

### Status: ❌ 0% Complete (ECE 513 Requirement)

**Required Implementation:**
- 4 physician endpoints
- Patient-physician relationship verification
- Device configuration update capability

**Effort Estimate:** 6-8 hours

**Recommendation:**
All infrastructure is ready. Implementation is straightforward - mostly adding verification wrappers around existing measurement queries. The hard work (data aggregation) is already done in user endpoints.

**Priority:** **HIGH** - This is mandatory for ECE 513 students.

---

**Next Steps:**
1. Create file structure in `src/routes/physicians/`
2. Implement helper functions
3. Implement 4 controller functions
4. Mount routes in app
5. Test with curl
6. Integrate with frontend

**Dependencies:**
- Better Auth user management
- Existing Measurement model and queries
- Role-based middleware (already implemented)

**Related Documentation:**
- Part 1: User-Level Measurement Analytics (for reusable queries)
- api-server/README.md (for context and architecture)
