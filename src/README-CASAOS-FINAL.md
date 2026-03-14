# To Do Less — CasaOS Deployment Guide

Self-hosted multi-user task manager with real-time sync, powered by PocketBase.

---

## 🚨 CRITICAL: No Public Image Available Yet

**This repository does not have a pre-built Docker image.** You must build and push it yourself before deploying to CasaOS.

### Quick Build (5 minutes)

```bash
# Make the script executable
chmod +x build-casaos-image.sh

# Run the interactive build script
./build-casaos-image.sh
```

The script will:
1. Ask for your container registry (GitHub or Docker Hub)
2. Login and build the frontend image
3. Push to your registry
4. Auto-update `docker-compose.yml` with the correct image name

**After building**, proceed to deployment below.

---

## Manual Build (if script fails)

### For GitHub Container Registry (GHCR)

```bash
# 1. Login
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# 2. Build
docker build -f Dockerfile.casaos -t ghcr.io/YOUR_USERNAME/todoless-frontend:1.0.0 .

# 3. Push
docker push ghcr.io/YOUR_USERNAME/todoless-frontend:1.0.0

# 4. Make package public:
# GitHub → Profile → Packages → todoless-frontend → Settings → Make public
```

### For Docker Hub

```bash
# 1. Login
docker login

# 2. Build
docker build -f Dockerfile.casaos -t YOUR_USERNAME/todoless-frontend:1.0.0 .

# 3. Push
docker push YOUR_USERNAME/todoless-frontend:1.0.0

# 4. Make repository public in Docker Hub settings
```

---

## 📝 Update docker-compose.yml

Replace this line in `docker-compose.yml`:

```yaml
image: YOUR_FRONTEND_IMAGE:TAG
```

With your actual image:

```yaml
# For GHCR:
image: ghcr.io/YOUR_USERNAME/todoless-frontend:1.0.0

# For Docker Hub:
image: YOUR_USERNAME/todoless-frontend:1.0.0
```

---

## 🚀 Deploy to CasaOS

1. **Open CasaOS** web interface
2. Go to **App Store** → **Custom Install**
3. **Paste** the contents of `docker-compose.yml`
4. **Click Install**

CasaOS will:
- Pull the PocketBase and frontend images
- Create persistent storage at `/DATA/AppData/todoless/`
- Set up networking between containers
- Expose the app on port 7070 (or next available)

---

## ✅ First-Time Setup

1. **Access the app** at `http://your-casaos-ip:7070`
2. **Follow onboarding** to create your first admin user
3. **Start using** the app!

### Optional: PocketBase Admin Access

- **URL:** `http://your-casaos-ip:7070/pb/_/`
- **Default credentials:** `admin@todoless.local` / `changeme123`
- **⚠️ CHANGE THE PASSWORD** immediately in CasaOS environment variables

---

## 🔧 Environment Variables

Customize these in CasaOS app settings:

| Variable | Default | Description |
|----------|---------|-------------|
| `PB_ADMIN_EMAIL` | `admin@todoless.local` | PocketBase admin email |
| `PB_ADMIN_PASSWORD` | `changeme123` | **CHANGE THIS!** Admin password |
| `TZ` | Auto | Timezone (e.g., `Europe/Amsterdam`) |
| `WEBUI_PORT` | `7070` | External web port |

---

## 💾 Data Storage

All data is stored in `/DATA/AppData/todoless/`:

```
/DATA/AppData/todoless/
├── pb_data/           # SQLite database, user uploads, logs
└── pb_migrations/     # Database schema migrations
```

**Backup this directory** to preserve your data.

---

## 🏗️ Architecture

```
User Browser
    ↓
http://casaos-ip:7070
    ↓
┌──────────────────────────────┐
│  Nginx (todoless-frontend)   │
│  - React SPA                 │
│  - Proxy /pb/* → PocketBase  │
└──────────┬───────────────────┘
           │ Docker Network
           ↓
┌──────────────────────────────┐
│  PocketBase (port 8090)      │
│  - SQLite database           │
│  - Auth + realtime sync      │
│  - Admin UI at /pb/_/        │
└──────────┬───────────────────┘
           ↓
   /DATA/AppData/todoless/pb_data
```

---

## 🔍 Troubleshooting

### "Connection Error" in browser

```bash
# Check containers are running
docker ps | grep todoless

# Check PocketBase logs
docker logs todoless-pocketbase

# Check frontend logs
docker logs todoless-frontend

# Verify network
docker network inspect todoless_todoless-net
```

### Can't access PocketBase admin

- Correct URL format: `http://ip:port/pb/_/` (note the `/pb/` prefix and trailing `/_/`)
- Default login: `admin@todoless.local` / `changeme123`

### Port already in use

- CasaOS auto-assigns ports via `${WEBUI_PORT}`
- Check actual assigned port in CasaOS app details

---

## 🔄 Updating

To update to a newer version:

1. **Build new version:**
   ```bash
   docker build -f Dockerfile.casaos -t ghcr.io/USER/todoless-frontend:1.1.0 .
   docker push ghcr.io/USER/todoless-frontend:1.1.0
   ```

2. **Update in CasaOS:**
   - Edit app settings
   - Change image tag from `:1.0.0` to `:1.1.0`
   - Restart app

Your data persists across updates.

---

## 📚 Features

- ✅ **Multi-user** with invite-only registration
- ✅ **Tasks** with status, priority, horizon, sprints
- ✅ **Items** with categories, locations, quantities
- ✅ **Notes** with linking to tasks/items
- ✅ **Calendar** with events and deadlines
- ✅ **Labels** with privacy controls
- ✅ **Archive** with auto-cleanup (30/60/90 days or unlimited)
- ✅ **Real-time sync** across all users
- ✅ **Global search** with @user, #label, //date parsing
- ✅ **Settings** with theme, language, retention policies
- ✅ **Self-hosted** — no external dependencies

---

## 🛡️ Security Notes

- **Change default PocketBase password** immediately
- **Use HTTPS** if exposing to internet (add reverse proxy like Caddy/Traefik)
- **Regular backups** of `/DATA/AppData/todoless/`
- **Invite codes** control who can register
- **Private labels** hide tasks from other users

---

## 📖 Documentation

- Full docs: `CASAOS-DEPLOYMENT.md`
- Build script help: `./build-casaos-image.sh --help`
- PocketBase docs: https://pocketbase.io/docs/

---

## 🙏 Credits

- **PocketBase** — Backend and database
- **React + Vite** — Frontend framework
- **Tailwind CSS** — Styling
- **Nginx** — Reverse proxy
- **CasaOS** — Home cloud OS

---

## 📝 License

Private repository. Check with repository owner for licensing.

---

## Support

For issues:
1. Check Docker logs: `docker logs todoless-frontend` and `docker logs todoless-pocketbase`
2. Verify PocketBase health at `http://ip:port/pb/api/health`
3. Check CasaOS app logs in web interface

---

**Ready to deploy?** Run `./build-casaos-image.sh` and follow the prompts!
