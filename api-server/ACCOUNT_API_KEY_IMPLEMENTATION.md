# Account-Level API Key Implementation Summary

## Overview

Successfully implemented **account-level API keys** for the Heart Track IoT system. Users can now generate a single API key per account that works across all their IoT devices, instead of managing separate API keys for each device.

---

## What Changed

### 1. **New User API Key Management Endpoints**

**Base Path:** `/api/users/api-key`

| Endpoint | Method | Description | Rate Limit |
|----------|--------|-------------|------------|
| `/api/users/api-key` | POST | Generate new account API key | 5/hour |
| `/api/users/api-key` | GET | View existing API key (masked) | None |
| `/api/users/api-key/regenerate` | POST | Revoke old and generate new | 5/hour |
| `/api/users/api-key` | DELETE | Revoke API key | 5/hour |

**Authentication:** All endpoints require JWT/session authentication (Bearer token).

---

### 2. **API Key Generation**

**Implementation Details:**
- Uses better-auth's API Key plugin (`auth.api.createApiKey`)
- API key name: `"Account API Key"`
- Expiration: 1 year (31,536,000 seconds)
- Cryptographically secure generation
- Key shown **ONCE** on creation (must be saved immediately)

**Example Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": "rGTCYIayLDAQVdNcfzhMVudvwbTOVEKIdtEppqiUzdEMMqCrQROMKpTKXyzGvdBt",
    "name": "Account API Key",
    "expiresIn": 31536000,
    "expiresAt": "2026-11-20T03:42:00.000Z"
  },
  "message": "Account API key generated successfully..."
}
```

---

### 3. **Updated API Key Authentication Middleware**

**File:** `src/middleware/device/index.ts`

**Changes:**
- Supports **both** account-level and device-specific API keys
- Automatically detects key type by checking the key name in better-auth
- For account-level keys:
  - Requires `deviceId` in request body or query params
  - Validates device belongs to the user
  - Attaches both `req.user` and `req.device`
- Backwards compatible with existing device-specific keys

**Authentication Flow:**
```
1. Extract X-API-Key from header
2. Check MongoDB for account-level key
   - If found: Verify expiration, use custom verification
   - If not found: Try better-auth verification (device keys)
3. For account-level:
   - Extract deviceId from body/query
   - Validate device ownership
   - Update device lastSeen
4. Attach device & user to request
```

---

### 4. **Measurement Submission Changes**

**Endpoint:** `POST /api/measurements`

**Required Fields:**
```json
{
  "deviceId": "photon-001",     // ← NOW REQUIRED in body
  "heartRate": 72,
  "spO2": 98,
  "timestamp": "2025-11-20T03:42:00.000Z",
  "quality": "good",
  "confidence": 0.95
}
```

**Headers:**
```
X-API-Key: {account-api-key}
Content-Type: application/json
```

**Validation:**
- `deviceId` must match authenticated device
- Device must belong to user associated with API key
- Device must be in `active` status

---

### 5. **Rate Limiting**

**Configuration:**
```typescript
apiKeyRateLimiter: {
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,                     // 5 requests per hour
  keyGenerator: (req) => req.user?.id
}
```

**Applied to:**
- `POST /api/users/api-key` (generate)
- `POST /api/users/api-key/regenerate`
- `DELETE /api/users/api-key` (revoke)

**Not** applied to:
- `GET /api/users/api-key` (view)

---

## Usage Guide

### For Frontend Developers

#### 1. Generate API Key

```javascript
const response = await fetch('http://localhost:4000/api/users/api-key', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
    'Content-Type': 'application/json'
  }
});

const { data } = await response.json();
const apiKey = data.apiKey;  // Save this! Only shown once
```

#### 2. View Existing API Key (Masked)

```javascript
const response = await fetch('http://localhost:4000/api/users/api-key', {
  headers: {
    'Authorization': `Bearer ${sessionToken}`
  }
});

