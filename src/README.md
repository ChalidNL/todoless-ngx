# Todoless-ngx

Multi-user task management with PostgreSQL, real-time sync, and Docker deployment.

---

## ⚡ PLAIN DOCKER COMPOSE (RECOMMENDED!)

✅ **Clean 70-line docker-compose.yml**  
✅ **No CasaOS labels or complexity**  
✅ **Just works!**

```bash
./start.sh  # Start everything
./stop.sh   # Stop
./logs.sh   # View logs
```

👉 **[READ: README-PLAIN.md](./README-PLAIN.md)** - Complete plain guide  
👉 **[READ: ✅-PLAIN-DOCKER-COMPOSE-READY.md](./✅-PLAIN-DOCKER-COMPOSE-READY.md)** - What changed

---

## 🚨 HAVING ERRORS? **FIX NOW!**

### Seeing these errors?
```
❌ WebSocket error: { "isTrusted": true }
❌ Error loading data: SyntaxError: Unexpected token '<', "<!DOCTYPE "...
```

### ⚡ **ONE-LINE FIX:**

```bash
chmod +x RUN-THIS-NOW.sh && ./RUN-THIS-NOW.sh
```

**Wait 60 seconds → Open http://localhost/ → DONE!** 🎉

**Full fix guide:** [❌-ERRORS-FIX-THIS.md](./❌-ERRORS-FIX-THIS.md)

---

## 🚀 Quick Start (No Errors)

```bash
chmod +x setup.sh
./setup.sh
```

Choose option 1 (Docker Compose), wait 30 seconds, then open http://localhost:3000

## 📖 Documentation

- **[START.md](./START.md)** - 👈 **Start here!** Complete getting started guide
- **[QUICK-FIX.md](./QUICK-FIX.md)** - Quick error fixes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Full deployment guide
- **[SCRIPTS.md](./SCRIPTS.md)** - Script usage
- **[ERRORS-FIXED.md](./ERRORS-FIXED.md)** - Technical fixes

## 🛠️ Scripts

| Script | Purpose |
|--------|---------|
| `setup.sh` | Automatic setup (recommended) |
| `fix-errors.sh` | Fix common errors |
| `diagnose.sh` | Identify problems |
| `start.sh` | Start production |
| `dev.sh` | Start development |
| `health-check.sh` | Check system health |
| `generate-invite.sh` | Create invite codes |

## 🐳 Docker Compose

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Health
docker-compose ps
```

## 💻 Development

```bash
# Start database
./dev.sh

# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev
```

## ✨ Features

- ✅ Multi-user with invite-only registration
- ✅ Real-time sync via WebSocket
- ✅ Private labels
- ✅ Auto-archive completed tasks
- ✅ Sprint management
- ✅ Calendar integration
- ✅ PostgreSQL database
- ✅ Docker deployment

## 🔧 Troubleshooting

```bash
# Identify problem
./diagnose.sh

# Check health
./health-check.sh

# View logs
docker-compose logs -f
```

## 📦 Architecture

```
Browser → Nginx (Frontend) → Node.js (Backend) → PostgreSQL
          ├─ /api → REST API
          └─ /ws  → WebSocket
```

## 🔐 First User

```bash
# Generate invite code
./generate-invite.sh

# Register at http://localhost:3000
# Use the generated code
```

## 🆘 Support

1. Read [START.md](./START.md) - Complete guide
2. Run `./diagnose.sh` - Identify issue
3. Run `./fix-errors.sh` - Auto-fix
4. Check [QUICK-FIX.md](./QUICK-FIX.md) - Manual fixes
5. Open GitHub issue with diagnostic output

## 📄 License

See LICENSE file

## 🤝 Contributing

Contributions welcome! Open an issue or PR.

---

**Quick start:** `./setup.sh` → Wait 30s → http://localhost:3000