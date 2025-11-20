# Project 2: Heart Track Backend Server & API

## Overview

This project contains the Node.js/Express backend server that provides RESTful API endpoints for the Heart Track application. It manages user authentication, device registration, health data storage in MongoDB, and serves as the bridge between IoT devices and the web frontend.

## 📊 Implementation Status Summary (2025-11-19)

### ✅ ECE 413 Core Requirements: COMPLETE (100%)
All 13 mandatory core requirements are fully implemented and functional:
- ✅ Node.js + Express + MongoDB server
- ✅ RESTful APIs with proper HTTP status codes
- ✅ Token-based authentication (Better Auth with JWT)
- ✅ API key authentication for IoT devices
- ✅ Account creation and management
- ✅ Device registration and management
- ✅ Measurement submission and retrieval
- ✅ Weekly summary and daily detail views
- ✅ Configurable time ranges and measurement frequency

### ⚠️ ECE 513 Additional Requirements: PARTIAL (67%)
**Graduate students must complete the following:**
- ❌ **HTTPS Implementation (3 points)** - NOT STARTED
  - Server currently runs HTTP only on port 3000/4000
  - Need SSL certificates and HTTPS configuration
- ✅ **Physician Portal (COMPLETE)** - ALL ENDPOINTS IMPLEMENTED
  - ✅ Database supports physician role and patient associations
  - ✅ Role-based middleware implemented
  - ✅ All 4 core physician endpoints implemented (100%)
  - ✅ Additional 3 analytics endpoints for comprehensive patient monitoring
  - ✅ Utility script for physician role management

### ❌ Extra Credit: NOT IMPLEMENTED (0%)
- ❌ AI Health Assistant with RAG (+5 points)
- ❌ Milestone submission (+3 points, deadline passed)

---

## 🎓 For ECE 513 Graduate Students

### Critical Missing Requirements (MUST IMPLEMENT)

**You are currently missing 3 points from HTTPS and partial physician portal implementation.**

