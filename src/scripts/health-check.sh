#!/bin/bash

echo "🏥 Todoless-ngx Health Check"
echo "============================"
echo ""

# Check if containers are running
echo "📦 Container Status:"
docker-compose ps

echo ""
echo "🔍 Detailed Health:"
echo ""

# Check database
echo -n "Database (PostgreSQL): "
if docker exec todoless-ngx-db pg_isready -U todoless -d todoless > /dev/null 2>&1; then
  echo "✅ Healthy"
else
  echo "❌ Unhealthy"
fi

# Check backend
echo -n "Backend API: "
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/health)
if [ "$BACKEND_HEALTH" = "200" ]; then
  echo "✅ Healthy"
else
  echo "❌ Unhealthy (HTTP $BACKEND_HEALTH)"
fi

# Check frontend
echo -n "Frontend: "
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_HEALTH" = "200" ]; then
  echo "✅ Healthy"
else
  echo "❌ Unhealthy (HTTP $FRONTEND_HEALTH)"
fi

echo ""
echo "📊 Database Stats:"
docker exec todoless-ngx-db psql -U todoless -d todoless -c "
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM tasks) as tasks,
  (SELECT COUNT(*) FROM items) as items,
  (SELECT COUNT(*) FROM notes) as notes,
  (SELECT COUNT(*) FROM labels) as labels;
" 2>/dev/null || echo "Cannot connect to database"

echo ""
echo "💾 Disk Usage:"
docker exec todoless-ngx-db du -sh /var/lib/postgresql/data 2>/dev/null || echo "Cannot check disk usage"

echo ""
echo "🔗 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:4000/api/health"
echo ""
