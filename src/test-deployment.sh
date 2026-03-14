#!/bin/bash

# ========================================
# Test Todoless-ngx Deployment
# Verifies all services are working
# ========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Todoless-ngx Deployment Test Suite                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    ((FAILED++))
}

info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
}

# ----------------------------------------
# Test 1: Docker Compose File
# ----------------------------------------
echo -e "${BLUE}Test 1: Configuration Files${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f docker-compose.yml ]; then
    pass "docker-compose.yml exists"
else
    fail "docker-compose.yml not found"
fi

if [ -f .env ]; then
    pass ".env file exists"
    
    # Check required variables
    if grep -q "DB_PASSWORD=" .env && ! grep -q "CHANGE_ME" .env; then
        pass "DB_PASSWORD is set"
    else
        fail "DB_PASSWORD not set or still using default"
    fi
    
    if grep -q "JWT_SECRET=" .env && ! grep -q "CHANGE_ME" .env; then
        pass "JWT_SECRET is set"
    else
        fail "JWT_SECRET not set or still using default"
    fi
else
    fail ".env file not found"
    warn "Copy .env.example to .env and configure it"
fi

if [ -f Dockerfile.frontend ]; then
    pass "Dockerfile.frontend exists"
else
    fail "Dockerfile.frontend not found"
fi

if [ -f Dockerfile.backend ]; then
    pass "Dockerfile.backend exists"
else
    fail "Dockerfile.backend not found"
fi

if [ -f nginx.conf ]; then
    pass "nginx.conf exists"
else
    fail "nginx.conf not found"
fi

echo ""

# ----------------------------------------
# Test 2: Docker Services
# ----------------------------------------
echo -e "${BLUE}Test 2: Docker Services${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if docker-compose is running
if docker-compose ps 2>/dev/null | grep -q "Up"; then
    pass "Docker Compose services are running"
    
    # Check individual services
    if docker-compose ps db 2>/dev/null | grep -q "Up"; then
        pass "Database container is up"
        
        # Check if healthy
        if docker-compose ps db 2>/dev/null | grep -q "healthy"; then
            pass "Database is healthy"
        else
            warn "Database not healthy yet (may still be starting)"
        fi
    else
        fail "Database container not running"
    fi
    
    if docker-compose ps backend 2>/dev/null | grep -q "Up"; then
        pass "Backend container is up"
        
        # Check if healthy
        if docker-compose ps backend 2>/dev/null | grep -q "healthy"; then
            pass "Backend is healthy"
        else
            warn "Backend not healthy yet (may still be starting)"
        fi
    else
        fail "Backend container not running"
    fi
    
    if docker-compose ps frontend 2>/dev/null | grep -q "Up"; then
        pass "Frontend container is up"
    else
        fail "Frontend container not running"
    fi
else
    warn "Docker Compose services not running"
    info "Start with: docker-compose up -d"
fi

echo ""