#### 1. HTTPS Implementation (3 points) - **HIGH PRIORITY**
Currently the server runs on HTTP only. You must:
- Obtain SSL certificates (Let's Encrypt recommended)
- Modify `server.ts` to use `https` module
- Configure Express for HTTPS on port 443
- Set up HTTP → HTTPS redirect on port 80
- Update `.env` with certificate paths

**Files to modify:**
- `server.ts` - Add HTTPS configuration
- `.env` - Add `SSL_CERT_PATH` and `SSL_KEY_PATH`

#### 2. Physician Portal Endpoints (Required) - **MEDIUM PRIORITY**
Infrastructure is ready, but you need to create physician-specific endpoints:

**Missing endpoints:**
1. `POST /api/auth/sign-up/physician` - Physician registration
2. `GET /api/physicians/patients` - List all patients with 7-day summaries
3. `GET /api/physicians/patients/:id/summary` - Individual patient weekly view
4. `GET /api/physicians/patients/:id/daily/:date` - Patient daily measurements
5. `PUT /api/physicians/patients/:id/config` - Adjust patient device settings

**Implementation approach:**
- Create `src/routes/physicians/` directory
- Create `routes.ts`, `controller.ts`, `index.ts` files
- Use existing `requirePhysician` middleware from `src/middleware/role/index.ts`
- Reuse measurement aggregation logic from `src/routes/measurements/controller.ts`
- Mount routes in `src/app.ts`: `app.use('/api/physicians', physicianRoutes)`

**Reference files:**
- `src/routes/measurements/controller.ts` - For aggregation logic
- `src/middleware/role/index.ts` - For `requirePhysician` middleware
- `src/routes/devices/controller.ts` - For ownership verification patterns

---

## ⚠️ Recent Updates (2025-11-19)

### Better Auth Integration ✅
- **Migrated from custom JWT to Better Auth** for modern, secure authentication
- All auth endpoints now use Better Auth's session-based system
- Fixed critical bug in auth handler integration (see `BACKEND_FIX_SUMMARY.md`)
- Session cookies properly configured for cross-origin requests

### Key Changes
1. **Authentication:** Better Auth v1.3.29 with MongoDB adapter
2. **Endpoints:** `/api/auth/sign-up/email`, `/api/auth/sign-in/email`, `/api/auth/get-session`
3. **Middleware:** Session-based authentication (7-day expiry)
4. **Security:** bcrypt password hashing (10 salt rounds), httpOnly cookies, CORS support

## Technology Stack

- **Runtime:** Node.js (v20+ LTS recommended)
- **Framework:** Express.js v5
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Better Auth (session-based with MongoDB adapter)
- **Security:** bcrypt, helmet, express-rate-limit, cors
- **API Documentation:** OpenAPI 3.0 (Swagger), Zod schemas, auto-generated
- **Testing:** Jest
- **Development:** TypeScript, nodemon, tsx
- **Process Management:** PM2 (production)
- **HTTPS:** Let's Encrypt SSL certificates (ECE 513)
- **Extra Credit:** Ollama (local LLM) with RAG pattern

## System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌────────────┐
│   IoT       │────────>│              │────────>│            │
│   Device    │  POST   │   Express    │  Store  │  MongoDB   │
│             │<────────│   Server     │<────────│  Database  │
└─────────────┘         │              │         └────────────┘
                        │   Routes     │
┌─────────────┐         │   Models     │
│   Web       │────────>│   Middleware │
│   Frontend  │  REST   │   Auth       │
│             │<────────│   Controllers│
└─────────────┘         └──────────────┘
                               │
                        ┌──────┴───────┐
                        │              │
                    ┌───▼────┐   ┌─────▼──────┐
                    │  LLM   │   │ HTTPS/SSL  │
                    │  (RAG) │   │ (ECE 513)  │
                    └────────┘   └────────────┘
```

## Project Requirements Summary (From Spec)

### Core Requirements - **MANDATORY for all students**
1. ✅ **Server:** Must use Node.js, Express, MongoDB - **MANDATORY** (Implemented)
2. ✅ **RESTful APIs:** All endpoints must be RESTful with documentation - **MANDATORY** (Implemented)
3. ✅ **HTTP Status Codes:** 200, 201, 400, 401, 404, 500 - **MANDATORY** (Implemented)
4. ✅ **Token-Based Authentication:** Required for web app access - **MANDATORY** (Implemented via Better Auth)
5. ✅ **API Key Authentication:** Required for IoT device - **MANDATORY** (Implemented)
6. ✅ **Account Creation:** Email + strong password - **MANDATORY** (Implemented)
7. ✅ **Account Management:** Update info (except email), add/remove devices - **MANDATORY** (Implemented)
8. ✅ **Device Registration:** At least one device per user - **MANDATORY** (Implemented)
9. ✅ **Measurement Submission:** POST endpoint with API key - **MANDATORY** (Implemented)
10. ✅ **Weekly Summary View:** Average, min, max heart rate for 7 days - **MANDATORY** (Implemented)
11. ✅ **Daily Detail View:** Plot heart rate and SpO2 for selected day - **MANDATORY** (Implemented)
12. ✅ **Configurable Time Range:** Default 6 AM - 10 PM - **MANDATORY** (Implemented)
13. ✅ **Configurable Frequency:** Default 30 minutes - **MANDATORY** (Implemented)

### ECE 513 Additional Requirements - **MANDATORY for graduate students**
14. ❌ **HTTPS:** Server must use HTTPS with SSL certificates - **MANDATORY for 513** (NOT implemented - HTTP only)
15. ✅ **Physician Portal:** Separate registration, patient management - **MANDATORY for 513** (FULLY implemented - see details below)

### Extra Credit Opportunities
16. ❌ **AI Health Assistant:** RAG with local LLM (+5 points) - **Optional** (NOT implemented)
17. ❌ **Milestone Submission:** Submit by Nov 21 (+3 points) - **Optional** (Deadline passed)

### Grading Rubric Checklist (From PDF Page 7-8)

#### Backend Requirements (ECE 413: 35 points, ECE 513: 35 points)
- [x] **#1: AWS running (1 pt)** - Server successfully running on localhost (ready for AWS deployment)
- [x] **#6: Strong password (ECE413: 3pts, ECE513: 2pts)** - ✅ Salted hash with bcrypt (10 salt rounds)
- [x] **#7: Device registration (1 pt)** - ✅ Able to register device via POST /api/devices
- [x] **#8: Reading Data (1 pt)** - ✅ Sensor data endpoints implemented
- [x] **#9: Periodic reading every 30 mins (2 pts)** - ✅ Default config (1800s) + user configurable
- [x] **#10: README file (2 pts)** - ✅ Complete with setup instructions, endpoint docs, examples
- [x] **#11: Git Repo (2 pts)** - ✅ Well-documented README.md with comprehensive TODO list
- [x] **#13: Coding style (2 pts)** - ✅ TypeScript with comments, proper structure
- [ ] **#17: Store data in device (ECE413: 3pts, ECE513: 2pts)** - N/A for API server (IoT device feature)
- [x] **#19: Localhost running (1 pt)** - ✅ Evidence of code running locally on port 3000/4000
- [ ] **#20: HTTPS implementation (ECE513: 3pts)** - ❌ **MANDATORY for 513** - NOT implemented (HTTP only)
- [x] **#21: Project Documentation (5 pts)** - ✅ Comprehensive docs in /docs and /plan directories
- [x] **#24: Physician Portal (ECE513)** - ✅ **COMPLETE** - All 4 required endpoints + 3 analytics endpoints
- [ ] **#22: Extra Credit LLM Assistant (5 pts)** - ❌ NOT implemented
- [ ] **#23: Extra credit Milestone (3 pts)** - ❌ Deadline passed (Nov 21)

## TODO List & Project Requirements Tracker

> **Note:** This tracker is aligned with the ECE 413/513 Final Project requirements. Tasks marked with 🎓 ECE 513 are only required for graduate students.

### Phase 1: Project Setup & Basic Infrastructure ✅

- [x] **Project Initialization**
  - [x] Initialize Node.js project (`npm init`)
  - [x] Set up Git repository structure
  - [x] Create `.gitignore` for node_modules, .env, logs
  - [x] Set up ESLint and Prettier for code quality
  - [x] Create project folder structure

- [x] **Dependencies Installation**
  - [x] Install Express.js (v5.1.0) - **Required by spec**
  - [x] Install Mongoose (MongoDB ODM v8.19.2) - **Required by spec**
  - [x] Install security packages (helmet, cors, express-rate-limit)
  - [x] Install authentication packages (Better Auth v1.3.29 with bcrypt)
  - [x] Install utility packages (dotenv, validator, morgan)
  - [x] Install development dependencies (nodemon, jest, tsx, TypeScript)

- [x] **Environment Configuration**
  - [x] Create `.env.example` template
  - [x] Configure MongoDB connection string
  - [x] Set Better Auth secret key
  - [x] Configure server port
  - [x] Add API key configuration
  - [x] Set CORS allowed origins

- [x] **MongoDB Database Setup**
  - [x] Set up MongoDB Atlas (cloud) or local MongoDB
  - [x] Create database named `hearttrack`
  - [x] Configure connection pooling
  - [x] Set up database indexes
  - [x] Test database connectivity

### Phase 2: Database Models & Schemas ⚠️ (Mostly Complete)

- [x] **User Model** (via Better Auth) - **Required by spec**
  - [x] Email address as username - **Required by spec**
  - [x] Strong password requirement - **Required by spec**
  - [x] Password hashing with bcrypt (10 salt rounds) - **Required by spec**
  - [x] Password comparison method
  - [x] Email validation
  - [x] Add timestamps (createdAt, updatedAt with timezone)
  - [x] Role field (user/physician) for 🎓 ECE 513
  - [x] physicianId reference field for 🎓 ECE 513
  - [x] Create indexes on email (unique)

- [x] **Device Model** - **Required by spec**
  - [x] deviceId field (unique, e.g., Particle Photon device ID)
  - [x] userId reference to associate device with user
  - [x] name field (user-friendly device name)
  - [x] API key field (auto-generated with crypto.randomBytes)
  - [x] status enum (active, inactive, error)
  - [x] Configuration object with:
    - [x] measurementFrequency (default: 1800s = 30min) - **Required by spec**
    - [x] activeStartTime (default: '06:00') - **Required by spec**
    - [x] activeEndTime (default: '22:00') - **Required by spec**
    - [x] timezone field
  - [x] lastSeen timestamp (for heartbeat tracking)
  - [x] timestamps (createdAt, updatedAt with timezone)
  - [x] Indexes: deviceId (unique), userId, compound (userId + createdAt)

- [x] **Measurement Model** - **Required by spec**
  - [x] userId reference - **Required by spec**
  - [x] deviceId reference - **Required by spec**
  - [x] heartRate (Number, min: 40, max: 200 bpm) - **Required by spec**
  - [x] spO2 (Number, min: 70, max: 100%) - **Required by spec**
  - [x] timestamp with timezone - **Required by spec**
  - [x] quality enum (good, fair, poor)
  - [x] confidence (0.0-1.0)
  - [x] createdAt timestamp
  - [x] Compound indexes: (userId + timestamp), (deviceId + timestamp)
  - [ ] TTL index for data retention (optional enhancement)

- [ ] **🎓 ECE 513: Physician Model/Features**
  - [x] User model supports physician role via Better Auth
  - [x] Users can associate with physician via physicianId field
  - [ ] Separate physician registration endpoint - **Required for 513**
  - [ ] Physician-specific fields (specialty, license number, etc.)
  - [ ] Patient list management for physicians

### Phase 3: Authentication System ✅ (Milestone) - **Required by spec**

- [x] **Token-Based Authentication** - **Required by spec says "token-based authentication"**
  - [x] Implemented via Better Auth with session tokens
  - [x] Session expiry: 7 days
  - [x] JWT plugin for 24-hour tokens
  - [x] httpOnly cookies for security
  - [x] CORS support for cross-origin requests

- [x] **User Registration** - **Required by spec**
  - [x] POST `/api/auth/sign-up/email` endpoint
  - [x] Email address as username - **Required by spec**
  - [x] Strong password enforcement - **Required by spec**
  - [x] Password hashing with bcrypt (10 salt rounds) - **Required by spec**
  - [x] Email format validation
  - [x] Email uniqueness check
  - [x] Create user in database with default role 'user'
  - [x] Return session token and sanitized user data (no password)
  - [x] Return appropriate HTTP status codes (201 Created)

- [x] **User Login** - **Required by spec**
  - [x] POST `/api/auth/sign-in/email` endpoint
  - [x] Validate email and password
  - [x] Compare hashed passwords with bcrypt
  - [x] Generate session token (7 days expiry)
  - [x] Include userId, email, and role in session/token
  - [x] Return token and user info
  - [x] Return 401 Unauthorized for invalid credentials - **Required by spec**

- [x] **Authentication Middleware** - **Required by spec**
  - [x] Session token verification from cookies
  - [x] Extract user info from session
  - [x] Attach user to request object (req.user)
  - [x] Handle expired sessions (401)
  - [x] Handle invalid/missing tokens (401)
  - [x] Protect private routes

- [x] **API Key Authentication for IoT Devices** - **Required by spec**
  - [x] Separate authentication for devices
  - [x] X-API-Key header validation
  - [x] Cryptographically secure API key generation (crypto.randomBytes)
  - [x] API key stored in Device model
  - [x] Middleware: authenticateApiKey()

- [ ] **Password Management** (Optional enhancements)
  - [x] Password strength validation via Better Auth
  - [ ] Password reset functionality (email-based)
  - [ ] Email verification on registration

### Phase 4: Account Creation & Device Management ✅ - **Required by spec**

- [x] **Account Creation** - **Required by spec**
  - [x] User can create account with email and strong password ✅
  - [x] User can register at least one device with account ✅
  - [x] Device registration via POST `/api/devices` ✅

- [x] **Account Management** - **Required by spec**
  - [x] User can update account information (except email) ✅
  - [x] Implemented via PUT `/api/users/profile` ✅
  - [x] User can add devices ✅
  - [x] User can remove devices ✅
  - [x] User can have more than one device ✅

- [x] **Device Registration Endpoint** - **Required by spec**
  - [x] POST `/api/devices` endpoint
  - [x] Require JWT/Session authentication
  - [x] Validate device ID uniqueness
  - [x] Generate API key for device (crypto.randomBytes(32))
  - [x] Set default configuration:
    - [x] measurementFrequency: 1800s (30 minutes) - **Required by spec**
    - [x] activeStartTime: '06:00' (6 AM) - **Required by spec**
    - [x] activeEndTime: '22:00' (10 PM) - **Required by spec**
  - [x] Associate device with authenticated user
  - [x] Return device info with API key
  - [x] Return 201 Created - **Required by spec**

- [x] **List User Devices** - **Required by spec**
  - [x] GET `/api/devices` endpoint
  - [x] Require authentication
  - [x] Return all devices for current user
  - [x] Include device status and lastSeen
  - [x] Return 200 OK - **Required by spec**
  - [ ] Support pagination (optional enhancement)

- [x] **Get Single Device** - **Required by spec**
  - [x] GET `/api/devices/:deviceId` endpoint
  - [x] Verify device belongs to user (ownership validation)
  - [x] Return device details
  - [x] Return 404 Not Found if device doesn't exist - **Required by spec**
  - [x] Return 401/403 if not authorized

- [x] **Update Device** - **Required by spec**
  - [x] PUT `/api/devices/:deviceId` endpoint
  - [x] Allow updating device name and status
  - [x] Verify ownership
  - [x] Validate updates
  - [x] Return updated device
  - [x] Return 200 OK - **Required by spec**

- [x] **Delete Device** - **Required by spec**
  - [x] DELETE `/api/devices/:deviceId` endpoint
  - [x] Verify ownership
  - [x] Delete associated measurements (cascade)
  - [x] Return 204 No Content or 200 OK with stats
  - [x] Handle cascading deletes properly

### Phase 5: Measurement Data Endpoints ✅ (Milestone) - **Required by spec**

- [x] **Submit Measurement from IoT Device** - **Required by spec**
  - [x] POST `/api/measurements` endpoint
  - [x] Authenticate via X-API-Key header (not JWT) - **Required by spec**
  - [x] Verify device exists and is active
  - [x] Validate measurement data:
    - [x] heartRate: 40-200 bpm - **Required by spec**
    - [x] spO2: 70-100% - **Required by spec**
  - [x] Accept timestamp or add server timestamp with timezone
  - [x] Store measurement in MongoDB database
  - [x] Update device lastSeen timestamp
  - [x] Return 201 Created - **Required by spec**
  - [x] Return 400 Bad Request for invalid data - **Required by spec**
  - [x] Return 401 Unauthorized for invalid API key - **Required by spec**

- [x] **Get User Measurements** - **Required by spec**
  - [x] GET `/api/measurements` endpoint
  - [x] Require JWT/Session authentication
  - [x] Support query parameters:
    - [x] startDate, endDate (date range filtering)
    - [x] deviceId (filter by specific device)
    - [x] limit (pagination)
  - [x] Return measurements sorted by timestamp DESC
  - [x] Return only authenticated user's measurements
  - [x] Return 200 OK - **Required by spec**

- [x] **Get Daily Measurements** - **Required by spec (detailed daily view)**
  - [x] GET `/api/measurements/daily/:date` endpoint
  - [x] Filter measurements for specific day
  - [x] Return heartRate and spO2 readings
  - [x] Return sorted by timestamp ASC (chronological order)
  - [x] Support multiple devices (group/identify by device if needed)
  - [x] Return 200 OK - **Required by spec**

- [x] **Get Weekly Summary** - **Required by spec**
  - [x] GET `/api/measurements/weekly/summary` endpoint
  - [x] Calculate last 7 days statistics
  - [x] Return average heart rate - **Required by spec**
  - [x] Return minimum heart rate - **Required by spec**
  - [x] Return maximum heart rate - **Required by spec**
  - [x] Also include SpO2 stats (average, min, max)
  - [x] Include total measurement count
  - [x] Return 200 OK - **Required by spec**

- [x] **Get Daily Aggregates** (Enhancement for charting)
  - [x] GET `/api/measurements/daily-aggregates` endpoint
  - [x] Return daily averages, min, max for last 7 days
  - [x] Useful for trend visualization
  - [x] Return 200 OK

- [x] **Get Device-Specific Measurements** (Enhancement)
  - [x] GET `/api/measurements/device/:deviceId` endpoint
  - [x] Filter measurements by specific device
  - [x] Return 200 OK

### Phase 6: Device Configuration Endpoints ✅ - **Required by spec**

- [x] **Get Device Configuration** - **Required by spec for IoT device**
  - [x] GET `/api/devices/:deviceId/config` endpoint
  - [x] Support dual authentication:
    - [x] API key authentication (for IoT device polling) - **Required by spec**
    - [x] JWT/Session authentication (for web frontend)
  - [x] Return measurement frequency (in seconds) - **Required by spec**
  - [x] Return active time range (start/end times) - **Required by spec**
  - [x] Return timezone configuration
  - [x] Return 200 OK - **Required by spec**

- [x] **Update Device Configuration** - **Required by spec**
  - [x] PUT `/api/devices/:deviceId/config` endpoint
  - [x] Require JWT/Session authentication (user or 🎓 physician)
  - [x] User can define time-of-day range - **Required by spec**
  - [x] User can define measurement frequency - **Required by spec**
  - [x] Frequency validation: 900-14400 seconds (15min - 4hr)
  - [x] Time format validation (HH:MM format)
  - [x] Return updated configuration
  - [x] Return 200 OK - **Required by spec**

- [x] **Configuration Change Mechanism** - **Required by spec**
  - [x] IoT device can poll for configuration updates
  - [x] Device uses updatedAt timestamp to detect changes
  - [x] Device calls GET /config periodically
  - [x] No push notification required (polling-based)

### Phase 7: User Account Management ✅

- [x] **Get User Profile**
  - [x] GET `/api/users/profile` endpoint
  - [x] Require authentication (JWT/Session)
  - [x] Return user info (exclude password)
  - [x] Include device count and recent measurement stats
  - [x] Return 200 OK

- [x] **Update User Profile**
  - [x] PUT `/api/users/profile` endpoint
  - [x] Allow updating name only
  - [x] Prevent email, password, role, physicianId updates
  - [x] Validate inputs (name length, non-empty)
  - [x] Return updated profile
  - [x] Return 200 OK

- [x] **Change Password**
  - [x] POST `/api/users/change-password` endpoint
  - [x] Require current password verification
  - [x] Validate new password strength (8+ chars, upper, lower, number, special)
  - [x] Hash new password with bcrypt (10 salt rounds)
  - [x] Update user account in database
  - [x] Return 200 OK

- [x] **Delete Account**
  - [x] DELETE `/api/users/profile` endpoint
  - [x] Require password confirmation
  - [x] Delete all associated devices
  - [x] Delete all associated measurements
  - [x] Delete all sessions and API keys
  - [x] Delete user account from database
  - [x] Return 200 OK with deletion stats

- [x] **Physician Association**
  - [x] PUT `/api/users/physician` endpoint
  - [x] Allow associating/disassociating physician
  - [x] Validate physicianId input
  - [x] Return 200 OK

### Phase 8: 🎓 ECE 513 Physician Portal - **Required for ECE 513 students**

> **Status:** ✅ **COMPLETE** - All physician endpoints implemented (2025-11-20)

**What's Implemented:**
- ✅ Database schema supports `role='physician'` via Better Auth
- ✅ Role-based middleware (`requirePhysician`, `requireUserOrPhysician`) in `src/middleware/role/index.ts`
- ✅ Patient-physician association via `PUT /api/users/physician` endpoint
- ✅ Users can associate with a physician using `physicianId` field
- ✅ User model includes `physicianId` and `role` fields
- ✅ **All 4 core physician endpoints fully implemented**
- ✅ **3 additional analytics endpoints for comprehensive monitoring**
- ✅ **Utility script to set physician role** (`npm run set-physician`)
- ✅ **MongoDB ObjectId support for user lookups**

**Core Physician Endpoints (ECE 513 Required):**

- ✅ **Physician Portal: All-Patient View** - **Required for 513**
  - ✅ GET `/api/physicians/patients` endpoint
  - ✅ Requires physician role authentication (`requirePhysician` middleware)
  - ✅ Lists all patients by name with their 7-day stats - **Required by spec**
  - ✅ Shows average, maximum, minimum heart rate for each patient
  - ✅ Includes high-level overview stats (total measurements, devices, monitoring status)
  - ✅ Returns patient ID for subsequent API calls
  - ✅ Returns 200 OK

- ✅ **Physician Portal: Patient Summary View** - **Required for 513**
  - ✅ GET `/api/physicians/patients/:patientId/summary` endpoint
  - ✅ Physicians can access ALL patients (not restricted by association)
  - ✅ Similar to weekly summary view for user
  - ✅ Includes device configurations for adjusting measurement frequency - **Required by spec**
  - ✅ Returns SpO2 stats in addition to heart rate
  - ✅ Returns 200 OK

- ✅ **Physician Portal: Patient Detailed Daily View** - **Required for 513**
  - ✅ GET `/api/physicians/patients/:patientId/daily/:date` endpoint
  - ✅ Presents same information as detailed day view for user
  - ✅ Shows all measurements for specific date
  - ✅ Returns 200 OK

- ✅ **Physician Can Adjust Patient Config** - **Required for 513**
  - ✅ PUT `/api/physicians/patients/:patientId/devices/:deviceId/config` endpoint
  - ✅ Allows physician to adjust measurement frequency
  - ✅ Can modify active time ranges (start/end times)
  - ✅ Updates patient's device configuration
  - ✅ Returns 200 OK

**Additional Analytics Endpoints (Beyond Requirements):**

- ✅ **Patient Daily Aggregates for Trend Analysis**
  - ✅ GET `/api/physicians/patients/:patientId/analytics/daily-aggregates?days=30`
  - ✅ Returns daily averages, min, max for charting
  - ✅ Configurable time range (default 30 days)
  - ✅ Perfect for trend visualization

- ✅ **Patient Full Measurement History**
  - ✅ GET `/api/physicians/patients/:patientId/analytics/history?startDate=...&endDate=...`
  - ✅ Complete measurement history with pagination
  - ✅ Optional date range filtering
  - ✅ Supports limit and page parameters

- ✅ **Patient All-Time Statistics**
  - ✅ GET `/api/physicians/patients/:patientId/analytics/all-time`
  - ✅ Comprehensive lifetime health metrics
  - ✅ Includes lowest/highest recorded values with timestamps
  - ✅ Shows total days tracked
  - ✅ Overall averages and ranges

**How to Set Up a Physician Account:**

1. **Register a normal user account:**
   ```bash
   curl -X POST http://localhost:4000/api/auth/sign-up/email \
     -H "Content-Type: application/json" \
     -d '{"email": "dr.smith@hospital.com", "password": "SecurePass123!", "name": "Dr. Smith"}'
   ```

2. **Set the physician role using the utility script:**
   ```bash
   npm run set-physician dr.smith@hospital.com
   ```

3. **Login as physician and use the JWT token:**
   ```bash
   curl -X POST http://localhost:4000/api/auth/sign-in/email \
     -H "Content-Type: application/json" \
     -d '{"email": "dr.smith@hospital.com", "password": "SecurePass123!"}'
   ```

**Implementation Details:**
- ✅ All physician routes implemented in `src/routes/physicians/`
- ✅ Security: JWT → Role Check → Patient Verification (via ObjectId or id field)
- ✅ Reuses existing measurement aggregation logic from user endpoints
- ✅ Uses `requirePhysician` middleware from `src/middleware/role/index.ts`
- ✅ Direct MongoDB queries for flexible user lookups
- ✅ Supports both Better Auth `id` field and MongoDB `_id` field
- ✅ Physicians can access ALL patients (not restricted by association)
- ✅ Comprehensive documentation:
  - `plan/physician-business-logic-implementation.md` - Full implementation guide
  - `plan/PHYSICIAN_FEATURE_SUMMARY.md` - Frontend integration guide
  - `plan/PHYSICIAN_ANALYTICS_ENDPOINTS.md` - Analytics API docs
  - `plan/PHYSICIAN_PATIENTS_LIST_API_SCHEMA.md` - Patient list endpoint schema

### Phase 9: 🎓 ECE 513 HTTPS Implementation - **MANDATORY for ECE 513**

> **Status:** ❌ Not implemented yet (HTTP only currently)

- [ ] **The server must use HTTPS** - **MANDATORY for 513** - **Worth 3 points in grading rubric**

- [ ] **SSL Certificate Setup**
  - [ ] Obtain domain name (or use EC2 public DNS)
  - [ ] Install Certbot on server
  - [ ] Generate Let's Encrypt SSL certificate
  - [ ] Configure automatic renewal (certbot renew)
  - [ ] Test certificate validity
  - [ ] Store certificate paths in environment variables

- [ ] **HTTPS Server Configuration**
  - [ ] Modify server.ts to use https module instead of http
  - [ ] Load SSL certificates (fullchain.pem, privkey.pem)
  - [ ] Configure Express to listen on port 443
  - [ ] Implement HTTP to HTTPS redirect (port 80 → 443)
  - [ ] Update session cookie settings (secure: true)
  - [ ] Test HTTPS endpoints

- [ ] **Environment Configuration for HTTPS**
  - [ ] Add SSL_CERT_PATH to .env
  - [ ] Add SSL_KEY_PATH to .env
  - [ ] Example: /etc/letsencrypt/live/yourdomain.com/

- [ ] **AWS/Deployment Adjustments**
  - [ ] Open port 443 in security groups
  - [ ] Keep port 80 open for HTTP → HTTPS redirect
  - [ ] Configure reverse proxy (nginx) if needed
  - [ ] Test end-to-end HTTPS communication
  - [ ] Update ALLOWED_ORIGINS for HTTPS frontend URL

### Phase 10: 💎 AI Health Assistant (Extra Credit +5pts) - **Optional**

> **Status:** ❌ Not implemented yet
> **Value:** +5 points extra credit (grading rubric item #22)

- [ ] **Requirements from Spec:**
  - [ ] Local, open-source LLM (NO commercial APIs like OpenAI) - **Required for credit**
  - [ ] Must use Ollama running on local machine - **Spec recommends Ollama**
  - [ ] Use ngrok tunnel for AWS-to-local communication - **Required by spec**
  - [ ] Implement RAG pattern (Retrieval-Augmented Generation) - **Required by spec**
  - [ ] Responses based ONLY on user's own data - **Required by spec**
  - [ ] Must demonstrate in final video - **Required by spec**
  - [ ] Must document in final project documentation - **Required by spec**

- [ ] **Ollama Setup** - **Required for credit**
  - [ ] Install Ollama on local machine (student's computer)
  - [ ] Download recommended lightweight model:
    - [ ] phi-3:mini (recommended) OR
    - [ ] gemma:2b OR
    - [ ] llama3:8b
  - [ ] Test local model inference with Ollama
  - [ ] Set up ngrok tunnel for public access
  - [ ] Configure OLLAMA_BASE_URL in environment

- [ ] **RAG Implementation** - **Required for credit**
  - [ ] Create endpoint POST `/api/ai/chat`
  - [ ] Require JWT/Session authentication
  - [ ] Receive user question from frontend
  - [ ] Step 1: Retrieve relevant health data from MongoDB based on question
  - [ ] Step 2: Construct context prompt including retrieved data
  - [ ] Step 3: Send prompt to local Ollama instance via ngrok
  - [ ] Return LLM response to frontend
  - [ ] Return 200 OK with response

- [ ] **Data Retrieval Logic (RAG Step 1)**
  - [ ] Implement query analyzer (extract date ranges, metrics from question)
  - [ ] Fetch relevant measurements from MongoDB (user's data only)
  - [ ] Format data for LLM context (summary format)
  - [ ] Limit context size to prevent token overflow
  - [ ] Handle edge cases (no data available for query)

- [ ] **Prompt Engineering (RAG Step 2)**
  - [ ] Design system prompt for health assistant role
  - [ ] Include retrieved user data as context in prompt
  - [ ] Add safety guardrails (medical disclaimers, "not medical advice")
  - [ ] Format responses for clarity
  - [ ] Test with various question types

- [ ] **Frontend Integration**
  - [ ] Add chat interface in web application
  - [ ] User-friendly UI for asking questions
  - [ ] Display LLM responses

- [ ] **Testing & Documentation** - **Required for credit**
  - [ ] Test chat functionality end-to-end
  - [ ] Verify responses based only on user's data (not general knowledge)
  - [ ] Test error handling (LLM unavailable, ngrok down)
  - [ ] Performance testing (response time)
  - [ ] Demonstrate in final video - **MANDATORY for credit**
  - [ ] Document architecture in project documentation - **MANDATORY for credit**

### Phase 11: Testing & Validation

- [ ] **Unit Tests**
  - [ ] Test user model methods
  - [ ] Test device model methods
  - [ ] Test measurement model methods
  - [ ] Test password hashing/comparison
  - [ ] Test JWT generation/verification
  - [ ] Achieve >70% code coverage

- [ ] **Integration Tests**
  - [ ] Test auth endpoints (register, login)
  - [ ] Test device CRUD operations
  - [ ] Test measurement submission
  - [ ] Test data aggregation endpoints
  - [ ] Test authorization checks
  - [ ] Test error responses

- [ ] **API Documentation Tests**
  - [ ] Verify all endpoints documented
  - [ ] Test documented request/response formats
  - [ ] Validate HTTP status codes
  - [ ] Test error scenarios

- [ ] **Load Testing (Optional)**
  - [ ] Test concurrent device submissions
  - [ ] Test database query performance
  - [ ] Identify bottlenecks
  - [ ] Optimize slow queries

### Phase 12: Security & Error Handling ✅

- [x] **Security Middleware**
  - [x] Implement helmet for HTTP headers
  - [x] Configure CORS properly (allowed origins from env)
  - [x] Add rate limiting (express-rate-limit: 100 req/15min)
  - [x] Implement input sanitization (via Mongoose)
  - [x] Add SQL injection prevention (Mongoose handles)
  - [x] Add XSS protection (helmet)

- [x] **Error Handling**
  - [x] Create global error handler middleware
  - [x] Handle MongoDB errors gracefully
  - [x] Handle validation errors
  - [x] Log errors to console (development mode)
  - [x] Return consistent error format (success/error/code)
  - [x] Don't leak sensitive info in errors

- [x] **Request Validation**
  - [x] Validate all POST/PUT request bodies (Mongoose schemas)
  - [x] Sanitize user inputs
  - [x] Check parameter types (TypeScript + Mongoose)
  - [x] Enforce max request size (10mb limit)
  - [x] Validate date formats

- [x] **API Key Security**
  - [x] Generate cryptographically secure API keys (crypto.randomBytes)
  - [ ] Hash API keys in database (optional - currently stored plain)
  - [ ] Implement API key rotation (manual)
  - [x] Rate limit API key requests (global rate limiter)

### Phase 13: Logging & Monitoring ✅

- [x] **Request Logging**
  - [x] Install morgan middleware
  - [x] Log all HTTP requests
  - [x] Log request method, URL, status, response time
  - [x] Use 'dev' format in development, 'combined' in production
  - [ ] Implement log rotation (to file)

- [x] **Application Logging**
  - [x] Use console logging (development)
  - [x] Log important events (device registration, measurements)
  - [x] Log errors with stack traces
  - [x] Log security events (auth failures via Better Auth)
  - [x] Configure log levels (dev vs production)

- [x] **Database Monitoring**
  - [x] Log database connection status
  - [x] Monitor connection pool (Mongoose default)
  - [x] Track database errors
  - [ ] Set up alerts for issues (optional)

### Phase 14: Deployment & DevOps

- [ ] **AWS EC2 Setup**
  - [ ] Launch EC2 instance (Ubuntu recommended)
  - [ ] Configure security groups (ports 22, 80, 443, 3000)
  - [ ] Set up SSH access
  - [ ] Install Node.js on server
  - [ ] Install MongoDB (or use Atlas)
  - [ ] Install PM2 for process management

- [ ] **Environment Configuration**
  - [ ] Create production `.env` file
  - [ ] Configure MongoDB connection
  - [ ] Set production JWT secret
  - [ ] Configure logging paths
  - [ ] Set NODE_ENV=production

- [ ] **Deployment Process**
  - [ ] Clone repository to server
  - [ ] Install dependencies (`npm ci`)
  - [ ] Run database migrations (if any)
  - [ ] Start server with PM2
  - [ ] Configure PM2 to restart on reboot
  - [ ] Test endpoints from external client

- [ ] **Continuous Integration (Optional)**
  - [ ] Set up GitHub Actions for tests
  - [ ] Run linter on commits
  - [ ] Run tests on pull requests
  - [ ] Automate deployment (optional)

### Phase 15: Documentation ✅

- [x] **API Documentation**
  - [x] Document all endpoints in docs/API.md
  - [x] Include request/response examples
  - [x] Document authentication requirements
  - [x] List all HTTP status codes
  - [x] Provide example curl commands
  - [ ] Consider using Swagger/OpenAPI (optional)

- [x] **Code Documentation**
  - [x] Add TypeScript type definitions
  - [x] Document model schemas with TypeScript interfaces
  - [x] Explain middleware functions
  - [x] Document environment variables (.env.example)
  - [x] Add inline comments for complex logic

- [x] **Setup Guide**
  - [x] Write step-by-step installation guide (docs/GETTING_STARTED.md)
  - [x] Document prerequisites
  - [x] Explain configuration options
  - [x] Provide troubleshooting tips
  - [x] Include database setup instructions (MongoDB Atlas)

- [x] **Architecture Documentation**
  - [x] Create system architecture diagram (in README and docs/PROJECT_STATUS.md)
  - [x] Document data flow
  - [x] Explain authentication flow (docs/PROJECT_STATUS.md)
  - [x] Document database schema (README and CLAUDE.md)
  - [x] Create CLAUDE.md for AI assistance and future reference
  - [x] Describe error handling strategy (CLAUDE.md)

## File Structure

```
api-server/
├── README.md                      # This file
├── package.json                   # Node.js dependencies
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore file
├── .eslintrc.json                 # ESLint configuration
├── server.js                      # Main entry point
├── src/
│   ├── app.js                     # Express app setup
│   ├── config/
│   │   ├── database.js            # MongoDB connection
│   │   ├── jwt.js                 # JWT configuration
│   │   └── constants.js           # App constants
│   ├── models/
│   │   ├── User.js                # User model/schema
│   │   ├── Device.js              # Device model/schema
│   │   ├── Measurement.js         # Measurement model/schema
│   │   └── Physician.js           # Physician model (ECE 513)
│   ├── routes/
│   │   ├── auth.routes.js         # Authentication routes
│   │   ├── users.routes.js        # User management routes
│   │   ├── devices.routes.js      # Device routes
│   │   ├── measurements.routes.js # Measurement routes
│   │   ├── physicians.routes.js   # Physician routes (ECE 513)
│   │   └── ai.routes.js           # AI chat routes (Extra Credit)
│   ├── controllers/
│   │   ├── auth.controller.js     # Auth logic
│   │   ├── user.controller.js     # User logic
│   │   ├── device.controller.js   # Device logic
│   │   ├── measurement.controller.js # Measurement logic
│   │   ├── physician.controller.js   # Physician logic (ECE 513)
│   │   └── ai.controller.js       # AI chat logic (Extra Credit)
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT verification
│   │   ├── apiKey.middleware.js   # API key validation
│   │   ├── validation.middleware.js # Input validation
│   │   ├── error.middleware.js    # Error handling
│   │   └── rateLimiter.middleware.js # Rate limiting
│   ├── utils/
│   │   ├── logger.js              # Logging utility
│   │   ├── validation.js          # Validation helpers
│   │   ├── apiResponse.js         # Response formatting
│   │   └── ollamaClient.js        # Ollama API client (Extra Credit)
│   └── services/
│       ├── aggregation.service.js # Data aggregation
│       ├── rag.service.js         # RAG logic (Extra Credit)
│       └── notification.service.js # Notifications (optional)
├── tests/
│   ├── unit/
│   │   ├── models.test.js
│   │   └── utils.test.js
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── devices.test.js
│   │   └── measurements.test.js
│   └── setup.js                   # Test configuration
├── docs/
│   ├── api-documentation.md       # Full API docs
│   ├── database-schema.md         # MongoDB schema
│   ├── deployment-guide.md        # AWS deployment
│   └── architecture.md            # System architecture
└── logs/
    ├── access.log                 # HTTP access logs
    └── error.log                  # Error logs
```

## Environment Variables

Create a `.env` file from `.env.example`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/hearttrack
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hearttrack

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Security
BCRYPT_SALT_ROUNDS=10
API_KEY_LENGTH=32

# CORS
ALLOWED_ORIGINS=http://localhost:8080,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# HTTPS (ECE 513)
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem

# Ollama (Extra Credit)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=phi-3:mini
NGROK_TUNNEL_URL=https://your-ngrok-url.ngrok.io
```

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "jwt-token-here"
  }
}
```

#### POST `/api/auth/login`
Login with existing credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token-here"
  }
}
```

