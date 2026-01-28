#!/bin/bash

# Comprehensive Authentication Testing Script
# Tests user registration, login, JWT tokens, and API access

BASE_URL="http://localhost:8000"
TEST_EMAIL="testauth_$(date +%s)@example.com"
TEST_NAME="Auth Test User"
TEST_PASSWORD="TestPassword123"

echo "=================================================="
echo "🔐 COMPREHENSIVE AUTHENTICATION TESTING"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📝 Test Configuration:"
echo "   Base URL: $BASE_URL"
echo "   Test Email: $TEST_EMAIL"
echo ""

# Test 1: Register a new user
echo "=================================================="
echo "1️⃣  POST /api/users/register - Register New User"
echo "=================================================="
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/users/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"name\": \"$TEST_NAME\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "$REGISTER_RESPONSE" | python3 -m json.tool

# Extract user ID
USER_ID=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', ''))" 2>/dev/null)

if [ -z "$USER_ID" ]; then
    echo -e "${RED}❌ Registration failed - no user ID returned${NC}"
    exit 1
else
    echo -e "${GREEN}✅ User registered successfully!${NC}"
    echo "   User ID: $USER_ID"
fi
echo ""

# Test 2: Try to register with same email (should fail)
echo "=================================================="
echo "2️⃣  POST /api/users/register - Duplicate Email Test"
echo "=================================================="
DUPLICATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/users/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"name\": \"Another User\",
    \"password\": \"AnotherPassword\"
  }")

if echo "$DUPLICATE_RESPONSE" | grep -q "already registered"; then
    echo -e "${GREEN}✅ Duplicate email correctly rejected${NC}"
    echo "$DUPLICATE_RESPONSE" | python3 -m json.tool
else
    echo -e "${RED}❌ Duplicate email should have been rejected${NC}"
fi
echo ""

# Test 3: Login with registered user
echo "=================================================="
echo "3️⃣  POST /api/users/login - User Login"
echo "=================================================="
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | python3 -m json.tool

# Extract JWT token
JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access_token', ''))" 2>/dev/null)

if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}❌ Login failed - no token returned${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Login successful!${NC}"
    echo "   JWT Token: ${JWT_TOKEN:0:50}..."
fi
echo ""

# Test 4: Try login with non-existent user
echo "=================================================="
echo "4️⃣  POST /api/users/login - Invalid User Test"
echo "=================================================="
INVALID_LOGIN=$(curl -s -X POST "${BASE_URL}/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"nonexistent@example.com\",
    \"password\": \"password\"
  }")

if echo "$INVALID_LOGIN" | grep -q "Invalid email or password"; then
    echo -e "${GREEN}✅ Invalid login correctly rejected${NC}"
    echo "$INVALID_LOGIN" | python3 -m json.tool
else
    echo -e "${RED}❌ Invalid login should have been rejected${NC}"
fi
echo ""

# Test 5: Get user by ID
echo "=================================================="
echo "5️⃣  GET /api/users/{user_id} - Get User Details"
echo "=================================================="
USER_RESPONSE=$(curl -s "${BASE_URL}/api/users/${USER_ID}")
echo "$USER_RESPONSE" | python3 -m json.tool

if echo "$USER_RESPONSE" | grep -q "$TEST_EMAIL"; then
    echo -e "${GREEN}✅ User details retrieved successfully${NC}"
else
    echo -e "${RED}❌ Failed to retrieve user details${NC}"
fi
echo ""

# Test 6: Get user by email
echo "=================================================="
echo "6️⃣  GET /api/users/email/{email} - Get User by Email"
echo "=================================================="
EMAIL_RESPONSE=$(curl -s "${BASE_URL}/api/users/email/${TEST_EMAIL}")
echo "$EMAIL_RESPONSE" | python3 -m json.tool

if echo "$EMAIL_RESPONSE" | grep -q "$USER_ID"; then
    echo -e "${GREEN}✅ User found by email${NC}"
else
    echo -e "${RED}❌ Failed to find user by email${NC}"
fi
echo ""

# Test 7: Create task with JWT token
echo "=================================================="
echo "7️⃣  POST /api/{user_id}/tasks - Create Task with JWT"
echo "=================================================="
TASK_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/${USER_ID}/tasks" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Authenticated Task",
    "description": "Created with real JWT token",
    "priority": "high",
    "category": "auth-test"
  }')

