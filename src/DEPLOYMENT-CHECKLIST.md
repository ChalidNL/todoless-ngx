# CasaOS Deployment Checklist

## Pre-Deployment (Before Building)

- [ ] Docker is installed on your machine
- [ ] Docker daemon is running (`docker info` works)
- [ ] You have a GitHub account OR Docker Hub account
- [ ] GitHub Personal Access Token created (if using GHCR)
  - [ ] Token has `write:packages` scope
  - [ ] Token is saved somewhere safe
- [ ] All files are present in repository:
  - [ ] `docker-compose.yml`
  - [ ] `Dockerfile.casaos`
  - [ ] `nginx-casaos.conf`
  - [ ] `build-casaos-image.sh`
  - [ ] `pb_migrations/initial_schema.js`

---

## Build Process

- [ ] Made build script executable: `chmod +x build-casaos-image.sh`
- [ ] Ran build script: `./build-casaos-image.sh`
- [ ] Build completed successfully (no errors)
- [ ] Image pushed to registry successfully
- [ ] `docker-compose.yml` auto-updated with real image name
- [ ] Verified image name in compose file:
  - Line 36 should be: `image: ghcr.io/username/todoless-frontend:1.0.0`
  - NOT: `image: YOUR_FRONTEND_IMAGE:TAG`

---

## Registry Configuration

**For GitHub Container Registry:**
- [ ] Logged into GitHub
- [ ] Went to https://github.com/USERNAME?tab=packages
- [ ] Found `todoless-frontend` package
- [ ] Clicked Package settings
- [ ] Changed visibility to Public
- [ ] Confirmed package shows "Public" badge

**For Docker Hub:**
- [ ] Logged into Docker Hub
- [ ] Found `todoless-frontend` repository
- [ ] Went to Settings
- [ ] Set visibility to Public
- [ ] Confirmed repository is accessible

**Test Pull (Optional but Recommended):**
```bash
# Try pulling the image to verify it's public
docker pull ghcr.io/YOUR_USERNAME/todoless-frontend:1.0.0
# OR
docker pull YOUR_USERNAME/todoless-frontend:1.0.0
```
- [ ] Image pulls successfully without auth

---

## docker-compose.yml Validation

- [ ] Opened `docker-compose.yml` in text editor
- [ ] Verified line 36 has real image name (not placeholder)
- [ ] Checked PocketBase version: `ghcr.io/muchobien/pocketbase:0.22.0`
- [ ] Verified `name: todoless` at top of file
- [ ] Confirmed no `build:` directives anywhere
- [ ] Confirmed `expose: ["8090"]` not `ports:` for PocketBase
- [ ] Checked volumes use `/DATA/AppData/$AppID/` prefix
- [ ] Verified `x-casaos` metadata block at bottom

**Quick Syntax Check (Optional):**
```bash
docker compose -f docker-compose.yml config
```
- [ ] No errors reported

---

## CasaOS Pre-Deployment

- [ ] CasaOS is installed and running
- [ ] Can access CasaOS web interface
- [ ] Logged into CasaOS
- [ ] Have admin/sufficient permissions
- [ ] Know your CasaOS server IP address: `_______________`

---

## Deploy to CasaOS

- [ ] Opened CasaOS web interface
- [ ] Clicked "App Store" (top navigation)
- [ ] Clicked "Custom Install" or "+ Install Custom App"
- [ ] Copied entire contents of `docker-compose.yml`
- [ ] Pasted into CasaOS text field
- [ ] Clicked "Submit" or "Install"
- [ ] Waited for CasaOS to pull images
- [ ] Deployment completed without errors

---

## Post-Deployment Verification

### Check Containers
```bash
docker ps | grep todoless
```
- [ ] `todoless-pocketbase` is running
- [ ] `todoless-frontend` is running
- [ ] Both show "Up" status (not "Restarting")

### Check Logs
```bash
docker logs todoless-pocketbase
```
- [ ] No errors in logs
- [ ] See "Server started at http://0.0.0.0:8090"

```bash
docker logs todoless-frontend
```
- [ ] No errors in logs
- [ ] Nginx started successfully

### Check Volumes
```bash
ls -la /DATA/AppData/todoless/
```
- [ ] `pb_data/` directory exists
- [ ] `pb_migrations/` directory exists
- [ ] Files are being created in `pb_data/`

### Check Network
```bash
docker network inspect todoless_todoless-net
```
- [ ] Network exists
- [ ] Both containers are connected

---

## Application Testing

### Access Main App
- [ ] Opened browser
- [ ] Navigated to `http://YOUR_CASAOS_IP:7070`
- [ ] App loads (no connection errors)
- [ ] Onboarding screen appears
- [ ] Created first admin user account
- [ ] Login successful
- [ ] Dashboard loads

### Test Core Features
- [ ] Can create a task
- [ ] Can create a note
- [ ] Can create an item
- [ ] Can view calendar
- [ ] Can access settings
- [ ] Real-time updates work (open in 2 tabs)

