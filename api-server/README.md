# Project 2: Heart Track Backend Server & API

## Overview

This project contains the Node.js/Express backend server that provides RESTful API endpoints for the Heart Track application. It manages user authentication, device registration, health data storage in MongoDB, and serves as the bridge between IoT devices and the web frontend.

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

## TODO List

### Phase 1: Project Setup & Basic Infrastructure ✅

- [x] **Project Initialization**
  - [x] Initialize Node.js project (`npm init`)
  - [x] Set up Git repository structure
  - [x] Create `.gitignore` for node_modules, .env, logs
  - [x] Set up ESLint and Prettier for code quality
  - [x] Create project folder structure

- [x] **Dependencies Installation**
  - [x] Install Express.js
  - [x] Install Mongoose (MongoDB ODM)
  - [x] Install security packages (helmet, cors, express-rate-limit)
  - [x] Install authentication packages (Better Auth with bcrypt)
  - [x] Install utility packages (dotenv, validator, morgan)
  - [x] Install development dependencies (nodemon, jest, tsx)

- [x] **Environment Configuration**
  - [x] Create `.env.example` template
  - [x] Configure MongoDB connection string
  - [x] Set Better Auth secret key
  - [x] Configure server port
  - [x] Add API key secrets
  - [x] Set CORS allowed origins

- [x] **MongoDB Database Setup**
  - [x] Set up MongoDB Atlas (cloud)
  - [x] Create database named `hearttrack`
  - [x] Configure connection pooling
  - [x] Set up database indexes
  - [x] Test database connectivity

### Phase 2: Database Models & Schemas ✅

- [x] **User Model** (via Better Auth)
  - [x] Create User schema with email, password, name, role
  - [x] Add password hashing pre-save hook (bcrypt with 10 salt rounds)
  - [x] Add password comparison method
  - [x] Add email validation
  - [x] Add timestamps (createdAt, updatedAt with timezone)
  - [x] Add physician reference (ECE 513)
  - [x] Create indexes on email (unique)

- [x] **Device Model**
  - [x] Create Device schema with deviceId, userId, name, status
  - [x] Add API key field (auto-generated with crypto)
  - [x] Add configuration fields (frequency, timeRange, timezone)
  - [x] Add registration timestamp with timezone
  - [x] Add last seen/heartbeat timestamp with timezone
  - [x] Create indexes on deviceId and userId
  - [x] Add device status enum (active, inactive, error)

- [x] **Measurement Model**
  - [x] Create Measurement schema
  - [x] Add fields: heartRate, spO2, timestamp with timezone, quality, confidence
  - [x] Add references to userId and deviceId
  - [x] Add data validation (range checks: HR 40-200, SpO2 70-100)
  - [x] Create compound indexes (userId + timestamp, deviceId + timestamp)
  - [ ] Add TTL index for data retention (optional)

- [ ] **Physician Model (ECE 513 only)**
  - [x] User model supports physician role via Better Auth
  - [ ] Add specialty field
  - [ ] Add license number
  - [ ] Add patient reference array
  - [ ] Add separate registration workflow

### Phase 3: Authentication System ✅ (Milestone)

- [x] **User Registration** (via Better Auth)
  - [x] POST `/api/auth/sign-up/email` endpoint
  - [x] Validate email format and uniqueness
  - [x] Enforce strong password requirements
  - [x] Hash password with bcrypt (salt rounds: 10)
  - [x] Create user in database
  - [x] Return sanitized user data (no password)
  - [x] Return session token and user data

- [x] **User Login** (via Better Auth)
  - [x] POST `/api/auth/sign-in/email` endpoint
  - [x] Validate email and password
  - [x] Compare hashed passwords with bcrypt
  - [x] Generate session token (7 days expiry)
  - [x] Include userId and role in session
  - [x] Return token and user info
  - [x] Return 401 Unauthorized on failure

- [x] **Session Middleware** (via Better Auth)
  - [x] Create authentication middleware
  - [x] Verify session token from cookies
  - [x] Extract user info from session
  - [x] Attach user to request object
  - [x] Handle expired sessions (401)
  - [x] Handle invalid tokens (403)

