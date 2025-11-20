# User Management API Documentation

**Base URL:** `http://localhost:4000/api` (development)
**Authentication:** All endpoints require JWT token via `Authorization: Bearer <token>` header

---

## 📋 Table of Contents

1. [Get User Profile](#1-get-user-profile)
2. [Update User Profile](#2-update-user-profile)
3. [Change Password](#3-change-password)
4. [Delete Account](#4-delete-account)
5. [Update Physician Association](#5-update-physician-association)
6. [Error Responses](#error-responses)

---

## 1. Get User Profile

Retrieve the authenticated user's profile information along with statistics.

### Endpoint
```
GET /api/users/profile
```

### Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Request
No request body required.

### Response

**Success (200 OK)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "691e656205ec0f339eeb288a",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "physicianId": null,
      "createdAt": "2025-11-20T00:48:34.936Z",
      "updatedAt": "2025-11-20T00:48:34.936Z"
    },
    "stats": {
      "deviceCount": 2,
      "recentMeasurementCount": 145
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `user.id` | string | Unique user identifier |
| `user.email` | string | User's email address |
| `user.name` | string | User's full name |
| `user.role` | string | User role (`"user"` or `"physician"`) |
| `user.physicianId` | string \| null | Associated physician ID (if any) |
| `user.createdAt` | string (ISO 8601) | Account creation timestamp |
| `user.updatedAt` | string (ISO 8601) | Last update timestamp |
| `stats.deviceCount` | number | Total number of registered devices |
| `stats.recentMeasurementCount` | number | Measurements in last 7 days |

### Error Responses
- **401 Unauthorized** - Invalid or missing authentication token
- **500 Internal Server Error** - Server error

### Example Usage

```bash
curl -X GET http://localhost:4000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

```javascript
// JavaScript/TypeScript
const response = await fetch('http://localhost:4000/api/users/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

---

## 2. Update User Profile

Update the user's profile information (currently supports name only).

### Endpoint
```
PUT /api/users/profile
```

### Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Jane Smith"
}
```

### Request Fields

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `name` | string | Yes | 1-100 characters, non-empty | User's full name |

### Protected Fields
**Cannot be updated via this endpoint:**
- `email` - Use account email change flow (not implemented)
- `password` - Use change password endpoint
- `role` - Admin-only operation
- `physicianId` - Use physician association endpoint

### Response

**Success (200 OK)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "691e656205ec0f339eeb288a",
      "email": "user@example.com",
      "name": "Jane Smith",
      "role": "user",
      "updatedAt": "2025-11-20T01:15:42.123Z"
    }
  },
  "message": "Profile updated successfully"
}
```

### Error Responses

- **400 Bad Request** - Invalid input
  ```json
  {
    "success": false,
    "error": {
      "message": "Name is required and must be a non-empty string",
      "code": "INVALID_INPUT"
    }
  }
  ```

- **400 Bad Request** - Attempting to update protected fields
  ```json
  {
    "success": false,
    "error": {
      "message": "Cannot update email, password, role, or physicianId through this endpoint",
      "code": "INVALID_INPUT"
    }
  }
  ```

- **401 Unauthorized** - Invalid authentication
- **404 Not Found** - User not found
- **500 Internal Server Error** - Server error

### Example Usage

```bash
curl -X PUT http://localhost:4000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith"}'
```

```javascript
// JavaScript/TypeScript
const response = await fetch('http://localhost:4000/api/users/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Jane Smith'
  })
});
const data = await response.json();
```

---

## 3. Change Password

Change the user's password with verification of the current password.

### Endpoint
```
POST /api/users/change-password
```

### Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Request Body

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePass456!"
}
```

### Request Fields

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `currentPassword` | string | Yes | - | User's current password |
| `newPassword` | string | Yes | See below | New password |

### Password Requirements

The new password must meet ALL of the following criteria:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*(),.?":{}|<>)

### Response

**Success (200 OK)**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Error Responses

- **400 Bad Request** - Missing fields
  ```json
  {
    "success": false,
    "error": {
      "message": "Current password and new password are required",
      "code": "INVALID_INPUT"
    }
  }
  ```

- **400 Bad Request** - Weak password
  ```json
  {
    "success": false,
    "error": {
      "message": "Password must contain uppercase, lowercase, number, and special character",
      "code": "WEAK_PASSWORD"
    }
  }
  ```

- **401 Unauthorized** - Incorrect current password
  ```json
  {
    "success": false,
    "error": {
      "message": "Current password is incorrect",
      "code": "INVALID_CREDENTIALS"
    }
  }
  ```

- **404 Not Found** - Account not found
- **500 Internal Server Error** - Server error

### Example Usage

```bash
curl -X POST http://localhost:4000/api/users/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewSecurePass456!"
  }'
```

```javascript
// JavaScript/TypeScript
const response = await fetch('http://localhost:4000/api/users/change-password', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    currentPassword: 'OldPassword123!',
    newPassword: 'NewSecurePass456!'
  })
});
const data = await response.json();
```

---

## 4. Delete Account

Permanently delete the user account and all associated data.

### ⚠️ Warning
This action is **irreversible** and will delete:
- User account
- All registered devices
- All measurement data
- All sessions and API keys

### Endpoint
```
DELETE /api/users/profile
```

### Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Request Body

```json
{
  "password": "UserPassword123!"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `password` | string | Yes | User's password for confirmation |

### Response

**Success (200 OK)**
```json
{
  "success": true,
  "message": "Account and all associated data deleted successfully",
  "data": {
    "deletedMeasurements": 1247,
    "deletedDevices": 3
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `deletedMeasurements` | number | Number of measurement records deleted |
| `deletedDevices` | number | Number of devices deleted |

### Error Responses

- **400 Bad Request** - Missing password
  ```json
  {
    "success": false,
    "error": {
      "message": "Password is required to delete account",
      "code": "INVALID_INPUT"
    }
  }
  ```

- **401 Unauthorized** - Incorrect password
  ```json
  {
    "success": false,
    "error": {
      "message": "Password is incorrect",
      "code": "INVALID_CREDENTIALS"
    }
  }
  ```

- **404 Not Found** - Account not found
- **500 Internal Server Error** - Server error

### Example Usage

```bash
curl -X DELETE http://localhost:4000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "UserPassword123!"}'
```

```javascript
// JavaScript/TypeScript
const response = await fetch('http://localhost:4000/api/users/profile', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    password: 'UserPassword123!'
  })
});
const data = await response.json();
```

---

## 5. Update Physician Association

Associate or disassociate the user account with a physician (ECE 513 feature).

### Endpoint
```
PUT /api/users/physician
```

### Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Request Body

**To Associate with Physician:**
```json
{
  "physicianId": "691e789012abc3def4567890"
}
```

**To Remove Physician Association:**
```json
{
  "physicianId": null
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `physicianId` | string \| null | Yes | Physician ID or null to remove |

### Response

**Success (200 OK) - Association Added**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "691e656205ec0f339eeb288a",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "physicianId": "691e789012abc3def4567890",
      "updatedAt": "2025-11-20T01:30:15.456Z"
    }
  },
  "message": "Physician association updated successfully"
}
```

**Success (200 OK) - Association Removed**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "691e656205ec0f339eeb288a",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "physicianId": null,
      "updatedAt": "2025-11-20T01:30:15.456Z"
    }
  },
  "message": "Physician association removed successfully"
}
```

