#!/bin/bash

cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║               🚀 TODOLESS-NGX QUICK FIX 🚀                     ║
║                                                                ║
║  This script will fix all your errors in one go!              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

EOF

echo "Fixing Dockerfiles and configuration..."
echo ""

# Make auto-fix executable
chmod +x auto-fix.sh 2>/dev/null || true

# Run auto-fix
./auto-fix.sh

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                      ✅ FIX COMPLETE!                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "NOW RUN ONE OF THESE:"
echo ""
echo "🐳 For Docker Compose (easiest):"
echo "   docker-compose build"
echo "   docker-compose up -d"
echo ""
echo "💻 For Development:"
echo "   chmod +x dev.sh && ./dev.sh"
echo "   # Then in new terminals:"
echo "   cd backend && npm run dev"
echo "   npm run dev"
echo ""
echo "📍 Then open: http://localhost:3000"
echo ""
