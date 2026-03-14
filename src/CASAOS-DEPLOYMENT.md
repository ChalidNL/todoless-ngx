# CasaOS Deployment Guide for To Do Less

## ⚠️ IMPORTANT: Build Frontend Image First

**The frontend Docker image does not exist yet.** You must build and push it once before deploying to CasaOS.

CasaOS cannot build from source — it only pulls pre-built images.

---

## One-Time Setup: Build and Push Frontend Image

Run these commands **on a machine that has Docker and access to this repository**:

### Option 1: Push to GitHub Container Registry (GHCR) - RECOMMENDED

```bash
# 1. Login to GHCR
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# 2. Build the frontend image
docker build -f Dockerfile.casaos -t ghcr.io/YOUR_USERNAME/todoless-frontend:1.0.0 .

# 3. Push to registry
docker push ghcr.io/YOUR_USERNAME/todoless-frontend:1.0.0

# 4. Make the package public (so CasaOS can pull without auth)
# Go to: GitHub → Your profile → Packages → todoless-frontend → Package settings → Make public
```

### Option 2: Push to Docker Hub

```bash
# 1. Login to Docker Hub
docker login

# 2. Build the frontend image
docker build -f Dockerfile.casaos -t YOUR_USERNAME/todoless-frontend:1.0.0 .

# 3. Push to registry
docker push YOUR_USERNAME/todoless-frontend:1.0.0

# 4. Make the repository public on Docker Hub
```

---

## Update docker-compose.yml

After building and pushing the image, edit `docker-compose.yml` and replace:

```yaml
image: YOUR_FRONTEND_IMAGE:TAG
```

With your actual image name:

```yaml
image: ghcr.io/YOUR_USERNAME/todoless-frontend:1.0.0
```

Or for Docker Hub:

```yaml
image: YOUR_USERNAME/todoless-frontend:1.0.0
```

---

## Deploy to CasaOS

1. Open CasaOS web interface
2. Go to **App Store** → **Custom Install**
3. Paste the contents of `docker-compose.yml`
4. Click **Install**

The app will:
- Create a PocketBase database at `/DATA/AppData/todoless/pb_data`
- Start the frontend on port 7070 (or next available port)
- Set up networking between services
- Create default admin account: `admin@todoless.local` / `changeme123`

---

## First-Time Setup

1. Access the app at `http://your-casaos-ip:7070`
2. Follow the onboarding flow to create your first user
3. (Optional) Access PocketBase admin at `http://your-casaos-ip:7070/pb/_/` to manage database

⚠️ **Change the default admin password immediately** by setting `PB_ADMIN_PASSWORD` in CasaOS environment variables.

---

## Environment Variables (Optional)

You can customize these in CasaOS app settings:

| Variable | Default | Description |
|----------|---------|-------------|
| `PB_ADMIN_EMAIL` | `admin@todoless.local` | PocketBase admin email |
| `PB_ADMIN_PASSWORD` | `changeme123` | PocketBase admin password (CHANGE THIS!) |
| `TZ` | Auto-detected | Timezone (e.g., `Europe/Amsterdam`) |
| `WEBUI_PORT` | `7070` | External web port (CasaOS auto-assigns) |

---

## Data Persistence

All data is stored in `/DATA/AppData/todoless/`:
- `pb_data/` — PocketBase database, user uploads, logs
- `pb_migrations/` — Database schema migrations

**Backup these directories** to preserve your data.

---

## Troubleshooting

### App shows "Connection Error"
- Check that both containers are running: `docker ps | grep todoless`
- Check PocketBase health: `docker logs todoless-pocketbase`
- Verify network: `docker network inspect todoless_todoless-net`

### Can't access PocketBase admin
- URL is: `http://your-ip:port/pb/_/` (note the `/pb/` prefix and trailing `/_/`)
- Default credentials: `admin@todoless.local` / `changeme123`

### Port conflict
- CasaOS auto-assigns ports using `${WEBUI_PORT}`
- Check assigned port in CasaOS app details

---

## Updating the App

To update to a new version:

1. Build and push new image with version tag:
   ```bash
   docker build -f Dockerfile.casaos -t ghcr.io/YOUR_USERNAME/todoless-frontend:1.1.0 .
   docker push ghcr.io/YOUR_USERNAME/todoless-frontend:1.1.0
   ```

2. In CasaOS, edit the app and change image tag to `:1.1.0`

3. Restart the app

Your data persists across updates.

---

## Architecture

```
┌─────────────────────────────────────────┐
│  CasaOS Host (your-ip:7070)             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  todoless-frontend (nginx)      │   │
│  │  - React SPA                    │   │
│  │  - Proxy /pb/* to PocketBase    │   │
│  │  Port: 80 → ${WEBUI_PORT}       │   │
│  └───────────┬─────────────────────┘   │
│              │                          │
│              │ Docker Network           │
│              │ (todoless-net)           │
│              ↓                          │
│  ┌─────────────────────────────────┐   │
│  │  todoless-pocketbase            │   │
│  │  - SQLite database              │   │
│  │  - Auth & realtime sync         │   │
│  │  - Admin UI at /pb/_/           │   │
│  │  Port: 8090 (internal only)     │   │
│  └─────────────────────────────────┘   │
│              │                          │
│              ↓                          │
│  /DATA/AppData/todoless/pb_data         │
│  (persistent storage)                   │
└─────────────────────────────────────────┘
```

Browser → nginx:80 → serves React SPA
React app → /pb/* → nginx proxy → pocketbase:8090

---

## Support

For issues, check:
- Docker logs: `docker logs todoless-frontend` and `docker logs todoless-pocketbase`
- PocketBase admin UI: `http://your-ip:port/pb/_/`
- CasaOS app logs in the web interface
