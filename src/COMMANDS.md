# Todoless - Command Reference

Handige commando's voor daily gebruik van Todoless met Supabase.

## 🚀 Quick Start

```bash
# Eerste keer setup
./scripts/setup.sh

# Daarna gewoon:
docker-compose -f docker-compose.supabase.yml up -d
```

## 📦 Docker Commands

### Service Management

```bash
# Start alles
docker-compose -f docker-compose.supabase.yml up -d

# Stop alles
docker-compose -f docker-compose.supabase.yml down

# Stop en verwijder volumes (⚠️ verwijdert data!)
docker-compose -f docker-compose.supabase.yml down -v

# Restart een specifieke service
docker-compose -f docker-compose.supabase.yml restart todoless
docker-compose -f docker-compose.supabase.yml restart db

# Rebuild en restart
docker-compose -f docker-compose.supabase.yml up -d --build
```

### Logs & Monitoring

```bash
# Alle logs (follow mode)
docker-compose -f docker-compose.supabase.yml logs -f

# Specifieke service logs
docker-compose -f docker-compose.supabase.yml logs -f db
docker-compose -f docker-compose.supabase.yml logs -f todoless
docker-compose -f docker-compose.supabase.yml logs -f kong

# Laatste 100 regels
docker-compose -f docker-compose.supabase.yml logs --tail=100

# Logs naar bestand
docker-compose -f docker-compose.supabase.yml logs > todoless.log
```

### Status & Health

```bash
# Check status van alle containers
docker-compose -f docker-compose.supabase.yml ps

# Resource usage
docker stats

# Inspect een container
docker inspect supabase-db

# Container shell
docker exec -it supabase-db bash
docker exec -it todoless-app sh
```

## 🗄️ Database Commands

### Verbinding

```bash
# Verbind met PostgreSQL
docker exec -it supabase-db psql -U postgres -d todoless

# Als één-liner query
docker exec supabase-db psql -U postgres -d todoless -c "SELECT COUNT(*) FROM tasks;"
```

### Database Queries

```sql
-- In psql prompt:

-- Lijst alle tabellen
\dt

-- Beschrijf tabel structuur
\d tasks
\d users

-- Count records
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM items;
SELECT COUNT(*) FROM users;

-- Recente tasks
SELECT id, title, status, created_at 
FROM tasks 
ORDER BY created_at DESC 
LIMIT 10;

-- Users overzicht
SELECT id, email, name, role, created_at 
FROM users;

-- Labels met counts
SELECT l.name, COUNT(t.id) as task_count
FROM labels l
LEFT JOIN tasks t ON l.id = ANY(t.labels)
GROUP BY l.id, l.name;

-- Database size
SELECT pg_size_pretty(pg_database_size('todoless'));

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Backup & Restore

```bash
# Maak backup
docker exec supabase-db pg_dump -U postgres todoless > backup-$(date +%Y%m%d).sql

# Maak compressed backup
docker exec supabase-db pg_dump -U postgres todoless | gzip > backup-$(date +%Y%m%d).sql.gz

# Restore from backup
cat backup-20260314.sql | docker exec -i supabase-db psql -U postgres todoless

# Restore from compressed backup
gunzip -c backup-20260314.sql.gz | docker exec -i supabase-db psql -U postgres todoless

# Backup all databases
docker exec supabase-db pg_dumpall -U postgres > backup-all-$(date +%Y%m%d).sql
```

### Migraties

```bash
# Voer alle migraties uit
./scripts/migrate.sh

# Voer specifieke migratie uit
./scripts/migrate.sh supabase/migrations/001_initial_schema.sql

# Handmatig migratie uitvoeren
docker exec -i supabase-db psql -U postgres todoless < supabase/migrations/001_initial_schema.sql
```

## 🔧 Maintenance Commands

### Database Maintenance

```sql
-- Vacuum database (cleanup)
VACUUM ANALYZE;