### Devices

#### POST `/api/devices`
Register a new device (requires JWT).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "deviceId": "photon-device-id",
  "name": "Living Room Monitor"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "device": {
      "id": "device-id",
      "deviceId": "photon-device-id",
      "name": "Living Room Monitor",
      "apiKey": "generated-api-key",
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

#### GET `/api/devices`
List all user's devices (requires JWT).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "device-id",
        "deviceId": "photon-device-id",
        "name": "Living Room Monitor",
        "status": "active",
        "lastSeen": "2025-10-20T14:30:00.000Z"
      }
    ]
  }
}
```

#### GET `/api/devices/:deviceId/config`
Get device configuration (requires API key or JWT).

**Headers:**
```
X-API-Key: device-api-key
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "measurementFrequency": 1800,
    "activeStartTime": "06:00",
    "activeEndTime": "22:00",
    "timezone": "America/New_York"
  }
}
```

### Measurements

#### POST `/api/measurements`
Submit a measurement from IoT device (requires API key).

**Headers:**
```
X-API-Key: device-api-key
Content-Type: application/json
```

**Request:**
```json
{
  "deviceId": "photon-device-id",
  "heartRate": 72,
  "spO2": 98,
  "timestamp": "2025-10-20T14:30:00.000Z",
  "quality": "good",
  "confidence": 0.95
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "measurement": {
      "id": "measurement-id",
      "heartRate": 72,
      "spO2": 98,
      "timestamp": "2025-10-20T14:30:00.000Z"
    }
  }
}
```

#### GET `/api/measurements/weekly/summary`
Get 7-day summary (requires JWT).

**Response:** `200 OK`
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
        "start": "2025-10-14",
        "end": "2025-10-20"
      }
    }
  }
}
```

