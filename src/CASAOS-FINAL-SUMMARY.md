# To Do Less — CasaOS Deployment (Final Summary)

## ✅ What's Been Created

You now have everything needed to deploy To Do Less on CasaOS:

### 📋 Core Files

1. **`docker-compose.yml`** — CasaOS-ready compose file
   - PocketBase 0.22.0 backend
   - Frontend nginx container (placeholder - you build this)
   - Proper networking, volumes, health checks
   - CasaOS metadata for App Store

2. **`Dockerfile.casaos`** — Frontend build file
   - Multi-stage build (Node.js → nginx)
   - Hardcoded PocketBase URL to `/pb`
   - Nginx proxy configuration included
   - Health checks enabled

3. **`nginx-casaos.conf`** — Nginx configuration
   - Serves React SPA
   - Proxies `/pb/*` to PocketBase service
   - WebSocket support for realtime
   - Security headers

### 🛠️ Helper Files

4. **`build-casaos-image.sh`** — Interactive build script
   - Guides you through building the frontend image
   - Supports GHCR and Docker Hub
   - Auto-updates docker-compose.yml
   - Error handling and validation

5. **`README-CASAOS-FINAL.md`** — User-friendly guide
   - Quick start instructions
   - Troubleshooting section
   - Feature overview

6. **`CASAOS-DEPLOYMENT.md`** — Detailed deployment docs
   - Step-by-step build process
   - Environment variables
   - Architecture diagrams
   - Update procedures

7. **`POCKETBASE-VERSION.md`** — Version guide
   - Why we use 0.22.0
   - How to upgrade safely
   - Compatibility matrix

---

## 🚀 Quick Start (3 Steps)

### Step 1: Build Frontend Image

```bash
chmod +x build-casaos-image.sh
./build-casaos-image.sh
```

Follow the prompts. The script will:
- Ask for your registry (GitHub/Docker Hub)
- Build the image
- Push to registry
- Update docker-compose.yml automatically

### Step 2: Make Package Public

**For GitHub Container Registry:**
1. Go to https://github.com/YOUR_USERNAME?tab=packages
2. Click `todoless-frontend`
3. Package settings → Make public

**For Docker Hub:**
1. Go to https://hub.docker.com
2. Find `todoless-frontend` repository
3. Settings → Make public

### Step 3: Deploy to CasaOS

1. Open CasaOS web interface
2. App Store → Custom Install
3. Paste `docker-compose.yml` contents
4. Click Install

**Done!** Access at `http://your-casaos-ip:7070`

---

## 📁 File Structure Overview

```
todoless-ngx/
├── docker-compose.yml          ← CasaOS deployment file
├── Dockerfile.casaos           ← Builds frontend image
├── nginx-casaos.conf           ← Nginx with PocketBase proxy
│
├── build-casaos-image.sh       ← Interactive build helper
├── README-CASAOS-FINAL.md      ← User documentation
├── CASAOS-DEPLOYMENT.md        ← Detailed guide
├── POCKETBASE-VERSION.md       ← Version information
│
├── package.json                ← Frontend dependencies
├── vite.config.ts              ← Build configuration
├── App.tsx                     ← Main React app
├── components/                 ← React components
├── lib/                        ← API clients
│   ├── pocketbase.ts           ← PocketBase client setup
│   └── pocketbase-client.ts    ← API wrapper
│
└── pb_migrations/              ← Database schema
    ├── README.md
    └── initial_schema.js
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  CasaOS Host (http://192.168.1.x:7070)         │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Container: todoless-frontend             │ │
│  │  Image: ghcr.io/YOU/todoless-frontend    │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │  Nginx (port 80 → WEBUI_PORT)       │ │ │
│  │  │                                     │ │ │
│  │  │  GET /        → React SPA          │ │ │
│  │  │  GET /pb/*    → Proxy to PocketBase│ │ │
│  │  │  WS  /pb/api/ → WebSocket proxy    │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  └───────────────┬───────────────────────────┘ │
│                  │                             │
│                  │ Docker Network              │
│                  │ (todoless-net)              │
│                  ↓                             │
│  ┌───────────────────────────────────────────┐ │
│  │  Container: todoless-pocketbase           │ │
│  │  Image: ghcr.io/muchobien/pocketbase:0.22│ │
│  │                                           │ │
│  │  Port: 8090 (internal only)              │ │
│  │  Health: /api/health                     │ │
│  │  Admin UI: /pb/_/ (via nginx)            │ │
│  └───────────────┬───────────────────────────┘ │
│                  │                             │
│                  ↓                             │
│  ┌───────────────────────────────────────────┐ │
│  │  /DATA/AppData/todoless/                  │ │
│  │  ├── pb_data/        ← SQLite DB          │ │
│  │  └── pb_migrations/  ← Schema files       │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

User Browser → http://casaos-ip:7070
                     ↓
            Nginx serves React app
                     ↓
React app calls /pb/api/collections/...
                     ↓
        Nginx proxies to pocketbase:8090
                     ↓
            PocketBase handles request
                     ↓
        Returns data to browser
```

---

## 🎯 Key Design Decisions

### 1. **No Public Image** (Yet)
- Repository is private
- User must build and push once
- `build-casaos-image.sh` automates this
- Alternative: Set up GitHub Actions CI/CD

### 2. **PocketBase Proxy via Nginx**
- **Problem:** Browser can't reach `http://pocketbase:8090`
- **Solution:** Nginx proxies `/pb/*` → `http://pocketbase:8090`
- **Benefit:** Single port, no CORS issues, works in browser
- **Build:** Frontend built with `VITE_POCKETBASE_URL=/pb`

