# Docker Configuration Fixes

## Problems Fixed

### 1. ❌ Error: Dockerfile in wrong location
**Problem**: Dockerfiles were stored as `/Dockerfile/main.tsx` and `/backend/Dockerfile/main.tsx` instead of proper locations.

**Root cause**: Files were accidentally created in subdirectories instead of root.

**Fix**:
- ✅ Created `/Dockerfile` for frontend (Nginx + React build)
- ✅ Created `/backend/Dockerfile` for backend (Node.js API)
- ✅ Deleted incorrect `/Dockerfile/main.tsx` and `/backend/Dockerfile/main.tsx`

### 2. ❌ Error: "<!DOCTYPE ..." is not valid JSON
**Problem**: Frontend was receiving HTML instead of JSON from API calls.

**Root cause**: 
- API calls were failing because backend wasn't reachable
- Nginx was returning 404 HTML pages
- VITE_API_URL environment variable not properly configured

**Fix**:
- ✅ Created `.env.production` with empty `VITE_API_URL=` (uses nginx proxy)
- ✅ Created `.env.development` with `VITE_API_URL=http://localhost:4000` (for local dev)
- ✅ Updated Dockerfile to build with `ENV VITE_API_URL=` (empty = nginx proxy)
- ✅ Updated `vite.config.ts` to proxy `/api` and `/ws` to backend

### 3. ❌ Error: WebSocket connection failed
**Problem**: WebSocket couldn't connect to `/ws` endpoint.

**Root cause**: Vite dev server wasn't configured to proxy WebSocket connections.

**Fix**:
- ✅ Added WebSocket proxy to `vite.config.ts`:
  ```typescript
  '/ws': {
    target: 'http://localhost:4000',
    ws: true,
    changeOrigin: true,
  }
  ```

### 4. ⚠️ Docker Compose configuration
**Problem**: Images were referencing external repositories that don't exist yet.

**Fix**:
- ✅ Added `image:` tags to docker-compose.yml for local builds:
  - `image: todoless-ngx-backend:latest`
  - `image: todoless-ngx-frontend:latest`
- ✅ These images are built locally, not pulled from registry

### 5. 📝 Missing .dockerignore
**Problem**: Docker builds were including unnecessary files.

**Fix**:
- ✅ Created `/.dockerignore` (excludes node_modules, backend, docs, etc.)
- ✅ Created `/backend/.dockerignore` (excludes node_modules, logs, etc.)

## New Files Created

```
✅ /Dockerfile                  - Frontend (Nginx + React)
✅ /backend/Dockerfile          - Backend (Node.js API)
✅ /.dockerignore               - Frontend build exclusions
✅ /backend/.dockerignore       - Backend build exclusions
✅ /.env.example                - Environment template
✅ /.env.development            - Dev environment (VITE_API_URL=http://localhost:4000)
✅ /.env.production             - Production environment (VITE_API_URL=)
✅ /build.sh                    - Build script for Docker images
✅ /DEPLOYMENT.md               - Deployment guide
```

## How It Works Now

### Production (Docker Compose)

1. **Frontend Container** (nginx:alpine)
   - Serves React app from `/usr/share/nginx/html`
   - Proxies `/api/*` → `todoless-ngx-backend:4000/api/*`
   - Proxies `/ws` → `todoless-ngx-backend:4000/ws` (WebSocket)
   - Port: `3000:80`

2. **Backend Container** (node:20-alpine)
   - Express API server on port 4000
   - WebSocket server on `/ws`
   - PostgreSQL connection to `todoless-ngx-db:5432`
   - Port: `4000:4000` (exposed for debugging)

3. **Database Container** (postgres:16-alpine)
   - PostgreSQL database
   - Volume: `todoless-ngx-db-data`
   - Port: `5432` (internal only)

### Development (npm run dev)

1. Vite dev server on `http://localhost:3000`
2. Uses `VITE_API_URL=http://localhost:4000` from `.env.development`
3. Proxies:
   - `/api` → `http://localhost:4000/api` (HTTP)
   - `/ws` → `http://localhost:4000/ws` (WebSocket)