- [x] **Password Management**
  - [x] Implement password strength validation (Better Auth)
  - [ ] Add password reset functionality (optional)
  - [ ] Add email verification (optional)

### Phase 4: Device Management Endpoints ✅ (Milestone)

- [x] **Device Registration**
  - [x] POST `/api/devices` endpoint
  - [x] Require authentication (JWT/Session)
  - [x] Validate device ID uniqueness
  - [x] Generate API key for device (crypto.randomBytes)
  - [x] Set default configuration (30min frequency, 6am-10pm)
  - [x] Associate device with user
  - [x] Return device info with API key
  - [x] Return 201 Created

- [x] **List User Devices**
  - [x] GET `/api/devices` endpoint
  - [x] Require authentication
  - [x] Return all devices for current user
  - [x] Include device status and last seen
  - [ ] Support pagination (optional)
  - [x] Return 200 OK

- [x] **Get Single Device**
  - [x] GET `/api/devices/:deviceId` endpoint
  - [x] Verify device belongs to user
  - [x] Return device details
  - [x] Return 404 if not found
  - [x] Return 403 if not authorized

- [x] **Update Device**
  - [x] PUT `/api/devices/:deviceId` endpoint
  - [x] Allow updating name, status
  - [x] Validate updates
  - [x] Return updated device
  - [x] Return 200 OK

- [x] **Delete Device**
  - [x] DELETE `/api/devices/:deviceId` endpoint
  - [x] Verify ownership
  - [x] Optionally delete associated measurements
  - [x] Return 204 No Content
  - [x] Handle cascading deletes

### Phase 5: Measurement Data Endpoints ✅ (Milestone)

- [x] **Submit Measurement (IoT Device)**
  - [x] POST `/api/measurements` endpoint
  - [x] Validate API key in X-API-Key header
  - [x] Verify device exists and is active
  - [x] Validate measurement data (HR: 40-200, SpO2: 70-100)
  - [x] Add timestamp with timezone if not provided
  - [x] Store measurement in database
  - [x] Return 201 Created
  - [x] Return 400 for invalid data

- [x] **Get User Measurements**
  - [x] GET `/api/measurements` endpoint
  - [x] Require JWT/Session authentication
  - [x] Support query parameters (startDate, endDate, deviceId)
  - [x] Return measurements sorted by timestamp DESC
  - [x] Support pagination (limit parameter)
  - [x] Return 200 OK

- [x] **Get Daily Measurements**
  - [x] GET `/api/measurements/daily/:date` endpoint
  - [x] Filter measurements for specific day
  - [x] Group by device if multiple devices
  - [x] Return sorted by timestamp ASC
  - [x] Return 200 OK

- [x] **Get Weekly Summary**
  - [x] GET `/api/measurements/weekly/summary` endpoint
  - [x] Calculate last 7 days statistics
  - [x] Compute average, min, max heart rate and SpO2
  - [x] Group by day
  - [x] Return aggregated data
  - [x] Return 200 OK

### Phase 6: Device Configuration Endpoints ✅

- [x] **Get Device Configuration**
  - [x] GET `/api/devices/:deviceId/config` endpoint
  - [x] Validate API key (for device) or Session (for user)
  - [x] Return measurement frequency
  - [x] Return active time range (start/end)
  - [x] Return timezone
  - [x] Return 200 OK

- [x] **Update Device Configuration**
  - [x] PUT `/api/devices/:deviceId/config` endpoint
  - [x] Require Session authentication (user or physician)
  - [x] Allow updating frequency (validated: 900-14400 seconds)
  - [x] Allow updating time range
  - [x] Validate inputs
  - [x] Return updated configuration
  - [x] Return 200 OK

- [x] **Configuration Change Notification**
  - [x] Implement mechanism for device to poll for config changes
  - [x] Add lastConfigUpdate timestamp (via updatedAt)
  - [x] Device can check on periodic GET /config calls

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

