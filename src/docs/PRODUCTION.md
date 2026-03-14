# Production Deployment Guide

## 🚀 Deploying Todoless-ngx to Production

### Prerequisites

- Docker & Docker Compose installed
- Domain name (optional, but recommended)
- SSL certificate (for HTTPS)

## 📋 Step-by-Step Deployment

### 1. Clone Repository

```bash
git clone <repository-url>
cd todoless-ngx
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with **production values**:

```env
# Database (PostgreSQL) - CHANGE THESE!
POSTGRES_DB=todoless
POSTGRES_USER=todoless_prod
POSTGRES_PASSWORD=<STRONG_PASSWORD_HERE>

# Security - CHANGE THIS!
JWT_SECRET=<RANDOM_64_CHAR_SECRET>

# Ports
FRONTEND_PORT=3000
BACKEND_PORT=4000

# CORS - Set to your domain
CORS_ORIGIN=https://yourdomain.com

# Cookies - Enable for HTTPS
COOKIE_SECURE=true

# Frontend API URL - Use your domain or server IP
VITE_API_URL=https://yourdomain.com/api
```

**⚠️ Generate Strong Secrets:**

```bash
# Generate database password
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 64
```

### 3. Build & Start Services

```bash
# Build with production env
docker-compose build --no-cache

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### 4. Create Admin User

```bash
chmod +x scripts/create-admin.sh
./scripts/create-admin.sh admin@yourdomain.com <secure-password> "Admin"
```

### 5. Setup Reverse Proxy (Nginx/Caddy)

#### Option A: Nginx with SSL

Create `/etc/nginx/sites-available/todoless`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/todoless /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Option B: Caddy (Automatic HTTPS)

Create `Caddyfile`:

```caddy
yourdomain.com {
    reverse_proxy /api/* localhost:4000
    reverse_proxy /ws localhost:4000
    reverse_proxy /* localhost:3000
}
```

Run:
```bash
caddy run --config Caddyfile
```

### 6. Get SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (already configured)
sudo systemctl status certbot.timer
```

### 7. Configure Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH
sudo ufw enable

# Don't expose database port (5432) to internet!
```

### 8. Setup Automatic Backups

Create `/etc/cron.d/todoless-backup`:

```cron
# Daily backup at 2 AM
0 2 * * * root cd /path/to/todoless-ngx && docker exec todoless-ngx-db pg_dump -U todoless todoless | gzip > /backup/todoless-$(date +\%Y\%m\%d).sql.gz

# Weekly cleanup (keep 30 days)
0 3 * * 0 root find /backup/todoless-*.sql.gz -mtime +30 -delete
```

### 9. Monitoring

#### Check Service Health

```bash
# Health check
curl https://yourdomain.com/api/health

# View logs
docker-compose logs -f

# Resource usage
docker stats
```

#### Setup Monitoring (Optional)

**Uptime monitoring:**
- UptimeRobot (free)
- StatusCake
- Healthchecks.io

**Server monitoring:**
- Grafana + Prometheus
- Netdata

### 10. Security Hardening

#### PostgreSQL

```bash
# Never expose port 5432 to internet
# Database only accessible from backend container

# Strong passwords in .env
POSTGRES_PASSWORD=<64-char-random>
```

#### Backend

```env
# Secure cookies
COOKIE_SECURE=true

# Restrict CORS
CORS_ORIGIN=https://yourdomain.com

# Strong JWT secret
JWT_SECRET=<64-char-random>
```

#### Network

```bash
# Use Docker networks (already configured)
# Frontend ← Backend ← Database

# Firewall rules
# Only 80, 443, 22 exposed
```

## 🔄 Updates

### Update to Latest Version

```bash
# Backup first!
make backup

# Pull latest code
git pull

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify
docker-compose ps
curl https://yourdomain.com/api/health
```

## 💾 Backup Strategy

### Automated Backups

```bash
# Script in /scripts/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=/backup/todoless
mkdir -p $BACKUP_DIR

# Database backup
docker exec todoless-ngx-db pg_dump -U todoless todoless | gzip > $BACKUP_DIR/db-$DATE.sql.gz

# Keep 30 days
find $BACKUP_DIR/db-*.sql.gz -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/db-$DATE.sql.gz"
```