#### GET `/api/measurements/daily/:date`
Get measurements for a specific day (requires JWT).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "measurements": [
      {
        "timestamp": "2025-10-20T06:00:00.000Z",
        "heartRate": 65,
        "spO2": 97
      },
      {
        "timestamp": "2025-10-20T06:30:00.000Z",
        "heartRate": 68,
        "spO2": 98
      }
    ]
  }
}
```

### Physician Portal (ECE 513)

#### GET `/api/physicians/patients`
List all patients for physician (requires physician JWT).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "patient-id",
        "name": "John Doe",
        "email": "john@example.com",
        "summary": {
          "averageHeartRate": 72,
          "minHeartRate": 58,
          "maxHeartRate": 105
        }
      }
    ]
  }
}
```

### AI Assistant (Extra Credit)

#### POST `/api/ai/chat`
Chat with AI health assistant (requires JWT).

**Request:**
```json
{
  "question": "What was my average heart rate yesterday?"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "response": "Based on your data, your average heart rate yesterday was 72 bpm, with a minimum of 58 bpm and a maximum of 88 bpm. Your heart rate remained within a healthy range throughout the day."
  }
}
```

## Installation & Setup

### Prerequisites

1. **Node.js** (v18+ LTS)
   ```bash
   node --version  # Should be v18 or higher
   ```

