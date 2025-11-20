# Physician Account Setup Guide

**Quick guide for setting up and testing the physician portal (ECE 513 requirement)**

---

## 🚀 Quick Start

### Step 1: Create a Physician Account

```bash
# Register as a regular user
curl -X POST http://localhost:4000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@hospital.com",
    "password": "SecurePass123!",
    "name": "Dr. Smith"
  }'
```

### Step 2: Set Physician Role

```bash
# Run the utility script to set physician role
npm run set-physician dr.smith@hospital.com
```

**Expected Output:**
```
✅ Success! User role updated to physician

🔐 This user can now access physician portal endpoints:
   - GET /api/physicians/patients
   - GET /api/physicians/patients/:patientId/summary
   - GET /api/physicians/patients/:patientId/daily/:date
   - PUT /api/physicians/patients/:patientId/devices/:deviceId/config
```

### Step 3: Login and Get JWT Token

```bash
curl -X POST http://localhost:4000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@hospital.com",
    "password": "SecurePass123!"
  }'
```

**Save the token from response:**
```bash
export PHYSICIAN_TOKEN="<jwt-token-from-response>"
```

---

## 📋 Testing Physician Endpoints

### Test 1: List All Patients

```bash
curl -X GET http://localhost:4000/api/physicians/patients \
  -H "Authorization: Bearer $PHYSICIAN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "patients": [],
    "totalPatients": 0
  }
}
```

> Note: Empty array is normal if no patients are associated yet

---

## 👥 Setting Up Test Patients

### Create a Patient Account

```bash
# Register patient
curl -X POST http://localhost:4000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient1@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'

# Login as patient and save token
curl -X POST http://localhost:4000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient1@example.com",
    "password": "SecurePass123!"
  }'

# Save patient token
export PATIENT_TOKEN="<patient-jwt-token>"
```

### Get Physician User ID

You need the physician's user ID to associate patients. Get it from the physician login response, or query MongoDB:

```bash
# Using MongoDB shell
mongosh mongodb://localhost:27017/hearttrack

# Find physician ID
db.user.findOne({ email: "dr.smith@hospital.com" }, { id: 1, name: 1, email: 1 })
```

Save the `id` field value.

### Associate Patient with Physician

```bash
# Patient associates themselves with physician
export PHYSICIAN_ID="<physician-user-id>"

curl -X PUT http://localhost:4000/api/users/physician \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"physicianId\": \"$PHYSICIAN_ID\"}"
```

### Register a Device for Patient

```bash
# Register device
curl -X POST http://localhost:4000/api/devices \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-001",
    "name": "Test Heart Monitor"
  }'

# Save the API key from response
export DEVICE_API_KEY="<device-api-key>"
```

### Submit Test Measurements

```bash
# Submit some test measurements
curl -X POST http://localhost:4000/api/measurements \
  -H "X-API-Key: $DEVICE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-001",
    "heartRate": 72,
    "spO2": 98
  }'

# Submit a few more with different values
curl -X POST http://localhost:4000/api/measurements \
  -H "X-API-Key: $DEVICE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-001",
    "heartRate": 68,
    "spO2": 97
  }'

curl -X POST http://localhost:4000/api/measurements \
  -H "X-API-Key: $DEVICE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-001",
    "heartRate": 75,
    "spO2": 99
  }'
```

---

## 🩺 Testing All Physician Features

### Test 1: View All Patients (Now with Data)

```bash
curl -X GET http://localhost:4000/api/physicians/patients \
  -H "Authorization: Bearer $PHYSICIAN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "user-507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "patient1@example.com",
        "summary": {
          "averageHeartRate": 71.7,
          "minHeartRate": 68,
          "maxHeartRate": 75,
          "totalMeasurements": 3,
          "lastMeasurement": "2025-11-19T15:30:00.000Z"
        }
      }
    ],
    "totalPatients": 1
  }
}
```

### Test 2: View Patient Summary

```bash
# Get patient ID from previous response
export PATIENT_ID="<patient-user-id>"

curl -X GET "http://localhost:4000/api/physicians/patients/$PATIENT_ID/summary" \
  -H "Authorization: Bearer $PHYSICIAN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "user-507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "patient1@example.com"
    },
    "summary": {
      "averageHeartRate": 71.7,
      "minHeartRate": 68,
      "maxHeartRate": 75,
      "averageSpO2": 98.0,
      "minSpO2": 97,
      "maxSpO2": 99,
      "totalMeasurements": 3,
      "dateRange": {
        "start": "2025-11-19",
        "end": "2025-11-19"
      }
    },
    "devices": [
      {
        "deviceId": "test-device-001",
        "name": "Test Heart Monitor",
        "status": "active",
        "config": {
          "measurementFrequency": 1800,
          "activeStartTime": "06:00",
          "activeEndTime": "22:00",
          "timezone": "America/New_York"
        },
        "lastSeen": null
      }
    ]
  }
}
```

