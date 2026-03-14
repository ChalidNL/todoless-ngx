#!/bin/bash

echo "🏥 Todoless-ngx Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_container() {
    local name=$1
    local port=$2
    local endpoint=$3
    
    echo -n "🔍 $name: "
    
    # Check if container is running
    if ! docker ps | grep -q $name; then
        echo -e "${RED}❌ Not Running${NC}"
        return 1
    fi
    
    # Check if healthy (if health check is defined)
    health=$(docker inspect --format='{{.State.Health.Status}}' $name 2>/dev/null)
    if [ "$health" = "healthy" ]; then
        echo -e "${GREEN}✅ Healthy${NC}"
        return 0
    elif [ "$health" = "unhealthy" ]; then
        echo -e "${RED}❌ Unhealthy${NC}"
        return 1
    elif [ "$health" = "starting" ]; then
        echo -e "${YELLOW}⏳ Starting...${NC}"
        return 0
    else
        # No health check, just check if running
        echo -e "${GREEN}✅ Running${NC}"
        return 0
    fi
}

check_endpoint() {
    local name=$1
    local url=$2
    
    echo -n "🌐 $name: "
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Responding${NC}"
        return 0
    else
        echo -e "${RED}❌ Not Responding${NC}"
        return 1
    fi
}

check_websocket() {
    echo -n "🔌 WebSocket: "
    
    # Check if backend WebSocket is listening
    if docker exec todoless-ngx-backend sh -c 'netstat -an | grep -q ":4000.*LISTEN"' 2>/dev/null; then
        # Try to get WebSocket client count from backend health endpoint
        clients=$(curl -s http://localhost:4000/api/health 2>/dev/null | grep -o '"clients":[0-9]*' | cut -d: -f2)
        if [ ! -z "$clients" ]; then
            echo -e "${GREEN}✅ Active ($clients clients)${NC}"
        else
            echo -e "${GREEN}✅ Active${NC}"
        fi
        return 0
    else
        echo -e "${RED}❌ Not Active${NC}"
        return 1
    fi
}

check_database() {
    echo -n "🗄️  Database Connection: "
    
    if docker exec todoless-ngx-db psql -U todoless -d todoless -c "SELECT 1" > /dev/null 2>&1; then
        # Get database size
        size=$(docker exec todoless-ngx-db psql -U todoless -d todoless -t -c "SELECT pg_size_pretty(pg_database_size('todoless'));" | tr -d ' \n')
        echo -e "${GREEN}✅ Connected ($size)${NC}"
        
        # Get table counts
        echo "   Tables:"
        for table in users tasks items notes labels shops sprints invite_codes calendar_events; do
            count=$(docker exec todoless-ngx-db psql -U todoless -d todoless -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' \n')
            if [ ! -z "$count" ]; then
                printf "     %-20s %s\n" "$table:" "$count rows"
            fi
        done
        return 0
    else
        echo -e "${RED}❌ Not Connected${NC}"
        return 1
    fi
}

check_volumes() {
    echo -n "💾 Data Volume: "
    
    volume=$(docker volume ls | grep todoless-ngx-db-data)
    if [ ! -z "$volume" ]; then
        echo -e "${GREEN}✅ Exists${NC}"
        return 0
    else
        echo -e "${RED}❌ Missing${NC}"
        return 1
    fi
}

check_network() {
    echo -n "🌐 Network: "
    
    network=$(docker network ls | grep todoless-ngx_net)
    if [ ! -z "$network" ]; then
        containers=$(docker network inspect todoless-ngx_net --format='{{len .Containers}}' 2>/dev/null)
        echo -e "${GREEN}✅ Active ($containers containers)${NC}"
        return 0
    else
        echo -e "${RED}❌ Not Found${NC}"
        return 1
    fi
}

# Run all checks
echo "Container Status:"
check_container "todoless-ngx-db"
check_container "todoless-ngx-backend"
check_container "todoless-ngx-frontend"

echo ""
echo "Service Health:"
check_database
check_websocket
check_endpoint "Backend API" "http://localhost:4000/api/health"
check_endpoint "Frontend" "http://localhost:3000"

echo ""
echo "Infrastructure:"
check_volumes
check_network

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
running=$(docker ps --filter "name=todoless-ngx" --format "{{.Names}}" | wc -l)
echo "Summary: $running/3 containers running"

if [ $running -eq 3 ]; then
    echo -e "${GREEN}✅ All systems operational${NC}"
    echo ""
    echo "📍 Access the app at: http://localhost:3000"
    exit 0
else
    echo -e "${RED}⚠️  Some services are not running${NC}"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To restart:   docker-compose restart"
    exit 1
fi