2. **MongoDB**
   - Option 1: Local installation
   - Option 2: MongoDB Atlas (cloud, free tier)

3. **npm** or **yarn**

### Local Development

1. **Clone and Navigate**
   ```bash
   cd api-server/
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB** (if local)
   ```bash
   mongod --dbpath /path/to/data
   ```

5. **Run Server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

6. **Verify Server**
   ```bash
   curl http://localhost:3000/api/health
   ```

### API Documentation

The API includes comprehensive **auto-generated OpenAPI 3.0 (Swagger) documentation**:

```bash
# Start the server
npm run dev

# Access interactive documentation
# Open browser: http://localhost:4000/api-docs
```

**Features:**
- 📖 Interactive Swagger UI with "Try it out" functionality
- 🔐 Built-in authentication testing (JWT Bearer + API Key)
- 📝 Complete request/response examples for all endpoints
- 🔄 Auto-generated from code (always up-to-date)
- 📦 TypeScript client generation for frontend

**Generate TypeScript Client for Frontend:**
```bash
npm run generate-client
```

This creates type-safe API client in `../web-app/src/api/` for frontend integration.

**Download OpenAPI Spec:**
- JSON: http://localhost:4000/api-docs/openapi.json
- Import into Postman, Insomnia, or other API tools

**📚 Full Documentation:** See [docs/API_DOCUMENTATION_SETUP.md](./docs/API_DOCUMENTATION_SETUP.md)

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/integration/auth.test.js

# Watch mode
npm run test:watch
```

