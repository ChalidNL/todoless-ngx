# Todoless-ngx

**Multi-user task management** with real-time sync, private labels, and auto-archive. Self-hosted with just **3 Docker containers**.

## ✨ Features

- 🔄 **Real-time sync** - PostgreSQL ensures data consistency across users
- ✅ **Multi-user** with invite-only registration
- 🏷️ **Private labels** - Hide tasks from other users
- 📦 **Auto-archive** - Automatic cleanup (30/60/90 days or unlimited)
- 🚀 **Sprint management** - Track progress with sprint cards
- 📊 **Compact design** - Paperless-ngx inspired UI
- 🗂️ **Complete workflow** - Inbox, Tasks, Items, Notes, Calendar, Settings
- 🌍 **Multi-language** - English (FR/NL/DE planned)
- 🐳 **Simple deployment** - 3 containers (frontend + backend + database)
- 💾 **PostgreSQL** - Rock-solid, production-ready database
- ⚡ **WebSocket support** - Real-time updates for all users

## 🚀 Quick Start

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd todoless-ngx

# 2. Create .env file
cp .env.example .env
# Edit .env and change passwords and JWT_SECRET!

# 3. Start services
docker-compose up -d

# 4. Wait for services to be healthy (check logs)
docker-compose logs -f

# 5. Access the app
open http://localhost:3000
```

### First User Setup

**Option 1 - Create admin via helper script:**
```bash
# Make script executable
chmod +x scripts/create-admin.sh

# Create admin user
./scripts/create-admin.sh admin@local admin123 "Admin"

# Login at http://localhost:3000
```

**Option 2 - Create invite code:**
```bash
# Make script executable
chmod +x scripts/create-invite.sh

# Create invite code (max 1 use, valid 30 days)
./scripts/create-invite.sh 1 30

# Register at the generated URL
```

**Option 3 - Manual SQL (advanced):**
```bash
# Create admin user manually
docker exec -it todoless-ngx-db psql -U todoless -d todoless -c "
INSERT INTO users (email, name, password_hash, role) 
VALUES ('admin@local', 'Admin', '\$2a\$10\$YourHashedPassword', 'admin');
"
```

## 📦 Architecture

### Services (3 containers)

| Service | Port | Description |
|---------|------|-------------|
| **todoless-ngx-frontend** | 3000 | React app (nginx) |
| **todoless-ngx-backend** | 4000 | Node.js API + WebSocket |
| **todoless-ngx-db** | - | PostgreSQL 16 (internal) |

### Why PostgreSQL?

✅ **Multi-user safe** - Concurrent writes without conflicts  
✅ **ACID compliant** - Data integrity guaranteed  
✅ **Real-time sync** - LISTEN/NOTIFY for instant updates  
✅ **Reliable** - Battle-tested in production  
✅ **Efficient** - Optimized indexes for fast queries  

Unlike SQLite (file-based), PostgreSQL handles multiple users editing simultaneously **without data loss or conflicts**.

## ⚙️ Configuration

### Environment Variables

Create `.env` from `.env.example`:

```env
# Database (CHANGE THESE!)
POSTGRES_DB=todoless
POSTGRES_USER=todoless
POSTGRES_PASSWORD=your-secure-password

# Security (REQUIRED - min 32 chars)
JWT_SECRET=your-random-secret-key-min-32-chars

# Ports (optional)
FRONTEND_PORT=3000
BACKEND_PORT=4000

# Optional
CORS_ORIGIN=*
COOKIE_SECURE=false
```

**⚠️ IMPORTANT**: Change `POSTGRES_PASSWORD` and `JWT_SECRET` before deployment!

### App Settings

Configure per user in **Settings**:
- **Archive retention**: 30/60/90 days or unlimited
- **Auto-cleanup**: Enable/disable automatic archiving
- **Language**: English (more coming)
- **Theme**: Light/dark mode

## 🔐 Security Features

- ✅ **Invite-only** registration (no public signup)
- ✅ **JWT authentication** with secure cookies
- ✅ **Private labels** - Tasks hidden from other users
- ✅ **Password hashing** with bcrypt (10 rounds)
- ✅ **SQL injection** protection with parameterized queries
- ✅ **Row-level privacy** - Labels filtered per user

## 💾 Backup & Restore

### Backup PostgreSQL Database

```bash
# Full database backup
docker exec todoless-ngx-db pg_dump -U todoless todoless > backup-$(date +%Y%m%d).sql

# Compressed backup (recommended)
docker exec todoless-ngx-db pg_dump -U todoless todoless | gzip > backup-$(date +%Y%m%d).sql.gz

# Automatic daily backups (cron)
0 2 * * * cd /path/to/todoless-ngx && docker exec todoless-ngx-db pg_dump -U todoless todoless | gzip > backups/backup-$(date +\%Y\%m\%d).sql.gz
```

### Restore Database

```bash
# Restore from SQL file
cat backup-20260314.sql | docker exec -i todoless-ngx-db psql -U todoless -d todoless

