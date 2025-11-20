#!/bin/bash

# Test script for account-level API key with manual curl commands

API_BASE="http://localhost:4000"
EMAIL="test-$(date +%s)@example.com"

echo "=========================================="
echo "Testing Account-Level API Key System"
echo "=========================================="

# Step 1: Register user
echo -e "\n1. Registering user..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/sign-up/email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Test123!@#\",\"name\":\"Test User\"}")

echo "Response: $SIGNUP_RESPONSE"

# Extract token from response
TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get session token"
  echo "Trying to extract from user object..."
  # Sometimes token is in user.token
  TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | head -1 | cut -d'"' -f4)
fi

echo "Token: ${TOKEN:0:20}..."

# Step 2: Register device
echo -e "\n2. Registering device..."
DEVICE_ID="photon-test-$(date +%s)"
DEVICE_RESPONSE=$(curl -s -X POST "$API_BASE/api/devices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"deviceId\":\"$DEVICE_ID\",\"name\":\"Test Monitor\"}")

echo "Response: $DEVICE_RESPONSE"

# Step 3: Generate account API key
echo -e "\n3. Generating account API key..."
API_KEY_RESPONSE=$(curl -s -X POST "$API_BASE/api/users/api-key" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $API_KEY_RESPONSE"

# Extract API key
API_KEY=$(echo $API_KEY_RESPONSE | grep -o '"apiKey":"[^"]*' | cut -d'"' -f4)
echo "API Key: ${API_KEY:0:30}..."

# Step 4: View API key (should return masked version)
echo -e "\n4. Viewing API key (masked)..."
VIEW_RESPONSE=$(curl -s -X GET "$API_BASE/api/users/api-key" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $VIEW_RESPONSE"

# Step 5: Submit measurement with account API key
echo -e "\n5. Submitting measurement with account API key..."
MEASUREMENT_RESPONSE=$(curl -s -X POST "$API_BASE/api/measurements" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{\"deviceId\":\"$DEVICE_ID\",\"heartRate\":72,\"spO2\":98,\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}")

echo "Response: $MEASUREMENT_RESPONSE"

echo -e "\n=========================================="
echo "Test Complete!"
echo "=========================================="
