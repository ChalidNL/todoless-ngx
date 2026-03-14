# ✅ Fixed: API Connection Issues

## Problem
- ❌ `TypeError: Failed to fetch`
- ❌ `WebSocket error`

## Root Cause
Frontend was trying to connect directly to `http://localhost:4000` from the browser, which doesn't work in Docker containers.

## Solution: Nginx Reverse Proxy

### Architecture Before (Broken)
```
Browser → http://localhost:4000/api ❌ (doesn't exist from browser)
```

### Architecture After (Fixed)
```
Browser → http://localhost:3000/api → Nginx Proxy → Backend:4000 ✅
Browser → ws://localhost:3000/ws → Nginx Proxy → Backend WebSocket ✅
```

## Changes Made

### 1. Nginx Configuration (`/nginx.conf`)
Added reverse proxy routes:

```nginx
# Proxy API requests to backend
location /api {
    proxy_pass http://todoless-ngx-backend:4000;
    # ... headers
}

# Proxy WebSocket connections
location /ws {
    proxy_pass http://todoless-ngx-backend:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 2. API Client (`/lib/api-client.ts`)
Updated to use empty API URL (same host):

```typescript
// If VITE_API_URL is empty, use same host via nginx proxy
const API_URL = import.meta.env.VITE_API_URL || '';

// Result: fetch('/api/tasks') → http://localhost:3000/api/tasks → nginx → backend
```

### 3. WebSocket Connection (`/context/AppContext.api.tsx`)
Smart WebSocket URL detection:

```typescript
const apiUrl = import.meta.env.VITE_API_URL || '';
let wsUrl: string;

if (!apiUrl) {
  // Same host via nginx proxy
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  wsUrl = `${protocol}//${window.location.host}/ws`;
} else {
  // Development or custom backend
  wsUrl = apiUrl.replace('http', 'ws');
}
```

### 4. Dockerfile (`/Dockerfile`)
Build with empty VITE_API_URL:

```dockerfile
# Build (API URL will be empty = same host via nginx proxy)
ENV VITE_API_URL=
RUN npm run build
```

### 5. Environment Files
- `.env.development` - For `npm run dev` → `VITE_API_URL=http://localhost:4000`
- `.env.production` - For Docker build → `VITE_API_URL=` (empty)

## How It Works Now

### Production (Docker)
1. Browser requests `http://localhost:3000`
2. Nginx serves React app
3. React app fetches `/api/tasks` (relative URL)
4. Nginx proxies to `http://todoless-ngx-backend:4000/api/tasks`
5. Backend responds
6. Nginx returns response to browser

### Development (`npm run dev`)
1. Vite dev server on `http://localhost:5173`
2. Uses `VITE_API_URL=http://localhost:4000`
3. Direct connection to backend (no proxy needed)

## Testing

### Start Services
```bash
docker-compose down
docker-compose up -d --build
```

### Check Logs
```bash
docker-compose logs -f

# Should see:
# ✅ PostgreSQL connected
# ✅ Database initialized
# ✅ Real-time listener active
# 🚀 Todoless-ngx backend running on port 4000
```

### Open Browser
```
http://localhost:3000
```

### Browser Console Should Show
```
✅ WebSocket connected
```

### No Errors!
```
❌ TypeError: Failed to fetch  ← GONE
❌ WebSocket error            ← GONE
```

## Network Flow Diagram

```
┌─────────────────────────────────────────┐
│         Browser (Port 3000)             │
│                                         │
│  GET /                                  │
│  GET /api/tasks                         │
│  WS  /ws                                │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│    Nginx (todoless-ngx-frontend:80)     │
│                                         │
│  /          → Serve React app           │
│  /api/*     → Proxy to backend:4000     │
│  /ws        → Proxy WebSocket           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Express Backend (backend:4000)        │
│                                         │
│  GET  /api/tasks                        │
│  POST /api/tasks                        │
│  WebSocket on same port                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   PostgreSQL (db:5432)                  │
│                                         │
│  LISTEN/NOTIFY for real-time            │
└─────────────────────────────────────────┘
```

## Key Points

✅ **No CORS issues** - All requests go to same host  
✅ **No port conflicts** - Frontend and backend on same port (3000) via proxy  
✅ **WebSocket works** - Nginx handles upgrade headers  
✅ **Production ready** - Works with HTTPS (just update nginx config)  
✅ **Development friendly** - Override VITE_API_URL for local dev  

## Verification

### Health Check
```bash
# Frontend (should serve HTML)
curl http://localhost:3000

# API via proxy (should return JSON)
curl http://localhost:3000/api/health

# Direct backend (optional, for testing)
curl http://localhost:4000/api/health
```

### WebSocket Test
Open browser console:
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (e) => console.log('Message:', e.data);
```

Should see: `Connected!`

## Common Issues

### Still getting "Failed to fetch"?
```bash
# Check if backend is running
docker-compose ps

# Check backend logs
docker-compose logs todoless-ngx-backend

# Restart services
docker-compose restart
```

### WebSocket not connecting?
```bash
# Check nginx config
docker exec todoless-ngx-frontend cat /etc/nginx/conf.d/default.conf

# Should see location /ws block
```

### CORS errors?
Not possible anymore! All requests go through nginx on same host.

---

**Everything should work now!** 🎉

The frontend and backend are properly connected via nginx reverse proxy, eliminating all cross-origin and connection issues.
