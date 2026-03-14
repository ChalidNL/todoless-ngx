#!/bin/bash

# Todoless-ngx - Generate Invite Code Script
# Quick script to generate invite codes

set -e

echo "========================================="
echo "  Todoless-ngx - Generate Invite Code"
echo "========================================="
echo ""

# Check if services are running
if ! docker ps | grep -q "todoless-ngx-db"; then
    echo "❌ Error: Todoless-ngx services are not running"
    echo "Please start services first with: docker-compose up -d"
    exit 1
fi

# Generate random invite code
INVITE_CODE=$(tr -dc 'A-Z0-9' < /dev/urandom | head -c 8)

# Get admin user ID (first user in database)
ADMIN_ID=$(docker exec todoless-ngx-db psql -U postgres postgres -t -c "SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1;")

if [ -z "$ADMIN_ID" ]; then
    echo "❌ Error: No users found in database"
    echo "Please create an admin user first"
    exit 1
fi

# Ask for expiration
echo "Select expiration period:"
echo "1) 7 days"
echo "2) 30 days"
echo "3) 90 days"
echo "4) 1 year"
echo "5) Never expires"
read -p "Choice (1-5): " EXPIRY_CHOICE

case $EXPIRY_CHOICE in
    1) EXPIRES_AT="NOW() + INTERVAL '7 days'" ;;
    2) EXPIRES_AT="NOW() + INTERVAL '30 days'" ;;
    3) EXPIRES_AT="NOW() + INTERVAL '90 days'" ;;
    4) EXPIRES_AT="NOW() + INTERVAL '1 year'" ;;
    5) EXPIRES_AT="NOW() + INTERVAL '100 years'" ;;
    *) echo "Invalid choice"; exit 1 ;;
esac

# Ask for max uses
read -p "Maximum uses (default: 1): " MAX_USES
MAX_USES=${MAX_USES:-1}

# Create invite code
docker exec -i todoless-ngx-db psql -U postgres postgres <<EOF
INSERT INTO public.invite_codes (code, created_by, expires_at, max_uses, current_uses)
VALUES (
  '$INVITE_CODE',
  '$ADMIN_ID'::uuid,
  $EXPIRES_AT,
  $MAX_USES,
  0
);
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Invite code created successfully!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Invite Code: $INVITE_CODE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Share this link with your team member:"
    echo "http://localhost:3000/?invite=$INVITE_CODE"
    echo ""
    echo "Or share just the code: $INVITE_CODE"
else
    echo ""
    echo "❌ Error creating invite code"
fi