# ----------------------------------------
# Test 3: Network Connectivity
# ----------------------------------------
echo -e "${BLUE}Test 3: Network Connectivity${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check backend health endpoint
if curl -s -f http://localhost:4000/api/health >/dev/null 2>&1; then
    pass "Backend API is reachable"
    
    # Check health response
    HEALTH=$(curl -s http://localhost:4000/api/health)
    
    if echo "$HEALTH" | grep -q '"status":"ok"'; then
        pass "Backend health check returns ok"
    else
        fail "Backend health check failed"
        info "Response: $HEALTH"
    fi
    
    if echo "$HEALTH" | grep -q '"database":"connected"'; then
        pass "Backend can connect to database"
    else
        fail "Backend cannot connect to database"
    fi
    
    if echo "$HEALTH" | grep -q '"websocket":"enabled"'; then
        pass "WebSocket is enabled"
    else
        warn "WebSocket not enabled"
    fi
else
    fail "Backend API not reachable on port 4000"
    info "Check if backend container is running and healthy"
fi

# Check frontend
FRONTEND_PORT=$(grep FRONTEND_PORT .env 2>/dev/null | cut -d'=' -f2 || echo "80")
if curl -s -f http://localhost:${FRONTEND_PORT}/ >/dev/null 2>&1; then
    pass "Frontend is reachable on port ${FRONTEND_PORT}"
    
    # Check if HTML is returned
    if curl -s http://localhost:${FRONTEND_PORT}/ | grep -q "<!DOCTYPE html>"; then
        pass "Frontend returns HTML content"
    else
        fail "Frontend not returning HTML"
    fi
else
    fail "Frontend not reachable on port ${FRONTEND_PORT}"
fi

echo ""

# ----------------------------------------
# Test 4: Database
# ----------------------------------------
echo -e "${BLUE}Test 4: Database${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if docker-compose ps db 2>/dev/null | grep -q "Up"; then
    # Test database connection
    if docker-compose exec -T db pg_isready -U todoless >/dev/null 2>&1; then
        pass "Database accepts connections"
    else
        fail "Database not accepting connections"
    fi
    
    # Check if tables exist
    TABLES=$(docker-compose exec -T db psql -U todoless -d todoless -c "\dt" 2>/dev/null || echo "")
    
    if echo "$TABLES" | grep -q "users"; then
        pass "Database schema initialized (users table exists)"
    else
        warn "Database schema may not be initialized"
        info "Tables should be created on first backend startup"
    fi
else
    warn "Database container not running - skipping database tests"
fi

echo ""

# ----------------------------------------
# Test 5: Docker Resources
# ----------------------------------------
echo -e "${BLUE}Test 5: Resources${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check disk space
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    pass "Disk space OK (${DISK_USAGE}% used)"
else
    warn "Disk space critical (${DISK_USAGE}% used)"
fi

# Check Docker volumes
if docker volume ls | grep -q "todoless-ngx-db-data"; then
    pass "Database volume exists"
    
    # Check volume size
    VOLUME_SIZE=$(docker system df -v | grep todoless-ngx-db-data | awk '{print $3}' || echo "unknown")
    info "Database volume size: ${VOLUME_SIZE}"
else
    warn "Database volume not found"
fi

# Check images
if docker images | grep -q "todoless-ngx-frontend"; then
    pass "Frontend image exists"
else
    warn "Frontend image not built"
fi

if docker images | grep -q "todoless-ngx-backend"; then
    pass "Backend image exists"
else
    warn "Backend image not built"
fi

echo ""

# ----------------------------------------
# Test 6: Security
# ----------------------------------------
echo -e "${BLUE}Test 6: Security${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if database port is exposed to host
if docker-compose ps db 2>/dev/null | grep -q "5432->5432"; then
    fail "Database port 5432 is exposed to host (security risk)"
    warn "Database should only be accessible via internal Docker network"
else
    pass "Database port not exposed to host (secure)"
fi

# Check environment file permissions
if [ -f .env ]; then
    PERMS=$(stat -c %a .env 2>/dev/null || stat -f %A .env 2>/dev/null)
    if [ "$PERMS" = "600" ] || [ "$PERMS" = "400" ]; then
        pass ".env file has secure permissions ($PERMS)"
    else
        warn ".env file permissions are $PERMS (recommend 600)"
        info "Run: chmod 600 .env"
    fi
fi

# Check for default passwords
if [ -f .env ]; then
    if grep -q "CHANGE_ME" .env; then
        fail "Default passwords still in use"
        warn "Change DB_PASSWORD and JWT_SECRET in .env"
    else
        pass "No default passwords found"
    fi
fi

echo ""

# ----------------------------------------
# Test 7: API Endpoints
# ----------------------------------------
echo -e "${BLUE}Test 7: API Endpoints${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test health endpoint
if curl -s http://localhost:4000/api/health >/dev/null 2>&1; then
    pass "GET /api/health responds"
else
    fail "GET /api/health not responding"
fi

# Test debug endpoint
if curl -s http://localhost:4000/api/debug >/dev/null 2>&1; then
    pass "GET /api/debug responds"
else
    warn "GET /api/debug not responding (may be disabled)"
fi

# Test CORS
CORS_HEADER=$(curl -s -I http://localhost:4000/api/health | grep -i "access-control-allow-origin" || echo "")
if [ -n "$CORS_HEADER" ]; then
    pass "CORS headers present"
    info "$CORS_HEADER"
else
    warn "CORS headers not found"
fi

echo ""

# ----------------------------------------
# Summary
# ----------------------------------------
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      TEST SUMMARY                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -eq 0 ]; then
    echo -e "${YELLOW}No tests run${NC}"
    exit 1
fi

PASS_RATE=$((PASSED * 100 / TOTAL))

echo -e "Total Tests: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo -e "Pass Rate: ${PASS_RATE}%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  🎉 ALL TESTS PASSED! 🎉                       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Your Todoless-ngx deployment is working correctly!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Generate invite code: docker-compose exec backend node -e \"console.log(Math.random().toString().slice(2,8))\""
    echo "2. Open browser: http://localhost:${FRONTEND_PORT:-80}/"
    echo "3. Register first user with invite code"
    echo ""
    exit 0
elif [ $PASS_RATE -ge 80 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║              ⚠️  MOSTLY WORKING (${PASS_RATE}%)                        ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Some tests failed but core functionality should work.${NC}"
    echo "Review failed tests above and fix if needed."
    echo ""
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║               ❌ DEPLOYMENT HAS ISSUES (${PASS_RATE}%)                ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Multiple tests failed. Deployment may not work correctly.${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check logs: docker-compose logs -f"
    echo "2. Check services: docker-compose ps"
    echo "3. Verify .env configuration"
    echo "4. Review failed tests above"
    echo ""
    exit 1
fi