### Phase 8: Physician Portal (ECE 513 Only)

- [ ] **Physician Registration**
  - [ ] POST `/api/auth/register/physician` endpoint
  - [ ] Separate registration page
  - [ ] Add physician-specific fields
  - [ ] Assign 'physician' role
  - [ ] Return 201 Created

- [ ] **Patient-Physician Association**
  - [ ] PUT `/api/users/profile/physician` endpoint
  - [ ] Allow user to select physician from list
  - [ ] Update user's physician reference
  - [ ] Return 200 OK

- [ ] **Get Physician's Patients**
  - [ ] GET `/api/physicians/patients` endpoint
  - [ ] Require physician authentication
  - [ ] Return all patients assigned to physician
  - [ ] Include 7-day summary for each patient
  - [ ] Return 200 OK

- [ ] **Get Patient Summary**
  - [ ] GET `/api/physicians/patients/:patientId/summary` endpoint
  - [ ] Verify patient belongs to physician
  - [ ] Return weekly summary
  - [ ] Include configuration controls
  - [ ] Return 200 OK

- [ ] **Get Patient Daily View**
  - [ ] GET `/api/physicians/patients/:patientId/daily/:date` endpoint
  - [ ] Return detailed daily measurements
  - [ ] Same format as user's daily view
  - [ ] Return 200 OK

- [ ] **Update Patient Configuration (Physician)**
  - [ ] PUT `/api/physicians/patients/:patientId/config` endpoint
  - [ ] Allow physician to adjust measurement frequency
  - [ ] Validate physician-patient relationship
  - [ ] Update device configuration
  - [ ] Return 200 OK

### Phase 9: HTTPS Implementation (ECE 513 Only)

- [ ] **SSL Certificate Setup**
  - [ ] Obtain domain name
  - [ ] Install Certbot
  - [ ] Generate Let's Encrypt SSL certificate
  - [ ] Configure automatic renewal
  - [ ] Test certificate validity

- [ ] **HTTPS Server Configuration**
  - [ ] Configure Express for HTTPS
  - [ ] Load SSL certificates
  - [ ] Redirect HTTP to HTTPS
  - [ ] Test HTTPS endpoints
  - [ ] Update CORS for HTTPS origins

- [ ] **Deployment Adjustments**
  - [ ] Update AWS security groups (port 443)
  - [ ] Configure reverse proxy (nginx) if needed
  - [ ] Test end-to-end HTTPS communication
  - [ ] Update frontend to use HTTPS endpoints

### Phase 10: AI Health Assistant (Extra Credit +5pts)

- [ ] **Ollama Setup**
  - [ ] Install Ollama on local machine
  - [ ] Download lightweight model (phi-3:mini, gemma:2b, or llama3:8b)
  - [ ] Test local model inference
  - [ ] Set up ngrok tunnel for public access
  - [ ] Document tunneling setup

- [ ] **RAG Implementation**
  - [ ] Create endpoint POST `/api/ai/chat`
  - [ ] Receive user question from frontend
  - [ ] Retrieve relevant health data from MongoDB
  - [ ] Construct context prompt with user's data
  - [ ] Send prompt to local Ollama instance
  - [ ] Return LLM response to frontend

- [ ] **Data Retrieval Logic**
  - [ ] Implement query analyzer (extract date ranges, metrics)
  - [ ] Fetch relevant measurements from database
  - [ ] Format data for LLM context
  - [ ] Limit context size to prevent token overflow
  - [ ] Handle edge cases (no data available)

- [ ] **Prompt Engineering**
  - [ ] Design system prompt for health assistant role
  - [ ] Include user data as context
  - [ ] Add safety guardrails (medical disclaimers)
  - [ ] Format responses for clarity
  - [ ] Test with various question types

- [ ] **Integration Testing**
  - [ ] Test chat functionality end-to-end
  - [ ] Verify responses based only on user's data
  - [ ] Test error handling (LLM unavailable)
  - [ ] Performance testing (response time)
  - [ ] Document in project documentation

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

**Last Updated:** 2025-10-20