-- Reindex
REINDEX DATABASE todoless;

-- Check for bloat
SELECT schemaname, tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Cleanup Old Data

```sql
-- Delete oude archived tasks (ouder dan 90 dagen)
DELETE FROM tasks 
WHERE archived = true 
  AND archived_at < NOW() - INTERVAL '90 days';

-- Delete verlopen invite codes
DELETE FROM invite_codes 
WHERE expires_at < NOW();

-- Delete completed items ouder dan 30 dagen
DELETE FROM items 
WHERE completed = true 
  AND updated_at < NOW() - INTERVAL '30 days';
```

## 🔐 Security Commands

### User Management

```sql
-- Maak nieuwe admin user
INSERT INTO users (email, name, role) 
VALUES ('admin@example.com', 'Admin User', 'admin');

-- Update user role
UPDATE users 
SET role = 'admin' 
WHERE email = 'user@example.com';

-- Disable user (soft delete via role change)
UPDATE users 
SET role = 'disabled' 
WHERE email = 'user@example.com';
```

### JWT Tokens

```bash
# Genereer nieuwe JWT tokens
node scripts/generate-jwt.js $(openssl rand -base64 32)

# Of genereer alleen een secret
openssl rand -base64 32
```

### Reset Admin Password

```sql
-- In productie zou je een hash gebruiken
UPDATE users 
SET password_hash = 'new-password-hash' 
WHERE email = 'admin@example.com';
```

## 📊 Monitoring & Stats

### System Stats

```bash
# Disk usage
docker exec supabase-db df -h

# Database connections
docker exec supabase-db psql -U postgres -d todoless -c \
  "SELECT count(*) FROM pg_stat_activity;"

# Table row counts
docker exec supabase-db psql -U postgres -d todoless -c \
  "SELECT schemaname, tablename, n_live_tup 
   FROM pg_stat_user_tables 
   ORDER BY n_live_tup DESC;"
```

### Performance Stats

```sql
-- Slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Table access stats
SELECT schemaname, tablename, seq_scan, idx_scan
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

## 🌐 API Commands

### Test API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Get all tasks
curl http://localhost:8000/rest/v1/tasks \
  -H "apikey: eyJhbGc..."

# Get specific task
curl http://localhost:8000/rest/v1/tasks?id=eq.task-id-123 \
  -H "apikey: eyJhbGc..."

# Create task
curl -X POST http://localhost:8000/rest/v1/tasks \
  -H "apikey: eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New task from API",
    "status": "todo"
  }'

# Update task
curl -X PATCH http://localhost:8000/rest/v1/tasks?id=eq.task-id-123 \
  -H "apikey: eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'

# Delete task
curl -X DELETE http://localhost:8000/rest/v1/tasks?id=eq.task-id-123 \
  -H "apikey: eyJhbGc..."

# Get with filters
curl "http://localhost:8000/rest/v1/tasks?status=eq.todo&priority=eq.urgent" \
  -H "apikey: eyJhbGc..."

# Get with ordering
curl "http://localhost:8000/rest/v1/tasks?order=created_at.desc&limit=10" \
  -H "apikey: eyJhbGc..."
```

## 🔄 Migration Commands

### Import from localStorage

```bash
# Backup localStorage (run in browser console first)
# See MIGRATION_GUIDE.md for the script

# Import data
node scripts/import-localstorage.js backup.json
```

### Export Data

```bash
# Export tasks to JSON
docker exec supabase-db psql -U postgres -d todoless -t -c \
  "SELECT json_agg(t) FROM tasks t;" > tasks-export.json

# Export all tables
for table in users tasks items notes labels shops sprints; do
  docker exec supabase-db psql -U postgres -d todoless -t -c \
    "SELECT json_agg(t) FROM $table t;" > $table-export.json
done
```

## 🛠️ Development Commands

### Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

### Docker Development

