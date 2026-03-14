# Todoless-ngx Command Reference

Quick reference for all common commands.

## 🚀 Installation

```bash
# Clone and setup
git clone <repo-url>
cd todoless-ngx
./scripts/init-setup.sh

# Or manual setup
cp .env.example .env
# Edit .env with your passwords
docker-compose up -d
./scripts/create-admin.sh
```

## 🎯 Using Make Commands

```bash
make help          # Show all available commands
make start         # Start all services
make stop          # Stop all services
make restart       # Restart all services
make logs          # View logs (live)
make build         # Rebuild containers
make clean         # Stop and remove containers
make clean-all     # Remove everything including data (⚠️)
```

## 👤 User Management

```bash
# Create admin user
make admin EMAIL=admin@local PASSWORD=admin123 NAME=Admin

# Or with script directly
./scripts/create-admin.sh admin@local admin123 Admin

# Create invite code
make invite USES=1 DAYS=30

# Or with script
./scripts/create-invite.sh 1 30

# List all users
docker exec -it todoless-ngx-db psql -U todoless -d todoless -c \
  "SELECT id, email, name, role FROM users;"

# Delete user
docker exec -it todoless-ngx-db psql -U todoless -d todoless -c \
  "DELETE FROM users WHERE email = 'user@example.com';"
```

## 💾 Backup & Restore

```bash
# Create backup
make backup

# Or manually
docker exec todoless-ngx-db pg_dump -U todoless todoless | gzip > backup.sql.gz

# Restore from backup
make restore FILE=backups/backup-20260314.sql.gz

# Or manually
gunzip -c backup.sql.gz | docker exec -i todoless-ngx-db psql -U todoless -d todoless

# Automatic daily backups (add to crontab)
0 2 * * * cd /path/to/todoless-ngx && make backup
```

## 🔍 Monitoring & Debugging

```bash
# Health check
make health

# View all logs
make logs

# View specific service logs
docker-compose logs -f todoless-ngx-backend
docker-compose logs -f todoless-ngx-db
docker-compose logs -f todoless-ngx-frontend

# Check container status
docker-compose ps

# Check resource usage
docker stats
```

## 🗄️ Database Management

```bash
# Open PostgreSQL shell
make shell-db

# Or directly
docker exec -it todoless-ngx-db psql -U todoless -d todoless

# Common SQL queries
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM labels;

# View recent tasks
SELECT id, title, status, created_at 
FROM tasks 
ORDER BY created_at DESC 
LIMIT 10;

# View invite codes
SELECT code, max_uses, current_uses, expires_at 
FROM invite_codes 
WHERE used_by IS NULL;

# Exit SQL shell
\q
```

## 🔧 Container Management

```bash
# Access backend container
make shell-backend

# Access frontend container  
make shell-frontend

# Restart specific service
docker-compose restart todoless-ngx-backend

# View service details
docker-compose config

# Remove specific container
docker-compose rm -sf todoless-ngx-backend
docker-compose up -d todoless-ngx-backend
```

## 🔄 Updates

```bash
# Update to latest version
make update

# Or manually
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🧹 Cleanup

```bash
# Stop services (keeps data)
make stop

# Remove containers (keeps data)
make clean

# Remove EVERYTHING including data (⚠️ DANGEROUS)
make clean-all

# Remove unused Docker resources
docker system prune -a
docker volume prune
```

## 🛠️ Development

```bash
# Start dev environment
make dev

# Then in separate terminals:
cd backend && npm run dev    # Backend on port 4000
npm run dev                  # Frontend on port 5173
```

## 📊 Database Queries

### Users

```sql
-- List all users
SELECT id, email, name, role, created_at FROM users;

-- Find user by email
SELECT * FROM users WHERE email = 'admin@local';

-- Count users
SELECT COUNT(*) FROM users;

-- Update user role to admin
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

### Tasks