### Test 3: View Patient Daily Measurements

```bash
# Get today's date in YYYY-MM-DD format
export TODAY=$(date +%Y-%m-%d)

curl -X GET "http://localhost:4000/api/physicians/patients/$PATIENT_ID/daily/$TODAY" \
  -H "Authorization: Bearer $PHYSICIAN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "user-507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "patient1@example.com"
    },
    "date": "2025-11-19",
    "measurements": [
      {
        "timestamp": "2025-11-19T15:25:00.000Z",
        "heartRate": 72,
        "spO2": 98,
        "quality": "good",
        "confidence": 1.0,
        "deviceId": "test-device-001"
      },
      {
        "timestamp": "2025-11-19T15:26:00.000Z",
        "heartRate": 68,
        "spO2": 97,
        "quality": "good",
        "confidence": 1.0,
        "deviceId": "test-device-001"
      },
      {
        "timestamp": "2025-11-19T15:27:00.000Z",
        "heartRate": 75,
        "spO2": 99,
        "quality": "good",
        "confidence": 1.0,
        "deviceId": "test-device-001"
      }
    ],
    "count": 3
  }
}
```

### Test 4: Update Patient Device Configuration

```bash
# Change measurement frequency from 30 minutes (1800s) to 1 hour (3600s)
curl -X PUT "http://localhost:4000/api/physicians/patients/$PATIENT_ID/devices/test-device-001/config" \
  -H "Authorization: Bearer $PHYSICIAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "measurementFrequency": 3600
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "device": {
      "deviceId": "test-device-001",
      "name": "Test Heart Monitor",
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

---

## 🔒 Testing Authorization (Should Fail)

### Test: Non-Physician User Accessing Physician Endpoint

```bash
# Try to access physician endpoint with patient token
curl -X GET http://localhost:4000/api/physicians/patients \
  -H "Authorization: Bearer $PATIENT_TOKEN"
```

**Expected Response (403):**
```json
{
  "success": false,
  "error": {
    "message": "Access denied. Required role: physician",
    "code": "FORBIDDEN"
  }
}
```

### Test: Physician Accessing Wrong Patient

Create a second physician and patient, then try to access:

```bash
# Physician 1 tries to access Physician 2's patient
curl -X GET "http://localhost:4000/api/physicians/patients/$OTHER_PATIENT_ID/summary" \
  -H "Authorization: Bearer $PHYSICIAN_TOKEN"
```

**Expected Response (403):**
```json
{
  "success": false,
  "error": {
    "message": "Access denied: Patient is not associated with this physician",
    "code": "FORBIDDEN"
  }
}
```

---

## 🛠️ Troubleshooting

### Issue: "User not found"

**Problem:** Email doesn't exist in database

**Solution:** Make sure you registered the user first via `/api/auth/sign-up/email`

---

### Issue: "Access denied. Required role: physician"

**Problem:** User doesn't have physician role

**Solution:** Run `npm run set-physician <email>` to set the role

---

### Issue: Empty patient list

**Problem:** No patients associated with physician

**Solution:**
1. Create patient accounts
2. Get physician user ID
3. Have patients associate via `PUT /api/users/physician`

---

### Issue: "Token expired"

**Problem:** JWT token has expired (7 days default)

**Solution:** Login again to get a fresh token

---

### Issue: MongoDB connection error

**Problem:** MongoDB not running

**Solution:**
```bash
# Start MongoDB
brew services start mongodb-community

# Or if using Docker
docker start mongodb
```

---

## 📚 Additional Resources

- [API Documentation](./docs/API.md)
- [Physician Implementation Details](../plan/physician-business-logic-implementation.md)
- [Scripts README](./scripts/README.md)
- [Main README](./README.md)

---

## 🎯 ECE 513 Compliance Checklist

- ✅ Physicians can register (via standard signup + role script)
- ✅ Physicians can view list of all their patients with 7-day summaries
- ✅ Physicians can view individual patient weekly summary
- ✅ Physicians can view individual patient daily measurements
- ✅ Physicians can adjust patient device measurement frequency
- ✅ Proper authorization and security (three-layer: JWT → Role → Relationship)
- ✅ All endpoints return proper HTTP status codes
- ✅ Comprehensive error handling

---

**Last Updated:** 2025-11-19
**Status:** Ready for Testing & Demo
