# Utility Scripts

This directory contains utility scripts for managing the Heart Track API server.

---

## Set Physician Role

### Overview

The `set-physician-role.ts` script allows you to manually assign the `physician` role to a user account. This is required for users who need access to the physician portal endpoints.

### Prerequisites

1. User must be registered via `/api/auth/sign-up/email`
2. MongoDB must be running and accessible

### Usage

```bash
npm run set-physician <email>
```

### Examples

**Set a user as physician:**
```bash
npm run set-physician dr.smith@hospital.com
```

### Output Example

```
🔌 Connecting to database...

🔍 Looking for user with email: dr.smith@hospital.com

✅ User found:
   ID: 507f1f77bcf86cd799439011
   Name: Dr. Smith
   Email: dr.smith@hospital.com
   Current Role: user

🔄 Updating role to 'physician'...

✅ Success! User role updated to physician

📋 User Details:
   Email: dr.smith@hospital.com
   Role: physician
   Updated: 2025-11-19T15:30:00.000Z

🔐 This user can now access physician portal endpoints:
   - GET /api/physicians/patients
   - GET /api/physicians/patients/:patientId/summary
   - GET /api/physicians/patients/:patientId/daily/:date
   - PUT /api/physicians/patients/:patientId/devices/:deviceId/config

🔌 Database connection closed
```

### Error Cases

**User not found:**
```bash
npm run set-physician nonexistent@example.com

❌ User not found with email: nonexistent@example.com
💡 Make sure the user has registered first via /api/auth/sign-up/email
```

**Invalid email format:**
```bash
npm run set-physician invalid-email

❌ Error: Invalid email format
```

**Missing email argument:**
```bash
npm run set-physician

❌ Error: Email address is required

Usage:
  npm run set-physician <email>

Example:
  npm run set-physician dr.smith@hospital.com
```

**Already a physician:**
```bash
npm run set-physician dr.smith@hospital.com

⚠️  User is already a physician!
```

---

## Complete Workflow for Setting Up a Physician

### Step 1: Register User Account

Use the signup endpoint:

```bash
curl -X POST http://localhost:4000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@hospital.com",
    "password": "SecurePass123!",
    "name": "Dr. Smith"
  }'
```

### Step 2: Set Physician Role

Run the script:

```bash
npm run set-physician dr.smith@hospital.com
```

### Step 3: Login as Physician

```bash
curl -X POST http://localhost:4000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@hospital.com",
    "password": "SecurePass123!"
  }'
```

Save the JWT token from the response.

### Step 4: Test Physician Endpoints

```bash
# List all patients
curl -X GET http://localhost:4000/api/physicians/patients \
  -H "Authorization: Bearer <physician-jwt-token>"
```

---

## Troubleshooting

### Database Connection Errors

**Error:** "MongoNetworkError: connect ECONNREFUSED"

**Solution:** Make sure MongoDB is running:
```bash
# Check MongoDB status
mongosh

# Or restart MongoDB
brew services restart mongodb-community
```

### Environment Variables

Make sure your `.env` file has the correct MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/hearttrack
```

### Permission Denied

**Error:** "Permission denied: tsx"

**Solution:** Make the script executable:
```bash
chmod +x scripts/set-physician-role.ts
```

---

## Alternative Methods

### Method 1: MongoDB Shell

If you prefer using the MongoDB shell directly:

```javascript
// Connect to MongoDB
mongosh mongodb://localhost:27017/hearttrack

// Find user by email
db.user.findOne({ email: "dr.smith@hospital.com" })

// Update role to physician
db.user.updateOne(
  { email: "dr.smith@hospital.com" },
  { $set: { role: "physician", updatedAt: new Date() } }
)

// Verify the update
db.user.findOne({ email: "dr.smith@hospital.com" }, { role: 1, email: 1, name: 1 })
```

### Method 2: MongoDB Compass

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017/hearttrack`
3. Navigate to the `user` collection
4. Find the user by email
5. Edit the document and set `role: "physician"`
6. Save the changes

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Production Use:** In production, you should have a proper admin interface or API endpoint to manage physician roles with proper authorization.

2. **Audit Logging:** Consider adding audit logs when roles are changed to track who made the changes and when.

3. **Role Hierarchy:** The current implementation has two roles:
   - `user` (default) - Regular patients
   - `physician` - Healthcare providers

4. **Future Enhancements:**
   - Email verification before role assignment
   - Multi-factor authentication for physicians
   - Role-based permissions beyond just physician/user

---

## Related Documentation

- [API Documentation](../docs/API.md)
- [Physician Portal Implementation](../../plan/physician-business-logic-implementation.md)
- [ECE 513 Requirements](../README.md#physician-portal-ece-513)

---

**Last Updated:** 2025-11-19
