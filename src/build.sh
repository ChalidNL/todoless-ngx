#!/bin/bash
set -e

echo "🏗️  Building Todoless-ngx Docker images..."

# Build backend
echo "📦 Building backend..."
cd backend
docker build -t todoless-ngx-backend:latest .
cd ..

# Build frontend  
echo "🎨 Building frontend..."
docker build -t todoless-ngx-frontend:latest .

echo "✅ Build complete!"
echo ""
echo "To start the application:"
echo "  docker-compose up -d"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
