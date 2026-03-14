# ✅ PLAIN DOCKER COMPOSE - KLAAR!

## 🎉 Je Hebt Nu Een Plain Docker Compose!

---

## 📦 Wat Is Er Veranderd?

### Voor (Complex)

```yaml
# 208 lines
# CasaOS labels
# Traefik configuration
# Resource limits
# Custom subnets
# Extensive metadata
```

### Na (Plain & Clean)

```yaml
# 70 lines
# Essential features only
# Health checks
# Restart policies
# Named networks
# Easy to read
```

---

## 🚀 Quick Start

### Optie 1: Helper Script (Aanbevolen)

```bash
chmod +x start.sh
./start.sh
```

Dit doet:
1. ✅ Maakt `.env` aan met secure passwords
2. ✅ Start alle services
3. ✅ Wacht tot alles klaar is
4. ✅ Geeft je de invite command

### Optie 2: Manueel

```bash
# 1. Environment
cp .env.example .env
nano .env  # Set DB_PASSWORD and JWT_SECRET

# 2. Start
docker-compose up -d

# 3. Wait
sleep 30

# 4. Generate invite
docker-compose exec backend node -e "console.log(Math.random().toString().slice(2,8))"

# 5. Open
http://localhost/
```

---

## 📋 Files Overzicht

### Docker Compose Files

| File | Lines | Use Case |
|------|-------|----------|
| `docker-compose.yml` | 70 | **Current/Default** - Plain & clean |
| `docker-compose.simple.yml` | 40 | Ultra minimal |

### Helper Scripts

| Script | Functie |
|--------|---------|
| `start.sh` | Start everything (auto-setup) |
| `stop.sh` | Stop all services |
| `logs.sh` | View logs |

### Documentation

| File | Wat |
|------|-----|
| `README-PLAIN.md` | Plain version guide |
| `DOCKER-COMPOSE-VERSIONS.md` | Compare versions |
| `🧪-TEST-ONBOARDING.md` | Test onboarding |
| `✅-PLAIN-DOCKER-COMPOSE-READY.md` | This file |

---

## 🎯 Plain Docker Compose Features

### ✅ What's Included

```yaml
services:
  db:
    image: postgres:16-alpine           # Official PostgreSQL
    container_name: todoless-db         # Easy to identify
    restart: unless-stopped             # Auto-restart
    healthcheck:                        # Wait until ready
      test: ["CMD-SHELL", "pg_isready"]
    volumes:
      - db-data:/var/lib/postgresql/data  # Persist data

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: todoless-backend
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy      # Wait for DB
    healthcheck:
      test: ["CMD", "wget", "..."]      # Health check

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: todoless-frontend
    restart: unless-stopped
    ports:
      - "80:80"                         # Expose to host
    depends_on:
      backend:
        condition: service_healthy      # Wait for backend

volumes:
  db-data:                              # Named volume

networks:
  todoless:                             # Named network
    driver: bridge
```

### ❌ What's Removed

- CasaOS labels
- Traefik labels
- Resource limits
- Custom subnets (172.25.0.0/16)
- Extensive comments
- Metadata fields
- Complex environment variables

---

## 🔍 Key Differences

### Before (Full-Featured)

```yaml
# 208 lines total

labels:
  casaos.name: "To Do Less"
  casaos.icon: "https://..."
  casaos.description: "..."
  casaos.category: "Productivity"
  traefik.enable: "true"
  traefik.http.routers.todoless.rule: "..."

deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M

networks:
  todoless-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.25.0.0/16
```

### After (Plain)

```yaml
# 70 lines total

networks:
  todoless:
    driver: bridge
```

**66% smaller! Much cleaner!** 🎉

---

## 📊 Environment Variables

### .env.example (Plain)

```env
# Database Configuration
DB_NAME=todoless
DB_USER=todoless
DB_PASSWORD=CHANGE_ME_TO_SECURE_PASSWORD

# JWT Authentication
JWT_SECRET=CHANGE_ME_TO_SECURE_JWT_SECRET

# Frontend Port (default: 80)
FRONTEND_PORT=80

# CORS Origin (use * for development, specific domain for production)
CORS_ORIGIN=*
```

**Before:** 25+ variables  
**After:** 6 variables  
**Much simpler!** ✨

---

## 🧪 Testing

### Test met Auto Script

```bash
chmod +x test-onboarding.sh
./test-onboarding.sh
```

Output:
```
🧪 ONBOARDING TEST WITH POSTGRESQL

✅ Services are running
✅ Database schema initialized (7 tables)
✅ Registration successful!
✅ Authenticated API call successful!

📊 ONBOARDING TEST SUMMARY

Services Status:
NAME                 STATUS
todoless-db          Up (healthy)
todoless-backend     Up (healthy)
todoless-frontend    Up

Database Info:
  Database: todoless
  User: todoless
  Tables: 7
  Users: 1
```

### Manual Browser Test

1. Start: `./start.sh`
2. Generate invite: `docker-compose exec backend node -e "console.log(Math.random().toString().slice(2,8))"`
3. Open: `http://localhost/`
4. Register met invite code
5. Start using! 🎉

---

## 🔧 Common Commands

### Start/Stop