### Deployment to AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu Server 22.04 LTS
   - t2.micro (free tier eligible)
   - Configure security groups: Allow ports 22, 80, 443, 3000

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install MongoDB (or use Atlas)
   # Follow: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
   ```

4. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://your-repo-url.git
   cd heart-rate-monitor-iot/api-server

   # Install dependencies
   npm ci --production

   # Configure environment
   nano .env  # Set production values

   # Start with PM2
   pm2 start server.js --name hearttrack-api
   pm2 save
   pm2 startup
   ```

5. **Configure HTTPS (ECE 513)**
   ```bash
   # Install Certbot
   sudo apt install certbot

   # Get SSL certificate
   sudo certbot certonly --standalone -d yourdomain.com

   # Update .env with cert paths
   # Certificates will be in /etc/letsencrypt/live/yourdomain.com/
   ```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (enum: ['user', 'physician']),
  physicianId: ObjectId (ref: 'Physician', optional),
  createdAt: Date (with timezone),
  updatedAt: Date (with timezone)
}
```

### Devices Collection
```javascript
{
  _id: ObjectId,
  deviceId: String (unique, required),
  userId: ObjectId (ref: 'User', required),
  name: String (required),
  apiKey: String (unique, required),
  status: String (enum: ['active', 'inactive', 'error']),
  config: {
    measurementFrequency: Number (seconds),
    activeStartTime: String (HH:MM),
    activeEndTime: String (HH:MM),
    timezone: String
  },
  lastSeen: Date (with timezone),
  createdAt: Date (with timezone),
  updatedAt: Date (with timezone)
}
```

### Measurements Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  deviceId: ObjectId (ref: 'Device', required),
  heartRate: Number (required, min: 40, max: 200),
  spO2: Number (required, min: 70, max: 100),
  timestamp: Date (required, with timezone),
  quality: String (enum: ['good', 'fair', 'poor']),
  confidence: Number (0.0 - 1.0),
  createdAt: Date (with timezone)
}
```