```bash
# Rebuild only frontend
docker-compose -f docker-compose.supabase.yml build todoless

# Restart met rebuild
docker-compose -f docker-compose.supabase.yml up -d --build todoless

# View build logs
docker-compose -f docker-compose.supabase.yml build --no-cache todoless
```

## 🧹 Cleanup Commands

### Docker Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything (⚠️ careful!)
docker system prune -a --volumes

# Remove only Todoless containers
docker-compose -f docker-compose.supabase.yml down --rmi all -v
```

### Database Cleanup

```sql
-- Reset database (⚠️ deletes all data!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run migrations
```

## 📋 Daily Workflow

### Morning Startup

```bash
# Start everything
docker-compose -f docker-compose.supabase.yml up -d

# Check status
docker-compose -f docker-compose.supabase.yml ps

# Check logs for errors
docker-compose -f docker-compose.supabase.yml logs --tail=50
```

### Evening Shutdown

```bash
# Backup
docker exec supabase-db pg_dump -U postgres todoless | \
  gzip > ~/backups/todoless-$(date +%Y%m%d).sql.gz

# Stop (data blijft bewaard)
docker-compose -f docker-compose.supabase.yml down
```

### Weekly Maintenance

```bash
# Backup
docker exec supabase-db pg_dump -U postgres todoless | \
  gzip > ~/backups/weekly-$(date +%Y%m%d).sql.gz

# Cleanup old archives (in psql)
DELETE FROM tasks 
WHERE archived = true 
  AND delete_after < NOW();

# Vacuum
docker exec supabase-db psql -U postgres -d todoless -c "VACUUM ANALYZE;"

# Check disk space
docker exec supabase-db df -h
```

## 🆘 Emergency Commands

### Complete Reset

```bash
# ⚠️ WARNING: This deletes EVERYTHING!

# Stop all services
docker-compose -f docker-compose.supabase.yml down -v

# Remove all data
rm -rf .supabase

# Fresh start
./scripts/setup.sh
```

### Database Recovery

```bash
# Stop services
docker-compose -f docker-compose.supabase.yml down

# Start only database
docker-compose -f docker-compose.supabase.yml up -d db

# Wait for DB to be ready
sleep 10

# Restore from backup
cat backup-20260314.sql | docker exec -i supabase-db psql -U postgres todoless

# Start all services
docker-compose -f docker-compose.supabase.yml up -d
```

### Port Conflicts

```bash
# Find what's using port 3000
lsof -i :3000

# Find what's using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

## 📚 Useful Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# Todoless shortcuts
alias tdl-start='docker-compose -f docker-compose.supabase.yml up -d'
alias tdl-stop='docker-compose -f docker-compose.supabase.yml down'
alias tdl-logs='docker-compose -f docker-compose.supabase.yml logs -f'
alias tdl-ps='docker-compose -f docker-compose.supabase.yml ps'
alias tdl-db='docker exec -it supabase-db psql -U postgres -d todoless'
alias tdl-backup='docker exec supabase-db pg_dump -U postgres todoless | gzip > ~/backups/todoless-$(date +%Y%m%d).sql.gz'
alias tdl-restart='docker-compose -f docker-compose.supabase.yml restart'
```

Then reload: `source ~/.bashrc`

Usage:
```bash
tdl-start    # Start everything
tdl-logs     # View logs
tdl-db       # Open database
tdl-backup   # Quick backup
```

---

**Pro tip:** Create a `Makefile` voor nog snellere commands!

```makefile
.PHONY: start stop logs backup

start:
	docker-compose -f docker-compose.supabase.yml up -d

stop:
	docker-compose -f docker-compose.supabase.yml down

logs:
	docker-compose -f docker-compose.supabase.yml logs -f

backup:
	docker exec supabase-db pg_dump -U postgres todoless | gzip > backup-$(shell date +%Y%m%d).sql.gz
```

Then use: `make start`, `make stop`, `make logs`, `make backup`
