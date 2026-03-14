#!/bin/bash

echo "🔍 Todoless-ngx Diagnostic Tool"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Checking runtime environment...${NC}"
echo ""

# Check if running via Docker
if docker ps | grep -q todoless-ngx; then
    echo -e "${GREEN}✅ Docker containers detected${NC}"
    RUNTIME="docker"
    
    echo ""
    echo "Container Status:"
    docker ps --filter "name=todoless-ngx" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
else
    echo -e "${YELLOW}⚠️  No Docker containers running${NC}"
    RUNTIME="local"
fi

echo ""
echo -e "${BLUE}🔍 Checking ports...${NC}"
echo ""

# Check if ports are in use
check_port() {
    local port=$1
    local name=$2
    
    if lsof -i :$port > /dev/null 2>&1 || netstat -an 2>/dev/null | grep -q ":$port.*LISTEN"; then
        echo -e "${GREEN}✅ Port $port${NC} - $name is listening"
        return 0
    else
        echo -e "${RED}❌ Port $port${NC} - $name is NOT listening"
        return 1
    fi
}

PORT_3000=$(check_port 3000 "Frontend")
PORT_4000=$(check_port 4000 "Backend")

echo ""
echo -e "${BLUE}🌐 Testing endpoints...${NC}"
echo ""

# Test backend
echo -n "Backend API (http://localhost:4000/api/health): "
if curl -s -f http://localhost:4000/api/health > /dev/null 2>&1; then
    response=$(curl -s http://localhost:4000/api/health)
    echo -e "${GREEN}✅ Responding${NC}"
    echo "   Response: $response"
else
    echo -e "${RED}❌ Not responding${NC}"
    BACKEND_ERROR=1
fi

echo ""
echo -n "Frontend (http://localhost:3000): "
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Responding${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
    FRONTEND_ERROR=1
fi

echo ""
echo -e "${BLUE}🔍 Checking configuration...${NC}"
echo ""

# Check .env files
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env exists${NC}"
else
    echo -e "${RED}❌ .env missing${NC}"
fi

if [ -f .env.development ]; then
    echo -e "${GREEN}✅ .env.development exists${NC}"
    echo "   VITE_API_URL=$(grep VITE_API_URL .env.development | cut -d= -f2)"
else
    echo -e "${YELLOW}⚠️  .env.development missing${NC}"
fi

if [ -f .env.production ]; then
    echo -e "${GREEN}✅ .env.production exists${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production missing${NC}"
fi

echo ""
echo -e "${BLUE}📋 Diagnosis Summary${NC}"
echo "================================"
echo ""

if [ "$RUNTIME" = "docker" ]; then
    echo "Runtime: Docker Compose"
    echo ""
    echo "Expected setup:"
    echo "  - Database:  todoless-ngx-db (internal)"
    echo "  - Backend:   todoless-ngx-backend:4000"
    echo "  - Frontend:  todoless-ngx-frontend:80 → mapped to :3000"
    echo ""
    
    if [ ! -z "$BACKEND_ERROR" ]; then
        echo -e "${RED}❌ PROBLEM: Backend not responding${NC}"
        echo ""
        echo "Solutions:"
        echo "  1. Check backend logs:"
        echo "     docker-compose logs todoless-ngx-backend"
        echo ""
        echo "  2. Check database connection:"
        echo "     docker exec todoless-ngx-db pg_isready -U todoless -d todoless"
        echo ""
        echo "  3. Restart backend:"
        echo "     docker-compose restart todoless-ngx-backend"
    fi
    
    if [ ! -z "$FRONTEND_ERROR" ]; then
        echo -e "${RED}❌ PROBLEM: Frontend not responding${NC}"
        echo ""
        echo "Solutions:"
        echo "  1. Check frontend logs:"
        echo "     docker-compose logs todoless-ngx-frontend"
        echo ""
        echo "  2. Rebuild frontend:"
        echo "     docker-compose build todoless-ngx-frontend"
        echo "     docker-compose up -d todoless-ngx-frontend"
    fi
    
else
    echo "Runtime: Local Development (npm run dev)"
    echo ""
    echo "Expected setup:"
    echo "  - Backend:   cd backend && npm run dev (port 4000)"
    echo "  - Frontend:  npm run dev (port 3000)"
    echo "  - Database:  PostgreSQL on localhost:5432"
    echo ""
    
    if [ "$PORT_4000" != "0" ]; then
        echo -e "${RED}❌ PROBLEM: Backend not running on port 4000${NC}"
        echo ""
        echo "Solutions:"
        echo "  1. Start backend manually:"
        echo "     cd backend"
        echo "     npm install"
        echo "     npm run dev"
        echo ""
        echo "  2. Or start database and backend via Docker:"
        echo "     ./dev.sh"
        echo "     cd backend && npm run dev"
    fi
    
    if [ "$PORT_3000" != "0" ]; then
        echo -e "${RED}❌ PROBLEM: Frontend not running on port 3000${NC}"
        echo ""
        echo "Solutions:"
        echo "  1. Start frontend:"
        echo "     npm install"
        echo "     npm run dev"
        echo ""
        echo "  2. Check if .env.development exists:"
        echo "     cat .env.development"
        echo "     # Should have: VITE_API_URL=http://localhost:4000"
    fi
fi

echo ""
echo -e "${BLUE}🔧 Error Details${NC}"
echo ""

if [ ! -z "$BACKEND_ERROR" ]; then
    echo "Your error: 'SyntaxError: Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON'"
    echo ""
    echo "This means:"
    echo "  - Frontend is trying to fetch from /api/* endpoints"
    echo "  - But getting HTML (404 page) instead of JSON"
    echo "  - Backend is either not running or not reachable"
    echo ""
    echo "Root cause:"
    if [ "$RUNTIME" = "docker" ]; then
        echo "  - Backend container might be unhealthy"
        echo "  - Database might not be connected"
        echo "  - Check: docker-compose ps"
    else
        echo "  - Backend not running on port 4000"
        echo "  - Start with: cd backend && npm run dev"
    fi
fi

echo ""
echo -e "${BLUE}🚀 Quick Fix Commands${NC}"
echo "================================"
echo ""

if [ "$RUNTIME" = "docker" ]; then
    echo "Stop everything:"
    echo "  docker-compose down"
    echo ""
    echo "Rebuild and restart:"
    echo "  docker-compose build --no-cache"
    echo "  docker-compose up -d"
    echo ""
    echo "Check logs:"
    echo "  docker-compose logs -f"
else
    echo "Start database:"
    echo "  ./dev.sh"
    echo ""
    echo "Start backend (new terminal):"
    echo "  cd backend"
    echo "  npm install"
    echo "  npm run dev"
    echo ""
    echo "Start frontend (new terminal):"
    echo "  npm install"
    echo "  npm run dev"
fi

echo ""
echo "Run health check:"
echo "  ./health-check.sh"
echo ""
