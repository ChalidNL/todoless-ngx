# Todoless - Quick Start Guide

## TL;DR

```bash
# 1. Setup environment
cp .env.example .env
nano .env  # Update POSTGRES_PASSWORD en JWT_SECRET

# 2. Start everything
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Open app
open http://localhost:3000
```

## Wat je nodig hebt

- Docker & Docker Compose geïnstalleerd
- 4GB vrije RAM
- 10GB vrije schijfruimte
- Node.js (voor development)

## Stap-voor-stap Setup

### 1️⃣ Clone & Navigate

```bash
git clone <your-repo-url>
cd todoless
```

### 2️⃣ Environment Configuratie

```bash
# Kopieer example
cp .env.example .env

# Genereer secure secrets
openssl rand -base64 32  # Voor POSTGRES_PASSWORD
openssl rand -base64 32  # Voor JWT_SECRET

# Update .env met deze waarden
nano .env
```

### 3️⃣ Start Services

**Optie A: Automatisch (Aanbevolen)**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Optie B: Handmatig**
```bash
# Generate JWT tokens
node scripts/generate-jwt.js $(openssl rand -base64 32)
# Kopieer output naar .env

# Start Supabase stack
docker-compose -f docker-compose.supabase.yml up -d

# Wacht tot alles draait
docker-compose -f docker-compose.supabase.yml logs -f
```

### 4️⃣ Toegang tot Services

| Service | URL | Beschrijving |
|---------|-----|--------------|
| **Todoless** | http://localhost:3000 | De hoofdapplicatie |
| **Studio** | http://localhost:3010 | Database management UI |
| **API** | http://localhost:8000 | Supabase REST API |
| **PostgreSQL** | localhost:5432 | Database (direct) |

### 5️⃣ Eerste Login

1. Open http://localhost:3000
2. Doorloop onboarding (eerste keer)
3. Maak admin account aan
4. Je bent klaar! 🎉

## Common Commands

### Service Management
```bash
# Start alles
docker-compose -f docker-compose.supabase.yml up -d

# Stop alles
docker-compose -f docker-compose.supabase.yml down

# Restart
docker-compose -f docker-compose.supabase.yml restart

# Bekijk logs
docker-compose -f docker-compose.supabase.yml logs -f

# Status check
docker-compose -f docker-compose.supabase.yml ps
```

### Database Management
```bash
# Verbind met database
docker exec -it supabase-db psql -U postgres -d todoless

# Backup maken
docker exec supabase-db pg_dump -U postgres todoless > backup.sql

# Restore backup
cat backup.sql | docker exec -i supabase-db psql -U postgres todoless

# Migraties uitvoeren
./scripts/migrate.sh
```

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build voor productie
npm run build

# Start productie server
npm start
```

## Invite Systeem

Todoless is invite-only. Zo nodig je iemand uit:

1. **Login als admin** op http://localhost:3000
2. **Ga naar Settings** (tandwiel icoon)
3. **Klik "Generate Invite Code"**
4. **Deel de 6-cijferige code** via WhatsApp of handmatig
5. **Nieuwe user** opent http://localhost:3000?invite=ABC123
6. **Registratie** wordt automatisch gestart

## Belangrijke Features

### ✨ Task Management
- **Inbox** - Quick overview met metrics
- **Tasks** - Volledig task overzicht met filters
- **Sprint Management** - Assign tasks aan 1-4 week sprints
- **Priority Icons** - Urgent/Normal/Low visual indicators
- **Blockers** - Mark tasks als blocked met comment

### 🏷️ Labels
- **Public Labels** - Zichtbaar voor iedereen
- **Private Labels** - Alleen voor jou zichtbaar
- **Color Coding** - Visuele organisatie
- **Multi-select** - Filter op meerdere labels

### 📦 Items (Shopping List)
- **Shop Assignment** - Organiseer per winkel
- **Minimum Stock** - Track voorraad
- **Quick Convert** - Van task naar item en terug

### 📝 Notes
- **Bullet Points** - Gestructureerd noteren
- **Link to Tasks/Items** - Koppel notities
- **Pin Important** - Pin belangrijke notities bovenaan

### 🗓️ Calendar
- **Week View** - Zie je taken per week
- **Drag & Drop** - Verschuif taken
- **Sprint Overview** - Zie sprint planning

### ⚙️ Settings
- **User Management** - Beheer team members
- **Archive Settings** - Auto-cleanup configuratie (30/60/90 dagen)
- **Language** - EN/NL/FR/DE ondersteuning
- **Dark Mode** - Donkere selectie in navigatie

## Troubleshooting

### "Port already in use"
```bash
# Check wat port 3000/8000 gebruikt
lsof -i :3000
lsof -i :8000

# Stop conflicterende services
docker-compose down
```

### "Database connection failed"
```bash
# Check of db container draait
docker ps | grep supabase-db

# Restart db
docker restart supabase-db

# Check logs
docker logs supabase-db
```

### "Can't login"
```bash
# Reset naar onboarding
docker exec supabase-db psql -U postgres -d todoless -c "DELETE FROM users;"

# Of volledig reset (WARNING: verwijdert alle data!)
docker-compose -f docker-compose.supabase.yml down -v
docker-compose -f docker-compose.supabase.yml up -d
```

### "Migraties falen"
```bash
# Handmatig uitvoeren
docker exec -i supabase-db psql -U postgres todoless < supabase/migrations/001_initial_schema.sql

# Of via script
chmod +x scripts/migrate.sh
./scripts/migrate.sh
```

## Productie Deployment

Voor productie deployment, zie:
- **SETUP_CHECKLIST.md** - Complete checklist
- **README_SUPABASE.md** - Uitgebreide Supabase documentatie
- **README_DOCKER.md** - Docker configuratie details

Minimaal voor productie:
1. ✅ Wijzig alle passwords in `.env`
2. ✅ Setup SSL (Let's Encrypt)
3. ✅ Configure reverse proxy (nginx)
4. ✅ Setup automated backups
5. ✅ Enable monitoring

## Support & Documentatie

- **README_SUPABASE.md** - Complete Supabase setup guide
- **README_DOCKER.md** - Docker deployment guide
- **SETUP_CHECKLIST.md** - Production deployment checklist
- **Supabase Docs** - https://supabase.com/docs
- **PostgreSQL Docs** - https://www.postgresql.org/docs/

## Tips & Tricks

### Snelle Backup
```bash
# Alias in ~/.bashrc
alias todoless-backup='docker exec supabase-db pg_dump -U postgres todoless | gzip > ~/backups/todoless-$(date +%Y%m%d).sql.gz'
```

### Development Workflow
```bash
# Terminal 1: Backend logs
docker-compose -f docker-compose.supabase.yml logs -f db rest auth

# Terminal 2: Frontend development
npm run dev

# Terminal 3: Database console
docker exec -it supabase-db psql -U postgres todoless
```

### Monitoring
```bash
# Resource usage
docker stats

# Database size
docker exec supabase-db psql -U postgres -d todoless -c "SELECT pg_size_pretty(pg_database_size('todoless'));"

# Connection count
docker exec supabase-db psql -U postgres -d todoless -c "SELECT count(*) FROM pg_stat_activity;"
```

## Next Steps

1. **Explore the app** - Maak wat tasks, probeer de features
2. **Invite team members** - Test het invite systeem
3. **Setup backups** - Automatiseer je backups
4. **Read full docs** - Check README_SUPABASE.md voor details
5. **Customize** - Pas aan naar jouw workflow

Happy organizing! 🚀
