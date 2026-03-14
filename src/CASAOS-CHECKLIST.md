# ✅ CasaOS Deployment Checklist

Quick reference checklist for deploying Todoless-ngx on CasaOS.

---

## 📦 Pre-Deployment (On Build Machine)

### Files Created

- [ ] `Dockerfile.frontend` - Multi-stage build (Node → Nginx)
- [ ] `Dockerfile.backend` - Production backend with auto-migrations
- [ ] `docker-compose.yml` - CasaOS compatible orchestration
- [ ] `.env.example` - Environment variable template
- [ ] `nginx.conf` - Frontend config with API proxy + WebSocket
- [ ] `README-casaos.md` - Complete deployment guide
- [ ] `.dockerignore` - Build optimization files
- [ ] `backend/.dockerignore` - Backend build optimization

### Build Images

- [ ] Registry configured (GHCR, Docker Hub, or private)
- [ ] Run: `chmod +x build-and-push.sh`
- [ ] Run: `./build-and-push.sh`
- [ ] Frontend image built successfully
- [ ] Backend image built successfully
- [ ] Images pushed to registry
- [ ] Images are public or pull credentials configured

### Update docker-compose.yml

- [ ] Replace `build:` sections with `image:` references
- [ ] Verify image names match registry
- [ ] Test locally: `docker-compose pull`
- [ ] Test locally: `docker-compose up -d`
- [ ] All services healthy: `docker-compose ps`

---

## 🏠 CasaOS Deployment

### Prepare Files

- [ ] Create `.env` from `.env.example`
- [ ] Generate secure `DB_PASSWORD`: `openssl rand -base64 32`
- [ ] Generate secure `JWT_SECRET`: `openssl rand -base64 64`
- [ ] Set `FRONTEND_PORT` (default: 80)
- [ ] Set `DOMAIN` (if using reverse proxy)
- [ ] Set `CORS_ORIGIN` (production domain or `*` for testing)

### Upload to CasaOS

**Option A: Web UI**
- [ ] Open CasaOS App Store
- [ ] Click "Install a customized app"
- [ ] Paste `docker-compose.yml` content
- [ ] Upload `.env` via file manager to `/DATA/AppData/todoless-ngx/`
- [ ] Click "Install"

**Option B: SSH**
- [ ] SSH to CasaOS: `ssh casaos-server`
- [ ] Create directory: `mkdir -p /DATA/AppData/todoless-ngx`
- [ ] Upload `docker-compose.yml`
- [ ] Upload `.env`
- [ ] Upload `init.sql` (if needed)
- [ ] Upload `database/` folder (if needed)

### Start Services

- [ ] Via UI: Click "Start" on "To Do Less" app
- [ ] Or SSH: `cd /DATA/AppData/todoless-ngx && docker-compose up -d`
- [ ] Wait 60 seconds for database initialization

### Verify Deployment

- [ ] Check containers: `docker-compose ps`
  - [ ] `todoless-ngx-db` - Status: Up (healthy)
  - [ ] `todoless-ngx-backend` - Status: Up (healthy)
  - [ ] `todoless-ngx-frontend` - Status: Up
- [ ] Check logs: `docker-compose logs -f`
- [ ] Test backend health: `curl http://localhost:4000/api/health`
- [ ] Expected: `{"status":"ok","database":"connected"}`
- [ ] Test frontend: `curl http://localhost/`
- [ ] Expected: HTML response (not error)
- [ ] Open browser: `http://casaos-ip/`
- [ ] Expected: Login/Register page loads

---

## 👤 First User Setup

### Generate Invite Code

- [ ] Run: `docker-compose exec backend node -e "console.log(Math.random().toString().slice(2,8))"`
- [ ] Save the 6-digit code (e.g., `847293`)

### Register First Admin

- [ ] Open: `http://casaos-ip/`
- [ ] Click "Register"
- [ ] Fill in:
  - [ ] Email
  - [ ] Password (secure!)
  - [ ] Name
  - [ ] Invite code (from above)
- [ ] Click "Register"
- [ ] Login with credentials
- [ ] Expected: Dashboard loads

### Verify Functionality

- [ ] Create test task
- [ ] Create test item
- [ ] Create test note
- [ ] Check real-time sync (open in 2 browsers)
- [ ] Check WebSocket connection (browser console, no errors)
- [ ] Logout and login again

---

## 🔧 Post-Deployment

### Configure Backups

- [ ] Create backup script (see README-casaos.md)
- [ ] Test manual backup: `docker-compose exec -T db pg_dump -U todoless todoless > backup.sql`
- [ ] Setup cron for automatic backups
- [ ] Test restore procedure
- [ ] Store backups off-server

### Setup Monitoring

- [ ] Add health check endpoint to monitoring tool
- [ ] Configure uptime alerts
- [ ] Monitor disk usage: `docker system df`
- [ ] Monitor container resources: `docker stats`

### Security Hardening

