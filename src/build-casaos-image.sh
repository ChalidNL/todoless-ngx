#!/bin/bash

# ========================================
# Build and Push To Do Less Frontend Image
# For CasaOS Deployment
# ========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║  To Do Less - CasaOS Image Builder    ║"
echo "╔════════════════════════════════════════╗"
echo -e "${NC}"

# ----------------------------------------
# Check Prerequisites
# ----------------------------------------
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is ready${NC}"

# ----------------------------------------
# Configuration
# ----------------------------------------
echo ""
echo -e "${BLUE}Choose your container registry:${NC}"
echo "1) GitHub Container Registry (ghcr.io) - Recommended"
echo "2) Docker Hub (docker.io)"
echo "3) Custom registry"
read -p "Enter choice [1-3]: " REGISTRY_CHOICE

case $REGISTRY_CHOICE in
    1)
        read -p "Enter your GitHub username: " USERNAME
        REGISTRY="ghcr.io/${USERNAME}"
        echo ""
        echo -e "${YELLOW}You'll need a GitHub Personal Access Token with 'write:packages' scope${NC}"
        echo "Create one at: https://github.com/settings/tokens/new?scopes=write:packages"
        echo ""
        read -p "Enter your GitHub token: " -s GITHUB_TOKEN
        echo ""
        echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$USERNAME" --password-stdin
        ;;
    2)
        read -p "Enter your Docker Hub username: " USERNAME
        REGISTRY="${USERNAME}"
        echo ""
        read -p "Enter your Docker Hub password: " -s DOCKER_PASSWORD
        echo ""
        echo "$DOCKER_PASSWORD" | docker login -u "$USERNAME" --password-stdin
        ;;
    3)
        read -p "Enter your registry URL (e.g., registry.example.com/username): " REGISTRY
        echo ""
        read -p "Username: " USERNAME
        read -p "Password: " -s PASSWORD
        echo ""
        echo "$PASSWORD" | docker login "${REGISTRY%%/*}" -u "$USERNAME" --password-stdin
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Version tag
read -p "Enter version tag (default: 1.0.0): " VERSION
VERSION=${VERSION:-1.0.0}

IMAGE_NAME="${REGISTRY}/todoless-frontend"
FULL_IMAGE="${IMAGE_NAME}:${VERSION}"

echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  Image: ${FULL_IMAGE}"
echo "  Dockerfile: Dockerfile.casaos"
echo ""

# ----------------------------------------
# Build Image
# ----------------------------------------
echo -e "${YELLOW}Building Docker image...${NC}"
echo ""

docker build \
    -f Dockerfile.casaos \
    -t "${FULL_IMAGE}" \
    -t "${IMAGE_NAME}:latest" \
    --platform linux/amd64,linux/arm64 \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    .

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Image built successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# ----------------------------------------
# Push Image
# ----------------------------------------
echo ""
read -p "Push image to registry? [Y/n]: " PUSH_CONFIRM
PUSH_CONFIRM=${PUSH_CONFIRM:-Y}

if [[ "$PUSH_CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Pushing ${FULL_IMAGE}...${NC}"
    docker push "${FULL_IMAGE}"
    
    echo -e "${YELLOW}Pushing ${IMAGE_NAME}:latest...${NC}"
    docker push "${IMAGE_NAME}:latest"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Image pushed successfully${NC}"
    else
        echo -e "${RED}❌ Push failed${NC}"
        exit 1
    fi
fi

# ----------------------------------------
# Update docker-compose.yml
# ----------------------------------------
echo ""
read -p "Update docker-compose.yml with this image? [Y/n]: " UPDATE_COMPOSE
UPDATE_COMPOSE=${UPDATE_COMPOSE:-Y}

if [[ "$UPDATE_COMPOSE" =~ ^[Yy]$ ]]; then
    if [ -f "docker-compose.yml" ]; then
        # Backup original
        cp docker-compose.yml docker-compose.yml.backup
        
        # Replace placeholder with actual image
        sed -i.tmp "s|image: YOUR_FRONTEND_IMAGE:TAG|image: ${FULL_IMAGE}|g" docker-compose.yml
        rm -f docker-compose.yml.tmp
        
        echo -e "${GREEN}✓ docker-compose.yml updated${NC}"
        echo "  Backup saved to: docker-compose.yml.backup"
    else
        echo -e "${RED}❌ docker-compose.yml not found${NC}"
    fi
fi

# ----------------------------------------
# Summary
# ----------------------------------------
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Build Complete                     ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}Image:${NC} ${FULL_IMAGE}"
echo ""
echo -e "${BLUE}Next steps:${NC}"

if [[ "$REGISTRY_CHOICE" == "1" ]]; then
    echo "1. Make the package public on GitHub:"
    echo "   → https://github.com/${USERNAME}?tab=packages"
    echo "   → Click 'todoless-frontend' → Package settings → Make public"
    echo ""
fi

echo "2. Deploy to CasaOS:"
echo "   → Open CasaOS → App Store → Custom Install"
echo "   → Paste contents of docker-compose.yml"
echo "   → Click Install"
echo ""
echo -e "${BLUE}PocketBase Admin:${NC}"
echo "  URL: http://your-casaos-ip:port/pb/_/"
echo "  User: admin@todoless.local"
echo "  Pass: changeme123 (CHANGE THIS!)"
echo ""
echo -e "${GREEN}Done! 🎉${NC}"
