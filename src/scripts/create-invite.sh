#!/bin/bash

# Create invite code script
# Usage: ./scripts/create-invite.sh [max_uses] [days_valid]

MAX_USES="${1:-1}"
DAYS_VALID="${2:-30}"

echo "Creating invite code..."
echo "Max uses: $MAX_USES"
echo "Valid for: $DAYS_VALID days"
echo ""

docker exec -i todoless-ngx-backend node -e "
const { query } = require('./database');

(async () => {
  try {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + $DAYS_VALID);
    
    const result = await query(\`
      INSERT INTO invite_codes (code, max_uses, current_uses, expires_at)
      VALUES (\$1, \$2, 0, \$3)
      RETURNING id, code, max_uses, expires_at
    \`, [code, $MAX_USES, expiresAt]);

    const invite = result.rows[0];
    
    console.log('✅ Invite code created successfully!');
    console.log('');
    console.log('Code:', invite.code);
    console.log('Max uses:', invite.max_uses);
    console.log('Expires:', invite.expires_at);
    console.log('');
    console.log('Share this link:');
    console.log('http://localhost:3000?invite=' + invite.code);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
"