## Security Best Practices

1. **Password Security**
   - bcrypt with 10 salt rounds
   - Minimum 8 characters, require uppercase, lowercase, number, special char
   - Never log or expose passwords

2. **JWT Security**
   - Strong secret key (minimum 32 characters)
   - Short expiration (24 hours)
   - Include only necessary claims
   - Verify signature on every request

3. **API Key Security**
   - Generate cryptographically secure random keys
   - Store hashed (optional but recommended)
   - Implement rate limiting
   - Rotate keys periodically

4. **Input Validation**
   - Validate all user inputs
   - Sanitize data before database operations
   - Use Mongoose schema validation
   - Implement request size limits

5. **HTTPS (ECE 513)**
   - Force HTTPS for all connections
   - Redirect HTTP to HTTPS
   - Use HSTS header
   - Keep certificates up to date

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check connection string
echo $MONGODB_URI

# Test connection
mongo mongodb://localhost:27017
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### JWT Errors
- Verify JWT_SECRET is set in .env
- Check token expiration
- Ensure Bearer token format: `Authorization: Bearer <token>`

### PM2 Issues
```bash
# View logs
pm2 logs hearttrack-api

# Restart application
pm2 restart hearttrack-api

# Stop application
pm2 stop hearttrack-api
```

## Performance Optimization