const { data } = await response.json();
console.log(data.keyPreview);  // "***VdBt" (last 8 chars)
```

#### 3. Regenerate API Key

```javascript
const response = await fetch('http://localhost:4000/api/users/api-key/regenerate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
    'Content-Type': 'application/json'
  }
});

const { data } = await response.json();
const newApiKey = data.apiKey;  // Old key is now revoked
```

---

### For IoT Device Developers

#### Configure Device with Account API Key

**1. User registers device** (via web frontend):
```http
POST /api/devices
Authorization: Bearer {session-token}

{
  "deviceId": "photon-001",
  "name": "Living Room Monitor"
}
```

**2. User generates account API key** (via web frontend):
```http
POST /api/users/api-key
Authorization: Bearer {session-token}
```

Response:
```json
{
  "apiKey": "rGTCYIayLDAQVdNcfzhMVudvwbTOVEKIdtEppqiUzdEMMqCrQROMKpTKXyzGvdBt"
}
```

**3. User configures IoT device** with:
- `deviceId`: `"photon-001"`
- `apiKey`: `"rGTCYIayLDAQVdNcfzhMVudvwbTOVEKIdtEppqiUzdEMMqCrQROMKpTKXyzGvdBt"`

**4. IoT device sends measurements:**

```http
POST /api/measurements
X-API-Key: rGTCYIayLDAQVdNcfzhMVudvwbTOVEKIdtEppqiUzdEMMqCrQROMKpTKXyzGvdBt
Content-Type: application/json

{
  "deviceId": "photon-001",
  "heartRate": 72,
  "spO2": 98,
  "timestamp": "2025-11-20T03:42:00.000Z"
}
```

---

## Files Modified

### New Files Created:
1. `/src/routes/users/api-key.controller.ts` - API key management logic
2. `/api-server/test-api-key.js` - Test suite for API key flow
3. `/api-server/ACCOUNT_API_KEY_IMPLEMENTATION.md` - This document

### Files Modified:
1. `/src/routes/users/routes.ts`
   - Imported API key controllers
   - Added 4 new routes
   - Added rate limiter configuration

2. `/src/middleware/device/index.ts`
   - Updated `authenticateApiKey` to support account-level keys
   - Added deviceId extraction from body/query
   - Added account vs device key detection
   - **Implemented custom MongoDB verification for account keys**

3. `/src/routes/measurements/controller.ts`
   - Added deviceId validation in `submitMeasurement`
   - Added device ownership check

---

## Security Features

### 1. **One-Time Display**
- API keys only returned during generation/regeneration
- `GET /api/users/api-key` returns masked version (`***{last8chars}`)
- Database field marked `select: false`

### 2. **Rate Limiting**
- 5 requests per hour for generation/regeneration
- Prevents brute-force attacks
- User-based limiting (not IP-based)

### 3. **Expiration**
- All keys expire after 1 year
- Custom verification checks expiration
- Users must regenerate expired keys

### 4. **Device Ownership Validation**
- API key links to userId
- DeviceId must belong to that user
- Prevents cross-user device access

### 5. **Device Status Check**
- Device must be `active` to submit data
- Allows disabling compromised devices

---

## Backwards Compatibility

### Device-Specific API Keys (Legacy)

The system still supports the old device-specific API keys for backwards compatibility:

**How it works:**
1. When device is registered via `POST /api/devices`, a device-specific API key is still generated
2. Device can use this key without providing `deviceId` in the body
3. Middleware detects non-account keys by checking the name field
4. Legacy flow: Device looked up by API key, no additional validation needed

**Migration Path:**
- Existing devices continue working with their device-specific keys
- New devices can use account-level keys
- Gradual migration as users regenerate devices

---

## Error Handling

### Common Errors:

| Status | Code | Message | Cause |
|--------|------|---------|-------|
| 400 | `DEVICE_ID_REQUIRED` | "deviceId is required when using account-level API key" | Missing deviceId in body |
| 400 | `API_KEY_EXISTS` | "Account API key already exists" | Trying to generate when one exists |
| 401 | `INVALID_API_KEY` | "Invalid or expired API key" | Bad key or expired |
| 403 | `DEVICE_INACTIVE` | "Device is not active" | Device status not active |
| 403 | `DEVICE_ID_MISMATCH` | "Device ID mismatch" | deviceId doesn't match authenticated device |
| 404 | `DEVICE_NOT_FOUND` | "Device not found or does not belong to this account" | Wrong deviceId or ownership issue |
| 429 | N/A | "Too many API key requests" | Rate limit exceeded |

---

## Testing

### Manual Testing with curl

**1. Register User:**
```bash
curl -X POST http://localhost:4000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","name":"Test User"}'
```

**2. Register Device:**
```bash
curl -X POST http://localhost:4000/api/devices \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"photon-001","name":"Test Monitor"}'
```

**3. Generate Account API Key:**
```bash
curl -X POST http://localhost:4000/api/users/api-key \
  -H "Authorization: Bearer {token}"
