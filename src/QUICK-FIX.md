# 🔧 Quick Fix for Common Errors

## Error: "SyntaxError: Unexpected token '<', "<!DOCTYPE "..."

This error means the frontend is receiving HTML instead of JSON from the API.

### 🎯 Instant Fix

Run the automatic fix script:

```bash
chmod +x fix-errors.sh diagnose.sh
./fix-errors.sh
```

The script will ask how you're running the app (Docker or npm run dev) and fix it automatically.

---

## Manual Fix Instructions

### If using Docker Compose:

1. **Stop everything**
   ```bash
   docker-compose down
   ```

2. **Check environment files**
   ```bash
   # Make sure these exist:
   ls -la .env .env.production
   
   # Create if missing:
   cp .env.example .env
   echo "VITE_API_URL=" > .env.production
   ```

3. **Rebuild images**
   ```bash
   docker-compose build --no-cache
   ```

4. **Start containers**
   ```bash
   docker-compose up -d
   ```

5. **Wait and check**
   ```bash
   # Wait 30 seconds for startup
   sleep 30
   
   # Check health
   ./health-check.sh
   ```

6. **Access app**
   ```
   http://localhost:3000
   ```

---

### If using npm run dev (development):

1. **Check environment file**
   ```bash
   # Create .env.development with correct URL
   echo "VITE_API_URL=http://localhost:4000" > .env.development
   ```

2. **Start database**
   ```bash
   chmod +x dev.sh
   ./dev.sh
   ```

3. **Start backend** (in new terminal)
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Start frontend** (in new terminal)
   ```bash
   npm install
   npm run dev
   ```

5. **Access app**
   ```
   http://localhost:3000
   ```

---

## Error: "WebSocket error: { isTrusted: true }"

This error means WebSocket can't connect.

### For Docker Compose:

WebSocket should work automatically through nginx proxy. If not:

```bash
# Check nginx config
docker exec todoless-ngx-frontend cat /etc/nginx/conf.d/default.conf | grep -A 10 "location /ws"

# Should show:
# location /ws {
#     proxy_pass http://todoless-ngx-backend:4000/ws;
#     proxy_http_version 1.1;
#     proxy_set_header Upgrade $http_upgrade;
#     proxy_set_header Connection "upgrade";
# }

# If config is wrong, rebuild:
docker-compose build todoless-ngx-frontend --no-cache
docker-compose up -d
```

### For npm run dev:

Check `vite.config.ts` has WebSocket proxy:

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
    },
    '/ws': {
      target: 'http://localhost:4000',
      ws: true,
      changeOrigin: true,
    },
  },
},
```

If missing, the file is already fixed in the repository.

---

## 🔍 Diagnostic Tools

### Run diagnostic to identify the problem:

```bash
chmod +x diagnose.sh
./diagnose.sh
```

This will show:
- ✅ What's running (Docker or local)
- ✅ Which ports are active
- ✅ If backend/frontend are responding
- ✅ Configuration status
- ✅ Specific fixes for your situation

### Check system health:

```bash
chmod +x health-check.sh
./health-check.sh
```

This shows detailed status of all services.

---

## 🚨 Still Not Working?

### 1. Check logs

**Docker:**
```bash
docker-compose logs -f
```

**Local development:**
```bash
# Backend logs are in the terminal where you ran "npm run dev"
# Frontend logs are in the terminal where you ran "npm run dev"
# Browser console (F12) shows frontend errors
```

### 2. Verify backend is running

```bash
curl http://localhost:4000/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected",
  "websocket": "enabled",
  "clients": 0
}
```

If you get HTML or connection refused:
- **Docker**: Backend container is not running or unhealthy
- **Local**: Backend is not started or crashed

### 3. Check database connection

**Docker:**
```bash
docker exec todoless-ngx-db psql -U todoless -d todoless -c "SELECT version();"
```

**Local dev:**
```bash
docker exec todoless-ngx-db-dev psql -U todoless -d todoless -c "SELECT version();"
```

### 4. Verify Dockerfiles are in correct location

```bash
ls -la Dockerfile backend/Dockerfile
```

Should show:
```
-rw-r--r--  1 user  staff  ... Dockerfile
-rw-r--r--  1 user  staff  ... backend/Dockerfile
```

**NOT** directories like `/Dockerfile/main.tsx`

If they're directories:
```bash
# This is wrong - the files were saved incorrectly
rm -rf Dockerfile backend/Dockerfile

# The correct files are already in the repository
# Just run: ./fix-errors.sh
```

---

## ✅ Expected Behavior

### When everything works:

**Docker Compose:**
```bash
$ docker-compose ps
NAME                    STATUS
todoless-ngx-db         Up (healthy)
todoless-ngx-backend    Up (healthy)
todoless-ngx-frontend   Up

$ curl http://localhost:4000/api/health
{"status":"ok","database":"connected","websocket":"enabled"}

$ curl -I http://localhost:3000
HTTP/1.1 200 OK
```

**npm run dev:**
```bash
# Terminal 1: Database
$ ./dev.sh
✅ Database is ready

# Terminal 2: Backend  
$ cd backend && npm run dev
🚀 Todoless-ngx backend running on port 4000

# Terminal 3: Frontend
$ npm run dev
VITE v5.2.11  ready in 847 ms
➜  Local:   http://localhost:3000/
```

---

## 📚 More Help

- **Full deployment guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **All fixes explained**: [ERRORS-FIXED.md](./ERRORS-FIXED.md)
- **Docker details**: [DOCKER-FIXES.md](./DOCKER-FIXES.md)
- **Script usage**: [SCRIPTS.md](./SCRIPTS.md)

---

## 🆘 Emergency Reset

If nothing works, completely reset:

```bash
# Stop and remove everything
docker-compose down -v
docker-compose -f docker-compose.dev.yml down -v

# Remove node modules
rm -rf node_modules backend/node_modules

# Start fresh
./fix-errors.sh
```

**⚠️ WARNING**: This deletes all data in the database!
