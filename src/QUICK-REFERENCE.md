# To Do Less — Quick Reference Card

## 🚀 Deploy in 3 Commands

```bash
# 1. Build and push image
chmod +x build-casaos-image.sh && ./build-casaos-image.sh

# 2. Make package public (GitHub or Docker Hub web interface)

# 3. Paste docker-compose.yml into CasaOS → Custom Install
```

---

## 📝 Important Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | CasaOS deployment file (paste this) |
| `build-casaos-image.sh` | Interactive build script (run first) |
| `Dockerfile.casaos` | Frontend build instructions |
| `nginx-casaos.conf` | Nginx config with PocketBase proxy |

---

## 🔗 URLs After Deployment

| Service | URL | Credentials |
|---------|-----|-------------|
| **App** | `http://casaos-ip:7070` | Create on first run |
| **PocketBase Admin** | `http://casaos-ip:7070/pb/_/` | `admin@todoless.local` / `changeme123` |

⚠️ **CHANGE THE ADMIN PASSWORD** in CasaOS env vars!

---

## 🗂️ Data Locations

```
/DATA/AppData/todoless/
├── pb_data/         ← SQLite database (BACKUP THIS!)
│   ├── data.db      ← Main database
│   ├── logs.db      ← Request logs
│   └── storage/     ← File uploads
└── pb_migrations/   ← Schema files
```

---

## 🛠️ Useful Commands

```bash
# Check if containers are running
docker ps | grep todoless

# View logs
docker logs todoless-frontend
docker logs todoless-pocketbase

# Restart containers
docker restart todoless-frontend
docker restart todoless-pocketbase

# Stop everything
docker compose down

# Start everything
docker compose up -d

# Backup database
cp -r /DATA/AppData/todoless/pb_data ~/backup-$(date +%Y%m%d)
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Image not found" | Did you run `build-casaos-image.sh`? Is package public? |
| "Connection Error" | Check: `docker logs todoless-pocketbase` |
| Can't access admin | URL must be: `http://ip:port/pb/_/` (note `/pb/`) |
| Port conflict | CasaOS auto-assigns port, check app details |

---

## 🔄 Update Workflow

### Update Frontend
```bash
# Build new version
docker build -f Dockerfile.casaos -t ghcr.io/USER/todoless-frontend:1.1.0 .
docker push ghcr.io/USER/todoless-frontend:1.1.0

# Update in CasaOS: Edit app → Change tag → Restart
```

### Update PocketBase
```bash
# Backup first!
cp -r /DATA/AppData/todoless/pb_data ~/backup/

# Edit docker-compose.yml
# Change: ghcr.io/muchobien/pocketbase:0.22.0
# To:     ghcr.io/muchobien/pocketbase:0.23.0

# Apply
docker compose pull && docker compose up -d
```

---

## 🔐 Security Checklist

- [ ] Change `PB_ADMIN_PASSWORD` in CasaOS env vars
- [ ] Use invite codes for registration (Settings → Invites)
- [ ] Make labels private for sensitive tasks
- [ ] Backup `/DATA/AppData/todoless/` regularly
- [ ] Use HTTPS if exposing to internet (add reverse proxy)

---

## 📦 Environment Variables

Edit in CasaOS app settings:

```bash
PB_ADMIN_EMAIL=admin@todoless.local       # Change this
PB_ADMIN_PASSWORD=changeme123             # CHANGE THIS!
TZ=Europe/Amsterdam                        # Your timezone
WEBUI_PORT=7070                            # Auto-assigned by CasaOS
```

---

## 🎯 Architecture Quick View

```
Browser → http://ip:7070
            ↓
        Nginx (frontend container)
            ↓
    /          → React SPA
    /pb/*      → PocketBase (proxied)
            ↓
        PocketBase (internal port 8090)
            ↓
        SQLite at /pb_data/data.db
```

---

## 📚 Full Documentation

- **Quick Start:** `README-CASAOS-FINAL.md`
- **Detailed Guide:** `CASAOS-DEPLOYMENT.md`
- **Version Info:** `POCKETBASE-VERSION.md`
- **This Summary:** `CASAOS-FINAL-SUMMARY.md`

---

## 🆘 Still Stuck?

1. Check Docker logs (see commands above)
2. Review `CASAOS-DEPLOYMENT.md` troubleshooting section
3. Verify all files are present and up to date
4. Ensure docker-compose.yml has real image name (not placeholder)

---

## ✅ Pre-Flight Checklist

Before deploying to CasaOS:

- [ ] Ran `./build-casaos-image.sh` successfully
- [ ] Made package public on GitHub/Docker Hub
- [ ] Verified `docker-compose.yml` has real image name
- [ ] Read `README-CASAOS-FINAL.md` quick start section

After deploying:

- [ ] App accessible at http://casaos-ip:7070
- [ ] Onboarding screen appears
- [ ] Can create user account
- [ ] Changed admin password

---

**Ready?** Run the build script and deploy! 🚀

```bash
./build-casaos-image.sh
```
