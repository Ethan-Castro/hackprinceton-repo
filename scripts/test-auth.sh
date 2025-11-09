#!/bin/bash

# Authentication Testing Script
# Run this after starting your dev server with: pnpm dev

echo "🔐 Authentication System Test"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

# Test 1: Check database status
echo "📊 Test 1: Database Status"
response=$(curl -s "$BASE_URL/api/db-init/status")
if echo "$response" | grep -q "connected"; then
  echo -e "${GREEN}✅ Database connected${NC}"
  table_count=$(echo "$response" | grep -o '"tableCount":[0-9]*' | grep -o '[0-9]*')
  echo "   Tables found: $table_count"
else
  echo -e "${RED}❌ Database connection failed${NC}"
  echo "   Run: curl -X POST $BASE_URL/api/db-init"
  exit 1
fi
echo ""

# Test 2: Check environment variables
echo "🔑 Test 2: Environment Variables"
if [ -f .env.local ]; then
  if grep -q "NEXTAUTH_SECRET" .env.local; then
    echo -e "${GREEN}✅ NEXTAUTH_SECRET is set${NC}"
  else
    echo -e "${RED}❌ NEXTAUTH_SECRET is missing${NC}"
    echo "   Generate with: openssl rand -base64 32"
  fi
  
  if grep -q "NEXTAUTH_URL" .env.local; then
    echo -e "${GREEN}✅ NEXTAUTH_URL is set${NC}"
  else
    echo -e "${RED}❌ NEXTAUTH_URL is missing${NC}"
    echo "   Add: NEXTAUTH_URL=http://localhost:3000"
  fi
  
  if grep -q "DATABASE_URL" .env.local; then
    echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
  else
    echo -e "${RED}❌ DATABASE_URL is missing${NC}"
  fi
else
  echo -e "${RED}❌ .env.local file not found${NC}"
  echo "   Create .env.local with required variables"
  exit 1
fi
echo ""

# Test 3: Test user registration
echo "👤 Test 3: User Registration"
test_email="test_$(date +%s)@example.com"
test_password="testpassword123"

register_response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$test_email\",\"password\":\"$test_password\",\"name\":\"Test User\"}")

if echo "$register_response" | grep -q "success"; then
  echo -e "${GREEN}✅ User registration successful${NC}"
  echo "   Email: $test_email"
else
  echo -e "${RED}❌ User registration failed${NC}"
  echo "   Response: $register_response"
fi
echo ""

# Test 4: Check pages are accessible
echo "🌐 Test 4: Page Accessibility"

pages=("/" "/auth/signup" "/auth/login" "/textbook-studio")
for page in "${pages[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page")
  if [ "$status" = "200" ]; then
    echo -e "${GREEN}✅ $page - OK${NC}"
  else
    echo -e "${RED}❌ $page - Status: $status${NC}"
  fi
done
echo ""

# Test 5: Check required dependencies
echo "📦 Test 5: Dependencies"
if command -v pnpm &> /dev/null; then
  if pnpm list next-auth 2>&1 | grep -q "next-auth"; then
    echo -e "${GREEN}✅ next-auth installed${NC}"
  else
    echo -e "${RED}❌ next-auth not installed${NC}"
    echo "   Run: pnpm install"
  fi
  
  if pnpm list bcryptjs 2>&1 | grep -q "bcryptjs"; then
    echo -e "${GREEN}✅ bcryptjs installed${NC}"
  else
    echo -e "${RED}❌ bcryptjs not installed${NC}"
    echo "   Run: pnpm install"
  fi
else
  echo -e "${YELLOW}⚠️  pnpm not found, skipping dependency check${NC}"
fi
echo ""

# Summary
echo "=============================="
echo "🎉 Test Summary"
echo "=============================="
echo ""
echo "Next steps:"
echo "1. Start dev server: pnpm dev"
echo "2. Visit: $BASE_URL/auth/signup"
echo "3. Create an account"
echo "4. Test sign in/out"
echo "5. Check Textbook Studio saved chats"
echo ""
echo "For detailed testing, see: AUTH_TESTING_CHECKLIST.md"

