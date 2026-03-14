#!/bin/bash

# ========================================
# Complete CasaOS Deployment Workflow
# One-stop script for building and deploying
# ========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   ████████╗ ██████╗ ██████╗  ██████╗ ██╗     ███████╗███████╗███████╗
║   ╚══██╔══╝██╔═══██╗██╔══██╗██╔═══██╗██║     ██╔════╝██╔════╝██╔════╝
║      ██║   ██║   ██║██║  ██║██║   ██║██║     █████╗  ███████╗███████╗
║      ██║   ██║   ██║██║  ██║██║   ██║██║     ██╔══╝  ╚════██║╚════██║
║      ██║   ╚██████╔╝██████╔╝╚██████╔╝███████╗███████╗███████║███████║
║      ╚═╝    ╚═════╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝╚══════╝╚══════╝
║                                                                  ║
║                    CasaOS Deployment Tool                        ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${BLUE}This script will help you deploy Todoless-ngx to CasaOS${NC}"
echo ""

# ----------------------------------------
# Step 1: Choose deployment method
# ----------------------------------------

echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
echo -e "${MAGENTA}Step 1: Choose Deployment Method${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
echo ""

echo "How do you want to deploy?"
echo ""
echo "  1) Build images and push to registry (recommended for CasaOS)"
echo "  2) Local deployment only (test before pushing)"
echo "  3) Skip build, use existing images"
echo ""
read -p "Enter choice [1-3]: " -n 1 -r DEPLOY_METHOD
echo ""

# ----------------------------------------
# Step 2: Configuration
# ----------------------------------------

echo ""
echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
echo -e "${MAGENTA}Step 2: Configuration${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
    
    # Generate secure passwords
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    # Update .env
    sed -i.bak "s/CHANGE_ME_TO_SECURE_PASSWORD_HERE/${DB_PASSWORD}/" .env
    sed -i.bak "s/CHANGE_ME_TO_SECURE_JWT_SECRET_HERE/${JWT_SECRET}/" .env
    rm .env.bak 2>/dev/null || true
    
    echo -e "${GREEN}✅ Created .env with secure random passwords${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Check if passwords are set
if grep -q "CHANGE_ME" .env; then
    echo -e "${YELLOW}⚠️  Default passwords detected in .env${NC}"
    read -p "Generate new secure passwords? [Y/n]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
        sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" .env
        sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
        rm .env.bak 2>/dev/null || true
        echo -e "${GREEN}✅ Generated new secure passwords${NC}"
    fi
fi

echo ""

# ----------------------------------------
# Step 3: Build Images
# ----------------------------------------

if [ "$DEPLOY_METHOD" = "1" ] || [ "$DEPLOY_METHOD" = "2" ]; then
    echo ""
    echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
    echo -e "${MAGENTA}Step 3: Build Docker Images${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
    echo ""
    
    # Ask for registry
    if [ "$DEPLOY_METHOD" = "1" ]; then
        echo "Enter your container registry:"
        echo "  Examples:"
        echo "    - ghcr.io/yourusername"
        echo "    - docker.io/yourusername"
        echo "    - registry.example.com"
        echo ""
        read -p "Registry: " REGISTRY
        
        if [ -z "$REGISTRY" ]; then
            echo -e "${RED}❌ Registry is required for push deployment${NC}"
            exit 1
        fi
    else
        REGISTRY="local"
    fi
    
    echo ""
    echo -e "${BLUE}Building frontend image...${NC}"
    if [ "$REGISTRY" = "local" ]; then
        docker build -t todoless-ngx-frontend:latest -f Dockerfile.frontend .
    else
        docker build -t ${REGISTRY}/todoless-ngx-frontend:latest -f Dockerfile.frontend .
    fi
    echo -e "${GREEN}✅ Frontend built${NC}"
    
    echo ""
    echo -e "${BLUE}Building backend image...${NC}"
    if [ "$REGISTRY" = "local" ]; then
        docker build -t todoless-ngx-backend:latest -f Dockerfile.backend .
    else
        docker build -t ${REGISTRY}/todoless-ngx-backend:latest -f Dockerfile.backend .
    fi
    echo -e "${GREEN}✅ Backend built${NC}"
    
    # ----------------------------------------
    # Step 4: Push Images
    # ----------------------------------------
    
    if [ "$DEPLOY_METHOD" = "1" ]; then
        echo ""
        echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
        echo -e "${MAGENTA}Step 4: Push to Registry${NC}"
        echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
        echo ""
        
        echo -e "${BLUE}Pushing images to ${REGISTRY}...${NC}"
        
        docker push ${REGISTRY}/todoless-ngx-frontend:latest
        echo -e "${GREEN}✅ Frontend pushed${NC}"
        
        docker push ${REGISTRY}/todoless-ngx-backend:latest
        echo -e "${GREEN}✅ Backend pushed${NC}"
        
        # Create production compose file
        echo ""
        echo -e "${BLUE}Creating docker-compose.production.yml...${NC}"
        
        sed "s|image: todoless-ngx-frontend:latest|image: ${REGISTRY}/todoless-ngx-frontend:latest|g" docker-compose.yml | \
        sed "s|image: todoless-ngx-backend:latest|image: ${REGISTRY}/todoless-ngx-backend:latest|g" | \
        sed "s|build:|# build:|g" | \
        sed "s|context:|# context:|g" | \
        sed "s|dockerfile:|# dockerfile:|g" \
        > docker-compose.production.yml
        
        echo -e "${GREEN}✅ Created docker-compose.production.yml${NC}"
    fi