### Error Responses

- **400 Bad Request** - Invalid physician ID
  ```json
  {
    "success": false,
    "error": {
      "message": "Invalid physician ID",
      "code": "INVALID_INPUT"
    }
  }
  ```

- **401 Unauthorized** - Invalid authentication
- **404 Not Found** - User or physician not found
- **500 Internal Server Error** - Server error

### Example Usage

```bash
# Associate with physician
curl -X PUT http://localhost:4000/api/users/physician \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"physicianId": "691e789012abc3def4567890"}'

# Remove physician association
curl -X PUT http://localhost:4000/api/users/physician \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"physicianId": null}'
```

```javascript
// JavaScript/TypeScript - Associate
const response = await fetch('http://localhost:4000/api/users/physician', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    physicianId: '691e789012abc3def4567890'
  })
});

// JavaScript/TypeScript - Remove
const response = await fetch('http://localhost:4000/api/users/physician', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    physicianId: null
  })
});
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "stack": "Error stack trace (development only)"
  }
}
```

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request successful |
| `201 Created` | Resource created successfully |
| `400 Bad Request` | Invalid request data or validation error |
| `401 Unauthorized` | Missing, invalid, or expired authentication token |
| `403 Forbidden` | Valid token but insufficient permissions |
| `404 Not Found` | Resource not found |
| `500 Internal Server Error` | Server-side error |

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required |
| `AUTHENTICATION_FAILED` | Invalid or expired token |
| `INVALID_INPUT` | Invalid request data |
| `INVALID_CREDENTIALS` | Incorrect username/password |
| `WEAK_PASSWORD` | Password doesn't meet requirements |
| `USER_NOT_FOUND` | User account not found |
| `ACCOUNT_NOT_FOUND` | Account not found in database |
| `UPDATE_FAILED` | Failed to update resource |
| `DELETE_FAILED` | Failed to delete resource |

