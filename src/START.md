# 🚀 Start Here - Todoless-ngx

**Having errors?** You're in the right place! This guide will get you running in 2 minutes.

## 🔥 Quick Start (Recommended)

Run the automatic setup script:

```bash
chmod +x setup.sh
./setup.sh
```

The script will:
1. ✅ Fix Dockerfile locations
2. ✅ Create environment files
3. ✅ Setup .dockerignore
4. ✅ Let you choose: Docker Compose or Development mode
5. ✅ Start everything automatically

**That's it!** Access the app at: http://localhost:3000

---

## 🚨 Have Errors? Run This First

If you're seeing these errors:
- ❌ "SyntaxError: Unexpected token '<', "<!DOCTYPE "..."
- ❌ "WebSocket error: { isTrusted: true }"

**Run the fix script:**

```bash
chmod +x fix-errors.sh
./fix-errors.sh
```

It will automatically detect and fix the problem.

---

## 📋 Manual Setup

### Option 1: Docker Compose (Production)

```bash
# 1. Setup environment
cp .env.example .env
nano .env  # Change POSTGRES_PASSWORD and JWT_SECRET

# 2. Start everything
./start.sh

# 3. Generate invite code
./generate-invite.sh

# 4. Open browser
# http://localhost:3000
```

### Option 2: Development Mode

```bash
# 1. Start database
./dev.sh

# 2. Start backend (new terminal)
cd backend
npm install
npm run dev

# 3. Start frontend (new terminal)
npm install
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

## 🔍 Troubleshooting

### Check what's wrong:

```bash
./diagnose.sh
```

This shows:
- What's running (Docker or local)
- Which ports are active
- If services are responding
- Specific fixes for your situation

### Check system health:

```bash
./health-check.sh
```

Shows detailed status of all services.

### View logs:

**Docker:**
```bash
docker-compose logs -f
```

**Development:**
Check the terminal where backend/frontend are running.

---

## 📁 Important Files

```
/
├── setup.sh              ← 🌟 Run this first!
├── fix-errors.sh         ← Fix common errors
├── diagnose.sh           ← Identify problems
├── start.sh              ← Start production
├── dev.sh                ← Start development
├── health-check.sh       ← Check system health
├── generate-invite.sh    ← Create invite codes
│
├── .env.example          ← Environment template
├── .env                  ← Your environment (create from example)
├── .env.development      ← Dev mode API URL
├── .env.production       ← Prod mode API URL
│
├── Dockerfile            ← Frontend build
├── backend/Dockerfile    ← Backend build
├── docker-compose.yml    ← Production deployment
└── docker-compose.dev.yml ← Development database
```

---

## 🎯 What Each Script Does

| Script | Purpose |
|--------|---------|
| `setup.sh` | **Automatic setup** - Fixes everything and starts app |
| `fix-errors.sh` | **Error fixer** - Fixes common API/WebSocket errors |
| `diagnose.sh` | **Diagnostic** - Shows what's wrong |
| `start.sh` | **Production** - Starts Docker Compose |
| `dev.sh` | **Development** - Starts database for local dev |
| `health-check.sh` | **Health check** - Detailed service status |
| `generate-invite.sh` | **Invite codes** - Create codes for new users |

---

## ✅ Expected Behavior

### When everything works:

**You should see:**
- ✅ Backend responding at http://localhost:4000/api/health
- ✅ Frontend loading at http://localhost:3000
- ✅ No errors in browser console (F12)
- ✅ WebSocket connected (check Network tab)

**Docker Compose:**
```bash
$ docker-compose ps
NAME                    STATUS
todoless-ngx-db         Up (healthy)
todoless-ngx-backend    Up (healthy)  
todoless-ngx-frontend   Up
```

**Development:**
```bash
Terminal 1: ✅ Database is ready
Terminal 2: 🚀 Backend running on port 4000
Terminal 3: ➜  Local: http://localhost:3000/
```

---

## 🆘 Still Not Working?

1. **Run diagnostic:**
   ```bash
   ./diagnose.sh
   ```

2. **Check these files exist:**
   ```bash
   ls -la Dockerfile backend/Dockerfile
   # Should show FILES, not directories
   ```

3. **If Dockerfiles are directories:**
   ```bash
   # Wrong locations detected - run setup to fix
   ./setup.sh
   ```

4. **Emergency reset:**
   ```bash
   docker-compose down -v
   rm -rf node_modules backend/node_modules
   ./setup.sh
   ```

---

## 📚 Full Documentation

- **[QUICK-FIX.md](./QUICK-FIX.md)** - Error fixes explained
- **[ERRORS-FIXED.md](./ERRORS-FIXED.md)** - All fixes documented
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[DOCKER-FIXES.md](./DOCKER-FIXES.md)** - Docker configuration details
- **[SCRIPTS.md](./SCRIPTS.md)** - Script usage guide

---

## 🎓 Understanding the Errors

### "SyntaxError: Unexpected token '<', "<!DOCTYPE "..."

**What it means:**
- Frontend is trying to fetch JSON from API
- Getting HTML (404 page) instead
- Backend is not running or not reachable

**Why it happens:**
- Docker: Backend container not healthy
- Local: Backend not started on port 4000
- Wrong VITE_API_URL in environment

**Fix:**
```bash
./fix-errors.sh
```

### "WebSocket error: { isTrusted: true }"

**What it means:**
- Real-time updates can't connect
- WebSocket endpoint not reachable

**Why it happens:**
- Docker: Nginx not proxying /ws correctly
- Local: Vite not proxying WebSocket
- Backend WebSocket server not running

**Fix:**
```bash
./fix-errors.sh
```

---

## 🔐 First-Time User Setup

After starting the app:

1. **Generate invite code:**
   ```bash
   ./generate-invite.sh
   ```
   You'll get a 6-digit code like: `847293`

2. **Register:**
   - Open http://localhost:3000
   - Click "Register"
   - Enter your email, password, name
   - Enter the invite code
   - Submit

3. **Start using the app!**
   - Create tasks, items, notes
   - Use labels to organize
   - Set up sprints
   - Add calendar events

---

## 🚀 Quick Commands Reference

```bash
# First time setup
./setup.sh

# Fix errors
./fix-errors.sh

# Start production
./start.sh

# Start development
./dev.sh

# Check health
./health-check.sh

# Diagnose problems
./diagnose.sh

# Generate invite
./generate-invite.sh

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Emergency reset (deletes data!)
docker-compose down -v
```

---

## ⚡ TL;DR

**Just want it to work?**

```bash
chmod +x setup.sh
./setup.sh
# Choose option 1 (Docker Compose)
# Wait 30 seconds
# Open http://localhost:3000
```

**That's it!**

---

## 🌟 Features

- ✅ Multi-user task management
- ✅ Real-time sync via WebSocket
- ✅ Private labels (hide tasks from others)
- ✅ Auto-archive completed tasks
- ✅ Sprint management
- ✅ Calendar integration
- ✅ Items/shopping lists
- ✅ Notes with linking
- ✅ Invite-only registration
- ✅ PostgreSQL database
- ✅ Docker deployment
- ✅ CasaOS ready

---

**Need help?** Run `./diagnose.sh` and check the output!
