# Heart Track API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

The API uses two authentication methods:

### 1. JWT Authentication (Web Frontend)

Include the session token in the `Authorization` header:

```
Authorization: Bearer <session-token>
```

### 2. API Key Authentication (IoT Devices)

Include the API key in the `X-API-Key` header:

```
X-API-Key: <device-api-key>
```

## Endpoints

### Authentication (Better-Auth)

#### Register User
```http
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Get Session
```http
GET /api/auth/get-session
Authorization: Bearer <session-token>
```

#### Logout
```http
POST /api/auth/sign-out
Authorization: Bearer <session-token>
```

### Devices

#### Register Device
```http
POST /api/devices
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "deviceId": "photon-001",
  "name": "Living Room Monitor"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "device": {
      "id": "...",
      "deviceId": "photon-001",
      "name": "Living Room Monitor",
      "apiKey": "hrt_abc123...",  // Only returned once!
      "status": "active",
      "config": {
        "measurementFrequency": 1800,
        "activeStartTime": "06:00",
        "activeEndTime": "22:00",
        "timezone": "America/New_York"
      }
    }
  }
}
```

#### List User's Devices
```http
GET /api/devices
Authorization: Bearer <session-token>
```

#### Get Device Details
```http
GET /api/devices/:deviceId
Authorization: Bearer <session-token>
```

#### Get Device Configuration
```http
GET /api/devices/:deviceId/config
X-API-Key: <device-api-key>  // OR Authorization: Bearer <session-token>
```

#### Update Device Configuration
```http
PUT /api/devices/:deviceId/config
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "measurementFrequency": 3600,
  "activeStartTime": "07:00",
  "activeEndTime": "23:00"
}
```

#### Delete Device
```http
DELETE /api/devices/:deviceId
Authorization: Bearer <session-token>
```

### Measurements

#### Submit Measurement (IoT Device)
```http
POST /api/measurements
X-API-Key: <device-api-key>
Content-Type: application/json

{
  "deviceId": "photon-001",
  "heartRate": 72,
  "spO2": 98,
  "timestamp": "2025-10-22T14:30:00.000Z",
  "quality": "good",
  "confidence": 0.95
}

Response: 201 Created
{
  "success": true,
  "data": {
    "measurement": {
      "id": "...",
      "heartRate": 72,
      "spO2": 98,
      "timestamp": "2025-10-22T14:30:00.000Z",
      "quality": "good",
      "confidence": 0.95
    }
  }
}
```

#### Get User Measurements
```http
GET /api/measurements?startDate=2025-10-15&endDate=2025-10-22&limit=50&page=1
Authorization: Bearer <session-token>
```

#### Get Weekly Summary
```http
GET /api/measurements/weekly/summary
Authorization: Bearer <session-token>

Response: 200 OK
{
  "success": true,
  "data": {
    "summary": {
      "averageHeartRate": 72.5,
      "minHeartRate": 58,
      "maxHeartRate": 105,
      "averageSpO2": 97.8,
      "minSpO2": 95,
      "maxSpO2": 100,
      "totalMeasurements": 48,
      "dateRange": {
        "start": "2025-10-15",
        "end": "2025-10-22"
      }
    }
  }
}
```

#### Get Daily Measurements
```http
GET /api/measurements/daily/2025-10-22
Authorization: Bearer <session-token>
```

#### Get Daily Aggregates
```http
GET /api/measurements/daily-aggregates?days=7
Authorization: Bearer <session-token>
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Authentication required or failed
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input data
- `DUPLICATE_FIELD` (400): Resource already exists
- `INVALID_API_KEY` (401): API key invalid or expired
- `DEVICE_INACTIVE` (403): Device is not active
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

- Window: 15 minutes
- Max requests per IP: 100
- Applies to all endpoints

## Frontend Integration (Next.js)

### Installation

```bash
npm install better-auth
```

### Setup

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  plugins: [inferAdditionalFields()],
});
```

### Usage in Components

```typescript
import { authClient } from "@/lib/auth-client";

// In a component
const { data: session, isPending } = authClient.useSession();

// Sign up
await authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
});

// Sign in
await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
});

// Sign out
await authClient.signOut();

// Make authenticated API calls
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/devices`, {
  headers: {
    "Authorization": `Bearer ${session?.token}`,
  },
});
```

## IoT Device Integration

### Getting API Key

1. User registers device via web interface
2. Device receives API key (shown only once)
3. Device stores API key securely

### Making Requests

```cpp
// Example for Particle Photon
String apiKey = "hrt_abc123...";
String serverUrl = "https://api.hearttrack.com";

void submitMeasurement(int heartRate, int spO2) {
  String data = String::format(
    "{\"deviceId\":\"%s\",\"heartRate\":%d,\"spO2\":%d}",
    DEVICE_ID, heartRate, spO2
  );

  Particle.publish("measurement", data, PRIVATE);

  // HTTP Request
  HttpClient http;
  http.setHeader("X-API-Key", apiKey);
  http.setHeader("Content-Type", "application/json");
  http.post(serverUrl + "/api/measurements", data);
}
```

### Polling for Configuration Updates

```cpp
void checkConfigUpdate() {
  HttpClient http;
  http.setHeader("X-API-Key", apiKey);

  String response = http.get(serverUrl + "/api/devices/" + DEVICE_ID + "/config");

  // Parse response and update local config
}
```

## Development

### Run in Development Mode

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
npm run test:watch
```

## Environment Variables

See `.env.example` for all required environment variables.