### Test PocketBase Admin
- [ ] Navigated to `http://YOUR_CASAOS_IP:7070/pb/_/`
- [ ] Login page appears
- [ ] Logged in with:
  - Email: `admin@todoless.local`
  - Password: `changeme123`
- [ ] Admin dashboard loads
- [ ] Can see collections (users, tasks, notes, etc.)
- [ ] Can browse records

---

## Security Hardening

- [ ] Changed PocketBase admin password:
  - [ ] In CasaOS: Edit App → Environment
  - [ ] Set `PB_ADMIN_PASSWORD` to strong password
  - [ ] Saved and restarted app
  - [ ] Verified new password works at `/pb/_/`
- [ ] Created invite codes:
  - [ ] Logged into app
  - [ ] Went to Settings → Invite Manager
  - [ ] Generated invite code
  - [ ] Tested registration with invite code
- [ ] Reviewed label privacy settings
- [ ] Set up archive retention policy (Settings → General)

---

## Backup Configuration

- [ ] Created backup directory: `mkdir -p ~/todoless-backups`
- [ ] Created backup script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
cp -r /DATA/AppData/todoless/pb_data ~/todoless-backups/pb_data-$DATE
echo "Backup created: pb_data-$DATE"
```
- [ ] Made script executable: `chmod +x backup-todoless.sh`
- [ ] Tested backup: `./backup-todoless.sh`
- [ ] Verified backup exists in `~/todoless-backups/`
- [ ] (Optional) Set up cron job for automatic backups

---

## Performance & Monitoring

- [ ] Checked Docker resource usage:
```bash
docker stats todoless-frontend todoless-pocketbase
```
- [ ] CPU usage is reasonable (< 10% idle)
- [ ] Memory usage is reasonable (< 500MB total)
- [ ] No restarts showing in `docker ps`

- [ ] Tested app performance:
  - [ ] Page loads are fast (< 2 seconds)
  - [ ] Task creation is instant
  - [ ] Search works quickly
  - [ ] No lag in UI

---

## Documentation Review

- [ ] Read `🎯-START-HERE-CASAOS.md`
- [ ] Bookmarked `QUICK-REFERENCE.md` for commands
- [ ] Saved `README-CASAOS-FINAL.md` location for troubleshooting
- [ ] Noted location of `POCKETBASE-VERSION.md` for future upgrades

---

## Optional: Advanced Configuration

- [ ] Set custom timezone:
  - [ ] In CasaOS: Edit App → Environment
  - [ ] Set `TZ` to your timezone (e.g., `Europe/Amsterdam`)
  - [ ] Restarted app
- [ ] Set custom port:
  - [ ] In CasaOS: Edit App → Ports
  - [ ] Changed `WEBUI_PORT` if needed
  - [ ] Restarted app
- [ ] (Advanced) Set up reverse proxy for HTTPS:
  - [ ] Caddy or Traefik configured
  - [ ] SSL certificate obtained
  - [ ] Domain name pointed to server

---

## Troubleshooting (If Issues)

If any check fails, see:
- `README-CASAOS-FINAL.md` → Troubleshooting section
- `QUICK-REFERENCE.md` → Common Issues table
- Docker logs: `docker logs todoless-pocketbase` and `docker logs todoless-frontend`

Common fixes:
```bash
# Restart containers
docker restart todoless-frontend todoless-pocketbase

# Re-pull images
docker compose pull

# Recreate containers
docker compose down
docker compose up -d

# Check CasaOS logs
journalctl -u casaos -f
```

---

## Success Criteria

✅ Deployment is successful when:

- [ ] Both containers running and healthy
- [ ] App accessible at http://casaos-ip:7070
- [ ] Can create and login user account
- [ ] All features working (tasks, notes, items, calendar)
- [ ] PocketBase admin accessible
- [ ] Admin password changed from default
- [ ] Backups configured
- [ ] No errors in logs

---

## Sign-Off

**Deployment completed by:** ______________________

**Date:** ______________________

**CasaOS Version:** ______________________

**App Version:** todoless-frontend:______

**PocketBase Version:** 0.22.0

**Status:** ✅ Production Ready

---

## Post-Deployment Notes

Use this space to note any custom configurations, issues encountered, or important information:

```
____________________________________________________________

____________________________________________________________

____________________________________________________________

____________________________________________________________
```

---

## Next Steps

After successful deployment:

1. **Share with team:**
   - Generate invite codes
   - Share app URL and invite code
   - Guide users through registration

2. **Set up regular backups:**
   - Schedule weekly/daily backups
   - Test backup restoration
   - Store backups off-server

3. **Monitor usage:**
   - Check logs regularly
   - Monitor disk space in `/DATA/AppData/todoless/`
   - Watch for errors

4. **Plan updates:**
   - Subscribe to PocketBase releases
   - Test updates in dev environment first
   - Keep `POCKETBASE-VERSION.md` handy

---

**Congratulations! 🎉**

Your To Do Less app is now running on CasaOS!

For support, refer to documentation files in the repository.