# Restore from compressed backup
gunzip -c backup-20260314.sql.gz | docker exec -i todoless-ngx-db psql -U todoless -d todoless

# Or using volume backup
docker run --rm -v todoless-ngx-db-data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz /data
```

## 🔧 Development

### Local Development

```bash
# 1. Start PostgreSQL only
docker-compose up -d todoless-ngx-db

# 2. Backend
cd backend
cp .env.example .env
# Edit .env with DB_HOST=localhost
npm install
npm run dev

# 3. Frontend (new terminal)
npm install
npm run dev
```

### Database Management

```bash
# Access PostgreSQL CLI
docker exec -it todoless-ngx-db psql -U todoless -d todoless

# View tables
\dt

# View users
SELECT id, email, name, role FROM users;

# View invite codes
SELECT code, max_uses, current_uses, expires_at FROM invite_codes;

# Exit
\q
```

### API Documentation

Backend API runs on `http://localhost:4000`:

**Authentication:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

**Tasks:**
```
GET    /api/tasks           # Get all tasks (privacy filtered)
POST   /api/tasks           # Create task
PATCH  /api/tasks/:id       # Update task
DELETE /api/tasks/:id       # Delete task
```

**Items, Notes, Labels, Shops, Sprints, Calendar, Settings, Invites, Users:**
```
GET    /api/{resource}
POST   /api/{resource}
PATCH  /api/{resource}/:id
DELETE /api/{resource}/:id
```

**WebSocket** (port 4000):
```javascript
const ws = new WebSocket('ws://localhost:4000');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // { type: 'data_change', table: 'tasks', action: 'INSERT', id: '...', data: {...} }
};
```

## 🔄 Real-time Updates

### How it works

1. **User A** creates a task → PostgreSQL trigger fires
2. **PostgreSQL NOTIFY** sends event to backend
3. **Backend WebSocket** broadcasts to all connected clients
4. **User B's browser** receives update and refreshes UI

**Zero polling, instant sync across all users!**

## 🐛 Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs -f

# Check specific service
docker-compose logs todoless-ngx-backend

# Restart services
docker-compose restart

# Full reset (WARNING: deletes data)
docker-compose down -v
docker-compose up -d
```

### Can't login / Need admin user

```bash
# Create admin user
./scripts/create-admin.sh admin@local admin123 Admin

# Or check existing users
docker exec -it todoless-ngx-db psql -U todoless -d todoless -c "SELECT id, email, name, role FROM users;"
```

### Database connection issues

```bash
# Check if database is running
docker-compose ps

# Check database health
docker exec todoless-ngx-db pg_isready -U todoless -d todoless

# View database logs
docker-compose logs todoless-ngx-db

# Restart database
docker-compose restart todoless-ngx-db
```

### Real-time updates not working

```bash
# Check WebSocket connection in browser console
# Should see: WebSocket client connected

# Test PostgreSQL LISTEN/NOTIFY
docker exec -it todoless-ngx-db psql -U todoless -d todoless
todoless=# LISTEN data_change;
todoless=# -- Open another terminal and make a change
todoless=# -- You should see a notification here

# Check backend logs for real-time listener
docker-compose logs todoless-ngx-backend | grep "Real-time"
```

## 📊 CasaOS Integration

This docker-compose includes CasaOS labels for one-click import:

1. Open CasaOS → App Store → Import
2. Paste the `docker-compose.yml` content
3. Click Install
4. **Edit `.env`** file and change passwords!
5. Access at configured port (default: 3000)

## 🔄 Updating

```bash
# Pull latest changes
git pull

# Rebuild and restart (preserves data)
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

## 📈 Performance Tips

1. **Database indexes** - Already optimized for common queries
2. **Connection pooling** - Backend uses 20 max connections
3. **Slow query logging** - Queries >1s are logged automatically
4. **Gzip compression** - Nginx compresses assets
5. **Asset caching** - Static files cached for 1 year

## 🔒 Production Recommendations

1. ✅ **Change all passwords** in `.env`
2. ✅ **Use strong JWT_SECRET** (min 32 random characters)
3. ✅ **Enable HTTPS** and set `COOKIE_SECURE=true`
4. ✅ **Set CORS_ORIGIN** to your domain
5. ✅ **Regular backups** (see Backup section)
6. ✅ **Monitor disk space** for PostgreSQL volume
7. ✅ **Firewall** - Only expose ports 3000/4000, not 5432

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 💬 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: This README

---

**Made with ❤️ for teams who need real-time task management**

**Why 3 containers instead of 11?**  
We use PostgreSQL directly instead of the full Supabase stack (Auth, Storage, Realtime, Kong, etc.). You get the same reliability with 73% fewer containers! 🚀
