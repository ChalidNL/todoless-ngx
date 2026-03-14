#!/bin/bash

# ========================================
# Build and Push Todoless-ngx Docker Images
# For CasaOS Deployment
# ========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Todoless-ngx Docker Image Builder                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ----------------------------------------
# Configuration
# ----------------------------------------

# Default registry (change this to your registry)
REGISTRY="${REGISTRY:-ghcr.io/YOUR-USERNAME}"
VERSION="${VERSION:-latest}"
APP_NAME="todoless-ngx"

echo -e "${YELLOW}Registry:${NC} $REGISTRY"
echo -e "${YELLOW}Version:${NC} $VERSION"
echo ""

# Check if registry is set
if [[ "$REGISTRY" == *"YOUR-USERNAME"* ]]; then
    echo -e "${RED}⚠️  ERROR: Please set your registry first!${NC}"
    echo ""
    echo "Options:"
    echo "1. Edit this script and change REGISTRY variable"
    echo "2. Set environment variable:"
    echo "   export REGISTRY=ghcr.io/your-username"
    echo "   export REGISTRY=docker.io/your-username"
    echo "   export REGISTRY=your-private-registry.com"
    echo ""
    exit 1
fi

# ----------------------------------------
# Build Images
# ----------------------------------------

echo -e "${BLUE}Step 1: Building Docker Images${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
docker build \
    -t ${REGISTRY}/${APP_NAME}-frontend:${VERSION} \
    -t ${REGISTRY}/${APP_NAME}-frontend:latest \
    -f Dockerfile.frontend \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

echo ""

# Build backend
echo -e "${YELLOW}Building backend...${NC}"
docker build \
    -t ${REGISTRY}/${APP_NAME}-backend:${VERSION} \
    -t ${REGISTRY}/${APP_NAME}-backend:latest \
    -f Dockerfile.backend \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend built successfully${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All images built successfully!${NC}"
echo ""

# ----------------------------------------
# List Built Images
# ----------------------------------------

echo -e "${BLUE}Built Images:${NC}"
docker images | grep ${APP_NAME} | head -4
echo ""

# ----------------------------------------
# Push Images
# ----------------------------------------

read -p "$(echo -e ${YELLOW}Push images to registry? [y/N]:${NC} )" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Step 2: Pushing Docker Images${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check if logged in to registry
    echo -e "${YELLOW}Checking registry authentication...${NC}"
    
    # Push frontend
    echo -e "${YELLOW}Pushing frontend...${NC}"
    docker push ${REGISTRY}/${APP_NAME}-frontend:${VERSION}
    docker push ${REGISTRY}/${APP_NAME}-frontend:latest
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend pushed successfully${NC}"
    else
        echo -e "${RED}❌ Frontend push failed${NC}"
        echo ""
        echo "You may need to login to your registry first:"
        echo "  docker login ghcr.io"
        echo "  docker login docker.io"
        exit 1
    fi
    
    echo ""
    
    # Push backend
    echo -e "${YELLOW}Pushing backend...${NC}"
    docker push ${REGISTRY}/${APP_NAME}-backend:${VERSION}
    docker push ${REGISTRY}/${APP_NAME}-backend:latest
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backend pushed successfully${NC}"
    else
        echo -e "${RED}❌ Backend push failed${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ All images pushed successfully!${NC}"
    echo ""
fi

# ----------------------------------------
# Generate docker-compose snippet
# ----------------------------------------

echo ""
echo -e "${BLUE}Step 3: Update docker-compose.yml${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}Replace the 'build:' sections in docker-compose.yml with:${NC}"
echo ""

cat << EOF
${BLUE}backend:${NC}
  # build:
  #   context: .
  #   dockerfile: Dockerfile.backend
  image: ${REGISTRY}/${APP_NAME}-backend:latest
  # ... rest of config

${BLUE}frontend:${NC}
  # build:
  #   context: .
  #   dockerfile: Dockerfile.frontend
  image: ${REGISTRY}/${APP_NAME}-frontend:latest
  # ... rest of config
EOF

echo ""
echo -e "${YELLOW}Or create docker-compose.production.yml:${NC}"

cat > docker-compose.production.yml << EOF
# Production docker-compose for CasaOS
# Uses pre-built images from registry

version: "3.8"

services:
  db:
    image: postgres:16-alpine
    container_name: todoless-ngx-db
    restart: unless-stopped
    networks:
      - todoless-network
    environment:
      POSTGRES_DB: \${DB_NAME:-todoless}
      POSTGRES_USER: \${DB_USER:-todoless}
      POSTGRES_PASSWORD: \${DB_PASSWORD:?Database password must be set}
    volumes:
      - todoless-db-data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d:ro
      - ./init.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER:-todoless}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: ${REGISTRY}/${APP_NAME}-backend:latest
    container_name: todoless-ngx-backend
    restart: unless-stopped
    networks:
      - todoless-network
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 4000
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: \${DB_NAME:-todoless}
      DB_USER: \${DB_USER:-todoless}
      DB_PASSWORD: \${DB_PASSWORD:?Database password must be set}
      JWT_SECRET: \${JWT_SECRET:?JWT secret must be set}
      CORS_ORIGIN: \${CORS_ORIGIN:-*}
      WS_ENABLED: "true"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:4000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 60s

  frontend:
    image: ${REGISTRY}/${APP_NAME}-frontend:latest
    container_name: todoless-ngx-frontend
    restart: unless-stopped
    ports:
      - "\${FRONTEND_PORT:-80}:80"
    networks:
      - todoless-network
    depends_on:
      backend:
        condition: service_healthy
    labels:
      casaos.name: "To Do Less"
      casaos.icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/tasks.png"
      casaos.description: "Self-hosted multi-user task management"
      casaos.category: "Productivity"
      casaos.port.map: "\${FRONTEND_PORT:-80}:80"
      casaos.main: "frontend"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 5s
      retries: 3

volumes:
  todoless-db-data:
    driver: local

networks:
  todoless-network:
    driver: bridge
EOF

echo -e "${GREEN}✅ Created docker-compose.production.yml${NC}"
echo ""

# ----------------------------------------
# Summary
# ----------------------------------------

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    🎉 BUILD COMPLETE! 🎉                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}Images built:${NC}"
echo "  • ${REGISTRY}/${APP_NAME}-frontend:latest"
echo "  • ${REGISTRY}/${APP_NAME}-backend:latest"
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Images available at:${NC}"
    echo "  ${REGISTRY}/${APP_NAME}-frontend:latest"
    echo "  ${REGISTRY}/${APP_NAME}-backend:latest"
    echo ""
fi

echo -e "${YELLOW}Next steps for CasaOS deployment:${NC}"
echo ""
echo "1. Upload to CasaOS:"
echo "   • Copy docker-compose.production.yml to CasaOS"
echo "   • Or use CasaOS web UI to import"
echo ""
echo "2. Create .env file on CasaOS:"
echo "   • Copy .env.example to .env"
echo "   • Set DB_PASSWORD and JWT_SECRET"
echo ""
echo "3. Start services:"
echo "   docker-compose -f docker-compose.production.yml up -d"
echo ""
echo "4. Generate invite code:"
echo "   docker-compose exec backend node -e \"console.log(Math.random().toString().slice(2,8))\""
echo ""
echo "5. Access app:"
echo "   http://your-casaos-ip/"
echo ""

echo -e "${BLUE}Full deployment guide: README-casaos.md${NC}"
echo ""
