# Todoless - CasaOS Deployment Guide

Complete guide voor het deployen van Todoless in CasaOS.

## 📋 Vereisten

- CasaOS geïnstalleerd
- Docker & Docker Compose (komt met CasaOS)
- Minimaal 2GB vrije RAM
- Minimaal 5GB vrije schijfruimte

## 🚀 Methode 1: Import via Docker Compose (Aanbevolen)

### Stap 1: Clone Repository

```bash
# SSH naar je CasaOS server
ssh user@your-casaos-ip

# Clone de repository
cd /DATA/AppData
git clone <your-repo-url> todoless
cd todoless
```

### Stap 2: Configureer Environment

```bash
# Kopieer environment template
cp .env.example .env

# Genereer veilige JWT tokens
node scripts/generate-jwt.js $(openssl rand -base64 32)

# Edit .env en vul de gegenereerde tokens in
nano .env
```

Vereiste variabelen in `.env`:
```bash
POSTGRES_PASSWORD=<strong-password>
JWT_SECRET=<generated-jwt-secret>
ANON_KEY=<generated-anon-key>
SERVICE_ROLE_KEY=<generated-service-role-key>
```

### Stap 3: Import in CasaOS

1. Open CasaOS Dashboard (http://your-casaos-ip)
2. Ga naar **App Store**
3. Klik op **"Install a customized app"** (rechts bovenin)
4. Kies **"Import from Docker Compose"**
5. Upload `docker-compose.supabase.yml`
6. Of plak de inhoud van het bestand

### Stap 4: Configureer in CasaOS UI

In het CasaOS import scherm:

**Basic Settings:**
- **App Name:** Todoless
- **Icon:** Upload logo of gebruik URL
- **Description:** Task management app with Supabase

**Environment Variables:**
Voeg alle variabelen uit `.env` toe via de UI, of:

**Volumes:**
Voeg deze mounts toe:
```
/DATA/AppData/todoless/.env → /app/.env (if needed)
/DATA/AppData/todoless/supabase/migrations → /migrations
```

**Ports:**
- 3000 → Todoless App (Web UI)
- 3010 → Supabase Studio (Database UI)
- 8000 → Supabase API

### Stap 5: Start de App

1. Klik **"Install"** of **"Start"**
2. CasaOS zal alle containers downloaden en starten
3. Wacht 1-2 minuten voor volledige startup

### Stap 6: Verificatie

Check of alles werkt:

```bash
# Check container status
docker ps | grep todoless
docker ps | grep supabase

# Check logs
docker logs todoless-app
docker logs supabase-db

# Test endpoints
curl http://localhost:3000
curl http://localhost:8000/health
```

### Stap 7: Run Migraties

```bash
cd /DATA/AppData/todoless
./scripts/migrate.sh
```

### Stap 8: Open de App

- **Todoless:** http://your-casaos-ip:3000
- **Supabase Studio:** http://your-casaos-ip:3010

## 🎨 Methode 2: CasaOS App Store Formaat

Als je een custom app wilt maken voor de CasaOS App Store:

### 1. Maak een `compose.yaml` voor CasaOS

```yaml
name: todoless
services:
  app:
    image: node:20-alpine
    container_name: todoless-app
    volumes:
      - /DATA/AppData/todoless:/app
    working_dir: /app
    command: sh -c "npm install && npm run build && npm run preview -- --host --port 3000"
    ports:
      - "3000:3000"
    depends_on:
      - db
    networks:
      - todoless-network
    restart: unless-stopped
    
  db:
    image: supabase/postgres:15.1.0.117
    container_name: supabase-db
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: todoless
    volumes:
      - todoless-db-data:/var/lib/postgresql/data
    networks:
      - todoless-network
    restart: unless-stopped
    
  # ... rest van services

x-casaos:
  architectures:
    - amd64
    - arm64
  main: app
  description:
    en_us: "Task management app with Supabase backend"
  tagline:
    en_us: "Efficient task management"
  developer: "Your Name"
  author: "Your Name"
  icon: "https://your-icon-url.com/icon.png"
  screenshot_link:
    - "https://your-screenshot.com/1.png"
  thumbnail: "https://your-thumbnail.com/thumb.png"
  title:
    en_us: "Todoless"
  category: "Productivity"
  port_map: "3000"
  tips:
    before_install:
      en_us: |
        Before installation:
        1. Make sure you have at least 2GB free RAM
        2. Prepare a strong database password
        3. The app will be available on port 3000
  index: /
  store_app_id: todoless

volumes:
  todoless-db-data:

networks:
  todoless-network:
    driver: bridge
```

### 2. Test lokaal

```bash
docker-compose -f compose.yaml up -d
```

### 3. Submit naar CasaOS App Store (Optioneel)

Zie: https://github.com/IceWhaleTech/CasaOS-AppStore

## 🔧 CasaOS Specifieke Configuratie

### Volume Paths

CasaOS gebruikt standaard `/DATA/AppData`:

```yaml
volumes:
  - /DATA/AppData/todoless/.env:/app/.env
  - /DATA/AppData/todoless/supabase/migrations:/migrations
  - todoless-db-data:/var/lib/postgresql/data
```

### Network Configuration

CasaOS gebruikt standaard de `bridge` network:

```yaml
networks:
  todoless-network:
    driver: bridge
```

### Port Mapping in CasaOS

CasaOS toont de primaire poort in de UI:

```yaml
x-casaos:
  port_map: "3000"  # Hoofd-port voor de Web UI
```

## 📱 Access via CasaOS Dashboard

Na installatie verschijnt Todoless in je CasaOS dashboard:

1. **Klik op het Todoless icoon** → Opent http://your-casaos-ip:3000
2. **Klik op "Settings"** → Database beheer opties
3. **View Logs** → Real-time container logs
4. **Terminal** → Open shell in container

## 🔐 Security in CasaOS

### 1. Firewall Configuratie

```bash
# Allow alleen from local network
sudo ufw allow from 192.168.1.0/24 to any port 3000
sudo ufw allow from 192.168.1.0/24 to any port 3010
sudo ufw allow from 192.168.1.0/24 to any port 8000

# Deny from outside
sudo ufw deny 3000
sudo ufw deny 3010
sudo ufw deny 8000
```

### 2. Reverse Proxy via CasaOS Gateway

CasaOS heeft een ingebouwde reverse proxy. Configureer:

1. Ga naar **Settings** → **Gateway**
2. Voeg een nieuwe route toe:
   - **Domain:** todoless.local (of eigen domain)
   - **Target:** http://localhost:3000
   - **SSL:** Enable (met Let's Encrypt)

### 3. Environment Secrets

In plaats van `.env` file, gebruik CasaOS secrets:

1. Ga naar **App Settings** → **Environment**
2. Voeg secrets toe via UI
3. Mark als "Secret" voor verbergen in UI

## 📊 Monitoring in CasaOS

### Resource Usage

CasaOS toont automatisch:
- CPU usage per container
- Memory usage
- Network traffic
- Disk usage

### Health Checks

Voeg health checks toe aan compose file:

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 🔄 Updates in CasaOS

### Manual Update

```bash
cd /DATA/AppData/todoless
git pull
docker-compose -f docker-compose.supabase.yml down
docker-compose -f docker-compose.supabase.yml up -d --build
```

### Via CasaOS UI

1. Stop de app via dashboard
2. SSH naar server
3. Run update commands
4. Start via dashboard

### Automated Updates (Optioneel)

```bash
# Cron job voor auto-update
0 3 * * 0 cd /DATA/AppData/todoless && git pull && docker-compose -f docker-compose.supabase.yml up -d --build
```

## 💾 Backups in CasaOS

### Automated Backup Script

Maak `/DATA/AppData/todoless/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/DATA/AppData/todoless/backups"
mkdir -p "$BACKUP_DIR"

# Database backup
docker exec supabase-db pg_dump -U postgres todoless | \
  gzip > "$BACKUP_DIR/todoless-$(date +%Y%m%d).sql.gz"

# Keep only last 7 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $(date)"
```

Make executable en add to cron:

```bash
chmod +x /DATA/AppData/todoless/backup.sh

# Add to crontab (daily at 2am)
0 2 * * * /DATA/AppData/todoless/backup.sh >> /DATA/AppData/todoless/backup.log 2>&1
```

### CasaOS Backup Module

Als CasaOS backup module beschikbaar is:

1. **Settings** → **Backup**
2. Add Todoless volumes:
   - `todoless-db-data`
   - `/DATA/AppData/todoless`
3. Schedule: Daily
4. Retention: 7 days

## 🆘 Troubleshooting in CasaOS

### Container Won't Start

```bash
# Check logs via CasaOS UI or:
docker logs todoless-app
docker logs supabase-db

# Restart via UI or:
docker restart todoless-app
```

### Port Conflicts

```bash
# Check if ports are in use
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

### Database Connection Issues

```bash
# Enter database container
docker exec -it supabase-db psql -U postgres -d todoless

# Check connections
SELECT count(*) FROM pg_stat_activity;

# Restart database
docker restart supabase-db
```

### Volume Permission Issues

```bash
# Fix permissions
sudo chown -R 1000:1000 /DATA/AppData/todoless
```

## 🌐 Remote Access

### Via CasaOS Tunnel

1. **Settings** → **Remote Access**
2. Enable CasaOS Tunnel
3. Get your unique URL: `https://xxx.casaos.app`
4. Access Todoless via: `https://xxx.casaos.app:3000`

### Via Tailscale (Recommended)

```bash
# Install Tailscale on CasaOS
curl -fsSL https://tailscale.com/install.sh | sh

# Connect
sudo tailscale up

# Access from any device in your Tailnet
http://casaos-hostname:3000
```

### Via Cloudflare Tunnel

1. Install Cloudflare Tunnel in CasaOS
2. Configure tunnel for port 3000
3. Get public URL: `https://todoless.your-domain.com`

## 📱 Mobile Access

### PWA Installation

Todoless is een PWA (Progressive Web App):

1. Open op mobiel: `http://your-casaos-ip:3000`
2. Browser menu → **Add to Home Screen**
3. App verschijnt als native app

### Mobile Optimization

De app is geoptimaliseerd voor mobiel:
- Responsive design
- Touch gestures
- Offline cache (na setup)

## ✅ Post-Installation Checklist

- [ ] App accessible via http://your-casaos-ip:3000
- [ ] Supabase Studio accessible via :3010
- [ ] Database migrations completed
- [ ] Admin account created
- [ ] Backups configured
- [ ] Firewall rules set
- [ ] Remote access configured (optional)
- [ ] PWA installed on mobile (optional)

## 🎉 Next Steps

1. **Onboarding:** Open http://your-casaos-ip:3000
2. **Create Admin:** Follow onboarding flow
3. **Invite Users:** Settings → Generate invite codes
4. **Start Using:** Create your first tasks!

## 📚 Additional Resources

- **CasaOS Docs:** https://casaos.io/docs
- **Todoless Docs:** See README.md
- **Supabase Docs:** README_SUPABASE.md
- **Docker Docs:** README_DOCKER.md

---

**Happy task managing in CasaOS! 🎉**