fi

# ----------------------------------------
# Step 5: Deploy Locally
# ----------------------------------------

if [ "$DEPLOY_METHOD" = "2" ] || [ "$DEPLOY_METHOD" = "3" ]; then
    echo ""
    echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
    echo -e "${MAGENTA}Step 5: Deploy Locally${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
    echo ""
    
    echo -e "${BLUE}Starting services with docker-compose...${NC}"
    docker-compose up -d
    
    echo ""
    echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
    sleep 10
    
    # Check services
    echo ""
    docker-compose ps
    
    echo ""
    echo -e "${BLUE}Waiting for health checks (60 seconds)...${NC}"
    sleep 60
    
    # Test deployment
    echo ""
    echo -e "${BLUE}Testing deployment...${NC}"
    chmod +x test-deployment.sh 2>/dev/null || true
    ./test-deployment.sh || true
fi

# ----------------------------------------
# Final Instructions
# ----------------------------------------

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    🎉 DEPLOYMENT READY! 🎉                       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$DEPLOY_METHOD" = "1" ]; then
    echo -e "${GREEN}✅ Images built and pushed to registry${NC}"
    echo ""
    echo -e "${YELLOW}Next steps for CasaOS deployment:${NC}"
    echo ""
    echo "1. Upload files to CasaOS:"
    echo "   • docker-compose.production.yml"
    echo "   • .env"
    echo ""
    echo "2. On CasaOS, navigate to app directory:"
    echo "   cd /DATA/AppData/todoless-ngx"
    echo ""
    echo "3. Start services:"
    echo "   docker-compose -f docker-compose.production.yml up -d"
    echo ""
    echo "4. Wait 60 seconds, then verify:"
    echo "   docker-compose ps"
    echo ""
    echo "5. Generate first invite code:"
    echo "   docker-compose exec backend node -e \"console.log(Math.random().toString().slice(2,8))\""
    echo ""
    echo "6. Open in browser:"
    echo "   http://your-casaos-ip/"
    echo ""
    echo -e "${BLUE}Full guide: README-casaos.md${NC}"
    
elif [ "$DEPLOY_METHOD" = "2" ]; then
    echo -e "${GREEN}✅ Local deployment complete${NC}"
    echo ""
    echo "Services are running!"
    echo ""
    echo "Generate invite code:"
    echo "  docker-compose exec backend node -e \"console.log(Math.random().toString().slice(2,8))\""
    echo ""
    echo "Access app:"
    echo "  http://localhost/"
    echo ""
    echo "View logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "When ready to deploy to CasaOS, run this script again with option 1"
    
else
    echo -e "${GREEN}✅ Using existing images${NC}"
    echo ""
    echo "Make sure your images are available in your registry"
    echo ""
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