```bash
# Start
./start.sh
# or
docker-compose up -d

# Stop
./stop.sh
# or
docker-compose down

# Restart
docker-compose restart

# Restart single service
docker-compose restart backend
```

### Logs

```bash
# All logs (follow)
./logs.sh
# or
docker-compose logs -f

# Single service
docker-compose logs backend
docker-compose logs db
docker-compose logs frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Status

```bash
# Check status
docker-compose ps

# Expected output:
NAME                 STATUS
todoless-db          Up (healthy)
todoless-backend     Up (healthy)
todoless-frontend    Up
```

### Database

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U todoless -d todoless

# Quick queries
docker-compose exec db psql -U todoless -d todoless -c "SELECT * FROM users;"
docker-compose exec db psql -U todoless -d todoless -c "\dt"

# Backup
docker-compose exec db pg_dump -U todoless todoless > backup.sql

# Restore
cat backup.sql | docker-compose exec -T db psql -U todoless -d todoless
```

---

## 🎨 Simple vs Plain Comparison

### Ultra Simple (docker-compose.simple.yml)

```yaml
# 40 lines
# No health checks
# No restart policies
# Basic depends_on
# Default network
```

**Use when:**
- Learning Docker
- Quick testing
- Don't care about reliability

### Plain (docker-compose.yml) - **CURRENT**

```yaml
# 70 lines
# Health checks ✅
# Restart policies ✅
# Smart dependencies ✅
# Named network ✅
```

**Use when:**
- Production deployment
- Need reliability
- Standard VPS
- **Most common!** ⭐

---

## 💡 Pro Tips

### Customize Port

Edit `.env`:
```env
FRONTEND_PORT=8080
```

Then access at: `http://localhost:8080/`

### Multiple Environments

```bash
# Development
cp .env.example .env.dev
# Edit .env.dev with dev settings

# Start with dev config
docker-compose --env-file .env.dev up -d

# Production
cp .env.example .env.prod
# Edit .env.prod with prod settings

docker-compose --env-file .env.prod up -d
```

### Check Health

```bash
# Backend health
curl http://localhost:4000/api/health

# Expected:
{
  "status": "ok",
  "database": "connected",
  "websocket": "enabled"
}

# Frontend
curl -I http://localhost/

# Expected:
HTTP/1.1 200 OK
```

---

## 🆘 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend
docker-compose logs db

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues

```bash
# Check DB is running
docker-compose ps db

# Check backend can reach DB
docker-compose exec backend ping db

# Check DB password in .env
cat .env | grep DB_PASSWORD
```

### Port Already in Use

```bash
# Option 1: Change port
nano .env
# Set: FRONTEND_PORT=8080

# Option 2: Find what's using port 80
sudo lsof -i :80
# Kill that process or use different port
```

---

## 🔄 Switching Versions

### From Simple to Plain

```bash
# Simple is same as Plain but with less features
# Just use default docker-compose.yml
docker-compose up -d
```

### From Plain to Simple

```bash
# Use simple version explicitly
docker-compose -f docker-compose.simple.yml up -d
```

### Back to Full-Featured (CasaOS)

If you need CasaOS labels back, see:
- `README-casaos.md`
- `DOCKER-COMPOSE-VERSIONS.md`

---

## 📚 Documentation Links

| Topic | File |
|-------|------|
| **Plain Guide** | `README-PLAIN.md` |
| **Version Comparison** | `DOCKER-COMPOSE-VERSIONS.md` |
| **Onboarding Test** | `🧪-TEST-ONBOARDING.md` |
| **Error Fixes** | `❌-ERRORS-FIX-THIS.md` |
| **CasaOS Deployment** | `README-casaos.md` |

---

## ✅ Success Checklist

After running `./start.sh`:

- [ ] All services show "Up (healthy)"
- [ ] Backend health check returns OK
- [ ] Frontend loads in browser
- [ ] Can generate invite code
- [ ] Can register new user
- [ ] User appears in PostgreSQL
- [ ] Can login
- [ ] Can create tasks
- [ ] Data persists after restart

**If all checked: SUCCESS!** 🎉

---

## 🎉 Summary

### What You Got

✅ **Plain docker-compose.yml** - 70 lines, easy to read  
✅ **Ultra simple version** - 40 lines, minimal  
✅ **Helper scripts** - start.sh, stop.sh, logs.sh  
✅ **Clean .env** - Only 6 variables  
✅ **Full documentation** - Multiple guides  
✅ **Test scripts** - Automated testing  

### What Changed

❌ **Removed** CasaOS labels (208 → 70 lines)  
❌ **Removed** Traefik config  
❌ **Removed** Resource limits  
❌ **Removed** Custom subnets  
❌ **Removed** Complex metadata  

### What Stayed

✅ **All functionality** - Everything works!  
✅ **Health checks** - Reliability  
✅ **Restart policies** - Auto-recovery  
✅ **Data persistence** - PostgreSQL volume  
✅ **Multi-user** - Invite system  
✅ **Real-time sync** - WebSocket  

---

## 🚀 Ready to Use!

```bash
# Start
./start.sh

# Test
./test-onboarding.sh

# Use
http://localhost/
```

**That's it! Plain, simple, and it works!** 🎉

---

**Questions? See README-PLAIN.md** 📖
