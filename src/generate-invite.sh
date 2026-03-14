#!/bin/bash
set -e

echo "🎫 Generating invite code..."
echo ""

# Check if backend container is running
if ! docker ps | grep -q todoless-ngx-backend; then
    echo "❌ Backend container is not running!"
    echo "Start the application first with:"
    echo "   docker-compose up -d"
    exit 1
fi

# Generate invite code via API
echo "Connecting to backend API..."

# Create invite via direct database access (more reliable)
INVITE_CODE=$(docker exec -i todoless-ngx-db psql -U todoless -d todoless -t -c "
    INSERT INTO invite_codes (code, created_by, created_at, expires_at) 
    VALUES (
        LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
        (SELECT id FROM users ORDER BY created_at LIMIT 1),
        NOW(),
        NOW() + INTERVAL '7 days'
    ) 
    RETURNING code;" | tr -d ' \n')

if [ -z "$INVITE_CODE" ]; then
    echo "❌ Failed to generate invite code"
    exit 1
fi

echo ""
echo "✅ Invite code generated successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   INVITE CODE: $INVITE_CODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This code:"
echo "  • Is valid for 7 days"
echo "  • Can be used once"
echo "  • Allows one new user to register"
echo ""
echo "Share this code with the person you want to invite."
echo ""
