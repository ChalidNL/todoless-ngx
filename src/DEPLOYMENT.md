# Todoless-ngx Deployment Guide

## Quick Start with Docker Compose

### 1. Create Environment File

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

**Important:** Change these values in `.env`:
- `POSTGRES_PASSWORD` - Choose a strong password
- `JWT_SECRET` - Generate a random string (at least 32 characters)

### 2. Start the Application

```bash
docker-compose up -d
```

This will start three containers:
- `todoless-ngx-db` - PostgreSQL database
- `todoless-ngx-backend` - Node.js API server  
- `todoless-ngx-frontend` - Nginx serving React app

### 3. Access the Application

Open your browser and go to:
```
http://localhost:3000
```

### 4. First-Time Setup

1. The app will show the login screen
2. You need to create an invite code first using the backend API:

```bash
# Connect to backend container
docker exec -it todoless-ngx-backend sh

# Generate invite code (inside container)
node -e "console.log(Math.floor(100000 + Math.random() * 900000))"
```

3. Register a new account using the invite code
4. The first registered user becomes the admin

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ http://localhost:3000
       ▼
┌─────────────┐
│   Nginx     │ ← Frontend container (React app)
│   Proxy     │
└──────┬──────┘
       │ Proxies /api → backend:4000
       │ Proxies /ws  → backend:4000
       ▼
┌─────────────┐
│   Node.js   │ ← Backend container (Express API)
│   Backend   │
└──────┬──────┘
       │ PostgreSQL connection
       ▼
┌─────────────┐
│ PostgreSQL  │ ← Database container
└─────────────┘
```

## Port Mapping

- **Frontend**: `3000:80` → Nginx serves React app and proxies API calls
- **Backend**: `4000:4000` → Express API server (not exposed by default)
- **Database**: `5432` → PostgreSQL (internal only, not exposed)

## Environment Variables

### Frontend (.env)
- `FRONTEND_PORT=3000` - Port for the web interface
- `VITE_API_URL=` - Empty for production (uses nginx proxy)

### Backend (.env)
- `BACKEND_PORT=4000` - Backend API port
- `DB_HOST=todoless-ngx-db` - Database host (Docker service name)
- `DB_PORT=5432` - Database port
- `DB_NAME=todoless` - Database name
- `DB_USER=todoless` - Database user
- `DB_PASSWORD=***` - Database password
- `JWT_SECRET=***` - JWT signing secret
- `CORS_ORIGIN=*` - CORS allowed origins
- `COOKIE_SECURE=false` - Set to true for HTTPS

## Volumes

Data is persisted in Docker volume:
```
todoless-ngx-db-data → /var/lib/postgresql/data
```

## Health Checks

All containers have health checks:

```bash
# Check container health
docker ps

# View container logs
docker-compose logs -f

# Check specific service
docker-compose logs -f todoless-ngx-backend
```

## Stopping the Application

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (⚠️ deletes all data)
docker-compose down -v
```

## Troubleshooting

### Backend not connecting to database

```bash
# Check database is running
docker-compose ps todoless-ngx-db

# Check database logs
docker-compose logs todoless-ngx-db

# Verify database connection
docker exec -it todoless-ngx-db psql -U todoless -d todoless -c "SELECT version();"
```

### Frontend shows "Error loading data"

1. Check backend is running:
   ```bash
   docker-compose logs todoless-ngx-backend
   ```

2. Verify backend health:
   ```bash
   curl http://localhost:4000/api/health
   ```

3. Check nginx proxy configuration:
   ```bash
   docker exec -it todoless-ngx-frontend cat /etc/nginx/conf.d/default.conf
   ```

### WebSocket not connecting

1. Check backend WebSocket server:
   ```bash
   docker-compose logs todoless-ngx-backend | grep WebSocket
   ```

2. Verify nginx WebSocket proxy is working:
   ```bash
   # Should show upgrade headers
   docker exec -it todoless-ngx-frontend nginx -T | grep -A 10 "location /ws"
   ```

## CasaOS Deployment

For CasaOS users:

1. Place `docker-compose.yml` in your CasaOS app directory
2. Create `.env` file with your configuration
3. CasaOS will detect the compose file and show the app
4. Click install and it will use the compose configuration

The app will be available at `http://YOUR_SERVER_IP:3000`

## Production Deployment

For production use:

1. **Use HTTPS**: Configure Nginx with SSL certificates
2. **Secure secrets**: Generate strong JWT_SECRET and database passwords
3. **Backup database**: Regular backups of PostgreSQL data volume
4. **Update CORS**: Set `CORS_ORIGIN` to your domain instead of `*`
5. **Set cookie security**: Change `COOKIE_SECURE=true` for HTTPS

### Example with Traefik reverse proxy:

```yaml
services:
  todoless-ngx-frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.todoless.rule=Host(`todoless.yourdomain.com`)"
      - "traefik.http.routers.todoless.entrypoints=websecure"
      - "traefik.http.routers.todoless.tls.certresolver=letsencrypt"
```

## Database Backups

### Manual backup:
```bash
docker exec todoless-ngx-db pg_dump -U todoless todoless > backup.sql
```

### Restore from backup:
```bash
cat backup.sql | docker exec -i todoless-ngx-db psql -U todoless -d todoless
```

### Automated backups:
Add a cron job:
```bash
0 2 * * * docker exec todoless-ngx-db pg_dump -U todoless todoless > /backups/todoless-$(date +\%Y\%m\%d).sql
```

## Updates

To update to the latest version:

```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Support

For issues and questions:
- GitHub: https://github.com/ChalidNL/todoless-ngx
- Documentation: /docs folder in repository
