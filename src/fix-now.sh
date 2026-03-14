#!/bin/bash

set -e  # Exit on error

echo "🔧 Todoless-ngx Quick Fix"
echo "========================="
echo ""

# Step 1: Stop everything
echo "1️⃣  Stopping all containers..."
docker-compose down
echo "✅ Stopped"
echo ""

# Step 2: Build with no cache
echo "2️⃣  Building containers (this may take 2-3 minutes)..."
docker-compose build --no-cache
echo "✅ Built"
echo ""

# Step 3: Start services
echo "3️⃣  Starting services..."
docker-compose up -d
echo "✅ Started"
echo ""

# Step 4: Wait for services
echo "4️⃣  Waiting for services to be ready (60 seconds)..."
for i in {60..1}; do
    printf "\r   ⏳ %02d seconds remaining..." $i
    sleep 1
done
echo ""
echo "✅ Wait complete"
echo ""

# Step 5: Check status
echo "5️⃣  Checking container status..."
docker-compose ps
echo ""

# Step 6: Test backend
echo "6️⃣  Testing backend connection..."
BACKEND_TEST=$(curl -s http://localhost:4000/api/health 2>&1 || echo "FAILED")
if echo "$BACKEND_TEST" | grep -q "status"; then
    echo "✅ Backend is responding: $BACKEND_TEST"
else
    echo "❌ Backend test failed: $BACKEND_TEST"
    echo ""
    echo "Backend logs:"
    docker-compose logs --tail=30 todoless-ngx-backend
    exit 1
fi
echo ""

# Step 7: Test proxy
echo "7️⃣  Testing nginx proxy..."
PROXY_TEST=$(curl -s http://localhost:3000/api/health 2>&1 || echo "FAILED")
if echo "$PROXY_TEST" | grep -q "status"; then
    echo "✅ Nginx proxy is working: $PROXY_TEST"
elif echo "$PROXY_TEST" | grep -q "<!DOCTYPE"; then
    echo "❌ PROBLEM: Nginx is returning HTML instead of JSON"
    echo "   This means the proxy is not configured correctly"
    echo ""
    echo "Nginx config:"
    docker exec todoless-ngx-frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo "Cannot read nginx config"
    exit 1
else
    echo "❌ Proxy test failed: $PROXY_TEST"
    exit 1
fi
echo ""

# Step 8: Check WebSocket
echo "8️⃣  Checking WebSocket support..."
WS_CHECK=$(echo "$BACKEND_TEST" | grep -o '"websocket":"[^"]*"' || echo "not found")
if echo "$WS_CHECK" | grep -q "enabled"; then
    echo "✅ WebSocket is enabled"
else
    echo "⚠️  WebSocket status unclear: $WS_CHECK"
fi
echo ""

# Success!
echo "=========================================="
echo "✨ SUCCESS! Everything is working!"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Create admin user (if not exists):"
echo "   chmod +x scripts/create-admin.sh"
echo "   ./scripts/create-admin.sh admin@local admin123 Admin"
echo ""
echo "2. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "3. Login with:"
echo "   Email: admin@local"
echo "   Password: admin123"
echo ""
echo "4. Check browser console (F12) for:"
echo "   ✅ WebSocket connected"
echo ""
echo "=========================================="
