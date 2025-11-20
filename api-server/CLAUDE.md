# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is **Project 2** of the Heart Track IoT system - a Node.js/Express backend server that provides RESTful API endpoints for heart rate and SpO2 monitoring. It serves as the central hub connecting IoT devices (Project 1) and the web frontend (Project 3).

## Common Commands

### Development
```bash
npm run dev           # Start development server with nodemon
npm start             # Start production server
npm test              # Run all tests
npm run test:coverage # Run tests with coverage
npm run test:watch    # Run tests in watch mode
```

### Database
```bash
# Local MongoDB
mongod --dbpath /path/to/data

# Connect to MongoDB shell
mongo mongodb://localhost:27017/hearttrack
```

### Deployment (AWS EC2)
```bash
# Start with PM2
pm2 start server.js --name hearttrack-api
pm2 save
pm2 startup

# View logs
pm2 logs hearttrack-api

# Restart
pm2 restart hearttrack-api
```

### HTTPS Setup (ECE 513)
```bash
# Install Certbot
sudo apt install certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificates location: /etc/letsencrypt/live/yourdomain.com/
```

## Architecture Overview

### Technology Stack
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcrypt (password hashing), helmet, express-rate-limit, cors
- **Testing:** Jest, Supertest
- **Process Management:** PM2 (production)

### Project Structure
```
api-server/
├── server.js                      # Main entry point
├── src/
│   ├── app.js                     # Express app setup
│   ├── config/
│   │   ├── database.js            # MongoDB connection
│   │   ├── jwt.js                 # JWT configuration
│   │   └── constants.js           # App constants
│   ├── models/
│   │   ├── User.js                # User schema (email, password, role)
│   │   ├── Device.js              # Device schema (deviceId, apiKey, config)
│   │   ├── Measurement.js         # Measurement schema (heartRate, spO2)
│   │   └── Physician.js           # Physician schema (ECE 513 only)
│   ├── routes/
│   │   ├── auth.routes.js         # POST /api/auth/register, /api/auth/login
│   │   ├── users.routes.js        # User profile management
│   │   ├── devices.routes.js      # Device CRUD operations
│   │   ├── measurements.routes.js # Measurement data endpoints
│   │   ├── physicians.routes.js   # Physician portal (ECE 513)
│   │   └── ai.routes.js           # AI chat (Extra Credit)
│   ├── controllers/
│   │   └── [business logic for routes]
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT verification
│   │   ├── apiKey.middleware.js   # API key validation for IoT devices
│   │   ├── validation.middleware.js
│   │   ├── error.middleware.js
│   │   └── rateLimiter.middleware.js
│   ├── utils/
│   │   ├── logger.js              # Logging utility
│   │   ├── validation.js          # Input validation helpers
│   │   └── ollamaClient.js        # Ollama LLM client (Extra Credit)
│   └── services/
│       ├── aggregation.service.js # Data aggregation for weekly/daily views
│       └── rag.service.js         # RAG implementation (Extra Credit)
├── tests/
│   ├── unit/
│   └── integration/
└── docs/
```

### Data Flow

**IoT Device → Server:**
- Device sends measurements via `POST /api/measurements`
- Authentication: `X-API-Key` header with device API key
- Device polls for config updates via `GET /api/devices/:deviceId/config`

**Frontend → Server:**
- All endpoints use JWT authentication: `Authorization: Bearer <token>`
- User registers/logs in to get JWT token
- Frontend makes RESTful API calls for data retrieval and management

### Database Schema

**Users Collection:**
- email (unique, required)
- password (hashed with bcrypt, 10 salt rounds)
- name (required)
- role (enum: 'user', 'physician')
- physicianId (ref to Physician, optional, ECE 513)
- createdAt, updatedAt (with timezone)

**Devices Collection:**
- deviceId (unique, e.g., Photon device ID)
- userId (ref to User)
- name (user-friendly name)
- apiKey (unique, auto-generated for device auth)
- status (enum: 'active', 'inactive', 'error')
- config (measurementFrequency, activeStartTime, activeEndTime, timezone)
- lastSeen (timestamp with timezone)
- createdAt, updatedAt (with timezone)

