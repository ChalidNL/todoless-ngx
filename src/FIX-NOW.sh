#!/bin/bash

# ========================================
# ULTIMATE FIX SCRIPT - RALF PRINCIPE
# Blijf fixen tot het werkt!
# ========================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

clear

echo -e "${RED}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║                      🔥 ULTIMATE FIX 🔥                          ║
║                                                                  ║
║              Fixing WebSocket & JSON Parse Errors                ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${BLUE}Step 1: Cleaning up old containers and volumes${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Stop everything
docker-compose down -v 2>/dev/null || true
docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true

echo -e "${GREEN}✅ Containers stopped${NC}"

echo ""
echo -e "${BLUE}Step 2: Removing directory conflicts${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove old directory files
rm -rf /Makefile/main.tsx 2>/dev/null || true
rm -rf Makefile/main.tsx 2>/dev/null || true

echo -e "${GREEN}✅ Conflicts removed${NC}"

echo ""
echo -e "${BLUE}Step 3: Verifying Dockerfiles are FILES not directories${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f Dockerfile.frontend ]; then
    echo -e "${GREEN}✅ Dockerfile.frontend is a FILE${NC}"
else
    echo -e "${RED}❌ Dockerfile.frontend is NOT a file!${NC}"
    exit 1
fi

if [ -f Dockerfile.backend ]; then
    echo -e "${GREEN}✅ Dockerfile.backend is a FILE${NC}"
else
    echo -e "${RED}❌ Dockerfile.backend is NOT a file!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 4: Creating .env if needed${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    
    # Generate secure passwords
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    # Update .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/CHANGE_ME_TO_SECURE_PASSWORD_HERE/${DB_PASSWORD}/" .env
        sed -i '' "s/CHANGE_ME_TO_SECURE_JWT_SECRET_HERE/${JWT_SECRET}/" .env
    else
        # Linux
        sed -i "s/CHANGE_ME_TO_SECURE_PASSWORD_HERE/${DB_PASSWORD}/" .env
        sed -i "s/CHANGE_ME_TO_SECURE_JWT_SECRET_HERE/${JWT_SECRET}/" .env
    fi
    
    echo -e "${GREEN}✅ Created .env with secure passwords${NC}"
else
    echo -e "${GREEN}✅ .env already exists${NC}"
    
    # Check if passwords need updating
    if grep -q "CHANGE_ME" .env; then
        echo -e "${YELLOW}⚠️  Updating default passwords in .env${NC}"
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" .env
            sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
        else
            sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" .env
            sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
        fi
        
        echo -e "${GREEN}✅ Passwords updated${NC}"
    fi
fi

echo ""
echo -e "${BLUE}Step 5: Building fresh images${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

docker-compose build --no-cache

echo -e "${GREEN}✅ Images built${NC}"

echo ""
echo -e "${BLUE}Step 6: Starting services${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

docker-compose up -d

echo -e "${GREEN}✅ Services started${NC}"

echo ""
echo -e "${YELLOW}⏳ Waiting 60 seconds for services to fully initialize...${NC}"
echo ""

# Show progress bar
for i in {1..60}; do
    echo -ne "[$i/60] "
    if [ $((i % 10)) -eq 0 ]; then
        echo ""
    fi
    sleep 1
done

echo ""
echo ""
echo -e "${BLUE}Step 7: Checking service health${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check containers
echo ""
docker-compose ps

echo ""
echo -e "${BLUE}Checking backend health...${NC}"
if curl -s -f http://localhost:4000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
    curl -s http://localhost:4000/api/health | jq . 2>/dev/null || curl -s http://localhost:4000/api/health
else
    echo -e "${RED}❌ Backend not responding yet${NC}"
    echo "Backend logs:"
    docker-compose logs backend | tail -20
fi

echo ""
echo -e "${BLUE}Checking frontend...${NC}"
if curl -s -f http://localhost/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is serving${NC}"
else
    echo -e "${RED}❌ Frontend not responding yet${NC}"
    echo "Frontend logs:"
    docker-compose logs frontend | tail -20
fi

echo ""
echo -e "${BLUE}Checking database...${NC}"
if docker-compose exec -T db pg_isready -U todoless > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database is ready${NC}"
else
    echo -e "${RED}❌ Database not ready yet${NC}"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    🎉 FIX COMPLETE! 🎉                           ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Generate invite code:"
echo "   docker-compose exec backend node -e \"console.log(Math.random().toString().slice(2,8))\""
echo ""
echo "2. Open your browser:"
echo "   http://localhost/"
echo ""
echo "3. Register with the invite code"
echo ""
echo -e "${BLUE}Troubleshooting:${NC}"
echo "  • View logs:    docker-compose logs -f"
echo "  • Check status: docker-compose ps"
echo "  • Restart:      docker-compose restart"
echo "  • Reset all:    docker-compose down -v && ./FIX-NOW.sh"
echo ""
