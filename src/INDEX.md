# 📚 Todoless-ngx Documentation Index

Quick reference to all documentation and scripts.

## 🚀 Getting Started

| File | Purpose | When to Use |
|------|---------|-------------|
| **[README.md](./README.md)** | Main readme | First file to read |
| **[START.md](./START.md)** | Complete getting started guide | Step-by-step setup |
| **[QUICK-FIX.md](./QUICK-FIX.md)** | Quick error fixes | When you have errors |
| **[SOLUTION-SUMMARY.md](./SOLUTION-SUMMARY.md)** | Summary of all fixes | Understanding what was fixed |

## 🔧 Troubleshooting

| File | Purpose | When to Use |
|------|---------|-------------|
| **[QUICK-FIX.md](./QUICK-FIX.md)** | Manual error fixes | Step-by-step error resolution |
| **[ERRORS-FIXED.md](./ERRORS-FIXED.md)** | Technical error details | Understanding what went wrong |
| **[VERIFY.md](./VERIFY.md)** | Verification checklist | Check if everything is correct |

## 📖 Detailed Guides

| File | Purpose | When to Use |
|------|---------|-------------|
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Full deployment guide | Production deployment |
| **[DOCKER-FIXES.md](./DOCKER-FIXES.md)** | Docker configuration details | Understanding Docker setup |
| **[README-DOCKER.md](./README-DOCKER.md)** | Docker quick start | Quick Docker reference |
| **[SCRIPTS.md](./SCRIPTS.md)** | Script usage guide | Learn what each script does |

## 🛠️ Scripts Reference

### Main Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| **setup.sh** | Automatic setup | `./setup.sh` |
| **fix-errors.sh** | Fix common errors | `./fix-errors.sh` |
| **verify.sh** | Verify configuration | `./verify.sh` |
| **diagnose.sh** | Identify problems | `./diagnose.sh` |

### Operation Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| **start.sh** | Start production | `./start.sh` |
| **dev.sh** | Start development | `./dev.sh` |
| **build.sh** | Build Docker images | `./build.sh` |
| **generate-invite.sh** | Generate invite codes | `./generate-invite.sh` |
| **health-check.sh** | Check system health | `./health-check.sh` |

## 🏗️ Configuration Files

### Docker

| File | Purpose |
|------|---------|
| **Dockerfile** | Frontend build (Nginx + React) |
| **backend/Dockerfile** | Backend build (Node.js + Express) |
| **docker-compose.yml** | Production deployment |
| **docker-compose.dev.yml** | Development database |
| **.dockerignore** | Frontend build exclusions |
| **backend/.dockerignore** | Backend build exclusions |

### Environment

