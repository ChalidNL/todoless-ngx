#!/bin/bash

echo "🚀 Todoless-ngx Initial Setup"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from template..."
  cp .env.example .env
  
  # Generate random passwords
  if command -v openssl &> /dev/null; then
    DB_PASS=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-20)
    JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-40)
    
    # Update .env with generated values
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$DB_PASS/" .env
      sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    else
      # Linux
      sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$DB_PASS/" .env
      sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    fi
    
    echo "✅ Generated secure passwords automatically"
  else
    echo "⚠️  Please edit .env and change POSTGRES_PASSWORD and JWT_SECRET!"
  fi
else
  echo "✅ .env file already exists"
fi

echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
echo "   This may take 30-60 seconds..."

# Wait for database
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if docker exec todoless-ngx-db pg_isready -U todoless -d todoless > /dev/null 2>&1; then
    echo "✅ Database is ready"
    break
  fi
  echo -n "."
  sleep 2
  attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
  echo ""
  echo "❌ Database failed to start. Check logs: docker-compose logs todoless-ngx-db"
  exit 1
fi

# Wait for backend
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is ready"
    break
  fi
  echo -n "."
  sleep 2
  attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
  echo ""
  echo "❌ Backend failed to start. Check logs: docker-compose logs todoless-ngx-backend"
  exit 1
fi

echo ""
echo "✅ All services are healthy!"
echo ""

# Ask if user wants to create admin
read -p "Do you want to create an admin user now? [Y/n] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
  echo ""
  read -p "Admin email [admin@local]: " ADMIN_EMAIL
  ADMIN_EMAIL=${ADMIN_EMAIL:-admin@local}
  
  read -p "Admin password [admin123]: " ADMIN_PASSWORD
  ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
  
  read -p "Admin name [Admin]: " ADMIN_NAME
  ADMIN_NAME=${ADMIN_NAME:-Admin}
  
  echo ""
  chmod +x scripts/create-admin.sh
  ./scripts/create-admin.sh "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "$ADMIN_NAME"
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 Setup Complete!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "🌐 Open your browser:"
  echo "   http://localhost:3000"
  echo ""
  echo "🔐 Login with:"
  echo "   Email:    $ADMIN_EMAIL"
  echo "   Password: $ADMIN_PASSWORD"
  echo ""
  echo "⚠️  Remember to change the password after first login!"
  echo ""
else
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ Setup Complete!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "🌐 Frontend: http://localhost:3000"
  echo "🔌 Backend:  http://localhost:4000"
  echo ""
  echo "📝 Next steps:"
  echo "   1. Create admin user: ./scripts/create-admin.sh"
  echo "   2. Or create invite code: ./scripts/create-invite.sh"
  echo ""
fi

echo "📚 Useful commands:"
echo "   make help      - Show all available commands"
echo "   make logs      - View service logs"
echo "   make health    - Check system health"
echo "   make backup    - Backup database"
echo ""
