#!/bin/bash

# Create admin user script
# Usage: ./scripts/create-admin.sh [email] [password] [name]

EMAIL="${1:-admin@local}"
PASSWORD="${2:-admin123}"
NAME="${3:-Admin}"

echo "Creating admin user..."
echo "Email: $EMAIL"
echo "Password: $PASSWORD"
echo "Name: $NAME"
echo ""

docker exec -i todoless-ngx-backend node -e "
const bcrypt = require('bcryptjs');
const { query } = require('./database');

(async () => {
  try {
    const passwordHash = await bcrypt.hash('$PASSWORD', 10);
    
    const result = await query(\`
      INSERT INTO users (email, name, password_hash, role)
      VALUES (\$1, \$2, \$3, 'admin')
      RETURNING id, email, name, role
    \`, ['$EMAIL', '$NAME', passwordHash]);

    const user = result.rows[0];
    
    await query('INSERT INTO app_settings (user_id) VALUES (\$1)', [user.id]);
    
    console.log('✅ Admin user created successfully!');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
"

echo ""
echo "You can now login with:"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