### Offsite Backups

Upload to cloud storage:

```bash
# AWS S3
aws s3 cp /backup/todoless/ s3://my-bucket/todoless/ --recursive

# Backblaze B2
b2 sync /backup/todoless/ b2://my-bucket/todoless/

# rsync to remote server
rsync -avz /backup/todoless/ user@backup-server:/backups/todoless/
```

## 📊 Performance Optimization

### Database

```sql
-- Run VACUUM weekly
docker exec todoless-ngx-db psql -U todoless -d todoless -c "VACUUM ANALYZE;"

-- Check slow queries
docker exec todoless-ngx-db psql -U todoless -d todoless -c "
  SELECT query, calls, mean_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"
```

### Nginx Caching

Add to nginx config:

```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Docker Resources

Limit container resources:

```yaml
# docker-compose.yml
services:
  todoless-ngx-db:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          memory: 512M
```

## 🐛 Troubleshooting Production

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker exec todoless-ngx-db pg_isready -U todoless

# View database logs
docker-compose logs todoless-ngx-db

# Check connections
docker exec todoless-ngx-db psql -U todoless -d todoless -c "
  SELECT pid, usename, application_name, state
  FROM pg_stat_activity;
"
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Restart services
docker-compose restart

# Tune PostgreSQL
# Edit docker-compose.yml:
environment:
  POSTGRES_SHARED_BUFFERS: 256MB
  POSTGRES_EFFECTIVE_CACHE_SIZE: 1GB
```

### Slow Performance

```bash
# Check database indexes
docker exec todoless-ngx-db psql -U todoless -d todoless -c "
  SELECT schemaname, tablename, indexname, idx_scan
  FROM pg_stat_user_indexes
  ORDER BY idx_scan ASC
  LIMIT 10;
"

# Rebuild indexes
docker exec todoless-ngx-db psql -U todoless -d todoless -c "REINDEX DATABASE todoless;"
```

## 📈 Scaling

### Vertical Scaling (More Resources)

```bash
# Increase container limits
# docker-compose.yml:
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 4G
```

### Horizontal Scaling (Multiple Instances)

**Load Balancer Setup:**

```nginx
upstream todoless_backend {
    least_conn;
    server backend1:4000;
    server backend2:4000;
    server backend3:4000;
}

server {
    location /api {
        proxy_pass http://todoless_backend;
    }
}
```

**Shared PostgreSQL:**

All backend instances connect to same PostgreSQL database.

## ✅ Production Checklist

Before going live:

- [ ] Changed all default passwords
- [ ] Generated strong JWT secret (64+ chars)
- [ ] Configured SSL/HTTPS
- [ ] Set COOKIE_SECURE=true
- [ ] Restricted CORS to your domain
- [ ] Setup firewall (80, 443, 22 only)
- [ ] Configured automatic backups
- [ ] Tested backup restoration
- [ ] Setup monitoring/alerts
- [ ] Documented admin credentials (securely!)
- [ ] Tested invite code creation
- [ ] Verified real-time sync works
- [ ] Load tested with expected users
- [ ] Setup log rotation
- [ ] Configured error reporting
- [ ] Created runbook for common issues

## 🆘 Emergency Procedures

### Database Corruption

```bash
# Stop services
docker-compose down

# Restore from backup
gunzip -c /backup/todoless-20260314.sql.gz | \
  docker exec -i todoless-ngx-db psql -U todoless -d todoless

# Restart
docker-compose up -d
```

### Container Won't Start

```bash
# View logs
docker-compose logs todoless-ngx-backend

# Rebuild
docker-compose build --no-cache todoless-ngx-backend
docker-compose up -d
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes

# Clean old backups
find /backup -mtime +30 -delete
```

---

**🎉 Your Todoless-ngx instance is now production-ready!**

**Support:**
- GitHub Issues: <repository-url>/issues
- Documentation: `/docs`
