# Todoless

Compact task management app with Supabase backend.

## CasaOS Install

```
1. App Store → "Install customized app"
2. Upload docker-compose.yml
3. Done!
```

Access: http://your-ip:3000

## Docker Install

```bash
cp .env.example .env
node scripts/generate-jwt.js $(openssl rand -base64 32)
# Copy output to .env
docker-compose up -d
```

Access: http://localhost:3000

---

## Features

- Task management (Inbox → Todo → Done)
- Shopping lists
- Notes & calendar
- Sprint planning
- Multi-user (invite-only)
- Real-time sync
- Auto-archive
- Smart search

---

## Services (All Included)

- **Todoless** (3000) - Web app
- **Studio** (3010) - Database UI
- **API** (8000) - REST + Auth
- **Database** (5432) - PostgreSQL
- + 7 more Supabase services

All in `docker-compose.yml`!

---

## Commands

```bash
docker-compose up -d      # Start
docker-compose logs -f    # Logs
docker-compose down       # Stop
make backup              # Backup
make health              # Check
```

---

## Docs

- [INSTALL.md](INSTALL.md) - Quick install
- [QUICKSTART.md](QUICKSTART.md) - 5-min setup
- [CASAOS_GUIDE.md](CASAOS_GUIDE.md) - CasaOS
- [COMMANDS.md](COMMANDS.md) - All commands
- [SUMMARY.md](SUMMARY.md) - Overview

---

**Stack:** React 18 + TypeScript + Tailwind v4 + Supabase + Docker

**Made with ❤️**
