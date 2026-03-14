#!/bin/bash
set -e

echo "🔧 Todoless-ngx Auto-Fix Tool"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FIXED=0

# Function to fix Dockerfile
fix_frontend_dockerfile() {
    echo -e "${BLUE}Fixing frontend Dockerfile...${NC}"
    
    # Remove if it's a directory
    if [ -d "Dockerfile" ]; then
        echo "  Removing directory Dockerfile/"
        rm -rf Dockerfile
        ((FIXED++))
    fi
    
    # Create correct file
    cat > Dockerfile << 'EOF'
# Multi-stage build for Todoless-ngx frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build with empty API URL (uses nginx proxy in production)
ENV VITE_API_URL=
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --spider -q http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF
    
    echo -e "${GREEN}  ✅ Frontend Dockerfile fixed${NC}"
}

# Function to fix backend Dockerfile
fix_backend_dockerfile() {
    echo -e "${BLUE}Fixing backend Dockerfile...${NC}"
    
    # Remove if it's a directory
    if [ -d "backend/Dockerfile" ]; then
        echo "  Removing directory backend/Dockerfile/"
        rm -rf backend/Dockerfile
        ((FIXED++))
    fi
    
    # Create correct file
    cat > backend/Dockerfile << 'EOF'
# Todoless-ngx backend with Node.js and PostgreSQL
FROM node:20-alpine

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose backend port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --spider -q http://localhost:4000/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
EOF
    
    echo -e "${GREEN}  ✅ Backend Dockerfile fixed${NC}"
}

# Function to fix environment files
fix_env_files() {
    echo -e "${BLUE}Checking environment files...${NC}"
    
    if [ ! -f .env.development ]; then
        echo "  Creating .env.development..."
        echo "VITE_API_URL=http://localhost:4000" > .env.development
        echo -e "${GREEN}  ✅ .env.development created${NC}"
        ((FIXED++))
    fi
    
    if [ ! -f .env.production ]; then
        echo "  Creating .env.production..."
        echo "VITE_API_URL=" > .env.production
        echo -e "${GREEN}  ✅ .env.production created${NC}"
        ((FIXED++))
    fi
    
    if [ ! -f .env ]; then
        echo "  Creating .env from template..."
        cp .env.example .env 2>/dev/null || echo "# Created by auto-fix" > .env
        echo -e "${YELLOW}  ⚠️  .env created - EDIT THIS FILE to set passwords!${NC}"
        ((FIXED++))
    fi
}

# Function to fix dockerignore
fix_dockerignore() {
    echo -e "${BLUE}Checking .dockerignore files...${NC}"
    
    if [ ! -f .dockerignore ]; then
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
        ((FIXED++))
    fi
    
    if [ ! -f backend/.dockerignore ]; then
        cat > backend/.dockerignore << 'EOF'
node_modules
.git
.env
*.log
.DS_Store
Dockerfile
EOF
        echo -e "${GREEN}  ✅ backend/.dockerignore created${NC}"
        ((FIXED++))
    fi
}

# Run fixes
echo "Step 1: Dockerfiles"
fix_frontend_dockerfile
fix_backend_dockerfile

echo ""
echo "Step 2: Environment files"
fix_env_files

echo ""
echo "Step 3: Docker ignore files"
fix_dockerignore

echo ""
echo "=============================="

if [ $FIXED -gt 0 ]; then
    echo -e "${GREEN}✅ Fixed $FIXED issue(s)${NC}"
else
    echo -e "${GREEN}✅ No issues found - everything looks good!${NC}"
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""

# Check if running
if docker ps | grep -q todoless-ngx; then
    echo "Docker containers are running. Rebuilding..."
    echo ""
    echo "Run these commands:"
    echo "  docker-compose down"
    echo "  docker-compose build --no-cache"
    echo "  docker-compose up -d"
else
    echo "Choose how to run:"
    echo ""
    echo "Option 1: Docker Compose (Production)"
    echo "  docker-compose build"
    echo "  docker-compose up -d"
    echo ""
    echo "Option 2: Development Mode"
    echo "  ./dev.sh"
    echo "  cd backend && npm run dev (new terminal)"
    echo "  npm run dev (new terminal)"
fi

echo ""
echo "Then verify with:"
echo "  ./verify.sh"
echo ""