**Measurements Collection:**
- userId (ref to User)
- deviceId (ref to Device)
- heartRate (number, min: 40, max: 200)
- spO2 (number, min: 70, max: 100)
- timestamp (required, with timezone)
- quality (enum: 'good', 'fair', 'poor')
- confidence (number, 0.0-1.0)
- createdAt (with timezone)

**Indexes:**
- Users: email (unique)
- Devices: deviceId (unique), userId
- Measurements: userId + timestamp (compound), deviceId + timestamp (compound)

## Critical Implementation Details

### Authentication Flow
1. **User Registration:** POST `/api/auth/register`
   - Validate email uniqueness
   - Hash password with bcrypt (10 salt rounds)
   - Return JWT token with userId and role in payload
   - Token expiry: 24 hours

2. **User Login:** POST `/api/auth/login`
   - Verify email exists
   - Compare hashed passwords
   - Generate JWT token
   - Return token + sanitized user info (no password)

3. **Protected Routes:**
   - Use `auth.middleware.js` to verify JWT
   - Extract user from token payload
   - Attach user to `req.user`
   - Return 401 for expired/invalid tokens

### Device Authentication
- IoT devices use API key authentication (not JWT)
- API key sent in `X-API-Key` header
- Middleware (`apiKey.middleware.js`) validates against Device collection
- API keys generated cryptographically secure on device registration

### Data Aggregation
**Weekly Summary:** GET `/api/measurements/weekly/summary`
- Fetch last 7 days of measurements
- Calculate: averageHeartRate, minHeartRate, maxHeartRate, totalMeasurements
- Group by day for trend visualization

**Daily View:** GET `/api/measurements/daily/:date`
- Filter measurements for specific date
- Sort by timestamp ASC
- Return all measurements with heartRate, spO2, timestamp

### Timezone Handling
**IMPORTANT:** Always store timestamps with timezone information
- Use ISO 8601 format with timezone (e.g., `2025-10-20T14:30:00.000Z`)
- MongoDB stores as UTC, convert for display based on user/device timezone
- Device config includes timezone field

### ECE 513 Requirements

**Physician Portal:**
- Separate physician registration: POST `/api/auth/register/physician`
- Patients can associate with physician
- Physician endpoints:
  - GET `/api/physicians/patients` - List all patients with 7-day summaries
  - GET `/api/physicians/patients/:patientId/summary` - Patient weekly summary
  - GET `/api/physicians/patients/:patientId/daily/:date` - Patient daily view
  - PUT `/api/physicians/patients/:patientId/config` - Adjust patient device config

**HTTPS:**
- Use Let's Encrypt SSL certificates
- Configure Express to use HTTPS
- Redirect HTTP to HTTPS
- Certificates path in .env: `SSL_CERT_PATH`, `SSL_KEY_PATH`

### Extra Credit: AI Health Assistant (+5pts)

**RAG Pattern Implementation:**
1. Local LLM: Ollama with phi-3:mini, gemma:2b, or llama3:8b
2. Endpoint: POST `/api/ai/chat`
3. Flow:
   - Receive user question
   - Retrieve relevant health data from MongoDB (last 7-30 days)
   - Construct context prompt with user's measurements
   - Send to Ollama instance (local or ngrok tunnel)
   - Return LLM response

**Important:** Responses must be based ONLY on user's own data, not general knowledge.

## Environment Variables

Required in `.env`:
```env
NODE_ENV=development|production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hearttrack
JWT_SECRET=<strong-secret-32-chars-minimum>
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10
ALLOWED_ORIGINS=http://localhost:8080,https://yourdomain.com

# ECE 513
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem

# Extra Credit
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=phi-3:mini
```

## Security Best Practices

1. **Never log or expose:**
   - User passwords (always hashed)
   - JWT secrets
   - API keys in plain text
   - Sensitive error details

2. **Input Validation:**
   - Validate all POST/PUT request bodies
   - Sanitize inputs before database operations
   - Use Mongoose schema validation
   - Implement request size limits

3. **Rate Limiting:**
   - Apply to authentication endpoints (prevent brute force)
   - Apply to API key endpoints (prevent device abuse)

