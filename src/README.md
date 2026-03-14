# Todoless - Task Management App

> A compact, Paperless-ngx-inspired task management application with multi-user support, real-time sync, and Supabase self-hosted backend.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![CasaOS](https://img.shields.io/badge/CasaOS-compatible-orange)

---

## ✨ Features

- 📋 **Task Management** - Inbox, Backlog, Todo, Done workflow
- 🛒 **Shopping Lists** - Items with shops, locations, and stock tracking
- 📝 **Notes** - Rich bullet-point notes with linking
- 📅 **Calendar** - Visual timeline view
- 🏃 **Sprint System** - Weekly sprint planning with icons
- 🏷️ **Smart Labels** - Public and private labels
- 👥 **Multi-user** - Invite-only with role-based access
- ⚡ **Real-time Sync** - Live updates across all devices
- 🗄️ **Auto-archive** - Configurable retention (30/60/90 days)
- 🔍 **Smart Search** - Parse @user, #label, //date
- 🌐 **Multi-language** - EN (+ FR, NL, DE ready)
- 🐳 **Docker Ready** - Complete self-hosted stack

---

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone repository
git clone <your-repo-url> todoless
cd todoless

# Run automated setup
make setup

# Access the app
open http://localhost:3000
```

That's it! The setup script handles everything:
- Creates `.env` with secure random passwords
- Generates JWT tokens
- Starts all 10 Supabase services
- Runs database migrations
- Builds and starts the frontend

### Option 2: Manual Setup

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Generate JWT tokens
node scripts/generate-jwt.js $(openssl rand -base64 32)
# Copy output to .env

# 3. Start services
docker-compose -f docker-compose.supabase.yml up -d

# 4. Run migrations
./scripts/migrate.sh

# 5. Access the app
open http://localhost:3000
```

### Option 3: CasaOS

1. **Import to CasaOS:**
   - Open CasaOS App Store
   - Click "Install a customized app"
   - Upload `docker-compose.supabase.yml`
   - Or use the git URL

2. **Configure:**
   - Set environment variables in CasaOS UI
   - Or mount `.env` file as volume

3. **Start:**
   - Click "Start" in CasaOS
   - Access via the CasaOS dashboard

---

## 📊 Services

| Service | Port | Description |
|---------|------|-------------|
| **Todoless App** | 3000 | React frontend |
| **Supabase Studio** | 3010 | Database management UI |
| **Supabase API** | 8000 | REST API + Auth |
| **PostgreSQL** | 5432 | Database (internal) |

**Full stack includes:**
- PostgreSQL 15 with Row Level Security
- Kong API Gateway
- GoTrue (Authentication)
- PostgREST (Auto-generated REST API)
- Realtime (WebSocket server)
- Storage (S3-compatible)
- ImgProxy (Image optimization)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICKSTART.md](QUICKSTART.md)** | ⚡ 5-minute setup guide |
| **[README_SUPABASE.md](README_SUPABASE.md)** | 📖 Complete Supabase documentation |
| **[README_DOCKER.md](README_DOCKER.md)** | 🐳 Docker deployment guide |
| **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** | 🔄 localStorage → Supabase migration |
| **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** | ✅ Production deployment checklist |
| **[COMMANDS.md](COMMANDS.md)** | 💻 All available commands |
| **[ACCESS.md](ACCESS.md)** | 🔑 URLs, credentials, API docs |
| **[STATUS.md](STATUS.md)** | 📊 Project status & features |

---

## 🎯 Common Tasks

```bash
# Start everything
make start

# View logs
make logs

# Open database console
make db

# Create backup
make backup

# Check status
make status

# Stop everything
make stop
```

