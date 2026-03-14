# Todoless-ngx Installation Guide

Complete step-by-step guide for installing Todoless-ngx with self-hosted Supabase.

## Prerequisites

- **Docker** and **Docker Compose** installed
- **Ports available**: 3000, 3001, 5432, 8000
- **Minimum 2GB RAM** recommended
- **Linux**, **macOS**, or **Windows** with WSL2

---

## Installation Steps

### 1. Download Todoless-ngx

```bash
git clone <repository-url>
cd todoless-ngx
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

**IMPORTANT**: Edit `.env` and change the default passwords:

```bash
nano .env
```

Change these values:
```env
POSTGRES_PASSWORD=your-super-secret-postgres-password-change-me
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long-change-me
```

**Security tip**: Use strong, random passwords. You can generate them with:
```bash
# Generate random password
openssl rand -base64 32
```

### 3. Start All Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Supabase services (Auth, REST API, Realtime, Storage, Studio)
- Todoless-ngx web application

### 4. Wait for Services to Initialize

Services can take 30-60 seconds to fully start. Check status:

```bash
# View logs
docker-compose logs -f

# Check all services are healthy
docker-compose ps
```

Wait until you see:
```
todoless-ngx-web     | Accepting connections at http://localhost:3000
```

### 5. Create Your First Admin User

Open **Supabase Studio**: http://localhost:3001

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - **Email**: your@email.com
   - **Password**: YourSecurePassword
   - **Auto Confirm User**: ✅ (Enable this!)
4. Click **Create user**

![Create User Screenshot](https://via.placeholder.com/800x400/f5f5f5/000000?text=Supabase+Studio+%E2%80%BA+Authentication+%E2%80%BA+Add+User)

### 6. Login to Todoless-ngx

1. Open http://localhost:3000
2. Login with the credentials you just created
3. You're in! 🎉

---

## Creating Invite Codes

Todoless-ngx is **invite-only** by default. To invite team members:

### Option 1: Via Supabase Studio

1. Open Supabase Studio: http://localhost:3001
2. Go to **Table Editor** → **invite_codes**
3. Click **Insert** → **Insert row**
4. Enter:
   ```
   code: INVITE01
   created_by: <your-user-id>  (copy from profiles table)
   expires_at: 2026-12-31 23:59:59+00
   max_uses: 1
   current_uses: 0
   ```
5. Click **Save**

### Option 2: Via SQL Editor

1. Open Supabase Studio: http://localhost:3001
2. Go to **SQL Editor**
3. Run this query:

```sql
INSERT INTO public.invite_codes (code, created_by, expires_at, max_uses, current_uses)
VALUES (
  'INVITE01',                                    -- Your invite code
  (SELECT id FROM public.profiles LIMIT 1),     -- Your user ID
  '2026-12-31 23:59:59+00',                      -- Expiration date
  1,                                             -- Max uses
  0                                              -- Current uses
);
```

4. Share the code `INVITE01` with your team member
5. They can register at: http://localhost:3000/?invite=INVITE01

---

## Configuration

### Archive Settings

Configure automatic archiving in **Settings** → **Archive**:

| Option | Description |
|--------|-------------|
| **30 days** | Archive after 30 days |
| **60 days** | Archive after 60 days |
| **90 days** | Archive after 90 days |
| **Unlimited** | Never auto-archive |
| **Auto-cleanup** | Automatically delete old archives |

### Private Labels

Create private labels in **Settings** → **Labels**:

1. Create a new label
2. Toggle **Private** ✅
3. Tasks with this label are hidden from other users

### Email Notifications (Optional)

To enable email notifications, configure SMTP in `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SENDER_NAME=Todoless-ngx
```

**Gmail users**: Create an [App Password](https://support.google.com/accounts/answer/185833) instead of using your real password.

---

## Accessing Services

| Service | URL | Description |
|---------|-----|-------------|
| **Todoless-ngx** | http://localhost:3000 | Main application |
| **Supabase Studio** | http://localhost:3001 | Database admin UI |
| **PostgreSQL** | localhost:5432 | Database (user: `postgres`) |
| **Kong API Gateway** | http://localhost:8000 | Supabase API endpoint |

---

## Backup & Restore

### Backup Database

```bash
# Backup to SQL file
docker exec todoless-ngx-db pg_dump -U postgres postgres > backup-$(date +%Y%m%d).sql

# Backup to compressed file
docker exec todoless-ngx-db pg_dump -U postgres postgres | gzip > backup-$(date +%Y%m%d).sql.gz
```

### Restore Database

```bash
# Restore from SQL file
docker exec -i todoless-ngx-db psql -U postgres postgres < backup-20260314.sql

# Restore from compressed file
gunzip < backup-20260314.sql.gz | docker exec -i todoless-ngx-db psql -U postgres postgres
```

### Automated Backups (Recommended)

Create a cron job for daily backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * docker exec todoless-ngx-db pg_dump -U postgres postgres | gzip > /path/to/backups/todoless-backup-$(date +\%Y\%m\%d).sql.gz
```

---

## Updating

### Update to Latest Version

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs -f web
```

### Database Migrations

Database schema is automatically created on first start. For updates:

```bash
# Apply new migrations
docker exec -i todoless-ngx-db psql -U postgres postgres < database/migration-v2.sql
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs db
docker-compose logs auth
docker-compose logs web

# Restart all services
docker-compose restart
```

### Can't Login

1. **Check user exists** in Supabase Studio → Authentication → Users
2. **Verify email is confirmed** (check "Confirmed" column)
3. **Check auth logs**: `docker-compose logs auth`
4. **Reset password** in Supabase Studio

### Database Connection Errors

```bash
# Check PostgreSQL is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Test connection
docker exec -it todoless-ngx-db psql -U postgres -c "SELECT version();"
```

### Port Already in Use

If port 3000 is already in use:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change the port in docker-compose.yml
ports:
  - "3001:3000"  # Changed from 3000:3000
```

### Complete Reset (Nuclear Option)

⚠️ **WARNING**: This deletes ALL data!

```bash
# Stop and remove everything
docker-compose down -v

# Remove all containers and volumes
docker system prune -a --volumes

# Start fresh
docker-compose up -d
```

---

## CasaOS Installation

### One-Click Install

1. Open **CasaOS** → **App Store**
2. Search for **"Todoless-ngx"**
3. Click **Install**
4. Wait for installation to complete
5. Follow steps 5-6 above to create admin user

### Manual Import

1. Open **CasaOS** → **App Store** → **Import**
2. Paste the docker-compose.yml content
3. Click **Install**
4. Follow setup steps above

---

## Production Deployment

### Security Checklist

- [ ] Change `POSTGRES_PASSWORD` in `.env`
- [ ] Change `JWT_SECRET` in `.env`
- [ ] Enable HTTPS with reverse proxy (nginx, Caddy, Traefik)
- [ ] Configure firewall to restrict database access
- [ ] Set up automated backups
- [ ] Configure SMTP for email notifications
- [ ] Keep `DISABLE_SIGNUP=true` (invite-only)
- [ ] Regularly update Docker images

### Reverse Proxy Example (nginx)

```nginx
server {
    listen 80;
    server_name todoless.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name todoless.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: See README.md for usage guide
- **Community**: Join our Discord/Slack/Forum

---

## License

MIT License - See LICENSE file for details
