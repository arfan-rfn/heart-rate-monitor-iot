#!/bin/bash

API_BASE="http://localhost:4000"
EMAIL="test-revoke-$(date +%s)@example.com"

echo "=========================================="
echo "Testing Revoke & Regenerate"
echo "=========================================="

# Step 1: Register user
echo -e "\n1. Registering user..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/sign-up/email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Test123!@#\",\"name\":\"Test User\"}")

TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:20}..."

# Step 2: Generate first API key
echo -e "\n2. Generating first API key..."
API_KEY_1=$(curl -s -X POST "$API_BASE/api/users/api-key" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"apiKey":"[^"]*' | cut -d'"' -f4)
echo "First API Key: ${API_KEY_1:0:30}..."

# Step 3: View the key (masked)
echo -e "\n3. Viewing API key (should show masked)..."
VIEW_1=$(curl -s -X GET "$API_BASE/api/users/api-key" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $VIEW_1"

# Step 4: Regenerate API key
echo -e "\n4. Regenerating API key (old key should be deleted)..."
REGEN_RESPONSE=$(curl -s -X POST "$API_BASE/api/users/api-key/regenerate" \
  -H "Authorization: Bearer $TOKEN")
API_KEY_2=$(echo $REGEN_RESPONSE | grep -o '"apiKey":"[^"]*' | cut -d'"' -f4)
echo "New API Key: ${API_KEY_2:0:30}..."

# Step 5: View the new key
echo -e "\n5. Viewing new API key (should show different masked value)..."
VIEW_2=$(curl -s -X GET "$API_BASE/api/users/api-key" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $VIEW_2"

# Step 6: Try to use old API key (should fail)
echo -e "\n6. Testing old API key (should fail with 401)..."
OLD_KEY_TEST=$(curl -s -w "\nHTTP Status: %{http_code}" -X POST "$API_BASE/api/measurements" \
  -H "X-API-Key: $API_KEY_1" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test","heartRate":72,"spO2":98}')
echo "$OLD_KEY_TEST"

# Step 7: Revoke the new key
echo -e "\n7. Revoking API key (key should be deleted from DB)..."
REVOKE_RESPONSE=$(curl -s -X DELETE "$API_BASE/api/users/api-key" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $REVOKE_RESPONSE"

# Step 8: Try to view after revoke (should return 404)
echo -e "\n8. Viewing after revoke (should return 404)..."
VIEW_3=$(curl -s -w "\nHTTP Status: %{http_code}" -X GET "$API_BASE/api/users/api-key" \
  -H "Authorization: Bearer $TOKEN")
echo "$VIEW_3"

echo -e "\n=========================================="
echo "Test Complete!"
echo "=========================================="
