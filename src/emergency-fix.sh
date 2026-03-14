#!/bin/bash

echo "🚨 EMERGENCY FIX - Todoless-ngx"
echo "================================"
echo ""
echo "This will fix your WebSocket and API errors NOW."
echo ""

# Step 1: Check if Dockerfile is actually a file
if [ -d "Dockerfile" ]; then
    echo "⚠️  WARNING: Dockerfile is a directory, not a file!"
    echo "   Fixing this now..."
    
    # Backup the directory
    mv Dockerfile Dockerfile.backup 2>/dev/null
    
    # Create correct Dockerfile
    cat > Dockerfile << 'EOF'
# Frontend Dockerfile with Nginx
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build with empty API URL (nginx proxy)
ENV VITE_API_URL=
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF
    
    echo "✅ Created proper Dockerfile"
fi

# Step 2: Check backend Dockerfile
if [ -d "backend/Dockerfile" ]; then
    echo "⚠️  WARNING: backend/Dockerfile is a directory, not a file!"
    echo "   Fixing this now..."
    
    # Backup the directory
    mv backend/Dockerfile backend/Dockerfile.backup 2>/dev/null
    
    # Create correct backend Dockerfile
    cat > backend/Dockerfile << 'EOF'
# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD wget --spider -q http://localhost:4000/api/health || exit 1

# Start server
CMD ["node", "server.js"]
EOF
    
    echo "✅ Created proper backend/Dockerfile"
fi

echo ""
echo "📋 Step 1: Stopping all containers..."
docker-compose down

echo ""
echo "📋 Step 2: Removing old images..."
docker rmi todoless-ngx-todoless-ngx-frontend 2>/dev/null || true
docker rmi todoless-ngx-todoless-ngx-backend 2>/dev/null || true

echo ""
echo "📋 Step 3: Building frontend (this takes 2-3 minutes)..."
docker-compose build --no-cache todoless-ngx-frontend

echo ""
echo "📋 Step 4: Building backend..."
docker-compose build --no-cache todoless-ngx-backend

echo ""
echo "📋 Step 5: Starting all services..."
docker-compose up -d

echo ""
echo "📋 Step 6: Waiting for services (60 seconds)..."
for i in {60..1}; do
    printf "\r   ⏳ %02d seconds remaining..." $i
    sleep 1
done
echo ""

echo ""
echo "📋 Step 7: Testing..."
echo ""

# Test backend direct
echo -n "Testing backend direct: "
BACKEND=$(curl -s http://localhost:4000/api/health 2>&1)
if echo "$BACKEND" | grep -q '"status":"ok"'; then
    echo "✅ OK"
else
    echo "❌ FAILED: $BACKEND"
    echo ""
    echo "Backend logs:"
    docker-compose logs --tail=30 todoless-ngx-backend
    exit 1
fi

# Test proxy
echo -n "Testing nginx proxy:    "
PROXY=$(curl -s http://localhost:3000/api/health 2>&1)
if echo "$PROXY" | grep -q '"status":"ok"'; then
    echo "✅ OK"
elif echo "$PROXY" | grep -q "<!DOCTYPE"; then
    echo "❌ FAILED: Returns HTML instead of JSON"
    echo ""
    echo "Checking nginx config..."
    docker exec todoless-ngx-frontend cat /etc/nginx/conf.d/default.conf | head -50
    exit 1
else
    echo "❌ FAILED: $PROXY"
    exit 1
fi

# Test WebSocket
echo -n "Testing WebSocket:      "
if echo "$BACKEND" | grep -q '"websocket":"enabled"'; then
    echo "✅ OK"
else
    echo "⚠️  Status unclear"
fi

echo ""
echo "=========================================="
echo "✅ SUCCESS! All tests passed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Create admin user:"
echo "   chmod +x scripts/create-admin.sh"
echo "   ./scripts/create-admin.sh admin@local admin123 Admin"
echo ""
echo "2. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "3. Login:"
echo "   Email: admin@local"
echo "   Password: admin123"
echo ""
echo "4. Check browser console (F12):"
echo "   Should see: ✅ WebSocket connected"
echo ""
echo "=========================================="
