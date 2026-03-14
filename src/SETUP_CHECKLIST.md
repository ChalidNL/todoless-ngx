# Todoless Setup Checklist

Complete deze stappen om Todoless met Supabase te deployen.

## ✅ Pre-deployment Checklist

### 1. Environment Setup
- [ ] Kopieer `.env.example` naar `.env`
- [ ] Genereer sterke `POSTGRES_PASSWORD` (min. 32 chars)
- [ ] Genereer sterke `JWT_SECRET` (min. 32 chars)
- [ ] Genereer nieuwe `ANON_KEY` en `SERVICE_ROLE_KEY`
  ```bash
  # Gebruik het generate-jwt.js script:
  node scripts/generate-jwt.js $(openssl rand -base64 32)
  ```
- [ ] Configureer SMTP instellingen (optioneel, voor email functionaliteit)
- [ ] Update `SITE_URL` naar jouw productie domein

### 2. Docker Setup
- [ ] Installeer Docker (min. versie 20.10)
- [ ] Installeer Docker Compose (min. versie 2.0)
- [ ] Voer setup script uit:
  ```bash
  chmod +x scripts/setup.sh
  ./scripts/setup.sh
  ```

### 3. Database Migraties
- [ ] Controleer of migratie automatisch is uitgevoerd
  ```bash
  docker exec supabase-db psql -U postgres -d todoless -c "\dt"
  ```
- [ ] Bij problemen, voer handmatig uit:
  ```bash
  chmod +x scripts/migrate.sh
  ./scripts/migrate.sh
  ```

### 4. Service Verificatie
- [ ] Check of alle containers draaien:
  ```bash
  docker-compose -f docker-compose.supabase.yml ps
  ```
- [ ] Test Supabase Studio: http://localhost:3010
- [ ] Test Supabase API: http://localhost:8000/health
- [ ] Test Todoless App: http://localhost:3000

### 5. Eerste Admin Account
- [ ] Open Todoless op http://localhost:3000
- [ ] Doorloop onboarding proces
- [ ] Maak eerste admin account aan
- [ ] Test login functionaliteit

### 6. Invite Systeem
- [ ] Log in als admin
- [ ] Ga naar Settings
- [ ] Genereer invite code
- [ ] Test registratie met invite code
- [ ] Verifieer dat nieuwe user kan inloggen

### 7. Functionaliteit Tests
- [ ] Maak een nieuwe task aan
- [ ] Update task status
- [ ] Voeg labels toe
- [ ] Maak een sprint aan
- [ ] Assign task aan sprint
- [ ] Test private labels functionaliteit
- [ ] Test archive functionaliteit
- [ ] Test bulk operations

### 8. Backup Setup
- [ ] Maak backup directory aan:
  ```bash
  mkdir -p /var/backups/todoless
  ```
- [ ] Test handmatige backup:
  ```bash
  docker exec supabase-db pg_dump -U postgres todoless > test-backup.sql
  ```
- [ ] Setup automated backups (cron):
  ```bash
  # Voeg toe aan crontab (crontab -e):
  0 2 * * * docker exec supabase-db pg_dump -U postgres todoless | gzip > /var/backups/todoless/backup-$(date +\%Y\%m\%d).sql.gz
  ```

### 9. Security Hardening

#### Database
- [ ] Wijzig standaard PostgreSQL poort (5432 → custom)
- [ ] Restricteer database toegang tot localhost only
- [ ] Enable SSL voor database verbindingen
- [ ] Review en versterk RLS policies

#### Network
- [ ] Setup firewall rules
  ```bash
  # Alleen 3000, 8000, 3010 open voor specifieke IPs
  ufw allow from 192.168.1.0/24 to any port 3000
  ufw allow from 192.168.1.0/24 to any port 8000
  ufw allow from 192.168.1.0/24 to any port 3010
  ```
- [ ] Setup reverse proxy met SSL (nginx/traefik)
- [ ] Configureer Let's Encrypt certificaten

#### Application
- [ ] Disable Supabase Studio in productie (port 3010)
- [ ] Update `DISABLE_SIGNUP=true` (alleen invite-only)
- [ ] Setup rate limiting
- [ ] Configure CORS origins restrictief

### 10. Monitoring Setup
- [ ] Setup log aggregation
  ```bash
  # Logs naar file
  docker-compose -f docker-compose.supabase.yml logs -f > /var/log/todoless.log
  ```
- [ ] Configure health checks monitoring
- [ ] Setup disk space alerts
- [ ] Setup database size monitoring
- [ ] Configure uptime monitoring (optional)

### 11. Performance Optimization
- [ ] Review PostgreSQL configuration
- [ ] Enable database query caching
- [ ] Setup connection pooling
- [ ] Configure proper indexes (already in migration)
- [ ] Monitor slow queries

### 12. Documentation
- [ ] Document custom configurations
- [ ] Create runbook voor common issues
- [ ] Document backup/restore procedure
- [ ] Create user manual (optional)

## 🚀 Production Deployment

### Reverse Proxy Setup (Nginx)

1. Install Nginx:
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

2. Create Nginx config (`/etc/nginx/sites-available/todoless`):
```nginx
server {
    listen 80;
    server_name todoless.example.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name todoless.example.com;
    
    # SSL Configuration (managed by certbot)
    ssl_certificate /etc/letsencrypt/live/todoless.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/todoless.example.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Supabase API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support voor Realtime
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

3. Enable and get SSL:
```bash
sudo ln -s /etc/nginx/sites-available/todoless /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d todoless.example.com
```

### Update Environment for Production

Update `.env`:
```bash
SITE_URL=https://todoless.example.com
API_EXTERNAL_URL=https://todoless.example.com/api
SUPABASE_PUBLIC_URL=https://todoless.example.com/api
```

Restart services:
```bash
docker-compose -f docker-compose.supabase.yml down
docker-compose -f docker-compose.supabase.yml up -d
```

## 📊 Post-Deployment Verification

- [ ] SSL certificate is valid (check with https://www.ssllabs.com/ssltest/)
- [ ] All services accessible via HTTPS
- [ ] Database backups are running
- [ ] Monitoring is active
- [ ] Logs are being collected
- [ ] Invite system werkt
- [ ] Email functionaliteit werkt (als geconfigureerd)
- [ ] Real-time updates werken
- [ ] Private labels hidden voor andere users
- [ ] Archive auto-cleanup werkt

## 🔧 Troubleshooting Common Issues

### Services won't start
```bash
# Check logs
docker-compose -f docker-compose.supabase.yml logs

# Reset everything (WARNING: deletes data!)
docker-compose -f docker-compose.supabase.yml down -v
docker-compose -f docker-compose.supabase.yml up -d
```

### Database connection failed
```bash
# Check database is running
docker exec supabase-db pg_isready -U postgres

# Connect manually
docker exec -it supabase-db psql -U postgres -d todoless
```

### Kong gateway errors
```bash
# Validate Kong config
docker exec supabase-kong kong config parse /home/kong/kong.yml

# Reload Kong
docker exec supabase-kong kong reload
```

### Can't access Studio
```bash
# Check Studio logs
docker logs supabase-studio

# Restart Studio
docker restart supabase-studio
```

## 📞 Support

Voor vragen of problemen:
- Check README_SUPABASE.md voor gedetailleerde documentatie
- Check README_DOCKER.md voor Docker-specifieke info
- Raadpleeg Supabase docs: https://supabase.com/docs
