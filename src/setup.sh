#!/bin/bash
set -e

echo "╔════════════════════════════════════════╗"
echo "║   Todoless-ngx Setup & Fix Tool       ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Step 1: Check Dockerfiles
echo -e "${BLUE}[1/6]${NC} Checking Dockerfile locations..."

DOCKERFILE_OK=true

if [ -f "Dockerfile" ]; then
    echo -e "${GREEN}  ✅ /Dockerfile exists${NC}"
else
    echo -e "${RED}  ❌ /Dockerfile missing!${NC}"
    DOCKERFILE_OK=false
fi

if [ -f "backend/Dockerfile" ]; then
    echo -e "${GREEN}  ✅ /backend/Dockerfile exists${NC}"
else
    echo -e "${RED}  ❌ /backend/Dockerfile missing!${NC}"
    DOCKERFILE_OK=false
fi

# Check for wrong locations
if [ -d "Dockerfile" ]; then
    echo -e "${RED}  ❌ /Dockerfile is a directory (should be a file)${NC}"
    DOCKERFILE_OK=false
fi

if [ -d "backend/Dockerfile" ]; then
    echo -e "${RED}  ❌ /backend/Dockerfile is a directory (should be a file)${NC}"
    DOCKERFILE_OK=false
fi

if [ "$DOCKERFILE_OK" = false ]; then
    echo ""
    echo -e "${YELLOW}  Fixing Dockerfiles...${NC}"
    
    # Remove wrong locations
    rm -rf Dockerfile/main.tsx backend/Dockerfile/main.tsx 2>/dev/null || true
    
    # Create frontend Dockerfile
    cat > Dockerfile << 'EOF'
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set empty API URL for production (uses nginx proxy)
ENV VITE_API_URL=

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --spider -q http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
EOF
    
    # Create backend Dockerfile
    cat > backend/Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache wget

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --spider -q http://localhost:4000/api/health || exit 1

CMD ["node", "server.js"]
EOF
    
    echo -e "${GREEN}  ✅ Dockerfiles fixed!${NC}"
fi

# Step 2: Check environment files
echo ""
echo -e "${BLUE}[2/6]${NC} Checking environment files..."

if [ ! -f .env ]; then
    echo -e "${YELLOW}  Creating .env from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}  ✅ .env created${NC}"
    echo -e "${YELLOW}  ⚠️  IMPORTANT: Edit .env and change:${NC}"
    echo "      - POSTGRES_PASSWORD"
    echo "      - JWT_SECRET"
fi

if [ ! -f .env.development ]; then
    echo -e "${YELLOW}  Creating .env.development...${NC}"
    echo "VITE_API_URL=http://localhost:4000" > .env.development
    echo -e "${GREEN}  ✅ .env.development created${NC}"
fi

if [ ! -f .env.production ]; then
    echo -e "${YELLOW}  Creating .env.production...${NC}"
    echo "VITE_API_URL=" > .env.production
    echo -e "${GREEN}  ✅ .env.production created${NC}"
fi

# Step 3: Check .dockerignore
echo ""
echo -e "${BLUE}[3/6]${NC} Checking .dockerignore files..."

if [ ! -f .dockerignore ]; then
    echo -e "${YELLOW}  Creating .dockerignore...${NC}"
    cat > .dockerignore << 'EOF'
node_modules
dist
.git
.env
.env.local
.env.development
.env.production
*.log
.DS_Store
backend
database
docs
scripts
guidelines
EOF
    echo -e "${GREEN}  ✅ .dockerignore created${NC}"
fi

if [ ! -f backend/.dockerignore ]; then
    echo -e "${YELLOW}  Creating backend/.dockerignore...${NC}"
    cat > backend/.dockerignore << 'EOF'
node_modules
.git
.env
*.log
.DS_Store
Dockerfile
EOF
    echo -e "${GREEN}  ✅ backend/.dockerignore created${NC}"
fi

# Step 4: Make scripts executable
echo ""
echo -e "${BLUE}[4/6]${NC} Making scripts executable..."
chmod +x *.sh 2>/dev/null || true
echo -e "${GREEN}  ✅ Scripts are executable${NC}"

# Step 5: Choose deployment mode
echo ""
echo -e "${BLUE}[5/6]${NC} Choose deployment mode:"
echo ""
echo "  ${PURPLE}1)${NC} Docker Compose (Production) - All-in-one, ready to deploy"
echo "  ${PURPLE}2)${NC} Development Mode - Live reload, debugging"
echo "  ${PURPLE}3)${NC} Just fix configuration (don't start anything)"
echo ""
read -p "Enter choice (1, 2, or 3): " CHOICE

# Step 6: Execute choice
echo ""
echo -e "${BLUE}[6/6]${NC} Setting up..."

if [ "$CHOICE" = "1" ]; then
    echo ""
    echo -e "${PURPLE}🐳 Docker Compose Mode${NC}"
    echo ""
    
    # Stop existing
    docker-compose down 2>/dev/null || true
    
    # Build images
    echo "Building Docker images (this may take a few minutes)..."
    docker-compose build
    
    # Start containers
    echo ""
    echo "Starting containers..."
    docker-compose up -d
    
    echo ""
    echo "Waiting for services to start..."
    sleep 10
    
    # Check status
    echo ""
    docker-compose ps
    
    echo ""
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Wait 30 seconds for all services to be ready"
    echo "  2. Generate invite code: ./generate-invite.sh"
    echo "  3. Access app: http://localhost:3000"
    echo ""
    echo "Useful commands:"
    echo "  - Health check:  ./health-check.sh"
    echo "  - View logs:     docker-compose logs -f"
    echo "  - Stop app:      docker-compose down"
    
elif [ "$CHOICE" = "2" ]; then
    echo ""
    echo -e "${PURPLE}💻 Development Mode${NC}"
    echo ""
    
    # Stop dev containers
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    # Start database
    echo "Starting PostgreSQL database..."
    docker-compose -f docker-compose.dev.yml up -d
    
    echo ""
    echo "Waiting for database..."
    sleep 5
    
    if docker exec todoless-ngx-db-dev pg_isready -U todoless -d todoless > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready${NC}"
    else
        echo -e "${YELLOW}⏳ Database is still starting (wait a few seconds)${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Database setup complete!${NC}"
    echo ""
    echo -e "${YELLOW}You need to start backend and frontend manually:${NC}"
    echo ""
    echo "${PURPLE}Terminal 1${NC} - Backend:"
    echo "  cd backend"
    echo "  npm install"
    echo "  npm run dev"
    echo ""
    echo "${PURPLE}Terminal 2${NC} - Frontend:"
    echo "  npm install"
    echo "  npm run dev"
    echo ""
    echo "Then access: http://localhost:3000"
    
elif [ "$CHOICE" = "3" ]; then
    echo ""
    echo -e "${GREEN}✅ Configuration fixed!${NC}"
    echo ""
    echo "All configuration files are now correct."
    echo ""
    echo "To start the app:"
    echo "  - Production:  ./start.sh"
    echo "  - Development: ./dev.sh"
    
else
    echo ""
    echo -e "${RED}Invalid choice. Please run again and select 1, 2, or 3.${NC}"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   Setup Complete!                      ║"
echo "╚════════════════════════════════════════╝"
echo ""
