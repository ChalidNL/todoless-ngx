# Todoless-ngx - Plain Docker Compose

Simple multi-user task management with PostgreSQL.

---

## ⚡ Quick Start

```bash
# Start everything
chmod +x start.sh
./start.sh

# Wait 30 seconds, then:
# 1. Generate invite code
docker-compose exec backend node -e "console.log(Math.random().toString().slice(2,8))"

# 2. Open browser
http://localhost/

# 3. Register with invite code
```

---

## 📋 Commands

```bash
# Start
./start.sh

# Stop
./stop.sh

# View logs
./logs.sh

# Restart
docker-compose restart

# Status
docker-compose ps
```

---

## 🔧 Manual Setup

### 1. Create .env

```bash
cp .env.example .env
nano .env
```

Set these values:
```env
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_secure_jwt_secret_here
```

### 2. Start

```bash
docker-compose up -d
```

### 3. Generate Invite

```bash
docker-compose exec backend node -e "console.log(Math.random().toString().slice(2,8))"
```

### 4. Open

```
http://localhost/
```

---

## 🗂️ Files

- `docker-compose.yml` - Main compose file (plain version)
- `docker-compose.simple.yml` - Ultra minimal version
- `Dockerfile.frontend` - Frontend build
- `Dockerfile.backend` - Backend build
- `.env.example` - Environment template

---

## 🐳 Docker Compose Versions

### Option 1: Standard (Recommended)

```bash
docker-compose up -d
```

Uses `docker-compose.yml` with:
- Health checks
- Restart policies
- Named networks

### Option 2: Ultra Simple

```bash
docker-compose -f docker-compose.simple.yml up -d
```

Minimal config, no bells and whistles.

---

## 🔍 Database Access

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U todoless -d todoless

# List tables
\dt

# View users
SELECT * FROM users;

# Exit
\q
```

---

## 💾 Backup & Restore

### Backup

```bash
docker-compose exec db pg_dump -U todoless todoless > backup.sql
```

### Restore

```bash
cat backup.sql | docker-compose exec -T db psql -U todoless -d todoless
```

---

## 🧹 Reset

```bash
# Delete all data
docker-compose down -v

# Start fresh
./start.sh
```

---

## 📊 Architecture

```
Browser (port 80)
    ↓
Frontend (Nginx + React)
    ↓
Backend (Node.js + Express)
    ↓
Database (PostgreSQL)
```

---

## 🆘 Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend
docker-compose logs db
```

### Can't connect to database

```bash
# Check database is running
docker-compose ps db

# Check backend can reach it
docker-compose exec backend ping db
```

### Port 80 already in use

Edit `.env`:
```env
FRONTEND_PORT=8080
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

Access at: `http://localhost:8080/`

---

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_NAME` | `todoless` | Database name |
| `DB_USER` | `todoless` | Database user |
| `DB_PASSWORD` | - | Database password (required) |
| `JWT_SECRET` | - | JWT secret (required) |
| `FRONTEND_PORT` | `80` | Frontend port |
| `CORS_ORIGIN` | `*` | CORS origin |

---

## ✅ Plain Docker Compose Features

✅ No extra labels  
✅ No CasaOS-specific config  
✅ No resource limits (use defaults)  
✅ No custom subnets  
✅ Simple service names  
✅ Minimal environment variables  
✅ Easy to understand  
✅ Works anywhere  

---

## 🚀 That's It!

**Start:** `./start.sh`  
**Stop:** `./stop.sh`  
**Logs:** `./logs.sh`  

**Done!** 🎉
