# Todoless - Supabase Self-Hosted Setup

Complete guide voor het opzetten van Todoless met een self-hosted Supabase backend.

## Wat is Supabase?

Supabase is een open-source Firebase alternatief dat bestaat uit:
- **PostgreSQL Database** - Relationele database met real-time functionaliteit
- **GoTrue** - Gebruikersauthenticatie en autorisatie
- **PostgREST** - Automatische REST API voor je database
- **Realtime** - WebSocket server voor live updates
- **Storage** - Object storage (S3-compatibel)
- **Studio** - Web UI voor database management

## Architectuur

```
┌─────────────┐
│   Todoless  │ ──┐
│   Frontend  │   │
└─────────────┘   │
                  ▼
┌─────────────────────────────────┐
│         Kong (API Gateway)       │ ← Port 8000
└─────────────────────────────────┘
         │      │      │      │
    ┌────┘      │      │      └────┐
    ▼           ▼      ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ GoTrue │ │PostgRES│ │Realtime│ │Storage │
│ (Auth) │ │  (API) │ │ (WSS)  │ │ (S3)   │
└────────┘ └────────┘ └────────┘ └────────┘
    │          │          │          │
    └──────────┴──────────┴──────────┘
                  ▼
          ┌──────────────┐
          │  PostgreSQL  │ ← Port 5432
          │   Database   │
          └──────────────┘
```

## Quick Start

### 1. Voorbereidingen

```bash
# Kopieer de environment variabelen
cp .env.example .env

# Bewerk .env en wijzig MINIMAAL deze waarden:
# - POSTGRES_PASSWORD (gebruik een sterk wachtwoord)
# - JWT_SECRET (minimaal 32 karakters, gebruik: openssl rand -base64 32)
nano .env
```

### 2. Start Supabase Stack

```bash
# Start alle Supabase services
docker-compose -f docker-compose.supabase.yml up -d

# Bekijk logs
docker-compose -f docker-compose.supabase.yml logs -f

# Check status
docker-compose -f docker-compose.supabase.yml ps
```

### 3. Toegang tot Services

- **Todoless App**: http://localhost:3000
- **Supabase Studio**: http://localhost:3010
- **Supabase API**: http://localhost:8000
- **PostgreSQL**: localhost:5432

### 4. Database Migraties

De initiële schema wordt automatisch uitgevoerd bij de eerste start via `/supabase/migrations/001_initial_schema.sql`.

Om handmatig migraties uit te voeren:

```bash
# Verbind met de database
docker exec -it supabase-db psql -U postgres -d todoless

# Voer SQL commando's uit
\dt  # Toon alle tabellen
\d users  # Toon users table structure
```

## Environment Variabelen

### Essentieel (MOET wijzigen voor productie)

```bash
# Database wachtwoord
POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password

# JWT secret voor authenticatie (genereer met: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long

# API keys (genereer nieuwe met https://supabase.com/docs/guides/api/api-keys)
ANON_KEY=eyJhbGc...
SERVICE_ROLE_KEY=eyJhbGc...
```

### Optioneel

```bash
# Email configuratie (voor wachtwoord reset, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SENDER_NAME=Todoless

# Site URL
SITE_URL=http://localhost:3000

# Disable signup (true = alleen via invite)
DISABLE_SIGNUP=false
```

## Database Schema

Het database schema bevat de volgende tabellen:

### Core Tables

- **users** - Gebruikersaccounts met rollen (admin/user/child)
- **tasks** - Taken met status, prioriteit, horizon, sprint assignment
- **items** - Shopping list items
- **notes** - Notities met bullet points
- **labels** - Labels met private/public optie
- **shops** - Winkels voor items
- **sprints** - Sprint management (1-4 weken)
- **invite_codes** - 6-cijferige invite codes
- **app_settings** - Per-user instellingen
- **calendar_events** - Kalender events

### Row Level Security (RLS)

Alle tabellen hebben RLS enabled:

- **Private items** - Alleen zichtbaar voor creator
- **Public items** - Zichtbaar voor alle users
- **Labels** - Private labels alleen voor creator
- **Settings** - Per user gescheiden

## Supabase Studio

De Supabase Studio web interface is beschikbaar op http://localhost:3010

### Features

- **Table Editor** - Browse en edit data
- **SQL Editor** - Voer custom queries uit
- **Auth** - Beheer gebruikers
- **Policies** - Configureer RLS policies
- **API Docs** - Automatisch gegenereerde API documentatie

### Eerste Login

1. Ga naar http://localhost:3010
2. De standaard credentials zijn gedefinieerd in `.env`
3. Verander deze voor productie gebruik!

## API Endpoints

Supabase genereert automatisch een REST API via PostgREST.

### Base URL

```
http://localhost:8000/rest/v1
```

### Authentication Headers

```bash
# Anonieme requests (read-only voor publieke data)
apikey: <ANON_KEY>

# Service role (full access, gebruik alleen server-side!)
apikey: <SERVICE_ROLE_KEY>
Authorization: Bearer <SERVICE_ROLE_KEY>
```

