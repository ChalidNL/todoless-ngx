#!/bin/bash

echo "🔍 Todoless-ngx Verification Check"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ISSUES=0

# Check files
echo "1. Dockerfiles:"
if [ -f Dockerfile ]; then
    echo -e "  ${GREEN}✅ /Dockerfile${NC}"
else
    echo -e "  ${RED}❌ /Dockerfile missing${NC}"
    ((ISSUES++))
fi

if [ -f backend/Dockerfile ]; then
    echo -e "  ${GREEN}✅ /backend/Dockerfile${NC}"
else
    echo -e "  ${RED}❌ /backend/Dockerfile missing${NC}"
    ((ISSUES++))
fi

if [ -d Dockerfile ]; then
    echo -e "  ${RED}❌ /Dockerfile is a directory (WRONG!)${NC}"
    ((ISSUES++))
fi

if [ -d backend/Dockerfile ]; then
    echo -e "  ${RED}❌ /backend/Dockerfile is a directory (WRONG!)${NC}"
    ((ISSUES++))
fi

echo ""
echo "2. Environment files:"
[ -f .env.example ] && echo -e "  ${GREEN}✅ .env.example${NC}" || echo -e "  ${RED}❌ .env.example missing${NC}"
[ -f .env.development ] && echo -e "  ${GREEN}✅ .env.development${NC}" || { echo -e "  ${RED}❌ .env.development missing${NC}"; ((ISSUES++)); }
[ -f .env.production ] && echo -e "  ${GREEN}✅ .env.production${NC}" || { echo -e "  ${RED}❌ .env.production missing${NC}"; ((ISSUES++)); }
[ -f .env ] && echo -e "  ${GREEN}✅ .env${NC}" || echo -e "  ${YELLOW}⚠️  .env missing (create from .env.example)${NC}"

echo ""
echo "3. Scripts:"
for script in setup.sh fix-errors.sh diagnose.sh start.sh dev.sh health-check.sh generate-invite.sh build.sh; do
    [ -f "$script" ] && echo -e "  ${GREEN}✅ $script${NC}" || echo -e "  ${RED}❌ $script missing${NC}"
done

echo ""
echo "4. Docker Compose:"
[ -f docker-compose.yml ] && echo -e "  ${GREEN}✅ docker-compose.yml${NC}" || echo -e "  ${RED}❌ docker-compose.yml missing${NC}"
[ -f docker-compose.dev.yml ] && echo -e "  ${GREEN}✅ docker-compose.dev.yml${NC}" || echo -e "  ${RED}❌ docker-compose.dev.yml missing${NC}"

echo ""
echo "5. Config files:"
[ -f nginx.conf ] && echo -e "  ${GREEN}✅ nginx.conf${NC}" || echo -e "  ${RED}❌ nginx.conf missing${NC}"
[ -f vite.config.ts ] && echo -e "  ${GREEN}✅ vite.config.ts${NC}" || echo -e "  ${RED}❌ vite.config.ts missing${NC}"

echo ""
echo "6. .dockerignore:"
[ -f .dockerignore ] && echo -e "  ${GREEN}✅ .dockerignore${NC}" || { echo -e "  ${RED}❌ .dockerignore missing${NC}"; ((ISSUES++)); }
[ -f backend/.dockerignore ] && echo -e "  ${GREEN}✅ backend/.dockerignore${NC}" || { echo -e "  ${RED}❌ backend/.dockerignore missing${NC}"; ((ISSUES++)); }

echo ""
echo "7. Documentation:"
[ -f README.md ] && echo -e "  ${GREEN}✅ README.md${NC}" || echo -e "  ${YELLOW}⚠️  README.md missing${NC}"
[ -f START.md ] && echo -e "  ${GREEN}✅ START.md${NC}" || echo -e "  ${YELLOW}⚠️  START.md missing${NC}"
[ -f QUICK-FIX.md ] && echo -e "  ${GREEN}✅ QUICK-FIX.md${NC}" || echo -e "  ${YELLOW}⚠️  QUICK-FIX.md missing${NC}"

echo ""
echo "===================================="

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Ready to run:"
    echo "  ./setup.sh     - For automatic setup"
    echo "  ./start.sh     - For production"
    echo "  ./dev.sh       - For development"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Found $ISSUES issue(s)${NC}"
    echo ""
    echo "Run this to fix:"
    echo "  chmod +x setup.sh"
    echo "  ./setup.sh"
    echo ""
    exit 1
fi
