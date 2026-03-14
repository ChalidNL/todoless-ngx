# CasaOS Deployment - Todoless

## Super Simple Method

### 1. Import Docker Compose

**In CasaOS:**
1. Open App Store
2. Click **"Install a customized app"**
3. Choose **"Import from Docker Compose"**
4. Upload `docker-compose.yml`

**Or paste content:**
- Copy entire `docker-compose.yml` file
- Paste in CasaOS import dialog

### 2. Configure (Optional)

**In CasaOS UI, set these environment variables:**

```bash
POSTGRES_PASSWORD=your-strong-password
JWT_SECRET=your-jwt-secret
ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-role-key
```

**Or mount `.env` file:**
- Volume: `/path/to/.env` → `/app/.env`

### 3. Start

Click **"Install"** or **"Start"**

Wait 1-2 minutes for all containers to start.

### 4. Access

- **Todoless:** http://your-casaos-ip:3000
- **Studio:** http://your-casaos-ip:3010

---

## Alternative: Git Clone Method

**SSH to CasaOS:**
```bash
ssh user@your-casaos-ip

cd /DATA/AppData
git clone <your-repo> todoless
cd todoless

# Setup
cp .env.example .env
nano .env  # Fill in values

# Generate tokens
node scripts/generate-jwt.js $(openssl rand -base64 32)
# Copy to .env

# Start
docker-compose up -d
```

---

## Configuration

### Generate JWT Tokens

**If you need to generate tokens manually:**

```bash
# On CasaOS server
cd /DATA/AppData/todoless
node scripts/generate-jwt.js $(openssl rand -base64 32)
```

Copy output:
- `JWT_SECRET` → .env
- `ANON_KEY` → .env
- `SERVICE_ROLE_KEY` → .env

### Environment Variables

**Minimum required in `.env`:**

```bash
POSTGRES_PASSWORD=strong-password-here
JWT_SECRET=<from generate-jwt.js>
ANON_KEY=<from generate-jwt.js>
SERVICE_ROLE_KEY=<from generate-jwt.js>
```

**All services will start automatically!**

---

## Verification

### Check Containers

```bash
docker ps | grep todoless
docker ps | grep supabase
```

Should show 11 containers running.

### Check Logs

```bash
docker-compose logs -f
```

### Test Endpoints

```bash
curl http://localhost:3000      # Frontend
curl http://localhost:8000      # API
```

---

## Remote Access

### Via CasaOS Tunnel

1. Settings → Remote Access
2. Enable CasaOS Tunnel
3. Access: `https://xxx.casaos.app:3000`

### Via Tailscale

```bash
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Access from anywhere
http://casaos-hostname:3000
```

---

## Backups

### Manual Backup

```bash
docker exec supabase-db pg_dump -U postgres todoless > backup.sql
```

### Automated Backup

Create `/DATA/AppData/todoless/backup.sh`:

```bash
#!/bin/bash
docker exec supabase-db pg_dump -U postgres todoless | \
  gzip > /DATA/AppData/todoless/backups/backup-$(date +%Y%m%d).sql.gz
```

Add to cron:
```bash
0 2 * * * /DATA/AppData/todoless/backup.sh
```

---

## Troubleshooting

### Port Conflicts

```bash
# Check ports
netstat -tulpn | grep :3000

# Change in docker-compose.yml
ports:
  - "3001:3000"
```

### Database Issues

```bash
# Check logs
docker logs supabase-db

# Restart
docker restart supabase-db

# Console
docker exec -it supabase-db psql -U postgres -d todoless
```

### Reset Everything

```bash
cd /DATA/AppData/todoless
docker-compose down -v
docker-compose up -d
```

---

## CasaOS Labels

The `docker-compose.yml` includes CasaOS labels:

```yaml
labels:
  - "casaos.name=Todoless"
  - "casaos.category=Productivity"
  - "casaos.port=3000"
```

Todoless will appear in your CasaOS dashboard automatically!

---

**That's it!** 🎉

Import → Start → Use