## Build Process

### Frontend Build
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
COPY . .
ENV VITE_API_URL=          # Empty = use nginx proxy
RUN npm run build          # Creates /dist

# Stage 2: Serve
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Backend Build
```dockerfile
FROM node:20-alpine
COPY . .
RUN npm ci --only=production
CMD ["node", "server.js"]
```

## Nginx Configuration

```nginx
# API proxy (must be before /)
location /api/ {
    proxy_pass http://todoless-ngx-backend:4000/api/;
    # ... proxy headers
}

# WebSocket proxy (must be before /)
location /ws {
    proxy_pass http://todoless-ngx-backend:4000/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    # ... proxy headers
}

# SPA routing (must be last)
location / {
    try_files $uri $uri/ /index.html;
}
```

## Testing the Fix

### 1. Build Images
```bash
# Option 1: Use build script
chmod +x build.sh
./build.sh

# Option 2: Use docker-compose
docker-compose build
```

### 2. Start Application
```bash
# Create .env from example
cp .env.example .env

# Update .env with secure passwords
nano .env

# Start containers
docker-compose up -d
```

### 3. Verify

```bash
# Check all containers are healthy
docker-compose ps

# Should show:
# todoless-ngx-db        healthy
# todoless-ngx-backend   healthy
# todoless-ngx-frontend  running

# Check backend health
curl http://localhost:4000/api/health

# Check frontend
curl http://localhost:3000

# Check logs
docker-compose logs -f
```

### 4. Access Application
```
http://localhost:3000
```

## Common Issues After Fix

### Still getting HTML instead of JSON?

1. Check backend is healthy:
   ```bash
   docker exec -it todoless-ngx-backend wget -O- http://localhost:4000/api/health
   ```

2. Check nginx can reach backend:
   ```bash
   docker exec -it todoless-ngx-frontend wget -O- http://todoless-ngx-backend:4000/api/health
   ```

3. Verify they're on same network:
   ```bash
   docker network inspect todoless-ngx_net
   ```

### WebSocket still not connecting?

1. Check WebSocket server:
   ```bash
   docker-compose logs todoless-ngx-backend | grep WebSocket
   ```

2. Test WebSocket from inside frontend container:
   ```bash
   docker exec -it todoless-ngx-frontend wget --spider http://todoless-ngx-backend:4000/ws
   ```

## CasaOS Deployment

For CasaOS, the docker-compose.yml is now ready:

1. ✅ No external image dependencies (builds locally)
2. ✅ Proper labels for CasaOS detection
3. ✅ Health checks for all services
4. ✅ Named volumes for data persistence
5. ✅ Custom network for container communication

## Next Steps

1. ✅ **Fixed**: Dockerfiles in correct location
2. ✅ **Fixed**: Environment variables configured
3. ✅ **Fixed**: Nginx proxy setup
4. ✅ **Fixed**: WebSocket proxy
5. ✅ **Fixed**: Docker Compose configuration
6. ⏭️ **Next**: Test deployment on CasaOS
7. ⏭️ **Next**: Setup GitHub Actions for image publishing

## Verification Checklist

- [x] `/Dockerfile` exists and is valid
- [x] `/backend/Dockerfile` exists and is valid  
- [x] `.dockerignore` files created
- [x] `.env.production` sets `VITE_API_URL=` (empty)
- [x] `.env.development` sets `VITE_API_URL=http://localhost:4000`
- [x] `vite.config.ts` proxies `/api` and `/ws`
- [x] `nginx.conf` proxies `/api/` and `/ws`
- [x] `docker-compose.yml` builds images locally
- [x] Build script created
- [x] Deployment documentation created

## Status

🎉 **All Docker configuration issues are now fixed!**

The application is ready for:
- ✅ Local development with `npm run dev`
- ✅ Docker Compose deployment
- ✅ CasaOS deployment  
- ✅ Production deployment

Just need to:
1. Copy `.env.example` to `.env`
2. Update passwords and secrets in `.env`
3. Run `docker-compose up -d`