### 3. **Internal PocketBase Port**
- Port 8090 is `expose` not `ports`
- Only accessible within Docker network
- Admin UI accessed via `/pb/_/` through nginx
- More secure (not directly exposed)

### 4. **CasaOS Path Convention**
- Uses `/DATA/AppData/$AppID/` for volumes
- `$AppID` auto-set by CasaOS to `todoless`
- Persistent across container rebuilds
- Easy to backup

### 5. **Pinned Versions**
- PocketBase: `0.22.0` (not `latest`)
- Nginx: `1.27-alpine` (not `latest`)
- Frontend: User sets version tag
- Prevents breaking changes

---

## ✔️ Verification Checklist

Before deploying, confirm:

- [ ] `build-casaos-image.sh` completed successfully
- [ ] Frontend image pushed to registry
- [ ] Package/repository is public
- [ ] `docker-compose.yml` updated with real image name (not `YOUR_FRONTEND_IMAGE:TAG`)
- [ ] File looks like: `image: ghcr.io/username/todoless-frontend:1.0.0`

After deploying to CasaOS:

- [ ] Both containers running: `docker ps | grep todoless`
- [ ] PocketBase healthy: `docker logs todoless-pocketbase`
- [ ] Frontend accessible: `http://casaos-ip:7070`
- [ ] Onboarding screen appears
- [ ] Can create user account
- [ ] Can create tasks/notes
- [ ] PocketBase admin works: `http://casaos-ip:7070/pb/_/`

---

## 🆘 Common Issues

### Issue: "YOUR_FRONTEND_IMAGE:TAG" not found

**Cause:** You didn't replace the placeholder in docker-compose.yml

**Fix:**
```bash
# Run the build script which auto-updates compose file
./build-casaos-image.sh

# OR manually edit docker-compose.yml line 36:
image: ghcr.io/YOUR_USERNAME/todoless-frontend:1.0.0
```

### Issue: "Failed to pull image"

**Cause:** Package is private or wrong registry

**Fix:**
- Make package public on GitHub or Docker Hub
- Verify image exists: `docker pull ghcr.io/username/todoless-frontend:1.0.0`
- Check spelling of username and image name

### Issue: "Connection Error" in browser

**Cause:** PocketBase not healthy or network issue

**Fix:**
```bash
# Check PocketBase health
docker logs todoless-pocketbase

# Should see: "Server started at http://0.0.0.0:8090"

# Restart if needed
docker restart todoless-pocketbase
```

### Issue: Can't access PocketBase admin

**Cause:** Wrong URL format

**Fix:**
- ❌ Wrong: `http://ip:port/_/`
- ❌ Wrong: `http://ip:8090/_/`
- ✅ Correct: `http://ip:port/pb/_/`

Note the `/pb/` prefix!

---

## 📦 What Happens on First Run

1. **CasaOS pulls images:**
   - `ghcr.io/muchobien/pocketbase:0.22.0`
   - Your frontend image

2. **Creates volumes:**
   - `/DATA/AppData/todoless/pb_data/`
   - `/DATA/AppData/todoless/pb_migrations/`

3. **PocketBase initializes:**
   - Creates SQLite database
   - Runs migrations from `pb_migrations/`
   - Creates admin account (from env vars)
   - Starts on port 8090 (internal)

4. **Frontend starts:**
   - Nginx serves React SPA on port 80
   - Mapped to host port 7070 (or next available)
   - Waits for PocketBase to be healthy

5. **User accesses app:**
   - Browser loads React app
   - Onboarding detects no users exist
   - Shows first-run setup screen

---

## 🔄 Update Strategy

### Frontend Updates

When you change the React app:

```bash
# 1. Increment version
docker build -f Dockerfile.casaos -t ghcr.io/user/todoless-frontend:1.1.0 .
docker push ghcr.io/user/todoless-frontend:1.1.0

# 2. Update CasaOS
# Edit app → Change image tag → Restart
```

### PocketBase Updates

When upgrading database:

```bash
# 1. Backup first!
cp -r /DATA/AppData/todoless/pb_data /backup/

# 2. Update docker-compose.yml
image: ghcr.io/muchobien/pocketbase:0.23.0

# 3. Pull and restart
docker compose pull pocketbase
docker compose up -d pocketbase

# 4. Check logs
docker logs -f todoless-pocketbase
```

See `POCKETBASE-VERSION.md` for detailed upgrade guide.

---

## 📚 Next Steps

After successful deployment:

1. **Change admin password** in CasaOS env vars
2. **Create invite codes** in Settings → Invite Manager
3. **Share with team** (invite-only registration)
4. **Set up backups** of `/DATA/AppData/todoless/`
5. **Optional:** Add reverse proxy (Caddy/Traefik) for HTTPS
6. **Optional:** Set up automatic backups in CasaOS

---

## 📞 Support Resources

- **This deployment:** `README-CASAOS-FINAL.md`
- **Build help:** `./build-casaos-image.sh --help`
- **Version info:** `POCKETBASE-VERSION.md`
- **PocketBase docs:** https://pocketbase.io/docs/
- **CasaOS docs:** https://casaos.io/docs/

---

## 🎉 You're Ready!

Everything is prepared. Just run:

```bash
chmod +x build-casaos-image.sh
./build-casaos-image.sh
```

Then paste `docker-compose.yml` into CasaOS and click Install.

**Enjoy your self-hosted task manager! 🚀**
