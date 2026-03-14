#!/bin/bash
set -e

echo "🔧 Todoless-ngx Error Fix Tool"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}This script will fix common errors:${NC}"
echo "  1. 'SyntaxError: Unexpected token <, <!DOCTYPE ...' "
echo "  2. 'WebSocket error: { isTrusted: true }'"
echo ""

# Ask user how they're running the app
echo -e "${YELLOW}How are you running the app?${NC}"
echo "  1) Docker Compose (production)"
echo "  2) npm run dev (development)"
echo ""
read -p "Enter choice (1 or 2): " CHOICE

if [ "$CHOICE" = "1" ]; then
    echo ""
    echo -e "${BLUE}🐳 Fixing Docker Compose setup...${NC}"
    echo ""
    
    # Stop containers
    echo "1. Stopping containers..."
    docker-compose down 2>/dev/null || true
    
    # Check environment files
    echo ""
    echo "2. Checking environment files..."
    if [ ! -f .env ]; then
        echo "   Creating .env from template..."
        cp .env.example .env
        echo -e "${YELLOW}   ⚠️  IMPORTANT: Edit .env and change passwords!${NC}"
        echo "      - POSTGRES_PASSWORD"
        echo "      - JWT_SECRET"
    fi
    
    if [ ! -f .env.production ]; then
        echo "   Creating .env.production..."
        echo "VITE_API_URL=" > .env.production
    fi
    
    # Rebuild images
    echo ""
    echo "3. Rebuilding Docker images..."
    echo "   This may take a few minutes..."
    docker-compose build --no-cache
    
    # Start containers
    echo ""
    echo "4. Starting containers..."
    docker-compose up -d
    
    # Wait for health
    echo ""
    echo "5. Waiting for services to be healthy..."
    sleep 10
    
    # Check status
    echo ""
    echo -e "${GREEN}✅ Fix complete!${NC}"
    echo ""
    echo "Checking status..."
    docker-compose ps
    
    echo ""
    echo "Next steps:"
    echo "  1. Wait 30 seconds for all services to be fully ready"
    echo "  2. Run: ./health-check.sh"
    echo "  3. Access app at: http://localhost:3000"
    echo ""
    echo "If still having issues:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Run diagnostic: ./diagnose.sh"
    
elif [ "$CHOICE" = "2" ]; then
    echo ""
    echo -e "${BLUE}💻 Fixing local development setup...${NC}"
    echo ""
    
    # Check environment files
    echo "1. Checking environment files..."
    if [ ! -f .env.development ]; then
        echo "   Creating .env.development..."
        echo "VITE_API_URL=http://localhost:4000" > .env.development
    else
        # Verify it has the right content
        if ! grep -q "VITE_API_URL=http://localhost:4000" .env.development; then
            echo "   Fixing .env.development..."
            echo "VITE_API_URL=http://localhost:4000" > .env.development
        fi
    fi
    
    if [ ! -f .env ]; then
        echo "   Creating .env from template..."
        cp .env.example .env
    fi
    
    # Start database
    echo ""
    echo "2. Starting PostgreSQL database..."
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    docker-compose -f docker-compose.dev.yml up -d
    
    echo ""
    echo "3. Waiting for database..."
    sleep 5
    
    # Check database
    if docker exec todoless-ngx-db-dev pg_isready -U todoless -d todoless > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Database is ready${NC}"
    else
        echo -e "${YELLOW}   ⏳ Database is still starting...${NC}"
        echo "      Wait a few seconds and try again"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Environment setup complete!${NC}"
    echo ""
    echo -e "${YELLOW}You still need to start backend and frontend manually:${NC}"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd backend"
    echo "  npm install"
    echo "  npm run dev"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  npm install"
    echo "  npm run dev"
    echo ""
    echo "Then access: http://localhost:3000"
    echo ""
    echo "Troubleshooting:"
    echo "  - Run diagnostic: ./diagnose.sh"
    echo "  - Check database: docker-compose -f docker-compose.dev.yml logs"
    
else
    echo ""
    echo -e "${RED}Invalid choice. Please run again and select 1 or 2.${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
