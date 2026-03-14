#!/bin/bash

# Simple start script for todoless-ngx

set -e

echo "🚀 Starting todoless-ngx..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    
    # Generate random passwords
    DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    # Update .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/CHANGE_ME_TO_SECURE_PASSWORD/${DB_PASS}/" .env
        sed -i '' "s/CHANGE_ME_TO_SECURE_JWT_SECRET/${JWT_SECRET}/" .env
    else
        sed -i "s/CHANGE_ME_TO_SECURE_PASSWORD/${DB_PASS}/" .env
        sed -i "s/CHANGE_ME_TO_SECURE_JWT_SECRET/${JWT_SECRET}/" .env
    fi
    
    echo "✅ Created .env with secure passwords"
    echo ""
fi

# Start services
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "✅ Services started!"
echo ""
echo "📊 Status:"
docker-compose ps
echo ""
echo "⏳ Waiting for services to be ready (30 seconds)..."
sleep 30
echo ""
echo "🎉 Ready!"
echo ""
echo "📱 Open: http://localhost/"
echo ""
echo "🎫 Generate invite code:"
echo "   docker-compose exec backend node -e \"console.log(Math.random().toString().slice(2,8))\""
echo ""
