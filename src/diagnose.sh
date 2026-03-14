#!/bin/bash

echo "🔍 Todoless-ngx Diagnostics"
echo "============================"
echo ""

# Check if containers are running
echo "📦 Container Status:"
docker-compose ps
echo ""

# Test backend directly
echo "🔧 Testing Backend Direct (port 4000):"
BACKEND_DIRECT=$(curl -s http://localhost:4000/api/health 2>&1)
if echo "$BACKEND_DIRECT" | grep -q "status"; then
    echo "✅ Backend responds with JSON: $BACKEND_DIRECT"
else
    echo "❌ Backend not responding or error: $BACKEND_DIRECT"
fi
echo ""

# Test backend via proxy
echo "🔧 Testing Backend via Nginx Proxy (port 3000):"
BACKEND_PROXY=$(curl -s http://localhost:3000/api/health 2>&1)
if echo "$BACKEND_PROXY" | grep -q "status"; then
    echo "✅ Proxy works! Response: $BACKEND_PROXY"
elif echo "$BACKEND_PROXY" | grep -q "<!DOCTYPE"; then
    echo "❌ PROBLEM: Proxy returns HTML instead of JSON!"
    echo "   This means nginx is NOT proxying to backend"
    echo "   Fix: Rebuild frontend with: docker-compose build --no-cache todoless-ngx-frontend"
else
    echo "❌ Proxy error: $BACKEND_PROXY"
fi
echo ""

# Check nginx config
echo "📝 Nginx Configuration:"
if docker ps | grep -q todoless-ngx-frontend; then
    echo "Checking /api/ location order..."
    docker exec todoless-ngx-frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null | grep -A 2 "location"
else
    echo "❌ Frontend container not running"
fi
echo ""

# Check backend logs for WebSocket
echo "🔌 WebSocket Status:"
docker-compose logs --tail=20 todoless-ngx-backend 2>/dev/null | grep -i websocket
echo ""

# Network connectivity
echo "🌐 Network Test (from frontend to backend):"
if docker ps | grep -q todoless-ngx-frontend; then
    docker exec todoless-ngx-frontend wget -q -O- http://todoless-ngx-backend:4000/api/health 2>&1 | head -1
else
    echo "❌ Frontend container not running"
fi
echo ""

# Final recommendation
echo "💡 Recommendations:"
if echo "$BACKEND_PROXY" | grep -q "<!DOCTYPE"; then
    echo "   1. Run: docker-compose down"
    echo "   2. Run: docker-compose build --no-cache"
    echo "   3. Run: docker-compose up -d"
    echo "   4. Wait 60 seconds and run this script again"
elif echo "$BACKEND_PROXY" | grep -q "status"; then
    echo "   ✅ Everything looks good! Open http://localhost:3000 in browser"
else
    echo "   1. Check logs: docker-compose logs -f"
    echo "   2. Restart: docker-compose restart"
fi
