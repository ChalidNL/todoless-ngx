# Todoless-ngx Helper Scripts

All scripts are in the root directory. Make them executable first:

```bash
chmod +x *.sh
```

## 🚀 Production Scripts

### `start.sh` - Start Application

Starts all services in production mode (Docker Compose).

```bash
./start.sh
```

**What it does**:
- ✅ Checks if `.env` exists (creates from template if not)
- ✅ Warns about default passwords
- ✅ Starts all Docker containers
- ✅ Waits for services to be healthy
- ✅ Displays health status
- ✅ Shows access URL and useful commands

**Output**:
```
🚀 Starting Todoless-ngx...
📦 Starting Docker containers...
⏳ Waiting for services to be healthy...
📊 Container Status:
🔍 Health Checks:
Database: ✅ Healthy
Backend:  ✅ Healthy
Frontend: ✅ Running

🎉 Todoless-ngx is starting!
📍 Access the app at: http://localhost:3000
```

---

### `health-check.sh` - System Health Check

Comprehensive health check of all services.

```bash
./health-check.sh
```

**What it checks**:
- ✅ Container status (running/healthy)
- ✅ Database connection and size
- ✅ Table row counts
- ✅ WebSocket server status
- ✅ Backend API health endpoint
- ✅ Frontend accessibility
- ✅ Docker volume existence
- ✅ Network connectivity

**Output**:
```
🏥 Todoless-ngx Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Container Status:
🔍 todoless-ngx-db:       ✅ Healthy
🔍 todoless-ngx-backend:  ✅ Healthy
🔍 todoless-ngx-frontend: ✅ Running

Service Health:
🗄️  Database Connection:  ✅ Connected (12 MB)
   Tables:
     users:               1 rows
     tasks:               5 rows
     items:               3 rows
     notes:               2 rows
     labels:              4 rows
     shops:               2 rows
     sprints:             1 rows
     invite_codes:        0 rows
     calendar_events:     0 rows
🔌 WebSocket:            ✅ Active (0 clients)
🌐 Backend API:          ✅ Responding
🌐 Frontend:             ✅ Responding

Infrastructure:
💾 Data Volume:          ✅ Exists
🌐 Network:              ✅ Active (3 containers)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary: 3/3 containers running
✅ All systems operational

📍 Access the app at: http://localhost:3000
```

---

### `generate-invite.sh` - Generate Invite Code

Creates a new invite code for user registration.

```bash
./generate-invite.sh
```

**What it does**:
- ✅ Checks if backend is running
- ✅ Connects to database
- ✅ Generates 6-digit random code
- ✅ Stores in database with 7-day expiry
- ✅ Displays code to share

**Output**:
```
🎫 Generating invite code...

Connecting to backend API...

✅ Invite code generated successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INVITE CODE: 847293
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This code:
  • Is valid for 7 days
  • Can be used once
  • Allows one new user to register

Share this code with the person you want to invite.
```

**Usage**:
1. Run script to get code
2. Share code with new user
3. User enters code during registration
4. Code becomes invalid after use

---

### `build.sh` - Build Docker Images

Builds both frontend and backend Docker images locally.

```bash
./build.sh
```

**What it does**:
- ✅ Builds backend image (`todoless-ngx-backend:latest`)
- ✅ Builds frontend image (`todoless-ngx-frontend:latest`)
- ✅ Tags images for local use

**Output**:
```
🏗️  Building Todoless-ngx Docker images...
📦 Building backend...
[+] Building 45.2s
🎨 Building frontend...
[+] Building 67.8s
✅ Build complete!

To start the application:
  docker-compose up -d

To view logs:
  docker-compose logs -f
```

**When to use**:
- After code changes
- Before deploying to production
- To test builds locally

---

## 🛠️ Development Scripts

### `dev.sh` - Development Environment Setup

Starts only the database for local development.

```bash
./dev.sh
```

**What it does**:
- ✅ Creates `.env` if missing
- ✅ Starts PostgreSQL container only
- ✅ Exposes database on `localhost:5432`
- ✅ Shows next steps for manual backend/frontend start