See [COMMANDS.md](COMMANDS.md) for all available commands.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         React Frontend              │
│  - TypeScript                       │
│  - Tailwind CSS v4                  │
│  - Real-time subscriptions          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Supabase Self-Hosted           │
│  ┌─────────────────────────────┐   │
│  │ Kong API Gateway (8000)     │   │
│  └─────────────────────────────┘   │
│    ↓          ↓           ↓         │
│  ┌────┐   ┌────┐     ┌────┐        │
│  │Auth│   │REST│     │Real│        │
│  │    │   │ API│     │time│        │
│  └────┘   └────┘     └────┘        │
│         ↓                           │
│  ┌──────────────────┐               │
│  │  PostgreSQL 15   │               │
│  │  + Row Level     │               │
│  │    Security      │               │
│  └──────────────────┘               │
└─────────────────────────────────────┘
```

---

## 🔐 Security

- ✅ **Invite-only** registration
- ✅ **Role-based access** (admin/user/child)
- ✅ **Private labels** - Hidden from other users
- ✅ **Row Level Security** - Database-level permissions
- ✅ **JWT authentication** - Secure token-based auth
- ✅ **Secure defaults** - Random passwords, encrypted connections

For production:
- Add SSL/TLS (Let's Encrypt)
- Use reverse proxy (nginx)
- Enable rate limiting
- Setup firewall rules

See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) for production deployment.

---

## 🔄 Migration from localStorage

If you're upgrading from the localStorage version:

1. **Backup your data** (browser console):
```javascript
const backup = {
  tasks: JSON.parse(localStorage.getItem('todoless_tasks') || '[]'),
  items: JSON.parse(localStorage.getItem('todoless_items') || '[]'),
  // ... see MIGRATION_GUIDE.md for full script
};
console.log(JSON.stringify(backup, null, 2));
// Save output to backup.json
```

2. **Start Supabase:**
```bash
make setup
```

3. **Import data:**
```bash
make import BACKUP_FILE=backup.json
```

4. **Activate Supabase context:**
```bash
mv context/AppContext.tsx context/AppContext.localStorage.tsx
mv context/AppContext.supabase.tsx context/AppContext.tsx
```

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for complete instructions.

---

## 📦 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS v4
- Vite
- Supabase Client

**Backend:**
- Supabase (self-hosted)
- PostgreSQL 15
- Kong API Gateway
- GoTrue (Auth)
- PostgREST (API)
- Realtime (WebSocket)

**DevOps:**
- Docker & Docker Compose
- CasaOS compatible
- Automated setup scripts

---

## 🎨 Screenshots

### Main Interface
- Compact task cards with metadata icons
- Global search/input bar with parsing
- Sidebar navigation (Inbox, Tasks, Items, Notes, Calendar, Settings)

### Features
- Sprint icons on task cards
- Private labels (lock icon)
- Multi-user assignments (@user)
- Auto-archive with retention periods
- Real-time updates across tabs

---

## 📋 Requirements

**Minimum:**
- Docker & Docker Compose
- 2GB RAM
- 5GB disk space

**Recommended:**
- Docker & Docker Compose
- 4GB RAM
- 10GB disk space
- Linux/macOS (Windows with WSL2)

---

## 🚀 Deployment

### Development
```bash
make start
```

### Production
See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) for:
- SSL/TLS setup
- Reverse proxy configuration
- Automated backups
- Monitoring
- Security hardening

### CasaOS
1. Import `docker-compose.supabase.yml`
2. Configure environment variables
3. Start via CasaOS dashboard

---

## 🔧 Configuration

All configuration via `.env` file:

```bash
# Copy template
cp .env.example .env

# Edit values
nano .env
```

Key variables:
- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - Token signing secret
- `ANON_KEY` - Public API key
- `SERVICE_ROLE_KEY` - Admin API key
- `ARCHIVE_PERIOD` - Auto-archive retention (30/60/90/-1)

---

## 🆘 Troubleshooting

### App won't start
```bash
docker-compose -f docker-compose.supabase.yml logs
```

### Database errors
```bash
docker exec supabase-db psql -U postgres -d todoless
```

### Reset everything
```bash
make reset  # ⚠️ Deletes all data!
make setup  # Fresh start
```

See [README_SUPABASE.md](README_SUPABASE.md) for detailed troubleshooting.

---

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] File attachments
- [ ] Advanced analytics
- [ ] Export to CSV/PDF
- [ ] Integrations (Slack, Teams)
- [ ] Offline mode (Service Worker)
- [ ] 2FA authentication

---

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Credits

Built with:
- [Supabase](https://supabase.com) - Open-source Firebase alternative
- [PostgreSQL](https://www.postgresql.org) - Powerful database
- [React](https://react.dev) - UI framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Docker](https://www.docker.com) - Containerization

Inspired by:
- [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) - UI design
- [Linear](https://linear.app) - Task management flow

---

## 📞 Support

For issues and questions:
1. Check the documentation (see above)
2. Review [COMMANDS.md](COMMANDS.md) for common tasks
3. Check [README_SUPABASE.md](README_SUPABASE.md) troubleshooting section

---

**Made with ❤️ for efficient task management**

---

## Quick Links

- 📱 **App:** http://localhost:3000
- 🎨 **Studio:** http://localhost:3010
- 🔌 **API:** http://localhost:8000
- 📖 **Docs:** Start with [QUICKSTART.md](QUICKSTART.md)
