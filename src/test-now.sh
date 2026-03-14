#!/bin/bash

echo "🔍 Quick Test - What's Wrong?"
echo "=============================="
echo ""

# Check if containers are running
echo "1️⃣ Container Status:"
if ! docker-compose ps | grep -q "todoless-ngx-frontend"; then
    echo "   ❌ Containers not running!"
    echo "   Run: docker-compose up -d"
    exit 1
fi
docker-compose ps
echo ""

# Check if Dockerfiles are files or directories
echo "2️⃣ Dockerfile Status:"
if [ -d "Dockerfile" ]; then
    echo "   ❌ ERROR: Dockerfile is a DIRECTORY (should be a file!)"
    echo "   This is why your build is broken!"
    echo ""
    echo "   Fix: Run ./emergency-fix.sh"
    exit 1
else
    echo "   ✅ Dockerfile is a file"
fi

if [ -d "backend/Dockerfile" ]; then
    echo "   ❌ ERROR: backend/Dockerfile is a DIRECTORY (should be a file!)"
    echo "   This is why your build is broken!"
    echo ""
    echo "   Fix: Run ./emergency-fix.sh"
    exit 1
else
    echo "   ✅ backend/Dockerfile is a file"
fi
echo ""

# Test backend
echo "3️⃣ Backend Test (http://localhost:4000/api/health):"
BACKEND=$(curl -s http://localhost:4000/api/health 2>&1)
if echo "$BACKEND" | grep -q '"status"'; then
    echo "   ✅ Backend returns JSON: $BACKEND"
elif echo "$BACKEND" | grep -q "Connection refused"; then
    echo "   ❌ Backend not running or not accessible"
    echo "   Check: docker-compose logs todoless-ngx-backend"
    exit 1
else
    echo "   ❌ Backend error: $BACKEND"
    exit 1
fi
echo ""

# Test proxy
echo "4️⃣ Nginx Proxy Test (http://localhost:3000/api/health):"
PROXY=$(curl -s http://localhost:3000/api/health 2>&1)
if echo "$PROXY" | grep -q '"status"'; then
    echo "   ✅ Proxy works! Returns: $PROXY"
elif echo "$PROXY" | grep -q "<!DOCTYPE"; then
    echo "   ❌ PROBLEM FOUND!"
    echo "   Proxy returns HTML instead of JSON"
    echo ""
    echo "   This means:"
    echo "   - Nginx is NOT proxying /api/ requests to backend"
    echo "   - It's serving the React app instead"
    echo ""
    echo "   Cause:"
    echo "   - Old nginx config in container"
    echo "   - Frontend container needs rebuild"
    echo ""
    echo "   Fix:"
    echo "   ./emergency-fix.sh"
    exit 1
elif echo "$PROXY" | grep -q "Connection refused"; then
    echo "   ❌ Frontend not running or not accessible"
    echo "   Check: docker-compose logs todoless-ngx-frontend"
    exit 1
else
    echo "   ❌ Proxy error: $PROXY"
    exit 1
fi
echo ""

# Test WebSocket in backend response
echo "5️⃣ WebSocket Status:"
if echo "$BACKEND" | grep -q '"websocket":"enabled"'; then
    echo "   ✅ WebSocket is enabled on backend"
else
    echo "   ⚠️  WebSocket status not found in backend response"
    echo "   Backend might need rebuild"
fi
echo ""

# Check nginx config inside container
echo "6️⃣ Nginx Config Check:"
if docker ps | grep -q todoless-ngx-frontend; then
    echo "   Checking /api/ location order in nginx..."
    CONFIG=$(docker exec todoless-ngx-frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null)
    
    if echo "$CONFIG" | grep -B 5 "location /api/" | grep -q "location /"; then
        echo "   ❌ ERROR: / location comes BEFORE /api/ location"
        echo "   This causes nginx to serve HTML for API requests"
        echo ""
        echo "   Fix: ./emergency-fix.sh"
        exit 1
    else
        echo "   ✅ Config looks correct (/api/ before /)"
    fi
else
    echo "   ⚠️  Cannot check (frontend container not running)"
fi
echo ""

echo "=========================================="
echo "✅ All Tests Passed!"
echo "=========================================="
echo ""
echo "Your app should be working at:"
echo "http://localhost:3000"
echo ""
echo "If browser still shows errors:"
echo "1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo "2. Clear browser cache"
echo "3. Check browser console (F12) for errors"
