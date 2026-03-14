# 🏠 Todoless-ngx CasaOS Deployment Guide

Complete guide for deploying Todoless-ngx on CasaOS - a self-hosted multi-user task management system.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Private Repository Handling](#private-repository-handling)
4. [Detailed Installation](#detailed-installation)
5. [Configuration](#configuration)
6. [First User Setup](#first-user-setup)
7. [Updating the App](#updating-the-app)
8. [Backup & Restore](#backup--restore)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

### CasaOS Requirements
- CasaOS installed and running
- Docker Compose v2+ installed (usually bundled with CasaOS)
- Minimum 512MB RAM available
- Minimum 2GB disk space

### Network Requirements
- Available port: 80 (or custom port)
- Internal Docker network for services

---

## ⚡ Quick Start

### Method 1: Pre-built Images (Recommended for CasaOS)

**Note:** Because this is a private GitHub repository, CasaOS **cannot** automatically pull and build from source. You must use pre-built images.

#### Step 1: Build Images Locally

On your development machine or build server:

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/todoless-ngx.git
cd todoless-ngx

# Build images
docker build -t your-registry/todoless-ngx-frontend:latest -f Dockerfile.frontend .
docker build -t your-registry/todoless-ngx-backend:latest -f Dockerfile.backend .

# Push to your registry (Docker Hub, GHCR, or private registry)
docker push your-registry/todoless-ngx-frontend:latest
docker push your-registry/todoless-ngx-backend:latest
```

#### Step 2: Update docker-compose.yml

Edit `docker-compose.yml` and replace the `build:` sections with `image:`:

```yaml
services:
  backend:
    # Remove or comment out build section
    # build:
    #   context: .
    #   dockerfile: Dockerfile.backend
    
    # Add image reference
    image: your-registry/todoless-ngx-backend:latest
    # ... rest of config

  frontend:
    # Remove or comment out build section
    # build:
    #   context: .
    #   dockerfile: Dockerfile.frontend
    
    # Add image reference
    image: your-registry/todoless-ngx-frontend:latest
    # ... rest of config
```

#### Step 3: Deploy on CasaOS

1. **Upload via CasaOS Web UI:**
   - Open CasaOS App Store
   - Click "Install a customized app"
   - Upload your modified `docker-compose.yml`
   - CasaOS will pull images and start services

2. **Or use SSH:**
   ```bash
   # Create app directory
   mkdir -p /DATA/AppData/todoless-ngx
   cd /DATA/AppData/todoless-ngx
   
   # Copy files
   scp docker-compose.yml casaos-server:/DATA/AppData/todoless-ngx/
   scp .env.example casaos-server:/DATA/AppData/todoless-ngx/.env
   
   # SSH into CasaOS
   ssh casaos-server
   cd /DATA/AppData/todoless-ngx
   
   # Edit environment variables
   nano .env
   # Set DB_PASSWORD and JWT_SECRET
   
   # Start services
   docker-compose up -d
   ```

---

## 🔐 Private Repository Handling

### Why CasaOS Can't Auto-Build

CasaOS cannot access private GitHub repositories during the compose deployment process. You have three options:

### Option A: Pre-built Images (Recommended)

**Advantages:**
- ✅ Works seamlessly with CasaOS
- ✅ Faster deployment
- ✅ No credentials needed on CasaOS server
- ✅ Better for multi-server deployments

**Process:**
1. Build images on your local machine or CI/CD
2. Push to container registry (public or private)
3. Use `image:` in docker-compose instead of `build:`

### Option B: GitHub Container Registry (GHCR)

**Setup:**
```bash
# On your development machine
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR-USERNAME --password-stdin

# Build and tag
docker build -t ghcr.io/YOUR-USERNAME/todoless-ngx-frontend:latest -f Dockerfile.frontend .
docker build -t ghcr.io/YOUR-USERNAME/todoless-ngx-backend:latest -f Dockerfile.backend .

# Push
docker push ghcr.io/YOUR-USERNAME/todoless-ngx-frontend:latest
docker push ghcr.io/YOUR-USERNAME/todoless-ngx-backend:latest
```

**Make repo packages public** (or configure pull secrets on CasaOS):
- Go to GitHub → Packages → todoless-ngx-frontend
- Settings → Change visibility → Public

Then use in docker-compose:
```yaml
image: ghcr.io/YOUR-USERNAME/todoless-ngx-frontend:latest
```

### Option C: Build on CasaOS Server

**Not recommended** because it requires:
- Git credentials on CasaOS server
- Node.js build dependencies
- Build takes longer

If you must use this method:
```bash
# SSH to CasaOS
ssh casaos-server

# Clone with credentials
git clone https://YOUR-TOKEN@github.com/YOUR-USERNAME/todoless-ngx.git
cd todoless-ngx

# Build directly
docker-compose build
docker-compose up -d
```

---

## 📦 Detailed Installation

### Step 1: Prepare Environment File

```bash
# Copy example environment file
cp .env.example .env

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

# Edit .env file
nano .env
```

**Required variables:**
```env
DB_PASSWORD=<your-secure-password>
JWT_SECRET=<your-jwt-secret>
```

**Optional but recommended:**
```env
FRONTEND_PORT=80
DOMAIN=todoless.yourdomain.com
CORS_ORIGIN=https://todoless.yourdomain.com
```

### Step 2: Upload to CasaOS

#### Via Web UI:

1. Open CasaOS web interface
2. Go to App Store
3. Click **"+ Install a customized app"**
4. Paste your `docker-compose.yml` content
5. Click **"Install"**

#### Via File Upload:

1. Use CasaOS file manager
2. Navigate to `/DATA/AppData/`
3. Create folder: `todoless-ngx`
4. Upload:
   - `docker-compose.yml`
   - `.env`

### Step 3: Start Services

**Via CasaOS UI:**
- Find "To Do Less" in your apps
- Click to start

**Via SSH:**
```bash
cd /DATA/AppData/todoless-ngx
docker-compose up -d
```

### Step 4: Verify Deployment

```bash
# Check container status
docker-compose ps

# Expected output:
# NAME                    STATUS
# todoless-ngx-db         Up (healthy)
# todoless-ngx-backend    Up (healthy)
# todoless-ngx-frontend   Up

# Check logs
docker-compose logs -f

# Test backend health
curl http://localhost:4000/api/health

# Expected response:
# {"status":"ok","database":"connected","websocket":"enabled"}
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_NAME` | `todoless` | PostgreSQL database name |
| `DB_USER` | `todoless` | PostgreSQL user |
| `DB_PASSWORD` | *required* | PostgreSQL password |
| `JWT_SECRET` | *required* | JWT signing secret |
| `FRONTEND_PORT` | `80` | Host port for web UI |
| `DOMAIN` | `todoless.local` | Domain name |
| `CORS_ORIGIN` | `*` | CORS allowed origin |
| `SESSION_TIMEOUT` | `86400000` | Session timeout (ms) |
| `WS_ENABLED` | `true` | Enable WebSocket |

### Port Configuration

Default ports:
- **Frontend (Web UI):** 80 → host port 80
- **Backend API:** 4000 → internal only (proxied by nginx)
- **PostgreSQL:** 5432 → internal only (never exposed)

To change frontend port:
```env
FRONTEND_PORT=8080
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

### Reverse Proxy Setup

If using CasaOS reverse proxy or Traefik:

```yaml
# Already included in docker-compose.yml
labels:
  traefik.enable: "true"
  traefik.http.routers.todoless.rule: "Host(`todoless.yourdomain.com`)"
  traefik.http.services.todoless.loadbalancer.server.port: "80"
```

Update your domain in `.env`:
```env
DOMAIN=todoless.yourdomain.com
CORS_ORIGIN=https://todoless.yourdomain.com
```

---

## 👤 First User Setup

Todoless-ngx uses **invite-only registration**. Create the first user:

### Step 1: Generate Invite Code

```bash
# Via docker-compose
docker-compose exec backend node -e "console.log(Math.random().toString().slice(2,8))"

# Output: 847293 (example 6-digit code)
```

**Or create a helper script:**

```bash
cat > generate-invite.sh << 'EOF'
#!/bin/bash
docker-compose exec -T backend node -e "console.log(Math.random().toString().slice(2,8))"
EOF

chmod +x generate-invite.sh
./generate-invite.sh
```

### Step 2: Register First User

1. Open web UI: `http://your-casaos-ip/`
2. Click **"Register"**
3. Fill in:
   - **Email:** your-email@example.com
   - **Password:** (secure password)
   - **Name:** Your Name
   - **Invite Code:** (from Step 1)
4. Click **"Register"**
5. Login with your credentials

### Step 3: Invite Additional Users

Once logged in as admin:
1. Go to **Settings** → **Invites**
2. Click **"Generate Invite Code"**
3. Share code with new users
4. They can register at the same URL

---

## 🔄 Updating the App

### Method 1: Pull New Images

If using pre-built images:

```bash
# Pull latest images
docker-compose pull

# Recreate containers
docker-compose up -d

# Remove old images
docker image prune -f
```

### Method 2: Rebuild from Source

If building locally:

```bash
# On your build machine
git pull origin main
docker build -t your-registry/todoless-ngx-frontend:latest -f Dockerfile.frontend .
docker build -t your-registry/todoless-ngx-backend:latest -f Dockerfile.backend .
docker push your-registry/todoless-ngx-frontend:latest
docker push your-registry/todoless-ngx-backend:latest

# On CasaOS
docker-compose pull
docker-compose up -d
```

### Automatic Updates

Create a cron job on CasaOS:

```bash
# Edit crontab
crontab -e

# Add line (check for updates daily at 3 AM)
0 3 * * * cd /DATA/AppData/todoless-ngx && docker-compose pull && docker-compose up -d
```

---

## 💾 Backup & Restore

### Backup Database

#### Automatic Backup Script

```bash
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/DATA/AppData/todoless-ngx/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
docker-compose exec -T db pg_dump -U todoless todoless > $BACKUP_DIR/todoless_$DATE.sql

# Compress
gzip $BACKUP_DIR/todoless_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: todoless_$DATE.sql.gz"
EOF

chmod +x backup.sh
```

#### Schedule Daily Backups

```bash
crontab -e

# Add line (backup daily at 2 AM)
0 2 * * * /DATA/AppData/todoless-ngx/backup.sh
```

#### Manual Backup

```bash
# One-time backup
docker-compose exec -T db pg_dump -U todoless todoless > backup-$(date +%Y%m%d).sql

# Compress
gzip backup-$(date +%Y%m%d).sql
```

### Restore Database

```bash
# Stop services
docker-compose stop backend frontend

# Restore from backup
gunzip < backup-20240314.sql.gz | docker-compose exec -T db psql -U todoless -d todoless

# Restart services
docker-compose start backend frontend
```

### Backup Docker Volumes

```bash
# Backup entire volume
docker run --rm \
  -v todoless-ngx-db-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/volume-backup-$(date +%Y%m%d).tar.gz /data
```

### Restore Docker Volume

```bash
# Stop containers
docker-compose down

# Restore volume
docker run --rm \
  -v todoless-ngx-db-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd / && tar xzf /backup/volume-backup-20240314.tar.gz"

# Restart
docker-compose up -d
```

---

## 🔧 Troubleshooting

### Check Service Health

```bash
# Container status
docker-compose ps

# View logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f db
docker-compose logs -f frontend

# Follow last 100 lines
docker-compose logs --tail=100 -f
```

### Common Issues

#### Issue: "Database password must be set"

**Solution:**
```bash
# Check .env file exists
ls -la .env

# Add required variables
nano .env

DB_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
```

#### Issue: Backend not healthy

**Check:**
```bash
# View backend logs
docker-compose logs backend

# Check database connection
docker-compose exec backend sh -c 'wget -qO- http://localhost:4000/api/health'
```

**Common causes:**
- Database not ready yet (wait 30 seconds)
- Wrong DB credentials in .env
- Database migrations failed

**Solution:**
```bash
# Restart backend
docker-compose restart backend

# Check logs
docker-compose logs -f backend
```

#### Issue: Frontend shows 502 Bad Gateway

**Causes:**
- Backend not running
- Nginx can't connect to backend

**Solution:**
```bash
# Check backend is running
docker-compose ps backend

# Should show: Up (healthy)

# Check nginx config
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Restart frontend
docker-compose restart frontend
```

#### Issue: WebSocket not connecting

**Check:**
```bash
# Verify WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost/ws
```

**Solution:**
- Check nginx.conf has WebSocket headers
- Verify WS_ENABLED=true in .env
- Check browser console for errors

#### Issue: Port already in use

**Solution:**
```bash
# Check what's using port 80
sudo netstat -tulpn | grep :80

# Change port in .env
FRONTEND_PORT=8080

# Restart
docker-compose down
docker-compose up -d
```

### Reset Everything

**⚠️ WARNING: This deletes all data!**

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (deletes database!)
docker volume rm todoless-ngx-db-data

# Restart fresh
docker-compose up -d
```

### View Container Resources

```bash
# CPU and memory usage
docker stats

# Disk usage
docker system df
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U todoless -d todoless

# Run SQL queries
todoless=# SELECT * FROM users;
todoless=# \dt  -- List tables
todoless=# \q   -- Quit
```

---

## 📊 Monitoring

### Health Endpoints

- **Backend:** `http://localhost/api/health`
- **Frontend:** `http://localhost/`

### Uptime Monitoring

Use CasaOS built-in monitoring or external tools:

- **Uptime Kuma:** Self-hosted monitoring
- **Healthchecks.io:** External monitoring

Add webhook:
```bash
# In docker-compose.yml healthcheck
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "https://hc-ping.com/YOUR-UUID"]
```

---

## 🚀 Performance Tuning

### Database Optimization

Add to docker-compose.yml database service:

```yaml
db:
  command:
    - "postgres"
    - "-c"
    - "max_connections=100"
    - "-c"
    - "shared_buffers=256MB"
    - "-c"
    - "effective_cache_size=1GB"
    - "-c"
    - "maintenance_work_mem=64MB"
    - "-c"
    - "checkpoint_completion_target=0.9"
    - "-c"
    - "wal_buffers=16MB"
    - "-c"
    - "default_statistics_target=100"
```

### Resource Limits

Already configured in docker-compose.yml:

```yaml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

Adjust based on your server resources.

---

## 🔒 Security Best Practices

### 1. Use Strong Passwords

```bash
# Generate secure password
openssl rand -base64 32
```

### 2. Enable HTTPS

Use CasaOS reverse proxy or Traefik with Let's Encrypt.

### 3. Limit CORS

In production, set specific origin:
```env
CORS_ORIGIN=https://todoless.yourdomain.com
```

### 4. Regular Backups

Automate daily backups (see Backup section).

### 5. Update Regularly

Keep Docker images updated:
```bash
docker-compose pull
docker-compose up -d
```

### 6. Monitor Logs

Check for suspicious activity:
```bash
docker-compose logs | grep -i error
docker-compose logs | grep -i unauthorized
```

---

## 📝 Summary

### ✅ Deployment Checklist

- [ ] CasaOS installed and running
- [ ] Docker Compose v2 available
- [ ] Images built and pushed to registry
- [ ] docker-compose.yml updated with image references
- [ ] .env file created with secure passwords
- [ ] Uploaded to CasaOS
- [ ] Services started and healthy
- [ ] First invite code generated
- [ ] First user registered
- [ ] Backups configured
- [ ] Monitoring enabled

### 🎯 Quick Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Generate invite
docker-compose exec backend node -e "console.log(Math.random().toString().slice(2,8))"

# Backup database
docker-compose exec -T db pg_dump -U todoless todoless > backup.sql

# Update app
docker-compose pull && docker-compose up -d

# Check health
curl http://localhost/api/health
```

---

## 🆘 Support

### Resources

- **Documentation:** See `/docs` folder
- **Scripts:** See `/scripts` folder
- **Logs:** `docker-compose logs -f`

### Community

- GitHub Issues: Report bugs and request features
- Discussions: Ask questions and share tips

---

**Deployed successfully?** Enjoy your self-hosted task management system! 🎉