**Output**:
```
🛠️  Starting Todoless-ngx in development mode...

📦 Starting PostgreSQL database...
⏳ Waiting for database to be ready...
✅ Database is ready

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Development Environment Ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Database: postgresql://todoless:todoless@localhost:5432/todoless

Next steps:

1. Start backend (in new terminal):
   cd backend
   npm install
   npm run dev

2. Start frontend (in new terminal):
   npm install
   npm run dev

3. Access app:
   http://localhost:3000
```

**Development workflow**:
```bash
# Terminal 1: Database
./dev.sh

# Terminal 2: Backend
cd backend
npm install
npm run dev

# Terminal 3: Frontend
npm install
npm run dev
```

---

## 📋 Common Command Combinations

### First-Time Setup

```bash
# 1. Make scripts executable
chmod +x *.sh

# 2. Create environment file
cp .env.example .env

# 3. Edit passwords
nano .env

# 4. Start application
./start.sh

# 5. Generate invite code
./generate-invite.sh

# 6. Check health
./health-check.sh
```

### Daily Development

```bash
# Start dev database
./dev.sh

# In separate terminals
cd backend && npm run dev
npm run dev

# Check everything is working
./health-check.sh
```

### Troubleshooting

```bash
# Check system health
./health-check.sh

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild images
./build.sh
docker-compose up -d
```

### Production Updates

```bash
# Pull latest code
git pull

# Rebuild images
./build.sh

# Restart with new images
docker-compose down
docker-compose up -d

# Verify everything works
./health-check.sh
```

---

## 🔧 Manual Commands

If scripts don't work, use these manual commands:

### Start Application Manually

```bash
# Create .env
cp .env.example .env

# Edit .env
nano .env

# Start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Generate Invite Manually

```bash
# Connect to database
docker exec -it todoless-ngx-db psql -U todoless -d todoless

# In psql:
INSERT INTO invite_codes (code, created_at, expires_at) 
VALUES (
  LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
  NOW(),
  NOW() + INTERVAL '7 days'
) 
RETURNING code;
```

### Health Check Manually

```bash
# Check containers
docker ps

# Check backend
curl http://localhost:4000/api/health

# Check frontend
curl http://localhost:3000

# Check database
docker exec todoless-ngx-db psql -U todoless -d todoless -c "SELECT 1"
```

---

## 🐛 Troubleshooting Scripts

### Script won't run (Permission denied)

```bash
# Make executable
chmod +x script-name.sh

# Or run with bash
bash script-name.sh
```

### Script fails with "command not found"

Check if required tools are installed:

```bash
# Docker
docker --version

# Docker Compose
docker-compose --version

# curl (for health checks)
curl --version

# wget (for health checks)
wget --version
```

### Database connection fails

```bash
# Check if database container is running
docker ps | grep todoless-ngx-db

# Check database logs
docker-compose logs todoless-ngx-db

# Try connecting manually
docker exec -it todoless-ngx-db psql -U todoless -d todoless
```

---

## 📝 Script Locations

All scripts are in the repository root:

```
/
├── start.sh              ← Production startup
├── dev.sh                ← Development setup
├── build.sh              ← Build Docker images
├── generate-invite.sh    ← Create invite codes
├── health-check.sh       ← System health check
├── .env.example          ← Environment template
├── docker-compose.yml    ← Production compose
└── docker-compose.dev.yml ← Development compose
```

---

## 🔐 Environment Variables

Scripts use these from `.env`:

```bash
# Database
POSTGRES_DB=todoless
POSTGRES_USER=todoless
POSTGRES_PASSWORD=your-secure-password

# Backend
JWT_SECRET=your-jwt-secret-min-32-chars
BACKEND_PORT=4000

# Frontend
FRONTEND_PORT=3000
```

---

## 📚 Additional Documentation

- [ERRORS-FIXED.md](./ERRORS-FIXED.md) - Error resolution details
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [DOCKER-FIXES.md](./DOCKER-FIXES.md) - Docker configuration
- [README-DOCKER.md](./README-DOCKER.md) - Quick start guide

---

## ✅ Quick Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `start.sh` | Start production | First deployment, restarts |
| `dev.sh` | Start dev database | Local development |
| `build.sh` | Build images | After code changes |
| `generate-invite.sh` | Create invite code | Add new users |
| `health-check.sh` | System health | Troubleshooting |

**Most used**: `start.sh` for production, `dev.sh` for development.