---

## TypeScript Types

For TypeScript projects, here are the type definitions:

```typescript
// User profile response
interface UserProfileResponse {
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'user' | 'physician';
      physicianId: string | null;
      createdAt: string;
      updatedAt: string;
    };
    stats: {
      deviceCount: number;
      recentMeasurementCount: number;
    };
  };
}

// Update profile request
interface UpdateProfileRequest {
  name: string;
}

// Update profile response
interface UpdateProfileResponse {
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'user' | 'physician';
      updatedAt: string;
    };
  };
  message: string;
}

// Change password request
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Change password response
interface ChangePasswordResponse {
  success: true;
  message: string;
}

// Delete account request
interface DeleteAccountRequest {
  password: string;
}

// Delete account response
interface DeleteAccountResponse {
  success: true;
  message: string;
  data: {
    deletedMeasurements: number;
    deletedDevices: number;
  };
}

// Update physician association request
interface UpdatePhysicianRequest {
  physicianId: string | null;
}

// Update physician association response
interface UpdatePhysicianResponse {
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'user' | 'physician';
      physicianId: string | null;
      updatedAt: string;
    };
  };
  message: string;
}

// Error response
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    stack?: string; // Only in development
  };
}
```

---

## Authentication Flow

To use these endpoints, you must first obtain a JWT token through authentication:

### 1. Register (Sign Up)
```
POST /api/auth/sign-up/email
Body: { email, password, name }
Response: { token, user }
```

### 2. Login (Sign In)
```
POST /api/auth/sign-in/email
Body: { email, password }
Response: { token, user }
```

### 3. Use Token
Include the token in all subsequent requests:
```
Authorization: Bearer <token>
```

### 4. Get Session (Verify Token)
```
GET /api/auth/get-session
Headers: Authorization: Bearer <token>
Response: { session, user }
```

---

## Rate Limiting

All endpoints are subject to rate limiting:
- **Window:** 15 minutes
- **Max Requests:** 100 per IP address

If you exceed the limit, you'll receive:
```json
{
  "success": false,
  "error": {
    "message": "Too many requests from this IP, please try again later.",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

---

## Complete API Endpoint List

### User Management (New)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password
- `DELETE /api/users/profile` - Delete account
- `PUT /api/users/physician` - Update physician association

### Authentication (Better-Auth)
- `POST /api/auth/sign-up/email` - Register new user
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/get-session` - Get current session

### Devices
- `POST /api/devices` - Register device
- `GET /api/devices` - List user's devices
- `GET /api/devices/:deviceId` - Get device details
- `PUT /api/devices/:deviceId` - Update device
- `DELETE /api/devices/:deviceId` - Delete device
- `GET /api/devices/:deviceId/config` - Get device config
- `PUT /api/devices/:deviceId/config` - Update device config

### Measurements
- `POST /api/measurements` - Submit measurement (API key auth)
- `GET /api/measurements` - Get measurements
- `GET /api/measurements/weekly/summary` - Weekly summary
- `GET /api/measurements/daily/:date` - Daily measurements
- `GET /api/measurements/daily-aggregates` - Multi-day aggregates
- `GET /api/measurements/device/:deviceId` - Device-specific data

---

## Support

For issues or questions:
- Check the main [API Documentation](./API.md)
- Review [Getting Started Guide](./GETTING_STARTED.md)
- See [Project Status](./PROJECT_STATUS.md)

---

**Last Updated:** November 20, 2025
**API Version:** 1.0.0
**Server:** Heart Track API Server
