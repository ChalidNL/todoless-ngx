#!/bin/bash

# ========================================
# ULTIMATE START SCRIPT
# Run this to begin deployment
# ========================================

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║                    TODOLESS-NGX FOR CASAOS                       ║
║                                                                  ║
║                    ✅ All files are ready!                       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

📦 DELIVERABLES CHECKLIST

Core Files:
  ✅ Dockerfile.frontend      - Multi-stage React/Nginx build
  ✅ Dockerfile.backend       - Production Node.js with auto-migrations
  ✅ docker-compose.yml       - CasaOS-compatible orchestration
  ✅ nginx.conf              - API proxy + WebSocket support
  ✅ .env.example            - Complete environment template

Documentation:
  ✅ README-casaos.md        - Complete deployment guide
  ✅ CASAOS-CHECKLIST.md     - Step-by-step checklist  
  ✅ DELIVERABLES.md         - This complete overview

Scripts:
  ✅ deploy-to-casaos.sh     - Interactive deployment wizard
  ✅ build-and-push.sh       - Build and push images
  ✅ test-deployment.sh      - Verify deployment works

╔══════════════════════════════════════════════════════════════════╗
║                      CHOOSE YOUR PATH                            ║
╚══════════════════════════════════════════════════════════════════╝

EOF

echo "What would you like to do?"
echo ""
echo "  1) 🏠 Deploy to CasaOS (complete workflow)"
echo "  2) 💻 Test locally first"
echo "  3) 🔨 Build and push images only"
echo "  4) 📚 Read documentation"
echo "  5) ✅ Run deployment test"
echo ""
read -p "Enter choice [1-5]: " -n 1 -r CHOICE
echo ""
echo ""

case $CHOICE in
    1)
        echo "Starting CasaOS deployment workflow..."
        echo ""
        chmod +x deploy-to-casaos.sh
        ./deploy-to-casaos.sh
        ;;
    2)
        echo "Setting up local test deployment..."
        echo ""
        
        # Check .env
        if [ ! -f .env ]; then
            echo "Creating .env from template..."
            cp .env.example .env
            
            # Generate passwords
            DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
            JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
            
            sed -i.bak "s/CHANGE_ME_TO_SECURE_PASSWORD_HERE/${DB_PASSWORD}/" .env
            sed -i.bak "s/CHANGE_ME_TO_SECURE_JWT_SECRET_HERE/${JWT_SECRET}/" .env
            rm .env.bak 2>/dev/null || true
            
            echo "✅ Created .env with secure passwords"
        fi
        
        echo ""
        echo "Building and starting services..."
        docker-compose up -d
        
        echo ""
        echo "⏳ Waiting 60 seconds for services to start..."
        sleep 60
        
        echo ""
        echo "Running tests..."
        chmod +x test-deployment.sh
        ./test-deployment.sh
        ;;
    3)
        echo "Building and pushing images..."
        echo ""
        chmod +x build-and-push.sh
        ./build-and-push.sh
        ;;
    4)
        echo "📚 Documentation Files:"
        echo ""
        echo "Main Guides:"
        echo "  • README-casaos.md        - Complete CasaOS deployment guide"
        echo "  • CASAOS-CHECKLIST.md     - Step-by-step deployment checklist"
        echo "  • DELIVERABLES.md         - Complete file overview"
        echo ""
        echo "Quick References:"
        echo "  • .env.example            - Environment variables"
        echo "  • docker-compose.yml      - Service orchestration"
        echo ""
        read -p "Open README-casaos.md? [y/N]: " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v less &> /dev/null; then
                less README-casaos.md
            elif command -v more &> /dev/null; then
                more README-casaos.md
            else
                cat README-casaos.md
            fi
        fi
        ;;
    5)
        echo "Running deployment test..."
        echo ""
        chmod +x test-deployment.sh
        ./test-deployment.sh
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    NEED MORE HELP?                               ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📖 Read: README-casaos.md"
echo "✅ Check: CASAOS-CHECKLIST.md"
echo "📋 Review: DELIVERABLES.md"
echo ""
echo "Or run this script again: ./START-DEPLOYMENT.sh"
echo ""