4. **CORS:**
   - Configure allowed origins only
   - Don't use `*` in production

## Testing Strategy

### Unit Tests
- Test model methods (password hashing, validation)
- Test utility functions
- Test JWT generation/verification
- Goal: >70% code coverage

### Integration Tests
- Test all API endpoints with Supertest
- Test authentication flows
- Test device registration and data submission
- Test data aggregation accuracy
- Test authorization (user can only access own data)

### Running Tests
```bash
npm test                           # All tests
npm test -- tests/integration/auth.test.js  # Specific test file
npm run test:coverage              # With coverage report
```

## Common Pitfalls

1. **Timestamps:** Always use timezone-aware timestamps. Add `createdAt` and `updatedAt` with timezone information.

2. **Password Security:** Never return password field in API responses. Use Mongoose `select: false` or sanitize before sending.

3. **API Key vs JWT:** IoT devices use API key (`X-API-Key` header), web frontend uses JWT (`Authorization: Bearer <token>`).

4. **Physician Authorization:** Physicians can only access data for patients associated with them. Always verify relationship.

5. **Device Ownership:** Users can only manage their own devices. Verify `userId` matches authenticated user.

## Integration Points

### With Project 1 (IoT Device)
- Device sends: `POST /api/measurements` with API key
- Device polls: `GET /api/devices/:deviceId/config` for configuration updates
- Device must handle: 201 (success), 400 (invalid data), 401 (invalid API key)

### With Project 3 (Web Frontend)
- Frontend authenticates: `POST /api/auth/login` or `/api/auth/register`
- Frontend uses JWT for all subsequent requests
- Frontend displays data from aggregation endpoints
- Frontend manages devices and updates configuration

## Development Workflow

1. **Check `/docs` directory** for existing documentation before implementing features
2. **Check `/plan` directory** in parent for overall project strategy
3. **Always use timestamp with zone** when adding time-related fields
4. **Reference related code** when implementing similar features
5. **Test authentication/authorization** for every new endpoint

## Error Handling

Standard error response format:
```json
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE"
  }
}
```

HTTP Status Codes:
- 200 OK: Successful GET/PUT/PATCH
- 201 Created: Successful POST
- 204 No Content: Successful DELETE
- 400 Bad Request: Invalid input
- 401 Unauthorized: Invalid/expired token or API key
- 403 Forbidden: Valid token but insufficient permissions
- 404 Not Found: Resource doesn't exist
- 500 Internal Server Error: Server-side error

## Deployment Checklist

1. Set `NODE_ENV=production` in `.env`
2. Use strong JWT_SECRET (minimum 32 characters)
3. Configure MongoDB connection (Atlas or local with auth)
4. Set up PM2 for process management
5. Configure CORS for production domain
6. Set up SSL certificates (ECE 513)
7. Configure security groups (ports 22, 80, 443, 3000)
8. Test all endpoints from external client
9. Verify logs are being written
10. Set up monitoring/alerts (optional)

## Troubleshooting

**MongoDB connection fails:**
- Check MongoDB is running: `sudo systemctl status mongod`
- Verify connection string in `.env`
- Check firewall/security groups

**JWT errors:**
- Verify JWT_SECRET is set
- Check token expiration time
- Ensure correct Bearer token format in Authorization header

**API key authentication fails:**
- Verify API key exists in Device collection
- Check `X-API-Key` header format (no "Bearer" prefix)
- Ensure device status is 'active'

**Port already in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

## Performance Optimization

1. **Database:**
   - Create indexes on frequently queried fields
   - Use projection to limit returned fields
   - Implement pagination for large datasets
   - Use aggregation pipeline for complex queries

2. **Connection Pooling:**
   - Configure Mongoose connection pool size
   - Reuse database connections

3. **Caching:**
   - Cache frequently accessed data (optional)
   - Implement Redis for session storage (optional)

## Documentation Requirements

When implementing features:
1. Update API documentation in `/docs` with request/response examples
2. Document environment variables in `.env.example`
3. Add comments to complex business logic
4. Update this CLAUDE.md if architecture changes
5. Keep README.md TODO list in sync with progress