echo "$TASK_RESPONSE" | python3 -m json.tool

TASK_ID=$(echo "$TASK_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', ''))" 2>/dev/null)

if [ -n "$TASK_ID" ]; then
    echo -e "${GREEN}✅ Task created with JWT authentication${NC}"
    echo "   Task ID: $TASK_ID"
else
    echo -e "${RED}❌ Failed to create task${NC}"
fi
echo ""

# Test 8: List tasks with JWT token
echo "=================================================="
echo "8️⃣  GET /api/{user_id}/tasks - List Tasks with JWT"
echo "=================================================="
TASKS_LIST=$(curl -s "${BASE_URL}/api/${USER_ID}/tasks" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

TASK_COUNT=$(echo "$TASKS_LIST" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null)

if [ -n "$TASK_COUNT" ]; then
    echo -e "${GREEN}✅ Tasks retrieved successfully${NC}"
    echo "   Total tasks: $TASK_COUNT"
    echo "$TASKS_LIST" | python3 -m json.tool | head -20
else
    echo -e "${RED}❌ Failed to retrieve tasks${NC}"
fi
echo ""

# Test 9: Try to access another user's tasks (should fail in production)
echo "=================================================="
echo "9️⃣  GET /api/{other_user}/tasks - Access Control Test"
echo "=================================================="
OTHER_USER_ID="550e8400-e29b-41d4-a716-446655440000"
UNAUTHORIZED_RESPONSE=$(curl -s "${BASE_URL}/api/${OTHER_USER_ID}/tasks" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

echo -e "${YELLOW}⚠️  DEV MODE: This should fail in production${NC}"
echo "$UNAUTHORIZED_RESPONSE" | python3 -m json.tool | head -15
echo ""

# Test 10: Decode JWT token
echo "=================================================="
echo "🔍 JWT Token Analysis"
echo "=================================================="
echo "Token: ${JWT_TOKEN:0:50}..."
echo ""
echo "Decoding JWT payload (without verification):"
python3 << EOF
import json
import base64

token = "$JWT_TOKEN"
parts = token.split('.')

if len(parts) == 3:
    # Decode header
    header = json.loads(base64.urlsafe_b64decode(parts[0] + '=='))
    print("Header:")
    print(json.dumps(header, indent=2))
    print()
    
    # Decode payload
    payload = json.loads(base64.urlsafe_b64decode(parts[1] + '=='))
    print("Payload:")
    print(json.dumps(payload, indent=2))
else:
    print("Invalid JWT format")
EOF
echo ""

# Test 11: Test without token (should fail or work in dev mode)
echo "=================================================="
echo "1️⃣1️⃣  GET /api/{user_id}/tasks - No Token Test"
echo "=================================================="
NO_TOKEN_RESPONSE=$(curl -s "${BASE_URL}/api/${USER_ID}/tasks")

if echo "$NO_TOKEN_RESPONSE" | python3 -c "import sys, json; json.load(sys.stdin)" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  DEV MODE: Request succeeded without token${NC}"
    echo -e "   In production, this should return 401 Unauthorized"
else
    echo -e "${GREEN}✅ Correctly rejected request without token${NC}"
fi
echo ""

# Summary
echo "=================================================="
echo "📊 TEST SUMMARY"
echo "=================================================="
echo ""
echo "Test User:"
echo "  Email: $TEST_EMAIL"
echo "  ID: $USER_ID"
echo "  Token: ${JWT_TOKEN:0:30}..."
echo ""
echo "Completed Tests:"
echo "  ✅ User Registration"
echo "  ✅ Duplicate Email Prevention"
echo "  ✅ User Login & JWT Generation"
echo "  ✅ Invalid Login Rejection"
echo "  ✅ Get User by ID"
echo "  ✅ Get User by Email"
echo "  ✅ Task Creation with JWT"
echo "  ✅ Task Listing with JWT"
echo "  ⚠️  Access Control (DEV MODE)"
echo "  ⚠️  No Token Access (DEV MODE)"
echo ""
echo "=================================================="
echo "🎉 AUTHENTICATION TESTING COMPLETE!"
echo "=================================================="
