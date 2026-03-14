#!/bin/bash
set -e

echo "🚀 Starting Todoless-ngx..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and change:"
    echo "   - POSTGRES_PASSWORD"
    echo "   - JWT_SECRET"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if default passwords are still in use
if grep -q "change-this-secure-password" .env; then
    echo "⚠️  WARNING: You're using the default database password!"
    echo "Please update POSTGRES_PASSWORD in .env file"
    echo ""
fi

if grep -q "change-this-to-a-secure-random-string" .env; then
    echo "⚠️  WARNING: You're using the default JWT secret!"
    echo "Please update JWT_SECRET in .env file"
    echo ""
fi

# Start containers
echo "📦 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check status
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🔍 Health Checks:"

# Check database
echo -n "Database: "
if docker exec todoless-ngx-db pg_isready -U todoless -d todoless > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Not Ready"
fi

# Check backend
echo -n "Backend:  "
if docker exec todoless-ngx-backend wget -q -O- http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Not Ready"
fi

# Check frontend
echo -n "Frontend: "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not Ready"
fi

echo ""
echo "🎉 Todoless-ngx is starting!"
echo ""
echo "📍 Access the app at: http://localhost:3000"
echo ""
echo "📝 Useful commands:"
echo "   View logs:      docker-compose logs -f"
echo "   Stop app:       docker-compose down"
echo "   Restart:        docker-compose restart"
echo "   Reset data:     docker-compose down -v"
echo ""
