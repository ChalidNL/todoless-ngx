# 🔧 Troubleshooting Guide

## Quick Diagnostics

### 1. Check All Services Are Running
```bash
docker-compose ps

# Should see:
# todoless-ngx-db         Up (healthy)
# todoless-ngx-backend    Up (healthy)
# todoless-ngx-frontend   Up
```

### 2. Test Backend Directly
```bash
# From host machine:
curl http://localhost:4000/api/health

# Should return:
# {"status":"ok","database":"connected","websocket":"enabled"}
```

### 3. Test Backend via Nginx Proxy
```bash
# From host machine:
curl http://localhost:3000/api/health

# Should return SAME as above
# If you get HTML instead of JSON, nginx proxy is broken
```

### 4. Check Logs
```bash
# All services:
docker-compose logs -f

# Just backend:
docker-compose logs -f todoless-ngx-backend

# Just frontend:
docker-compose logs -f todoless-ngx-frontend

# Just database:
docker-compose logs -f todoless-ngx-db
```

---

## Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

**Cause:** Nginx is serving the React app HTML instead of proxying to the backend.

**Solution:**

### Step 1: Verify Nginx Config
```bash
docker exec todoless-ngx-frontend cat /etc/nginx/conf.d/default.conf
```

Should show `/api/` location **BEFORE** the `/` location:
```nginx
location /api/ {
    proxy_pass http://todoless-ngx-backend:4000/api/;
    ...
}

# This MUST come AFTER /api/
location / {
    try_files $uri $uri/ /index.html;
}
```

### Step 2: Test Backend Connection
```bash
# Test if backend container is reachable:
docker exec todoless-ngx-frontend ping -c 3 todoless-ngx-backend

# Should see replies
```

### Step 3: Rebuild Frontend
```bash
docker-compose down
docker-compose build --no-cache todoless-ngx-frontend
docker-compose up -d
```

### Step 4: Check Backend is Running
```bash
# Backend health check:
curl http://localhost:4000/api/health

# If this fails, backend is not running:
docker-compose logs todoless-ngx-backend
```

---

## Error: WebSocket Connection Failed

**Symptoms:**
- Browser console: `WebSocket error`
- No real-time updates

**Solution:**

### Step 1: Check WebSocket Endpoint
```bash
# Test WebSocket upgrade:
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  http://localhost:3000/ws

# Should see: HTTP/1.1 101 Switching Protocols
```

### Step 2: Verify Backend WebSocket
```bash
# Check backend logs for WebSocket connections:
docker-compose logs -f todoless-ngx-backend

# When you open the app, should see:
# 🔌 WebSocket client connected
```

### Step 3: Test Direct WebSocket Connection
```javascript
// In browser console:
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onopen = () => console.log('✅ Connected');
ws.onerror = (e) => console.error('❌ Error:', e);
ws.onmessage = (e) => console.log('📨 Message:', e.data);
```

### Step 4: Check Nginx WebSocket Config
```bash
docker exec todoless-ngx-frontend cat /etc/nginx/conf.d/default.conf | grep -A 10 "location /ws"
```

Should see:
```nginx
location /ws {
    proxy_pass http://todoless-ngx-backend:4000/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    ...
}
```

---

## Error: Database Connection Failed

**Symptoms:**
- Backend logs: `Error: connect ECONNREFUSED`
- Health check fails

**Solution:**

### Step 1: Check PostgreSQL is Running
```bash
docker-compose ps todoless-ngx-db

# Should be: Up (healthy)
```

### Step 2: Test Database Connection
```bash
# From backend container:
docker exec todoless-ngx-backend nc -zv todoless-ngx-db 5432

# Should see: Connection successful
```

### Step 3: Check Database Credentials
```bash
# Verify .env file exists and has correct values:
cat .env | grep POSTGRES

# Should see:
# POSTGRES_DB=todoless
# POSTGRES_USER=todoless
# POSTGRES_PASSWORD=<your-password>
```

### Step 4: Restart Database
```bash
docker-compose restart todoless-ngx-db

# Wait 30 seconds, then:
docker-compose ps
```

---

## Error: CORS Policy Error

**Symptoms:**
- Browser console: `Access to fetch...blocked by CORS policy`

**This should NOT happen** with nginx proxy setup! If you see this:

### Solution: Check API URL
```bash
# Frontend should use empty API URL (nginx proxy):
docker exec todoless-ngx-frontend cat /usr/share/nginx/html/assets/*.js | grep -o 'http://[^"]*' | head -5

# Should NOT see any http://localhost:4000 URLs
# If you do, rebuild frontend:
docker-compose build --no-cache todoless-ngx-frontend
docker-compose up -d
```

---

## Error: Port Already in Use

**Symptoms:**
- `docker-compose up` fails
- Error: `port is already allocated`

**Solution:**

### Option 1: Change Ports in .env
```bash
# Edit .env:
FRONTEND_PORT=3001
BACKEND_PORT=4001

# Restart:
docker-compose down
docker-compose up -d
```

