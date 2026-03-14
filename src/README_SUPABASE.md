# Supabase Setup - Todoless

## What is Supabase?

Open-source Firebase alternative with:
- **PostgreSQL** - Database with real-time
- **GoTrue** - Authentication
- **PostgREST** - Auto-generated REST API
- **Realtime** - WebSocket server
- **Storage** - S3-compatible storage
- **Studio** - Database UI

## Architecture

```
Frontend (3000)
     ↓
Kong Gateway (8000)
     ↓
Auth + REST + Realtime + Storage
     ↓
PostgreSQL (5432)
```

All included in `docker-compose.yml`!

---

## Setup

### 1. Environment

```bash
cp .env.example .env
```

### 2. Generate Tokens

```bash
node scripts/generate-jwt.js $(openssl rand -base64 32)
```

Copy to `.env`:
- `JWT_SECRET`
- `ANON_KEY`
- `SERVICE_ROLE_KEY`

### 3. Set Password

```bash
POSTGRES_PASSWORD=your-strong-password
```

### 4. Start

```bash
docker-compose up -d
```

---

## Services

All run automatically:

| Service | Purpose |
|---------|---------|
| **db** | PostgreSQL 15 |
| **studio** | Database UI (port 3010) |
| **kong** | API Gateway (port 8000) |
| **auth** | User authentication |
| **rest** | REST API |
| **realtime** | WebSocket server |
| **storage** | File storage |
| **imgproxy** | Image optimization |
| **meta** | Database metadata |

---

## Database

### Schema

Complete schema in: `supabase/migrations/001_initial_schema.sql`

Tables:
- `users` - User accounts
- `tasks` - Task management
- `items` - Shopping items
- `notes` - Rich notes
- `labels` - Smart labels
- `sprints` - Sprint planning
- `invite_codes` - Invite system

### Access

**Via Studio:**
```
http://localhost:3010
```

**Via CLI:**
```bash
docker exec -it supabase-db psql -U postgres -d todoless
```

### Migrations

```bash
./scripts/migrate.sh
```

Or manually:
```bash
docker exec -i supabase-db psql -U postgres -d todoless < supabase/migrations/001_initial_schema.sql
```

---

## API Usage

### Base URL
```
http://localhost:8000
```

### Authentication

**Register:**
```bash
curl http://localhost:8000/auth/v1/signup \
  -H "apikey: $ANON_KEY" \
  -d '{"email":"user@example.com","password":"password"}'
```

**Login:**
```bash
curl http://localhost:8000/auth/v1/token?grant_type=password \
  -H "apikey: $ANON_KEY" \
  -d '{"email":"user@example.com","password":"password"}'
```

### REST API

**Get tasks:**
```bash
curl http://localhost:8000/rest/v1/tasks \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Create task:**
```bash
curl -X POST http://localhost:8000/rest/v1/tasks \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New task","status":"inbox"}'
```

### Realtime

**Subscribe to changes:**
```javascript
const supabase = createClient(SUPABASE_URL, ANON_KEY);

supabase
  .channel('tasks')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'tasks' },
    (payload) => console.log(payload)
  )
  .subscribe();
```

---

## Security

### Row Level Security (RLS)

All tables have RLS enabled:

```sql
-- Users can only see their own tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Private labels
CREATE POLICY "Private labels hidden"
  ON tasks FOR SELECT
  USING (
    NOT EXISTS (
      SELECT 1 FROM labels 
      WHERE labels.id = ANY(tasks.label_ids) 
      AND labels.is_private = true 
      AND labels.created_by != auth.uid()
    )
  );
```

### API Keys

**ANON_KEY:**
- Used by frontend
- Limited permissions
- Safe to expose

**SERVICE_ROLE_KEY:**
- Admin access
- Bypasses RLS
- Keep secret!

---

## Troubleshooting

### Services won't start

```bash
docker-compose logs
```

Common issues:
- Port conflicts (change in docker-compose.yml)
- Missing .env file
- Invalid JWT tokens

### Database connection failed

```bash
# Check database
docker exec supabase-db pg_isready -U postgres

# View logs
docker logs supabase-db

# Restart
docker restart supabase-db
```

### API returns 401

Check:
- `ANON_KEY` in frontend matches `.env`
- User is authenticated
- RLS policies allow access

### Reset everything

```bash
docker-compose down -v
docker-compose up -d
./scripts/migrate.sh
```

---

## Backup & Restore

### Backup

```bash
# Full backup
docker exec supabase-db pg_dump -U postgres todoless > backup.sql

# Compressed
docker exec supabase-db pg_dump -U postgres todoless | gzip > backup.sql.gz
```

### Restore

```bash
# From SQL
docker exec -i supabase-db psql -U postgres todoless < backup.sql

# From compressed
gunzip -c backup.sql.gz | docker exec -i supabase-db psql -U postgres todoless
```

---

## Advanced

### Custom SQL

```bash
# Run query
docker exec supabase-db psql -U postgres -d todoless -c "SELECT COUNT(*) FROM tasks;"

# Run file
docker exec -i supabase-db psql -U postgres -d todoless < custom.sql
```

### Extensions

PostgreSQL extensions available:
- `uuid-ossp` - UUID generation
- `pgcrypto` - Encryption
- `pg_stat_statements` - Query stats

Enable:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Performance

```bash
# Database stats
docker exec supabase-db psql -U postgres -d todoless -c "\
  SELECT schemaname, tablename, 
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables 
  WHERE schemaname = 'public';"

# Active connections
docker exec supabase-db psql -U postgres -d todoless -c "\
  SELECT count(*) FROM pg_stat_activity;"
```

---

**That's it!** 🚀

Everything you need is in `docker-compose.yml`
