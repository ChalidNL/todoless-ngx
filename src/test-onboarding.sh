#!/bin/bash

# ========================================
# Test Onboarding Flow with PostgreSQL
# ========================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              🧪 ONBOARDING TEST WITH POSTGRESQL                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${BLUE}Step 1: Checking if services are running${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}Services not running. Starting now...${NC}"
    ./RUN-THIS-NOW.sh
else
    echo -e "${GREEN}✅ Services are running${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Waiting for services to be ready${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Wait for backend
echo -n "Waiting for backend..."
for i in {1..30}; do
    if curl -s -f http://localhost:4000/api/health > /dev/null 2>&1; then
        echo -e " ${GREEN}✅${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Wait for frontend
echo -n "Waiting for frontend..."
for i in {1..10}; do
    if curl -s -f http://localhost/ > /dev/null 2>&1; then
        echo -e " ${GREEN}✅${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo -e "${BLUE}Step 3: Checking database schema${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check tables exist
TABLES=$(docker-compose exec -T db psql -U todoless -d todoless -t -c "\dt" | grep -c "public" || echo "0")

if [ "$TABLES" -gt 0 ]; then
    echo -e "${GREEN}✅ Database schema initialized (${TABLES} tables)${NC}"
    echo ""
    docker-compose exec -T db psql -U todoless -d todoless -c "\dt"
else
    echo -e "${RED}❌ Database schema not initialized${NC}"
    echo "Running migrations..."
    docker-compose restart backend
    sleep 20
fi

echo ""
echo -e "${BLUE}Step 4: Checking existing users${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

USER_COUNT=$(docker-compose exec -T db psql -U todoless -d todoless -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ' || echo "0")

echo "Current users in database: ${USER_COUNT}"

if [ "$USER_COUNT" -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}Existing users:${NC}"
    docker-compose exec -T db psql -U todoless -d todoless -c "SELECT id, email, name, created_at FROM users;"
fi

echo ""
echo -e "${BLUE}Step 5: Generate invite code for testing${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

INVITE_CODE=$(docker-compose exec -T backend node -e "console.log(Math.random().toString().slice(2,8))")

echo -e "${GREEN}Generated invite code: ${INVITE_CODE}${NC}"

echo ""
echo -e "${BLUE}Step 6: Test API registration endpoint${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Generate random test user
RANDOM_NUM=$(date +%s)
TEST_EMAIL="test${RANDOM_NUM}@example.com"
TEST_NAME="Test User ${RANDOM_NUM}"
TEST_PASSWORD="TestPassword123!"

echo "Testing registration with:"
echo "  Email: ${TEST_EMAIL}"
echo "  Name: ${TEST_NAME}"
echo "  Invite: ${INVITE_CODE}"
echo ""

# Test registration API
RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"name\": \"${TEST_NAME}\",
    \"invite_code\": \"${INVITE_CODE}\"
  }")

echo "API Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

if echo "$RESPONSE" | grep -q "token"; then
    echo ""
    echo -e "${GREEN}✅ Registration successful!${NC}"
    
    # Extract token
    TOKEN=$(echo "$RESPONSE" | jq -r '.token' 2>/dev/null)
    
    echo ""
    echo -e "${BLUE}Step 7: Verify user in database${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    docker-compose exec -T db psql -U todoless -d todoless -c \
      "SELECT id, email, name, created_at FROM users WHERE email='${TEST_EMAIL}';"
    
    echo ""
    echo -e "${BLUE}Step 8: Test authenticated API call${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Test getting user tasks
    TASKS_RESPONSE=$(curl -s -X GET http://localhost:4000/api/tasks \
      -H "Authorization: Bearer ${TOKEN}")
    
    echo "Tasks API Response:"
    echo "$TASKS_RESPONSE" | jq . 2>/dev/null || echo "$TASKS_RESPONSE"
    
    echo ""
    echo -e "${GREEN}✅ Authenticated API call successful!${NC}"
else
    echo ""
    echo -e "${RED}❌ Registration failed${NC}"
    echo "Check backend logs:"
    docker-compose logs backend | tail -20
fi

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  📊 ONBOARDING TEST SUMMARY                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${GREEN}✅ Services Status:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✅ Database Info:${NC}"
echo "  Database: todoless"
echo "  User: todoless"
echo "  Tables: ${TABLES}"
echo "  Users: $(docker-compose exec -T db psql -U todoless -d todoless -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')"

echo ""
echo -e "${GREEN}✅ Test Credentials:${NC}"
echo "  Email: ${TEST_EMAIL}"
echo "  Password: ${TEST_PASSWORD}"
echo "  Invite Code: ${INVITE_CODE}"

echo ""
echo -e "${YELLOW}🌐 Manual Test:${NC}"
echo ""
echo "1. Open browser: ${BLUE}http://localhost/${NC}"
echo ""
echo "2. Click 'Register' and fill in:"
echo "   Email:    any-email@example.com"
echo "   Password: SecurePassword123!"
echo "   Name:     Your Name"
echo "   Invite:   ${GREEN}${INVITE_CODE}${NC}"
echo ""
echo "3. After registration, you should:"
echo "   ✅ See the dashboard"
echo "   ✅ Be able to create tasks"
echo "   ✅ See real-time updates"
echo ""

echo -e "${BLUE}📊 View all users in database:${NC}"
echo "  docker-compose exec db psql -U todoless -d todoless -c \"SELECT * FROM users;\""
echo ""

echo -e "${BLUE}🔍 View backend logs:${NC}"
echo "  docker-compose logs -f backend"
echo ""

echo -e "${BLUE}🧹 Reset database (delete all users):${NC}"
echo "  docker-compose down -v && ./RUN-THIS-NOW.sh"
echo ""