- [ ] Change default passwords
- [ ] Set specific CORS_ORIGIN (not `*`)
- [ ] Enable HTTPS via CasaOS reverse proxy
- [ ] Restrict network access if needed
- [ ] Review and rotate JWT_SECRET periodically

### Optional Configuration

- [ ] Setup custom domain
- [ ] Configure reverse proxy (Traefik/Nginx)
- [ ] Add SSL certificate (Let's Encrypt)
- [ ] Configure email notifications (future)
- [ ] Setup auto-updates

---

## 📚 Documentation

### User Documentation

- [ ] Share access URL with users
- [ ] Provide registration instructions
- [ ] Explain invite code system
- [ ] Document main features

### Admin Documentation

- [ ] Document backup procedures
- [ ] Document update procedures
- [ ] Document troubleshooting steps
- [ ] Save all credentials securely

---

## 🧪 Testing

### Functional Testing

- [ ] User registration works
- [ ] User login works
- [ ] Task creation works
- [ ] Item creation works
- [ ] Note creation works
- [ ] Calendar works
- [ ] Labels work
- [ ] Private labels work (multi-user)
- [ ] Sprint creation works
- [ ] Auto-archive works
- [ ] Search/filter works
- [ ] Real-time sync works

### Multi-User Testing

- [ ] Register second user with new invite
- [ ] Both users can login
- [ ] Private labels are hidden from other users
- [ ] Public tasks visible to all users
- [ ] Real-time updates work between users
- [ ] No data leakage between users

### Performance Testing

- [ ] Create 100+ tasks (performance test)
- [ ] Create 50+ items (performance test)
- [ ] Search with large dataset
- [ ] Check memory usage: `docker stats`
- [ ] Check database size: `docker exec todoless-ngx-db du -sh /var/lib/postgresql/data`

---

## 🚨 Troubleshooting Checklist

### If Services Won't Start

- [ ] Check `.env` file exists and has required variables
- [ ] Check `DB_PASSWORD` is set
- [ ] Check `JWT_SECRET` is set
- [ ] Check port 80 is not in use: `netstat -tulpn | grep :80`
- [ ] Check logs: `docker-compose logs -f`
- [ ] Check disk space: `df -h`
- [ ] Check Docker is running: `docker ps`

### If Backend Unhealthy

- [ ] Check database is healthy: `docker-compose ps db`
- [ ] Check backend logs: `docker-compose logs backend`
- [ ] Verify database credentials in `.env`
- [ ] Check migrations ran: `docker-compose logs backend | grep migration`
- [ ] Restart backend: `docker-compose restart backend`

### If Frontend Shows Errors

- [ ] Check backend is healthy: `curl http://localhost:4000/api/health`
- [ ] Check nginx logs: `docker-compose logs frontend`
- [ ] Verify nginx can reach backend: `docker-compose exec frontend ping backend`
- [ ] Check browser console for errors (F12)
- [ ] Clear browser cache and reload

### If WebSocket Not Working

- [ ] Check `WS_ENABLED=true` in `.env`
- [ ] Check nginx WebSocket config: `docker-compose exec frontend cat /etc/nginx/conf.d/default.conf | grep -A5 "location /ws"`
- [ ] Check browser console for WebSocket errors
- [ ] Test WebSocket: `curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost/ws`

---

## ✅ Final Verification

### All Services Running

```bash
docker-compose ps
```

Expected output:
```
NAME                    STATUS
todoless-ngx-db         Up (healthy)
todoless-ngx-backend    Up (healthy)
todoless-ngx-frontend   Up
```

### All Health Checks Pass

```bash
# Database
docker-compose exec db pg_isready -U todoless

# Backend
curl http://localhost:4000/api/health

# Frontend
curl -I http://localhost/
```

All should return success (200 OK).

### Application Works

- [ ] Open `http://casaos-ip/`
- [ ] Can register new user
- [ ] Can login
- [ ] Can create tasks/items/notes
- [ ] Real-time sync works
- [ ] No errors in browser console
- [ ] No errors in docker logs

---

## 🎉 Deployment Complete!

If all items are checked ✅, your deployment is successful!

### Share with Users

Your Todoless-ngx instance is now available at:
- **Local:** `http://casaos-ip/`
- **Public:** `https://your-domain.com/` (if configured)

### Generate Invite Codes

For each new user:
```bash
docker-compose exec backend node -e "console.log(Math.random().toString().slice(2,8))"
```

### Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update app
docker-compose pull && docker-compose up -d

# Backup database
docker-compose exec -T db pg_dump -U todoless todoless > backup-$(date +%Y%m%d).sql
```

---

## 📞 Support

- **Documentation:** See `README-casaos.md`
- **Troubleshooting:** See "Troubleshooting" section above
- **Logs:** `docker-compose logs -f`
- **Health:** `curl http://localhost/api/health`

---

**Congratulations on your successful CasaOS deployment!** 🚀
