# Todoless-ngx - Docker Quick Start

Multi-user task management app with PostgreSQL, real-time sync, and Docker deployment.

## 🚀 Quick Start

### 1. Clone and Configure

```bash
git clone https://github.com/ChalidNL/todoless-ngx.git
cd todoless-ngx

# Copy environment template
cp .env.example .env

# Edit .env and change these values:
# - POSTGRES_PASSWORD (use a strong password)
# - JWT_SECRET (minimum 32 random characters)
nano .env
```

### 2. Start Application

```bash
# Make scripts executable
chmod +x start.sh generate-invite.sh

# Start all services
./start.sh
```

### 3. Create First User

```bash
# Generate an invite code
./generate-invite.sh

# Open browser and register
# http://localhost:3000
```

## 📦 What Gets Deployed

Three Docker containers:

- **Frontend** (Nginx + React) - Port 3000
- **Backend** (Node.js + Express) - Port 4000  
- **Database** (PostgreSQL 16) - Internal only

## 🏗️ Architecture

```
Browser → Nginx (port 3000)
            ↓ /api → Backend (port 4000)
            ↓ /ws  → WebSocket
                      ↓
                  PostgreSQL
```

## 📝 Common Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f todoless-ngx-backend

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Stop and delete all data (⚠️ destructive!)
docker-compose down -v

# Rebuild after code changes
docker-compose build --no-cache
docker-compose up -d
```

## 🔧 Troubleshooting

### Backend not connecting?

```bash
# Check health
docker exec todoless-ngx-backend wget -O- http://localhost:4000/api/health

# View backend logs
docker-compose logs todoless-ngx-backend
```

### Database issues?

```bash
# Check database connection
docker exec todoless-ngx-db psql -U todoless -d todoless -c "SELECT version();"

# View database logs
docker-compose logs todoless-ngx-db
```

### Frontend shows errors?

```bash
# Check nginx config
docker exec todoless-ngx-frontend cat /etc/nginx/conf.d/default.conf

# View frontend logs  
docker-compose logs todoless-ngx-frontend
```

## 🔐 Security

Before production deployment:

1. ✅ Change `POSTGRES_PASSWORD` in `.env`
2. ✅ Generate secure `JWT_SECRET` (min 32 chars)
3. ✅ Set `CORS_ORIGIN` to your domain (not `*`)
4. ✅ Enable HTTPS with reverse proxy
5. ✅ Set `COOKIE_SECURE=true` for HTTPS

## 📊 Environment Variables

See `.env.example` for all options:

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` - Database credentials
- `JWT_SECRET` - JWT token signing key
- `FRONTEND_PORT` - Web interface port (default: 3000)
- `BACKEND_PORT` - API port (default: 4000)
- `CORS_ORIGIN` - CORS allowed origins

## 🎯 Features

- ✅ Multi-user with invite-only registration
- ✅ Real-time sync via WebSocket
- ✅ Private labels (hide tasks from other users)
- ✅ Auto-archive completed tasks
- ✅ PostgreSQL database with full persistence
- ✅ Docker deployment ready for CasaOS

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [DOCKER-FIXES.md](./DOCKER-FIXES.md) - Docker configuration details
- [/docs](./docs) - Additional documentation

## 🐛 Issues?

1. Check logs: `docker-compose logs -f`
2. Verify all containers are healthy: `docker-compose ps`
3. Review [DOCKER-FIXES.md](./DOCKER-FIXES.md) for common issues
4. Open an issue on GitHub

## 📦 For CasaOS Users

1. Clone this repository
2. Create `.env` file from `.env.example`
3. Update passwords in `.env`
4. Run `docker-compose up -d`
5. Access at `http://YOUR_SERVER_IP:3000`

CasaOS will automatically detect the app via the labels in `docker-compose.yml`.

## 🔄 Updates

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📄 License

See repository for license information.

## 🤝 Contributing

Contributions welcome! Please open an issue or PR on GitHub.

---

**Need help?** Check the documentation in `/docs` or open an issue.
