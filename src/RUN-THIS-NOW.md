# ⚡ FIX ERRORS NOW - Run This

You're seeing these errors:
- ❌ `WebSocket error`
- ❌ `Unexpected token '<', "<!DOCTYPE"...`

## 🎯 One Command Fix

```bash
chmod +x fix-now.sh && ./fix-now.sh
```

**That's it!** This will:
1. Stop all containers
2. Rebuild with correct configuration
3. Start services
4. Test everything
5. Show you next steps

⏱️ **Takes 3-5 minutes**

---

## OR: Step by Step

If the script doesn't work, run these commands:

```bash
# 1. Stop everything
docker-compose down

# 2. Rebuild (IMPORTANT: --no-cache flag!)
docker-compose build --no-cache

# 3. Start
docker-compose up -d

# 4. Wait 60 seconds
sleep 60

# 5. Test
curl http://localhost:3000/api/health
```

**Expected output:**
```json
{"status":"ok","database":"connected","websocket":"enabled","clients":0}
```

**If you get HTML (`<!DOCTYPE...`)**, the rebuild didn't work. Check:
```bash
# View nginx config inside container:
docker exec todoless-ngx-frontend cat /etc/nginx/conf.d/default.conf

# Should show /api/ location BEFORE / location
```

---

## ✅ Verify It's Fixed

### 1. Check Containers
```bash
docker-compose ps
```
All should be "Up", db and backend should be "healthy"

### 2. Test Backend Direct
```bash
curl http://localhost:4000/api/health
```
Should return JSON

### 3. Test Nginx Proxy
```bash
curl http://localhost:3000/api/health
```
Should return **SAME** JSON as above

### 4. Open Browser
```
http://localhost:3000
```

### 5. Check Browser Console (F12)
Should see:
```
✅ WebSocket connected
```

Should NOT see:
```
❌ Failed to fetch
❌ WebSocket error
❌ Unexpected token '<'
```

---

## 🆘 Still Not Working?

### Run Diagnostics
```bash
chmod +x diagnose.sh
./diagnose.sh
```

This will show you exactly what's wrong.

### Common Issues

**Problem: "Backend not responding"**
```bash
# Check logs:
docker-compose logs todoless-ngx-backend

# Look for:
# ✅ PostgreSQL connected
# ✅ Database initialized
# ✅ Real-time listener active
```

**Problem: "Proxy returns HTML"**
```bash
# Frontend container might not have new nginx config
# Force rebuild frontend only:
docker-compose build --no-cache todoless-ngx-frontend
docker-compose up -d todoless-ngx-frontend
```

**Problem: "Database not ready"**
```bash
# Database needs time to start
# Wait longer:
sleep 60

# Then test again:
curl http://localhost:4000/api/health
```

---

## 📖 More Help

- **Quick fixes**: `cat ERROR-FIXES.md`
- **Detailed troubleshooting**: `cat TROUBLESHOOTING.md`
- **Complete rebuild guide**: `cat REBUILD-NOW.md`

## 🎯 Using Makefile

If you prefer make commands:

```bash
# Fix everything:
make fix

# Run diagnostics:
make diagnose

# Check health:
make health

# View logs:
make logs
```

---

## ⚙️ What The Fix Does

The rebuild fixes these issues:

1. **Nginx Configuration**
   - Properly orders proxy locations
   - `/api/` proxied to backend BEFORE catch-all `/`
   - WebSocket upgrade headers configured

2. **Backend WebSocket**
   - Dedicated `/ws` endpoint
   - Proper upgrade handling
   - Real-time updates via PostgreSQL LISTEN/NOTIFY

3. **API Client**
   - Empty `VITE_API_URL` for production (nginx proxy)
   - Relative URLs for API calls
   - Correct WebSocket URL detection

---

## 🎉 After It Works

1. **Create admin user:**
   ```bash
   make admin
   # or
   ./scripts/create-admin.sh admin@local admin123 Admin
   ```

2. **Login:**
   - Go to http://localhost:3000
   - Email: `admin@local`
   - Password: `admin123`

3. **Start using the app!**

---

**Need more help?** All documentation is in the repo:
- Quick start: `START-HERE.md`
- Full manual: `README.md`
- All commands: `docs/COMMANDS.md`