### Voorbeelden

```bash
# Haal alle users op
curl http://localhost:8000/rest/v1/users \
  -H "apikey: <ANON_KEY>"

# Maak een nieuwe task
curl -X POST http://localhost:8000/rest/v1/tasks \
  -H "apikey: <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "status": "todo",
    "priority": "normal"
  }'

# Update een task
curl -X PATCH http://localhost:8000/rest/v1/tasks?id=eq.<task-id> \
  -H "apikey: <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'

# Delete een task
curl -X DELETE http://localhost:8000/rest/v1/tasks?id=eq.<task-id> \
  -H "apikey: <ANON_KEY>"
```

## Backup & Restore

### Database Backup

```bash
# Maak backup van de database
docker exec supabase-db pg_dump -U postgres todoless > backup-$(date +%Y%m%d).sql

# Of gebruik pg_dumpall voor alle databases
docker exec supabase-db pg_dumpall -U postgres > backup-all-$(date +%Y%m%d).sql
```

### Database Restore

```bash
# Stop de services
docker-compose -f docker-compose.supabase.yml down

# Verwijder oude data
docker volume rm todoless-network_supabase-db

# Start opnieuw
docker-compose -f docker-compose.supabase.yml up -d db

# Wacht tot database ready is
sleep 10

# Restore de backup
cat backup-20240314.sql | docker exec -i supabase-db psql -U postgres todoless

# Start alle services
docker-compose -f docker-compose.supabase.yml up -d
```

### Automated Backups

Voeg toe aan crontab voor dagelijkse backups:

```bash
# Crontab entry (run daily at 2 AM)
0 2 * * * docker exec supabase-db pg_dump -U postgres todoless | gzip > /backups/todoless-$(date +\%Y\%m\%d).sql.gz
```

## Monitoring

### Container Logs

```bash
# Alle logs
docker-compose -f docker-compose.supabase.yml logs -f

# Specifieke service
docker-compose -f docker-compose.supabase.yml logs -f db
docker-compose -f docker-compose.supabase.yml logs -f auth
docker-compose -f docker-compose.supabase.yml logs -f rest
```

### Database Monitoring

```bash
# Verbind met database
docker exec -it supabase-db psql -U postgres todoless

# Check active connections
SELECT * FROM pg_stat_activity;

# Check database size
SELECT pg_size_pretty(pg_database_size('todoless'));

# Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Troubleshooting

### Database verbinding mislukt

```bash
# Check of de database container draait
docker ps | grep supabase-db

# Check database logs
docker logs supabase-db

# Test verbinding
docker exec supabase-db pg_isready -U postgres
```

### Kong gateway errors

```bash
# Check Kong configuratie
docker exec supabase-kong kong config parse /home/kong/kong.yml

# Reload Kong
docker exec supabase-kong kong reload
```

### Migraties falen

```bash
# Handmatig migraties uitvoeren
docker exec -i supabase-db psql -U postgres todoless < supabase/migrations/001_initial_schema.sql
```

### Reset alles

```bash
# WAARSCHUWING: Dit verwijdert ALLE data!
docker-compose -f docker-compose.supabase.yml down -v
docker-compose -f docker-compose.supabase.yml up -d
```

## Productie Deployment

### Checklist

- [ ] Wijzig `POSTGRES_PASSWORD` naar sterk wachtwoord
- [ ] Genereer nieuwe `JWT_SECRET` (minimaal 32 chars)
- [ ] Genereer nieuwe `ANON_KEY` en `SERVICE_ROLE_KEY` via https://supabase.com/docs/guides/api/api-keys
- [ ] Configureer SMTP voor email functionaliteit
- [ ] Enable SSL/TLS voor database verbindingen
- [ ] Setup automated backups
- [ ] Configureer monitoring en alerting
- [ ] Setup reverse proxy (nginx/traefik) met SSL
- [ ] Limiteer database toegang tot specifieke IPs
- [ ] Review en versterk RLS policies

### Reverse Proxy (Nginx)

Voorbeeld nginx configuratie:

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
    
    ssl_certificate /etc/letsencrypt/live/todoless.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/todoless.example.com/privkey.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Supabase API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Development vs Production

### Development

```bash
# Start met hot reload
docker-compose -f docker-compose.supabase.yml up

# Frontend development server
npm run dev
```

### Production

```bash
# Build en start
docker-compose -f docker-compose.supabase.yml up -d

# Check status
docker-compose -f docker-compose.supabase.yml ps
```

## Migratie van localStorage

Als je data hebt in de oude localStorage versie:

1. Export data via browser console:
```javascript
// Export tasks
console.log(JSON.stringify(JSON.parse(localStorage.getItem('todoless_tasks'))));
```

2. Import via Supabase Studio of API:
```bash
# Via API
curl -X POST http://localhost:8000/rest/v1/tasks \
  -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d @tasks-export.json
```

## Support & Documentatie

- **Supabase Docs**: https://supabase.com/docs
- **PostgREST Docs**: https://postgrest.org/en/stable/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## License

Private use only.