### Option 2: Kill Process Using Port
```bash
# Find process on port 3000:
lsof -i :3000

# Kill it:
kill -9 <PID>

# Then restart:
docker-compose up -d
```

---

## Error: Container Keeps Restarting

**Solution:**

### Check Logs
```bash
docker-compose logs <container-name>

# Common issues:
# - Missing .env file
# - Wrong credentials
# - Port conflicts
# - Out of memory
```

### Verify .env File
```bash
# Must have these:
cat .env

# Required:
POSTGRES_PASSWORD=<something>
JWT_SECRET=<something-32-chars>
```

---

## Database Not Initializing

**Symptoms:**
- Backend fails to start
- Logs: `relation "users" does not exist`

**Solution:**

### Option 1: Force Reinitialize
```bash
# Remove database volume:
docker-compose down
docker volume rm todoless-ngx_todoless-ngx-db-data

# Start fresh:
docker-compose up -d

# Wait 60 seconds, check logs:
docker-compose logs -f todoless-ngx-backend
```

### Option 2: Manual Database Init
```bash
# Connect to database:
docker exec -it todoless-ngx-db psql -U todoless -d todoless

# Run init script:
\i /docker-entrypoint-initdb.d/init.sql

# Exit:
\q

# Restart backend:
docker-compose restart todoless-ngx-backend
```

---

## Frontend Shows White Page

**Solution:**

### Step 1: Check Browser Console
```
F12 → Console tab
```

Look for errors.

### Step 2: Check Nginx is Serving Files
```bash
# List files in nginx:
docker exec todoless-ngx-frontend ls -la /usr/share/nginx/html/

# Should see:
# index.html
# assets/
# vite.svg
```

### Step 3: Rebuild Frontend
```bash
docker-compose build --no-cache todoless-ngx-frontend
docker-compose up -d
```

---

## Can't Login / Register

**Solution:**

### Step 1: Check Admin User Exists
```bash
# List users:
docker exec todoless-ngx-db psql -U todoless -d todoless -c "SELECT email, role FROM users;"
```

### Step 2: Create Admin User
```bash
./scripts/create-admin.sh admin@local admin123 Admin
```

### Step 3: Check JWT Secret
```bash
# Must be set in .env:
grep JWT_SECRET .env

# If empty, set it:
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env

# Restart:
docker-compose restart todoless-ngx-backend
```

---

## Complete Reset (Nuclear Option)

**Warning: This deletes ALL data!**

```bash
# Stop everything:
docker-compose down

# Remove all volumes:
docker volume rm todoless-ngx_todoless-ngx-db-data

# Remove all images:
docker-compose down --rmi all

# Rebuild from scratch:
docker-compose build --no-cache
docker-compose up -d

# Wait 60 seconds, create admin:
./scripts/create-admin.sh admin@local admin123 Admin

# Done!
```

---

## Performance Issues

### Check Resource Usage
```bash
docker stats
```

### Limit Container Resources
Edit `docker-compose.yml`:
```yaml
services:
  todoless-ngx-db:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Clear Old Data
```bash
# Archive old tasks:
docker exec todoless-ngx-db psql -U todoless -d todoless -c "
  UPDATE tasks 
  SET archived_at = NOW() 
  WHERE status = 'done' 
    AND completed_at < NOW() - INTERVAL '30 days';
"
```

---

## Still Having Issues?

### Collect Debug Info
```bash
# 1. Service status:
docker-compose ps > debug.txt

# 2. All logs:
docker-compose logs >> debug.txt

# 3. Environment:
echo "--- Environment ---" >> debug.txt
cat .env >> debug.txt

# 4. Network test:
echo "--- Network Test ---" >> debug.txt
curl http://localhost:3000/api/health >> debug.txt 2>&1
curl http://localhost:4000/api/health >> debug.txt 2>&1

# 5. Database test:
echo "--- Database Test ---" >> debug.txt
docker exec todoless-ngx-db pg_isready -U todoless >> debug.txt 2>&1
```

Share `debug.txt` when reporting issues!

---

## Quick Health Check Script

Save as `health.sh`:
```bash
#!/bin/bash
echo "🏥 Todoless-ngx Health Check"
echo "=============================="

echo -n "Frontend: "
curl -s http://localhost:3000 > /dev/null && echo "✅" || echo "❌"

echo -n "Backend (direct): "
curl -s http://localhost:4000/api/health > /dev/null && echo "✅" || echo "❌"

echo -n "Backend (via proxy): "
curl -s http://localhost:3000/api/health > /dev/null && echo "✅" || echo "❌"

echo -n "Database: "
docker exec todoless-ngx-db pg_isready -U todoless > /dev/null 2>&1 && echo "✅" || echo "❌"

echo -n "WebSocket: "
# Check if backend has WebSocket enabled
curl -s http://localhost:4000/api/health | grep -q "websocket" && echo "✅" || echo "❌"

echo ""
echo "Container Status:"
docker-compose ps
```

Run: `chmod +x health.sh && ./health.sh`
