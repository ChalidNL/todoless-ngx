# Upgrading from SQLite to PostgreSQL

**If you previously installed Todoless-ngx with SQLite**, this guide will help you migrate to PostgreSQL.

## ⚠️ Important Notes

1. **Backup first!** - Always backup your SQLite database before migrating
2. **Downtime required** - Plan for 5-10 minutes of downtime
3. **Test first** - Test on a copy if you have production data

## 🔄 Migration Steps

### Step 1: Backup Current Data

```bash
# Stop current containers
docker-compose down

# Backup SQLite database
docker run --rm -v todoless-ngx-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/sqlite-backup-$(date +%Y%m%d).tar.gz /data

# Also copy the raw DB file
docker cp todoless-ngx-backend:/app/data/todoless.db ./todoless-backup.db
```

### Step 2: Export Data from SQLite

Create a script to export your data:

```bash
# Create export script
cat > export-sqlite.js << 'EOF'
const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('./todoless-backup.db', { readonly: true });

const tables = ['users', 'invite_codes', 'labels', 'shops', 'sprints', 
                'tasks', 'task_labels', 'items', 'item_labels', 
                'notes', 'note_labels', 'calendar_events', 'app_settings'];

const data = {};

tables.forEach(table => {
  data[table] = db.prepare(`SELECT * FROM ${table}`).all();
  console.log(`Exported ${data[table].length} rows from ${table}`);
});

fs.writeFileSync('export.json', JSON.stringify(data, null, 2));
console.log('\n✅ Data exported to export.json');

db.close();
EOF

# Run export (requires Node.js locally)
npm install better-sqlite3
node export-sqlite.js
```

### Step 3: Update Docker Compose

```bash
# Pull latest version with PostgreSQL
git pull origin main

# Or manually update docker-compose.yml to PostgreSQL version
```

### Step 4: Configure PostgreSQL

```bash
# Update .env file
cat >> .env << EOF

# PostgreSQL (new)
POSTGRES_DB=todoless
POSTGRES_USER=todoless
POSTGRES_PASSWORD=$(openssl rand -base64 16)
EOF
```

### Step 5: Start PostgreSQL

```bash
# Start new PostgreSQL-based stack
docker-compose up -d

# Wait for database to initialize
docker-compose logs -f todoless-ngx-db

# Wait until you see: "database system is ready to accept connections"
```

### Step 6: Import Data to PostgreSQL

Create import script:

```bash
# Create import script
cat > import-postgres.js << 'EOF'
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'localhost',
  port: 4000, // Adjust if different
  database: process.env.POSTGRES_DB || 'todoless',
  user: process.env.POSTGRES_USER || 'todoless',
  password: process.env.POSTGRES_PASSWORD,
});

const data = JSON.parse(fs.readFileSync('export.json', 'utf8'));

async function importData() {
  try {
    // Import in correct order (respecting foreign keys)
    const order = ['users', 'app_settings', 'invite_codes', 'labels', 
                   'shops', 'sprints', 'tasks', 'task_labels', 
                   'items', 'item_labels', 'notes', 'note_labels', 
                   'calendar_events'];

    for (const table of order) {
      const rows = data[table] || [];
      console.log(`Importing ${rows.length} rows to ${table}...`);

      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        await pool.query(
          `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
          values
        );
      }
      console.log(`✅ ${table} imported`);
    }

    console.log('\n✅ All data imported successfully!');
  } catch (error) {
    console.error('❌ Import error:', error);
  } finally {
    await pool.end();
  }
}

importData();
EOF

# Run import
npm install pg
node import-postgres.js
```

### Step 7: Verify Migration

```bash
# Check if data was imported
docker exec -it todoless-ngx-db psql -U todoless -d todoless

# Verify user count
SELECT COUNT(*) FROM users;

# Verify tasks count
SELECT COUNT(*) FROM tasks;

# Verify everything looks good
\dt

# Exit
\q
```

### Step 8: Test Application

```bash
# Open application
open http://localhost:3000

# Login with your existing credentials
# Verify all your data is present:
# - Tasks
# - Notes
# - Labels
# - Items
# - Settings
```

### Step 9: Cleanup (Optional)

```bash
# If everything works, remove old SQLite backup
rm todoless-backup.db
rm export.json
rm import-postgres.js
rm export-sqlite.js

# Remove old volume
docker volume rm todoless-ngx-data
```

## 🔧 Alternative: Manual SQL Export/Import

If you're comfortable with SQL:

### Export from SQLite

```bash
# Export as SQL
sqlite3 todoless-backup.db .dump > dump.sql
```

### Adapt SQL for PostgreSQL

SQLite and PostgreSQL have different syntax. You'll need to modify:

```bash
# Convert SQLite to PostgreSQL syntax
sed -i 's/INTEGER PRIMARY KEY/UUID PRIMARY KEY/g' dump.sql
sed -i 's/AUTOINCREMENT//g' dump.sql
sed -i 's/datetime('"'"'now'"'"')/NOW()/g' dump.sql

# Remove SQLite-specific commands
sed -i '/PRAGMA/d' dump.sql
sed -i '/BEGIN TRANSACTION/d' dump.sql
sed -i '/COMMIT/d' dump.sql
```

### Import to PostgreSQL

```bash
# Import modified dump
cat dump.sql | docker exec -i todoless-ngx-db psql -U todoless -d todoless
```

⚠️ **This is complex** - the JSON export/import method above is recommended.

## 🆘 Troubleshooting

### Foreign Key Violations

```bash
# Temporarily disable foreign key checks
docker exec -it todoless-ngx-db psql -U todoless -d todoless -c "
SET session_replication_role = 'replica';
-- Run your imports here
SET session_replication_role = 'origin';
"
```

### Duplicate Key Errors

If you get duplicate key errors:

```bash
# Clear PostgreSQL and start fresh
docker-compose down
docker volume rm todoless-ngx-db-data
docker-compose up -d
# Wait for initialization, then retry import
```

### UUID vs Integer IDs

SQLite used random UUIDs via crypto.randomUUID(). PostgreSQL uses gen_random_uuid(). Both are UUIDs, so IDs should be compatible.

If you have integer IDs in old version:

```bash
# Convert integer IDs to UUIDs during import
# This is complex - consider starting fresh if you have < 100 tasks
```

## 🎯 Starting Fresh (Recommended for Small Datasets)

If you have **< 100 tasks** and **< 5 users**, it might be easier to:

1. Export tasks as CSV (manually copy important data)
2. Start fresh with PostgreSQL
3. Invite users again
4. Manually recreate important tasks

This avoids migration complexity.

## ✅ Post-Migration Checklist

- [ ] All users can login
- [ ] All tasks visible
- [ ] Labels work correctly
- [ ] Private labels filter properly
- [ ] Notes are accessible
- [ ] Items list complete
- [ ] Calendar events present
- [ ] Settings preserved
- [ ] Real-time updates working (test with 2 browsers)
- [ ] Backup working (`make backup`)

## 📊 Performance Improvements After Migration

You should notice:

✅ **No more "database locked" errors**  
✅ **Real-time updates** - changes appear instantly for other users  
✅ **Faster queries** on large datasets  
✅ **No conflicts** when multiple users edit simultaneously  

## 💬 Need Help?

If you run into issues:

1. Check logs: `docker-compose logs -f`
2. Verify database: `docker exec -it todoless-ngx-db psql -U todoless -d todoless`
3. Open GitHub issue with error details

---

**🎉 Congratulations on upgrading to PostgreSQL! Your Todoless-ngx instance is now production-ready for multi-user teams.**