| File | Purpose |
|------|---------|
| **.env.example** | Environment template |
| **.env.development** | Dev mode (VITE_API_URL=http://localhost:4000) |
| **.env.production** | Production (VITE_API_URL=) |
| **.env** | Your configuration (create from .env.example) |

### Application

| File | Purpose |
|------|---------|
| **nginx.conf** | Nginx reverse proxy configuration |
| **vite.config.ts** | Vite dev server configuration |
| **package.json** | Frontend dependencies |
| **backend/package.json** | Backend dependencies |

## 📊 Quick Reference

### First Time Setup

1. **Read:** [START.md](./START.md)
2. **Run:** `./setup.sh`
3. **Generate:** `./generate-invite.sh`
4. **Access:** http://localhost:3000

### Having Errors?

1. **Run:** `./fix-errors.sh`
2. **Or read:** [QUICK-FIX.md](./QUICK-FIX.md)
3. **Diagnose:** `./diagnose.sh`
4. **Verify:** `./verify.sh`

### Production Deployment

1. **Read:** [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Configure:** Copy and edit `.env`
3. **Start:** `./start.sh`
4. **Check:** `./health-check.sh`

### Development

1. **Read:** [START.md](./START.md) - Development section
2. **Setup:** `./dev.sh`
3. **Start backend:** `cd backend && npm run dev`
4. **Start frontend:** `npm run dev`

## 🎯 By Use Case

### "I just want to run it"
→ Run `./setup.sh` → Choose option 1 → Wait 30s → http://localhost:3000

### "I have errors"
→ Run `./fix-errors.sh` → Follow prompts

### "I want to develop"
→ Run `./dev.sh` → Start backend & frontend manually

### "I need to deploy to production"
→ Read [DEPLOYMENT.md](./DEPLOYMENT.md) → Configure `.env` → Run `./start.sh`

### "I want to understand what was fixed"
→ Read [SOLUTION-SUMMARY.md](./SOLUTION-SUMMARY.md) and [ERRORS-FIXED.md](./ERRORS-FIXED.md)

### "Something's not working"
→ Run `./diagnose.sh` → Check output → Read [QUICK-FIX.md](./QUICK-FIX.md)

### "I want to verify everything"
→ Run `./verify.sh` → Check all green ✅

### "I want to check system health"
→ Run `./health-check.sh` → Review detailed status

## 📁 File Locations

### Documentation (Root)
```
/README.md
/START.md
/QUICK-FIX.md
/DEPLOYMENT.md
/DOCKER-FIXES.md
/README-DOCKER.md
/ERRORS-FIXED.md
/SOLUTION-SUMMARY.md
/SCRIPTS.md
/VERIFY.md
/INDEX.md (this file)
```

### Scripts (Root)
```
/setup.sh
/fix-errors.sh
/verify.sh
/diagnose.sh
/start.sh
/dev.sh
/build.sh
/generate-invite.sh
/health-check.sh
```

### Configuration (Root)
```
/.env.example
/.env.development
/.env.production
/.dockerignore
/nginx.conf
/vite.config.ts
/docker-compose.yml
/docker-compose.dev.yml
```

### Docker (Root & Backend)
```
/Dockerfile
/backend/Dockerfile
/backend/.dockerignore
```

## 🔍 Search Guide

**Want to...**

- **Fix "<!DOCTYPE" error** → [QUICK-FIX.md](./QUICK-FIX.md#error-syntaxerror-unexpected-token-doctype-)
- **Fix WebSocket error** → [QUICK-FIX.md](./QUICK-FIX.md#error-websocket-error--istrusted-true-)
- **Start production** → [DEPLOYMENT.md](./DEPLOYMENT.md#quick-start-with-docker-compose)
- **Start development** → [START.md](./START.md#option-2-development-mode)
- **Generate invite code** → [SCRIPTS.md](./SCRIPTS.md#generate-invitesh---generate-invite-code)
- **Check health** → [SCRIPTS.md](./SCRIPTS.md#health-checksh---system-health-check)
- **Understand Docker** → [DOCKER-FIXES.md](./DOCKER-FIXES.md)
- **Verify setup** → [VERIFY.md](./VERIFY.md)
- **Learn scripts** → [SCRIPTS.md](./SCRIPTS.md)
- **Deploy to CasaOS** → [DEPLOYMENT.md](./DEPLOYMENT.md#casaos-deployment)
- **Backup database** → [DEPLOYMENT.md](./DEPLOYMENT.md#database-backups)

## ❓ FAQ

**Q: Which file should I read first?**
A: [START.md](./START.md) for complete guide, or just run `./setup.sh`

**Q: I have errors, what do I do?**
A: Run `./fix-errors.sh` or read [QUICK-FIX.md](./QUICK-FIX.md)

**Q: How do I verify everything is correct?**
A: Run `./verify.sh`

**Q: Where are the Dockerfiles?**
A: `/Dockerfile` (frontend) and `/backend/Dockerfile` (backend)

**Q: What's the difference between .env files?**
A: 
- `.env.example` - Template
- `.env.development` - For `npm run dev` (API URL = localhost:4000)
- `.env.production` - For Docker (API URL = empty/nginx proxy)
- `.env` - Your actual config (create from .env.example)

**Q: How do I run in development mode?**
A: Run `./dev.sh` then start backend and frontend manually

**Q: How do I deploy to production?**
A: Read [DEPLOYMENT.md](./DEPLOYMENT.md) and run `./start.sh`

**Q: How do I create new users?**
A: Run `./generate-invite.sh` to get an invite code

**Q: How do I check if everything is working?**
A: Run `./health-check.sh`

**Q: Where are the logs?**
A: `docker-compose logs -f` for Docker, or terminal where you ran `npm run dev`

**Q: How do I update the app?**
A: `git pull` → `./build.sh` → `docker-compose up -d`

## 🆘 Getting Help

1. **Run diagnostic:** `./diagnose.sh`
2. **Check documentation:** Use this index to find relevant docs
3. **Verify setup:** `./verify.sh`
4. **Check health:** `./health-check.sh`
5. **Read fixes:** [QUICK-FIX.md](./QUICK-FIX.md)
6. **Open issue:** GitHub with diagnostic output

## 📝 Document Hierarchy

```
README.md (Quick overview)
  ├─→ START.md (Getting started guide)
  │    ├─→ QUICK-FIX.md (Error fixes)
  │    └─→ DEPLOYMENT.md (Full deployment)
  │
  ├─→ SOLUTION-SUMMARY.md (What was fixed)
  │    ├─→ ERRORS-FIXED.md (Technical details)
  │    └─→ DOCKER-FIXES.md (Docker config)
  │
  ├─→ SCRIPTS.md (Script usage)
  ├─→ VERIFY.md (Verification)
  └─→ INDEX.md (This file)
```

---

**Quick Start:** `./setup.sh` → Wait 30s → http://localhost:3000 🚀
