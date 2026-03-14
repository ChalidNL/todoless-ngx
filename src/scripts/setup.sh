#!/bin/bash

# Todoless Setup Script
# This script helps you set up Todoless with Supabase

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Todoless + Supabase Self-Hosted Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists"
    read -p "   Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   Keeping existing .env file"
        USE_EXISTING_ENV=true
    fi
fi

if [ "$USE_EXISTING_ENV" != true ]; then
    echo "📝 Creating .env file..."
    
    # Generate random JWT secret
    echo "   Generating JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Generate random Postgres password
    echo "   Generating PostgreSQL password..."
    POSTGRES_PASSWORD=$(openssl rand -base64 32)
    
    # Generate JWT tokens using Node.js script
    echo "   Generating API keys..."
    
    # Create temporary Node.js script inline
    ANON_KEY=$(node -e "
    const crypto = require('crypto');
    function base64url(input) {
      return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    function generateJWT(secret, payload) {
      const header = { alg: 'HS256', typ: 'JWT' };
      const encodedHeader = base64url(Buffer.from(JSON.stringify(header)));
      const encodedPayload = base64url(Buffer.from(JSON.stringify(payload)));
      const signature = crypto.createHmac('sha256', secret).update(\`\${encodedHeader}.\${encodedPayload}\`).digest();
      const encodedSignature = base64url(signature);
      return \`\${encodedHeader}.\${encodedPayload}.\${encodedSignature}\`;
    }
    const payload = {
      iss: 'supabase',
      role: 'anon',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60)
    };
    console.log(generateJWT('$JWT_SECRET', payload));
    ")
    
    SERVICE_ROLE_KEY=$(node -e "
    const crypto = require('crypto');
    function base64url(input) {
      return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    function generateJWT(secret, payload) {
      const header = { alg: 'HS256', typ: 'JWT' };
      const encodedHeader = base64url(Buffer.from(JSON.stringify(header)));
      const encodedPayload = base64url(Buffer.from(JSON.stringify(payload)));
      const signature = crypto.createHmac('sha256', secret).update(\`\${encodedHeader}.\${encodedPayload}\`).digest();
      const encodedSignature = base64url(signature);
      return \`\${encodedHeader}.\${encodedPayload}.\${encodedSignature}\`;
    }
    const payload = {
      iss: 'supabase',
      role: 'service_role',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60)
    };
    console.log(generateJWT('$JWT_SECRET', payload));
    ")
    
    # Copy .env.example to .env
    cp .env.example .env
    
    # Replace placeholders
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|" .env
        sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
        sed -i '' "s|ANON_KEY=.*|ANON_KEY=$ANON_KEY|" .env
        sed -i '' "s|SERVICE_ROLE_KEY=.*|SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY|" .env
    else
        # Linux
        sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|" .env
        sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
        sed -i "s|ANON_KEY=.*|ANON_KEY=$ANON_KEY|" .env
        sed -i "s|SERVICE_ROLE_KEY=.*|SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY|" .env
    fi
    
    echo "✅ .env file created with secure random values"
fi

echo ""
echo "🐳 Starting Supabase services..."
echo ""

# Start Supabase stack
docker-compose -f docker-compose.supabase.yml up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.supabase.yml ps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Access your services:"
echo ""
echo "   Todoless App:      http://localhost:3000"
echo "   Supabase Studio:   http://localhost:3010"
echo "   Supabase API:      http://localhost:8000"
echo "   PostgreSQL:        localhost:5432"
echo ""
echo "📚 Next steps:"
echo ""
echo "   1. Visit http://localhost:3010 to access Supabase Studio"
echo "   2. Visit http://localhost:3000 to start using Todoless"
echo "   3. Check logs: docker-compose -f docker-compose.supabase.yml logs -f"
echo ""
echo "⚠️  IMPORTANT:"
echo "   • Your credentials are in the .env file"
echo "   • Keep the SERVICE_ROLE_KEY secret!"
echo "   • Backup your database regularly"
echo ""
echo "📖 Read README_SUPABASE.md for detailed documentation"
echo ""
