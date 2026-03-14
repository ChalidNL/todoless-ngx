# Docker Deployment - Todoless

## Quick Start

```bash
# 1. Environment
cp .env.example .env
nano .env

# 2. Generate tokens
node scripts/generate-jwt.js $(openssl rand -base64 32)
# Copy to .env

# 3. Start
docker-compose up -d

# 4. Access
open http://localhost:3000
```

---

## Services

`docker-compose.yml` includes:

```yaml
services:
  db:         # PostgreSQL 15
  studio:     # Supabase Studio
  kong:       # API Gateway
  auth:       # Authentication
  rest:       # REST API
  realtime:   # WebSocket
  storage:    # File storage
  imgproxy:   # Image optimization
  meta:       # DB metadata
  todoless:   # Frontend app
```

**Total: 11 containers**

---

## Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Status
docker-compose ps

# Update
docker-compose pull
docker-compose up -d
```

---

## Configuration

### Ports

| Service | Port | Change in |
|---------|------|-----------|
| Frontend | 3000 | `docker-compose.yml` line ~340 |
| Studio | 3010 | `docker-compose.yml` line ~60 |
| API | 8000 | `docker-compose.yml` line ~90 |
| Database | 5432 | `docker-compose.yml` line ~40 |

### Environment

All config in `.env`:

```bash
# Database
POSTGRES_PASSWORD=strong-password

# JWT (generate with scripts/generate-jwt.js)
JWT_SECRET=your-secret
ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-key

# URLs
API_EXTERNAL_URL=http://localhost:8000
SITE_URL=http://localhost:3000
```

### Volumes

Persistent data:

```yaml
volumes:
  todoless_db_data:       # Database
  todoless_storage_data:  # File storage
```

Location: `/var/lib/docker/volumes/`

---

## Networking

All services on `todoless_network`:

```yaml
networks:
  todoless_network:
    driver: bridge
```

Internal communication:
- `db:5432` - Database
- `kong:8000` - API Gateway
- `studio:3010` - Studio

---

## Health Checks

Built-in health checks:

```bash
# Check all
docker-compose ps

# Check specific
docker inspect --format='{{.State.Health.Status}}' supabase-db
docker inspect --format='{{.State.Health.Status}}' todoless-app
```

Manual checks:
```bash
# Database
docker exec supabase-db pg_isready -U postgres

# API
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000
```

---

## Troubleshooting

### Container won't start

```bash
# View logs
docker logs <container-name>

# Common containers
docker logs todoless-app
docker logs supabase-db
docker logs supabase-kong
```

### Port conflicts

```bash
# Check ports
netstat -tulpn | grep :3000

# Change in docker-compose.yml
ports:
  - "3001:3000"  # Use different external port
```

### Out of memory

```bash
# Check usage
docker stats

# Increase Docker memory (Docker Desktop)
# Settings → Resources → Memory → 4GB+
```

### Database issues

```bash
# Restart database
docker restart supabase-db

# Check logs
docker logs supabase-db

# Access console
docker exec -it supabase-db psql -U postgres -d todoless
```

### Reset everything

```bash
# ⚠️ Deletes all data!
docker-compose down -v
docker-compose up -d
```

---

## Production

### Security

```yaml
# Use secrets instead of .env
secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt

services:
  db:
    secrets:
      - postgres_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
```

### Reverse Proxy

**Nginx example:**

```nginx
server {
    listen 80;
    server_name todoless.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Traefik labels:**

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.todoless.rule=Host(`todoless.example.com`)"
  - "traefik.http.services.todoless.loadbalancer.server.port=3000"
```

### SSL/TLS

**With Caddy:**

```
todoless.example.com {
    reverse_proxy localhost:3000
}
```

**With Let's Encrypt:**

```bash
certbot --nginx -d todoless.example.com
```

### Monitoring

**Add Prometheus exporter:**

```yaml
  postgres-exporter:
    image: prometheuscommunity/postgres-exporter
    environment:
      DATA_SOURCE_NAME: "postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/todoless?sslmode=disable"
    ports:
      - "9187:9187"
```

---

## Maintenance

### Backups

```bash
# Automated backup
docker exec supabase-db pg_dump -U postgres todoless | \
  gzip > backup-$(date +%Y%m%d).sql.gz

# Scheduled (crontab)
0 2 * * * docker exec supabase-db pg_dump -U postgres todoless | gzip > /backups/todoless-$(date +\%Y\%m\%d).sql.gz
```

### Updates

```bash
# Pull new images
docker-compose pull

# Recreate containers
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Cleanup

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# System cleanup
docker system prune -a --volumes
```

---

## Resource Limits

```yaml
services:
  db:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          memory: 1G
```

---

**That's it!** 🐳

Everything in `docker-compose.yml`
