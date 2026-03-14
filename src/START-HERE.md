# 🚀 Start Here - Todoless-ngx

**Multi-user task management with PostgreSQL**

## ⚡ Quick Start (3 Steps)

### 1. Clone & Configure
```bash
git clone <repository-url>
cd todoless-ngx
cp .env.example .env
```

**Edit `.env` and change these two values:**
```env
POSTGRES_PASSWORD=your-secure-password    # Change this!
JWT_SECRET=your-random-secret-32-chars   # Change this!
```

**Generate secure secrets:**
```bash
# Linux/Mac:
openssl rand -base64 32
```

### 2. Start Services
```bash
docker-compose up -d

# Wait 30-60 seconds, then check:
docker-compose ps
```

All 3 services should be healthy:
- ✅ todoless-ngx-db
- ✅ todoless-ngx-backend  
- ✅ todoless-ngx-frontend

### 3. Create Admin User
```bash
chmod +x scripts/create-admin.sh
./scripts/create-admin.sh admin@local admin123 Admin
```

**Done! Open your browser:**
```
http://localhost:3000
```

Login with:
- **Email**: admin@local
- **Password**: admin123

---

## 🎯 What You Get

✅ **3 Docker containers** (not 11 like Supabase!)  
✅ **PostgreSQL database** - Real concurrent writes  
✅ **Real-time sync** - WebSocket + LISTEN/NOTIFY  
✅ **Private labels** - Multi-user privacy  
✅ **Invite-only** - Secure registration  
✅ **Auto-archive** - Configurable retention  

## 📦 Architecture

```
Frontend (React + Nginx)  ←→  Backend (Node.js)  ←→  Database (PostgreSQL)
Port 3000                     Port 4000               Internal only
```

**All communication goes through nginx proxy** - No CORS, no connection issues!

## 🔧 Common Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Full rebuild
docker-compose down
docker-compose up -d --build

# Create invite code
./scripts/create-invite.sh 1 30  # 1 use, valid 30 days

# Health check
curl http://localhost:3000/api/health

# Backup database
docker exec todoless-ngx-db pg_dump -U todoless todoless | gzip > backup.sql.gz
```

## 📚 Documentation

- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **Full Guide**: [README.md](./README.md)
- **Commands**: [docs/COMMANDS.md](./docs/COMMANDS.md)
- **PostgreSQL Info**: [docs/POSTGRESQL-VS-SQLITE.md](./docs/POSTGRESQL-VS-SQLITE.md)
- **Production**: [docs/PRODUCTION.md](./docs/PRODUCTION.md)
- **Troubleshooting**: [FIXED.md](./FIXED.md)

## 🐛 Troubleshooting

### Services won't start
```bash
# Check logs for errors
docker-compose logs -f

# Common issue: ports in use
# Change ports in .env:
FRONTEND_PORT=3001
BACKEND_PORT=4001
```

### Can't connect to database
```bash
# Wait longer (PostgreSQL needs 30-60s to start)
docker-compose logs todoless-ngx-db

# Look for: "database system is ready to accept connections"
```

### "Failed to fetch" errors
```bash
# Rebuild frontend with nginx proxy
docker-compose down
docker-compose build --no-cache todoless-ngx-frontend
docker-compose up -d
```

### Forgot admin password
```bash
# Create new admin
./scripts/create-admin.sh newadmin@local newpass123 "New Admin"
```

## 💡 Development

### Local Development (Without Docker)
```bash
# 1. Start PostgreSQL only
docker-compose up -d todoless-ngx-db

# 2. Backend (terminal 1)
cd backend
cp .env.example .env
# Edit .env: DB_HOST=localhost
npm install
npm run dev

# 3. Frontend (terminal 2)
npm install
npm run dev
# Opens at http://localhost:5173
```

### Environment Variables

**Production (Docker):**
- Uses `.env.production` → `VITE_API_URL=` (empty = nginx proxy)

**Development (npm run dev):**
- Uses `.env.development` → `VITE_API_URL=http://localhost:4000`

## 🔐 Security Checklist

Before inviting users:

- [ ] Changed `POSTGRES_PASSWORD` in `.env`
- [ ] Changed `JWT_SECRET` in `.env` (min 32 chars)
- [ ] Changed admin password after first login
- [ ] Set up regular backups
- [ ] (Production) Configured HTTPS/SSL
- [ ] (Production) Restricted CORS to your domain

## 🆘 Need Help?

1. **Check logs**: `docker-compose logs -f`
2. **Verify services**: `docker-compose ps`
3. **Read docs**: All `.md` files in repo
4. **GitHub Issues**: Report bugs/ask questions

---

## ✨ Features

### Multi-user Collaboration
- Concurrent editing without conflicts
- Real-time updates via WebSocket
- Private labels for personal tasks
- User assignment and tracking

### Task Management
- **Inbox/Backlog** - Capture everything
- **Tasks** - Organize and prioritize
- **Items** - Shopping lists with shops
- **Notes** - Quick capture with labels
- **Calendar** - Schedule and plan
- **Sprints** - Iterative planning

### Smart Organization
- Labels with colors and privacy
- Filtering and search
- Horizons (week, month, quarter, year)
- Priority levels (urgent, normal, low)
- Blocking with reasons

### Auto-archive
- Configurable retention (30/60/90 days or unlimited)
- Automatic cleanup of expired archives
- Manual archive/restore anytime

---

**🎉 Enjoy your new task management system!**

**Questions?** Open an issue on GitHub  
**Found a bug?** We'd love to know!  
**Want to contribute?** PRs welcome!
