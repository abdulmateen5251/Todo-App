#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Testing Authentication Flow${NC}"
echo -e "${YELLOW}========================================${NC}"

# Generate random email for testing
RANDOM_EMAIL="testuser$(date +%s)@example.com"
PASSWORD="test123456"
NAME="Test User"

echo -e "\n${YELLOW}1. Testing Registration Endpoint${NC}"
echo -e "Email: ${RANDOM_EMAIL}"
echo -e "Password: ${PASSWORD}"

# Test registration
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d "{\"email\":\"${RANDOM_EMAIL}\",\"password\":\"${PASSWORD}\",\"name\":\"${NAME}\"}" \
  -w "\nHTTP_CODE:%{http_code}" 2>&1)

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" == "201" ]; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  echo -e "Response: $RESPONSE_BODY"
  USER_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo -e "User ID: $USER_ID"
else
  echo -e "${RED}✗ Registration failed (HTTP $HTTP_CODE)${NC}"
  echo -e "Response: $RESPONSE_BODY"
  exit 1
fi

echo -e "\n${YELLOW}2. Testing Login Endpoint${NC}"

# Test login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d "{\"email\":\"${RANDOM_EMAIL}\",\"password\":\"${PASSWORD}\"}" \
  -w "\nHTTP_CODE:%{http_code}" 2>&1)

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✓ Login successful${NC}"
  echo -e "Response: $RESPONSE_BODY"
  ACCESS_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  echo -e "Token: ${ACCESS_TOKEN:0:50}..."
else
  echo -e "${RED}✗ Login failed (HTTP $HTTP_CODE)${NC}"
  echo -e "Response: $RESPONSE_BODY"
  exit 1
fi

echo -e "\n${YELLOW}3. Testing CORS Headers${NC}"

# Test CORS preflight
CORS_RESPONSE=$(curl -s -X OPTIONS http://localhost:8000/api/users/register \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -i 2>&1 | grep -i "access-control")

if echo "$CORS_RESPONSE" | grep -q "access-control-allow-origin"; then
  echo -e "${GREEN}✓ CORS headers present${NC}"
  echo "$CORS_RESPONSE"
else
  echo -e "${RED}✗ CORS headers missing${NC}"
  exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}All Tests Passed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Open browser to http://localhost:3000/auth/signup"
echo -e "2. Use these credentials to test:"
echo -e "   Email: ${RANDOM_EMAIL}"
echo -e "   Password: ${PASSWORD}"
echo -e "3. Try signing up through the UI"
echo -e "4. Then try signing in with the same credentials"
