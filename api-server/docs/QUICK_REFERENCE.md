# API Quick Reference Guide

## Base URL
```
http://localhost:4000/api
```

## Authentication
All endpoints (except auth) require:
```
Authorization: Bearer <jwt-token>
```

---

## 🔐 Authentication Endpoints

### Sign Up
```http
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe"
}
```

### Sign In
```http
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

---

## 👤 User Management Endpoints

### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "user" },
    "stats": { "deviceCount": 2, "recentMeasurementCount": 145 }
  }
}
```

### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith"
}
```

### Change Password
```http
POST /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Password Requirements:**
- Min 8 characters
- 1 uppercase, 1 lowercase, 1 number, 1 special char

### Delete Account
```http
DELETE /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "UserPassword123!"
}
```

### Update Physician
```http
PUT /api/users/physician
Authorization: Bearer <token>
Content-Type: application/json

{
  "physicianId": "physician-id-here"
}
```

---

## 📱 Device Endpoints

### Register Device
```http
POST /api/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceId": "photon-device-123",
  "name": "Living Room Monitor"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "device": {
      "id": "...",
      "deviceId": "photon-device-123",
      "name": "Living Room Monitor",
      "apiKey": "generated-api-key-here",
      "status": "active",
      "config": {
        "measurementFrequency": 1800,
        "activeStartTime": "06:00",
        "activeEndTime": "22:00"
      }
    }
  }
}
```

### List Devices
```http
GET /api/devices
Authorization: Bearer <token>
```

### Get Device Config
```http
GET /api/devices/:deviceId/config
X-API-Key: device-api-key
```

### Update Device Config
```http
PUT /api/devices/:deviceId/config
Authorization: Bearer <token>
Content-Type: application/json

{
  "measurementFrequency": 1800,
  "activeStartTime": "06:00",
  "activeEndTime": "22:00",
  "timezone": "America/New_York"
}
```

---

## 📊 Measurement Endpoints

### Submit Measurement (IoT Device)
```http
POST /api/measurements
X-API-Key: device-api-key
Content-Type: application/json

{
  "deviceId": "photon-device-123",
  "heartRate": 72,
  "spO2": 98,
  "timestamp": "2025-11-20T14:30:00.000Z",
  "quality": "good",
  "confidence": 0.95
}
```

### Get Measurements
```http
GET /api/measurements?startDate=2025-11-01&endDate=2025-11-20&deviceId=device-id
Authorization: Bearer <token>
```

### Weekly Summary
```http
GET /api/measurements/weekly/summary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "averageHeartRate": 72,
      "minHeartRate": 58,
      "maxHeartRate": 105,
      "totalMeasurements": 48,
      "dateRange": {
        "start": "2025-11-14",
        "end": "2025-11-20"
      }
    }
  }
}
```

### Daily Measurements
```http
GET /api/measurements/daily/2025-11-20
Authorization: Bearer <token>
```

---

## 🎨 Frontend Integration Example

### React Hook for User Profile

```typescript
import { useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  deviceCount: number;
  recentMeasurementCount: number;
}

function useUserProfile(token: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('http://localhost:4000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile({
          ...data.data.user,
          deviceCount: data.data.stats.deviceCount,
          recentMeasurementCount: data.data.stats.recentMeasurementCount
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [token]);

  return { profile, loading, error };
}

// Usage
function ProfilePage() {
  const token = localStorage.getItem('authToken');
  const { profile, loading, error } = useUserProfile(token);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Welcome, {profile.name}!</h1>
      <p>Email: {profile.email}</p>
      <p>Devices: {profile.deviceCount}</p>
      <p>Recent Measurements: {profile.recentMeasurementCount}</p>
    </div>
  );
}
```

### Update Profile Function

```typescript
async function updateUserProfile(token: string, name: string) {
  const response = await fetch('http://localhost:4000/api/users/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return await response.json();
}

// Usage
try {
  await updateUserProfile(token, 'New Name');
  alert('Profile updated successfully!');
} catch (error) {
  alert('Error: ' + error.message);
}
```

### Change Password Function

```typescript
async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
) {
  const response = await fetch('http://localhost:4000/api/users/change-password', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return await response.json();
}

// Usage with form
async function handlePasswordChange(e) {
  e.preventDefault();
  try {
    await changePassword(
      token,
      formData.currentPassword,
      formData.newPassword
    );
    alert('Password changed successfully!');
  } catch (error) {
    alert('Error: ' + error.message);
  }
}
```

---

## 📝 Common Response Patterns

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

---

## 🔑 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful deletion) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 💾 Local Storage Pattern

```javascript
// After login
localStorage.setItem('authToken', response.token);
localStorage.setItem('user', JSON.stringify(response.user));

// Get token for requests
const token = localStorage.getItem('authToken');

// After logout
localStorage.removeItem('authToken');
localStorage.removeItem('user');
```

---

## 🧪 Testing with cURL

```bash
# Get profile
curl -X GET http://localhost:4000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update profile
curl -X PUT http://localhost:4000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name"}'

# Change password
curl -X POST http://localhost:4000/api/users/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass456!"
  }'
```

---

## 📚 Additional Resources

- **Full Documentation:** `docs/USER_MANAGEMENT_API.md`
- **API Documentation:** `docs/API.md`
- **Getting Started:** `docs/GETTING_STARTED.md`
- **Project Status:** `docs/PROJECT_STATUS.md`

---

**Server:** http://localhost:4000
**Health Check:** http://localhost:4000/health
**API Info:** http://localhost:4000/api