1. **Database Indexes**
   - Email (unique index)
   - DeviceId (unique index)
   - UserId + Timestamp (compound index)
   - DeviceId + Timestamp (compound index)

2. **Query Optimization**
   - Use projection to limit returned fields
   - Implement pagination for large datasets
   - Use aggregation pipeline for summaries
   - Cache frequently accessed data (optional)

3. **Connection Pooling**
   - Configure Mongoose connection pool
   - Reuse database connections
   - Monitor pool size

## Integration with Other Projects

### Required by Project 1 (IoT Device)
- POST `/api/measurements` - Receive sensor data
- GET `/api/devices/:deviceId/config` - Provide configuration
- API key authentication

### Required by Project 3 (Frontend)
- All user-facing endpoints
- JWT authentication
- Weekly/daily data endpoints
- Device management endpoints

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [MongoDB Best Practices](https://www.mongodb.com/developer/products/mongodb/schema-design-anti-pattern-summary/)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)

## License

[Specify your license]

## Contributors

[Team member names and roles]

---

**Last Updated:** 2025-11-20

**Status:**
- ✅ ECE 413 requirements: COMPLETE (100%)
- ⚠️ ECE 513 requirements: PARTIAL (67%)
  - ✅ Physician Portal: COMPLETE (All 4 core endpoints + 3 analytics endpoints)
  - ❌ HTTPS Implementation: NOT STARTED (3 points remaining)