```sql
-- Count tasks by status
SELECT status, COUNT(*) FROM tasks GROUP BY status;

-- Recent tasks
SELECT t.title, u.name as created_by, t.created_at 
FROM tasks t 
JOIN users u ON t.created_by = u.id 
ORDER BY t.created_at DESC 
LIMIT 20;

-- Tasks with labels
SELECT t.title, array_agg(l.name) as labels
FROM tasks t
LEFT JOIN task_labels tl ON t.id = tl.task_id
LEFT JOIN labels l ON tl.label_id = l.id
GROUP BY t.id, t.title;
```

### Labels

```sql
-- All labels with privacy info
SELECT name, color, is_private, 
       (SELECT COUNT(*) FROM task_labels WHERE label_id = labels.id) as task_count
FROM labels;

-- Private labels
SELECT * FROM labels WHERE is_private = true;
```

### Settings

```sql
-- View user settings
SELECT u.email, s.language, s.archive_retention_days, s.auto_cleanup_enabled
FROM app_settings s
JOIN users u ON s.user_id = u.id;
```

## 🔐 Security

```bash
# Change database password
# 1. Update .env with new POSTGRES_PASSWORD
# 2. Restart services
docker-compose down
docker-compose up -d

# Generate new JWT secret
openssl rand -base64 32
# Update JWT_SECRET in .env
docker-compose restart todoless-ngx-backend

# View active connections
docker exec -it todoless-ngx-db psql -U todoless -d todoless -c \
  "SELECT pid, usename, application_name, client_addr, state 
   FROM pg_stat_activity 
   WHERE datname = 'todoless';"
```

## 📈 Performance

```bash
# Database size
docker exec -it todoless-ngx-db psql -U todoless -d todoless -c \
  "SELECT pg_size_pretty(pg_database_size('todoless'));"

# Table sizes
docker exec -it todoless-ngx-db psql -U todoless -d todoless -c \
  "SELECT schemaname, tablename, 
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables 
   WHERE schemaname = 'public' 
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Index usage
docker exec -it todoless-ngx-db psql -U todoless -d todoless -c \
  "SELECT schemaname, tablename, indexname, idx_scan
   FROM pg_stat_user_indexes
   ORDER BY idx_scan DESC;"

# Slow queries (if enabled)
docker exec -it todoless-ngx-db psql -U todoless -d todoless -c \
  "SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;"
```

## 🐛 Troubleshooting

```bash
# Can't connect to database
docker-compose logs todoless-ngx-db
docker exec todoless-ngx-db pg_isready -U todoless -d todoless

# Backend not responding
curl http://localhost:4000/api/health
docker-compose logs todoless-ngx-backend

# Frontend not loading
curl http://localhost:3000
docker-compose logs todoless-ngx-frontend

# Check disk space
df -h
docker system df

# Reset everything (last resort)
docker-compose down -v
docker volume prune -f
docker-compose up -d
./scripts/create-admin.sh
```

## 📝 Export Data

```bash
# Export users as CSV
docker exec -it todoless-ngx-db psql -U todoless -d todoless -c \
  "COPY (SELECT email, name, role, created_at FROM users) 
   TO STDOUT CSV HEADER" > users.csv

# Export tasks as CSV
docker exec -it todoless-ngx-db psql -U todoless -d todoless -c \
  "COPY (SELECT title, status, priority, created_at FROM tasks) 
   TO STDOUT CSV HEADER" > tasks.csv

# Export full database as JSON (requires jq)
docker exec -it todoless-ngx-db psql -U todoless -d todoless -t -c \
  "SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM tasks) t" | jq . > tasks.json
```

## 🔗 Useful Links

- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:4000/api/health
- **Backend API**: http://localhost:4000/api/*
- **Database**: localhost:5432 (internal only)

---

**💡 Tip**: Add aliases to your shell profile for frequently used commands:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias tdl='cd /path/to/todoless-ngx'
alias tdl-logs='docker-compose -f /path/to/todoless-ngx/docker-compose.yml logs -f'
alias tdl-backup='cd /path/to/todoless-ngx && make backup'
```
