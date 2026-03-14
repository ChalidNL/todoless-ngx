#!/bin/bash
set -e

echo "🛠️  Starting Todoless-ngx in development mode..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created"
    echo ""
fi

# Start database only
echo "📦 Starting PostgreSQL database..."
docker-compose -f docker-compose.dev.yml up -d

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 3

# Check database
if docker exec todoless-ngx-db-dev pg_isready -U todoless -d todoless > /dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "⏳ Database is starting..."
    sleep 5
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Development Environment Ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Database: postgresql://todoless:todoless@localhost:5432/todoless"
echo ""
echo "Next steps:"
echo ""
echo "1. Start backend (in new terminal):"
echo "   cd backend"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "2. Start frontend (in new terminal):"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "3. Access app:"
echo "   http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Useful commands:"
echo "  Stop database:    docker-compose -f docker-compose.dev.yml down"
echo "  Database logs:    docker-compose -f docker-compose.dev.yml logs -f"
echo "  Database shell:   docker exec -it todoless-ngx-db-dev psql -U todoless -d todoless"
echo ""
