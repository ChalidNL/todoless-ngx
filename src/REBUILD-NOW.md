# 🔄 Complete Rebuild Instructions

**Follow these exact steps to fix all errors:**

## Step 1: Stop Everything
```bash
docker-compose down
```

## Step 2: Check Environment File
```bash
# Create .env if missing:
cp backend/.env.example .env

# Edit .env and set these:
nano .env
```

**Minimum required in `.env`:**
```env
POSTGRES_DB=todoless
POSTGRES_USER=todoless
POSTGRES_PASSWORD=change-this-password

JWT_SECRET=change-this-to-random-32-chars

FRONTEND_PORT=3000
BACKEND_PORT=4000
```

**Generate secure secrets:**
```bash
# PostgreSQL password:
openssl rand -base64 32

# JWT secret:
openssl rand -base64 32
```

## Step 3: Clean Build (No Cache)
```bash
docker-compose build --no-cache
```

This will:
- ✅ Rebuild frontend with nginx proxy config
- ✅ Rebuild backend with WebSocket support
- ✅ Pull PostgreSQL image

## Step 4: Start Services
```bash
docker-compose up -d
```

## Step 5: Wait for Services to be Healthy
```bash
# Check every 10 seconds:
watch -n 10 docker-compose ps

# Wait until you see:
# todoless-ngx-db         Up (healthy)
# todoless-ngx-backend    Up (healthy)
# todoless-ngx-frontend   Up
```

**This can take 60-90 seconds on first start!**

## Step 6: Verify Backend is Working
```bash
# Test direct backend:
curl http://localhost:4000/api/health

# Should return:
# {"status":"ok","database":"connected","websocket":"enabled"}
```

## Step 7: Verify Nginx Proxy is Working
```bash
# Test via nginx proxy:
curl http://localhost:3000/api/health

# Should return SAME JSON as above
# If you get HTML, something is wrong!
```

## Step 8: Create Admin User
```bash
chmod +x scripts/create-admin.sh
./scripts/create-admin.sh admin@local admin123 Admin

# Should see:
# ✅ Admin user created successfully!
```

## Step 9: Open Browser
```
http://localhost:3000
```

## Step 10: Check Browser Console
```
Press F12 → Console tab
```

**Should see:**
```
✅ WebSocket connected
```

**Should NOT see:**
```
❌ TypeError: Failed to fetch
❌ WebSocket error
❌ Unexpected token '<'
```

---

## If Still Getting Errors:

### Error: "Unexpected token '<'"

The nginx proxy is not working. Check:

```bash
# 1. View nginx config:
docker exec todoless-ngx-frontend cat /etc/nginx/conf.d/default.conf

# 2. Should see /api/ BEFORE /:
# location /api/ {
#     proxy_pass http://todoless-ngx-backend:4000/api/;
# }
#
# location / {
#     try_files $uri $uri/ /index.html;
# }

# 3. Test backend from frontend container:
docker exec todoless-ngx-frontend wget -O- http://todoless-ngx-backend:4000/api/health

# Should return JSON
```

### Error: WebSocket fails

```bash
# 1. Check backend logs:
docker-compose logs todoless-ngx-backend | grep WebSocket

# Should see when you open the app:
# 🔌 WebSocket client connected

# 2. Test WebSocket manually:
# Open browser console (F12):
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onopen = () => console.log('Connected!');

# Should see: Connected!
```

### Error: Database connection fails

```bash
# 1. Check database is running:
docker-compose ps todoless-ngx-db

# Must be: Up (healthy)

# 2. Test connection:
docker exec todoless-ngx-backend nc -zv todoless-ngx-db 5432

# Should see: Connection successful

# 3. Check credentials match:
grep POSTGRES .env
# vs
docker-compose logs todoless-ngx-backend | grep "Database"
```

---

## Complete Fresh Start (If Nothing Works)

```bash
# 1. Stop and remove everything:
docker-compose down -v

# 2. Remove database volume:
docker volume rm todoless-ngx_todoless-ngx-db-data

# 3. Remove images:
docker rmi todoless-ngx-todoless-ngx-frontend
docker rmi todoless-ngx-todoless-ngx-backend

# 4. Clean build:
docker-compose build --no-cache

# 5. Start:
docker-compose up -d

# 6. Wait 90 seconds

# 7. Check logs:
docker-compose logs -f

# Look for these success messages:
# ✅ PostgreSQL connected
# ✅ Database initialized
# ✅ Real-time listener active
# 🚀 Todoless-ngx backend running on port 4000

# 8. Create admin:
./scripts/create-admin.sh admin@local admin123 Admin

# 9. Open browser:
# http://localhost:3000
```

---

## Verify Everything is Working

### Test 1: Frontend Loads
```bash
curl -I http://localhost:3000

# Should see: HTTP/1.1 200 OK
```

### Test 2: API via Proxy Works
```bash
curl http://localhost:3000/api/health

# Should see JSON:
# {"status":"ok","database":"connected","websocket":"enabled"}
```

### Test 3: Direct Backend Works
```bash
curl http://localhost:4000/api/health

# Should see SAME JSON as above
```

### Test 4: Database Works
```bash
docker exec todoless-ngx-db psql -U todoless -d todoless -c "SELECT NOW();"

# Should see current timestamp
```

### Test 5: WebSocket Works
```javascript
// In browser console (F12):
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onopen = () => console.log('✅ WebSocket connected');
ws.onmessage = (e) => console.log('📨 Message:', e.data);
ws.onerror = (e) => console.error('❌ Error:', e);

// Should see: ✅ WebSocket connected
```

### Test 6: Login Works
1. Go to http://localhost:3000
2. Click "Login"
3. Email: `admin@local`
4. Password: `admin123`
5. Should see the dashboard

---

## Monitoring

### Watch Logs Live
```bash
# All services:
docker-compose logs -f

# Just backend:
docker-compose logs -f todoless-ngx-backend

# Just frontend:
docker-compose logs -f todoless-ngx-frontend
```

### Check Resource Usage
```bash
docker stats
```

### View Database Tables
```bash
docker exec -it todoless-ngx-db psql -U todoless -d todoless

# List tables:
\dt

# View users:
SELECT * FROM users;

# Exit:
\q
```

---

## Success Checklist

After rebuild, verify:

- [ ] `docker-compose ps` shows all 3 services as "Up"
- [ ] Database shows "healthy" status
- [ ] Backend shows "healthy" status
- [ ] `curl http://localhost:3000/api/health` returns JSON
- [ ] `curl http://localhost:4000/api/health` returns JSON
- [ ] Browser shows app at http://localhost:3000
- [ ] Browser console shows "✅ WebSocket connected"
- [ ] No errors in browser console
- [ ] Can login with admin credentials
- [ ] Can create tasks/items/notes

**If all checked ✅ you're good to go!**

---

## Get Help

If after following all steps you still have issues:

1. **Run health check:**
   ```bash
   curl http://localhost:3000/api/health
   curl http://localhost:4000/api/health
   docker-compose ps
   docker-compose logs > all-logs.txt
   ```

2. **Check troubleshooting guide:**
   - See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

3. **Report issue with:**
   - Output from health check
   - Browser console errors (F12)
   - Docker logs: `docker-compose logs > logs.txt`
   - Your `.env` file (remove passwords!)

---

**Good luck! 🚀**
