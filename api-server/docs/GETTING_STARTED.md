# Getting Started with Heart Track API Server

## Prerequisites

1. **Node.js** v18+ LTS
   ```bash
   node --version  # Should be v18 or higher
   ```

2. **MongoDB**
   - Option A: Local MongoDB installation
   - Option B: MongoDB Atlas (cloud, free tier)

3. **npm** or **yarn**

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required environment variables:**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/hearttrack

# Better Auth (use a strong secret in production!)
BETTER_AUTH_SECRET=your-super-secret-auth-key-min-32-characters-long

# Server
PORT=3000
NODE_ENV=development
```

### 3. Start MongoDB

**If using local MongoDB:**

```bash
mongod --dbpath /path/to/data
```

**If using MongoDB Atlas:**
- Create a cluster at https://www.mongodb.com/cloud/atlas
- Get your connection string
- Update `MONGODB_URI` in `.env`

### 4. Run the Server

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

### 5. Verify Installation

Open your browser or use curl:

```bash
curl http://localhost:3000/health
```

You should see:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-22T...",
  "environment": "development"
}
```

## Testing the API

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

Save the session token from the response!

### 3. Register a Device

```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "deviceId": "test-device-001",
    "name": "Test Monitor"
  }'
```

**IMPORTANT:** Save the `apiKey` from the response - it's only shown once!

### 4. Submit a Measurement (as IoT Device)

```bash
curl -X POST http://localhost:3000/api/measurements \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_DEVICE_API_KEY" \
  -d '{
    "deviceId": "test-device-001",
    "heartRate": 72,
    "spO2": 98
  }'
```

### 5. Get Measurements

```bash
curl http://localhost:3000/api/measurements/weekly/summary \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Project Structure

```
api-server/
├── src/
│   ├── config/
│   │   ├── auth.ts              # Better-auth configuration
│   │   └── database.ts          # MongoDB connection
│   ├── models/
│   │   ├── Device.ts            # Device model
│   │   └── Measurement.ts       # Measurement model
│   ├── controllers/
│   │   ├── device.controller.ts
│   │   └── measurement.controller.ts
│   ├── routes/
│   │   ├── device.routes.ts
│   │   └── measurement.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT authentication
│   │   ├── apiKey.middleware.ts # API key authentication
│   │   ├── role.middleware.ts   # Role-based access
│   │   └── error.middleware.ts  # Error handling
│   └── app.ts                   # Express app configuration
├── server.ts                    # Entry point
├── .env                         # Environment variables
├── package.json
└── tsconfig.json
```

## Development Workflow

### Running in Development

```bash
npm run dev
```

This uses nodemon and ts-node for automatic reloading.

### Type Checking

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### Running Tests

```bash
npm test
npm run test:watch
```

## Common Issues

### MongoDB Connection Failed

**Problem:** Cannot connect to MongoDB

**Solution:**
1. Verify MongoDB is running: `sudo systemctl status mongod`
2. Check connection string in `.env`
3. If using Atlas, check network access whitelist

### Port Already in Use

**Problem:** Error: listen EADDRINUSE :::3000

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=3001
```

### Better-Auth Errors

**Problem:** Invalid or missing BETTER_AUTH_SECRET

**Solution:**
Ensure `.env` has a secret with at least 32 characters:

```env
BETTER_AUTH_SECRET=your-super-secret-auth-key-min-32-characters-long-change-in-prod
```

## Next Steps

1. **Read the API Documentation:** See [`docs/API.md`](./API.md)
2. **Integrate with Frontend:** Configure Next.js to use better-auth client
3. **Deploy to AWS:** Follow deployment guide in README
4. **Implement Physician Portal:** Add ECE 513 features
5. **Add AI Assistant:** Implement extra credit RAG features

## Frontend Integration

### Install better-auth in your Next.js app:

```bash
npm install better-auth
```

### Create auth client:

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
});
```

### Use in components:

```typescript
import { authClient } from "@/lib/auth-client";

function MyComponent() {
  const { data: session } = authClient.useSession();

  return <div>Welcome, {session?.user.name}</div>;
}
```

## Resources

- [Better-Auth Documentation](https://www.better-auth.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)

## Support

For issues or questions:
- Check the [API Documentation](./API.md)
- Review the main [README](../README.md)
- Check existing issues on GitHub