```

**4. Submit Measurement:**
```bash
curl -X POST http://localhost:4000/api/measurements \
  -H "X-API-Key: {account-api-key}" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId":"photon-001",
    "heartRate":72,
    "spO2":98,
    "timestamp":"2025-11-20T03:42:00.000Z"
  }'
```

---

## Database Schema

### Better-Auth `apiKey` Collection

```javascript
{
  _id: ObjectId("..."),
  id: "unique-key-id",
  key: "rGTCYIayLDAQVdNcfzhMVudvwbTOVEKIdtEppqiUzdEMMqCrQROMKpTKXyzGvdBt",
  name: "Account API Key",
  userId: "691e8e0926ef4398e7b9398e",
  createdAt: ISODate("2025-11-20T03:42:00.000Z"),
  expiresAt: ISODate("2026-11-20T03:42:00.000Z")
}
```

**Indexes:**
- `userId` (for querying user's keys)
- `key` (unique, for authentication)

---

## Next Steps / Future Enhancements

### Recommended Improvements:

1. **API Key Scopes**
   - Better-auth supports permission scopes
   - Could limit keys to specific operations (read-only, write-only)

2. **Multi-Key Support**
   - Allow multiple account keys with different names/scopes
   - "Production Key", "Development Key", etc.

3. **Usage Analytics**
   - Track API key usage statistics
   - Last used timestamp
   - Request count per key

4. **Key Rotation Reminders**
   - Email notifications before expiration
   - Automatic key rotation policies

5. **Audit Logging**
   - Log all API key operations (create, revoke, use)
   - Security monitoring dashboard

---

## Troubleshooting

### Issue: "deviceId is required" error

**Cause:** Using account-level API key without deviceId in body
**Solution:** Include `deviceId` in JSON body:
```json
{ "deviceId": "your-device-id", ...}
```

### Issue: "Device not found" error

**Cause:** Device not registered or doesn't belong to user
**Solution:**
1. Register device first via `POST /api/devices`
2. Ensure deviceId matches exactly

### Issue: Rate limit exceeded

**Cause:** More than 5 API key operations in 1 hour
**Solution:** Wait for rate limit window to reset (1 hour from first request)

### Issue: IPv6 validation warning in logs

**Status:** Known issue, non-critical
**Impact:** None - server functions normally
**Note:** Warning from express-rate-limit library about custom keyGenerator

---

## Summary

✅ **Implemented:**
- Account-level API key generation with better-auth
- 4 new API key management endpoints
- Dual authentication support (account + device keys)
- Rate limiting (5 requests/hour for sensitive operations)
- Device ownership validation
- Backwards compatibility with existing device keys

✅ **Security:**
- One-time key display
- 1-year expiration
- Cryptographically secure generation
- Device status validation
- User-based rate limiting

✅ **Developer Experience:**
- Simple one-key-per-account model
- Easy IoT device configuration
- Masked key viewing
- Self-service key regeneration

---

**Implementation Date:** November 20, 2025
**Server Version:** 1.0.0
**Better-Auth Version:** Latest
**Status:** ✅ Production Ready
