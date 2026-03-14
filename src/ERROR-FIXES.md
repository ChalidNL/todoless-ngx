# ⚡ Quick Error Fixes

## 🔴 Error: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**What it means:** Nginx is serving HTML instead of proxying to backend

**Fix:**
```bash
# 1. Stop everything
docker-compose down

# 2. Rebuild frontend (this updates nginx config)
docker-compose build --no-cache todoless-ngx-frontend

# 3. Start
docker-compose up -d

# 4. Test
curl http://localhost:3000/api/health
# Should return JSON, not HTML!
```

**Why it happens:** 
- Nginx location order was wrong
- `/api/` location must come BEFORE `/` location
- Fixed in latest nginx.conf

---

## 🔴 Error: `WebSocket error`

**What it means:** WebSocket connection failed

**Fix:**
```bash
# 1. Rebuild backend (adds /ws endpoint)
docker-compose build --no-cache todoless-ngx-backend

# 2. Restart
docker-compose restart

# 3. Check logs
docker-compose logs -f todoless-ngx-backend

# When you open http://localhost:3000, should see:
# 🔌 WebSocket client connected
```

**Test in browser console:**
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onopen = () => console.log('✅ Connected!');
// Should see: ✅ Connected!
```

---

## 🔴 Error: `Failed to fetch`

**What it means:** Can't connect to API

**Fix:**
```bash
# 1. Check backend is running
docker-compose ps

# Backend must show: Up (healthy)

# 2. Test direct backend
curl http://localhost:4000/api/health

# Should return JSON

# 3. Test via proxy
curl http://localhost:3000/api/health

# Should return SAME JSON

# 4. If proxy fails, rebuild frontend
docker-compose build --no-cache todoless-ngx-frontend
docker-compose up -d
```

---

## 🔴 Error: `Database connection failed`

**Fix:**
```bash
# 1. Check database is running
docker-compose ps todoless-ngx-db

# Must show: Up (healthy)

# 2. Wait longer (database needs 30-60s to start)
sleep 60

# 3. Restart backend
docker-compose restart todoless-ngx-backend

# 4. Check logs
docker-compose logs todoless-ngx-backend | grep PostgreSQL

# Should see: ✅ PostgreSQL connected
```

---

## 🔴 Error: Port already in use

**Fix:**
```bash
# Option 1: Change ports
echo "FRONTEND_PORT=3001" >> .env
echo "BACKEND_PORT=4001" >> .env
docker-compose down
docker-compose up -d

# Option 2: Kill process using port
lsof -i :3000
kill -9 <PID>
docker-compose up -d
```

---

## 🔴 White page in browser

**Fix:**
```bash
# 1. Check browser console (F12)
# Look for errors

# 2. Rebuild frontend
docker-compose build --no-cache todoless-ngx-frontend
docker-compose up -d

# 3. Hard refresh browser
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)
```

---

## 🔴 Can't login

**Fix:**
```bash
# Create admin user
./scripts/create-admin.sh admin@local admin123 Admin

# Then login with:
# Email: admin@local
# Password: admin123
```

---

## 🔴 All containers keep restarting

**Fix:**
```bash
# 1. Check logs for error
docker-compose logs

# 2. Common issues:
# - Missing .env file → cp backend/.env.example .env
# - Wrong credentials → check POSTGRES_PASSWORD in .env
# - Missing JWT_SECRET → add to .env

# 3. Verify .env has required values:
cat .env

# Must have:
# POSTGRES_PASSWORD=something
# JWT_SECRET=something-32-chars

# 4. Restart
docker-compose down
docker-compose up -d
```

---

## 🔴 Nuclear Option (Complete Reset)

**When nothing else works:**

```bash
# WARNING: Deletes all data!

# 1. Stop everything
docker-compose down -v

# 2. Remove volumes
docker volume rm todoless-ngx_todoless-ngx-db-data

# 3. Remove images
docker-compose down --rmi all

# 4. Clean build
docker-compose build --no-cache

# 5. Start fresh
docker-compose up -d

# 6. Wait 90 seconds
sleep 90

# 7. Create admin
./scripts/create-admin.sh admin@local admin123 Admin

# 8. Open browser
open http://localhost:3000
```

---

## ✅ Verify Everything Works

Run these tests:

```bash
# 1. Services running
docker-compose ps
# All should be "Up", db and backend should be "healthy"

# 2. Backend works
curl http://localhost:4000/api/health
# Should return: {"status":"ok","database":"connected","websocket":"enabled"}

# 3. Proxy works
curl http://localhost:3000/api/health
# Should return SAME JSON as above

# 4. Frontend loads
curl -I http://localhost:3000
# Should return: HTTP/1.1 200 OK

# 5. Database works
docker exec todoless-ngx-db pg_isready -U todoless
# Should return: accepting connections
```

**All tests pass?** ✅ You're good!

**Still failing?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📚 Documentation

- **Full rebuild guide:** [REBUILD-NOW.md](./REBUILD-NOW.md)
- **Detailed troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Quick start:** [START-HERE.md](./START-HERE.md)
- **All commands:** [docs/COMMANDS.md](./docs/COMMANDS.md)

---

**Most common fix:** Just rebuild with `--no-cache`!

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

This fixes 90% of issues! 🎯
