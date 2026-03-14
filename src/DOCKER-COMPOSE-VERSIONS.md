# Docker Compose Versions - Kies Wat Je Nodig Hebt

Er zijn nu **3 versies** van docker-compose.yml beschikbaar!

---

## 📋 Overzicht

| File | Lines | Use Case | Complexity |
|------|-------|----------|------------|
| `docker-compose.simple.yml` | 40 | Ultra minimal | ⭐ |
| `docker-compose.yml` | 70 | Plain & clean | ⭐⭐ |
| `docker-compose.old.yml` | 208 | Full-featured (CasaOS) | ⭐⭐⭐⭐⭐ |

---

## 1️⃣ Ultra Simple Version

**File:** `docker-compose.simple.yml`

### When to Use
- 🎯 Just want it to work
- 🎯 Learning Docker Compose
- 🎯 Testing locally
- 🎯 Don't care about advanced features

### What's Included
- ✅ Database (PostgreSQL)
- ✅ Backend (Node.js)
- ✅ Frontend (Nginx + React)
- ✅ Data persistence

### What's NOT Included
- ❌ Health checks
- ❌ Restart policies
- ❌ Resource limits
- ❌ Custom networks
- ❌ Labels/metadata

### Usage

```bash
docker-compose -f docker-compose.simple.yml up -d
```

### Full File
```yaml
version: "3.8"

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: todoless
      POSTGRES_USER: todoless
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/01-init.sql:ro

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      NODE_ENV: production
      PORT: 4000
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: todoless
      DB_USER: todoless
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - db

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  db-data:
```

**40 lines - That's it!** 🎉

---

## 2️⃣ Plain Version (Current Default)

**File:** `docker-compose.yml`

### When to Use
- 🎯 Production deployment (small/medium)
- 🎯 Need reliability
- 🎯 Want clean, readable config
- 🎯 No special integrations

### What's Included
- ✅ Everything from Simple version
- ✅ Health checks (wait for services to be ready)
- ✅ Restart policies (auto-restart on crash)
- ✅ Named networks (better isolation)
- ✅ Container names (easier management)
- ✅ Proper dependencies

### What's NOT Included
- ❌ CasaOS labels
- ❌ Traefik labels
- ❌ Resource limits
- ❌ Custom subnets
- ❌ Excessive metadata

### Usage

```bash
docker-compose up -d
```

Or use the helper scripts:
```bash
./start.sh   # Start
./stop.sh    # Stop
./logs.sh    # Logs
```

### Key Features

```yaml
# Health checks ensure services are ready
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U todoless"]
  interval: 10s
  timeout: 5s
  retries: 5

# Restart policies keep services running
restart: unless-stopped

# Dependencies ensure proper startup order
depends_on:
  db:
    condition: service_healthy
```

**70 lines - Clean & reliable!** ✨

---

## 3️⃣ Full-Featured Version (Old)

**File:** `docker-compose.old.yml` (renamed from original)

### When to Use
- 🎯 CasaOS deployment
- 🎯 Behind Traefik reverse proxy
- 🎯 Need resource limits
- 🎯 Complex infrastructure

### What's Included
- ✅ Everything from Plain version
- ✅ CasaOS UI labels (icon, description, etc.)
- ✅ Traefik labels (reverse proxy)
- ✅ Resource limits (memory/CPU)
- ✅ Custom subnet configuration
- ✅ Extensive metadata
- ✅ Advanced health checks

### Usage

```bash
docker-compose -f docker-compose.old.yml up -d
```

### Extra Features

```yaml
# CasaOS metadata
labels:
  casaos.name: "To Do Less"
  casaos.icon: "https://..."
  casaos.description: "..."
  casaos.category: "Productivity"

# Resource limits
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M

# Custom network with subnet
networks:
  todoless-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.25.0.0/16
```

**208 lines - All the features!** 🚀

---

## 🤔 Which Should I Use?

### Choose **Simple** if:
- 👍 First time using Docker Compose
- 👍 Just testing locally
- 👍 Want minimal complexity
- 👍 Following a tutorial

### Choose **Plain** (default) if:
- 👍 Deploying to production
- 👍 Need reliability
- 👍 Want best practices
- 👍 Standard VPS/server deployment
- 👍 **Most common choice!** ⭐

### Choose **Full-Featured** if:
- 👍 Using CasaOS
- 👍 Using Traefik
- 👍 Need resource limits
- 👍 Complex multi-service setup
- 👍 Corporate environment

---

## 🔄 Converting Between Versions

### From Simple → Plain

Add:
```yaml
# Health checks
healthcheck:
  test: [...]
  interval: 10s

# Restart policy
restart: unless-stopped

# Named network
networks:
  - todoless

# Bottom of file
networks:
  todoless:
    driver: bridge
```

### From Plain → Simple

Remove:
- Health check blocks
- Restart policies
- Networks section
- Container names

### From Plain → Full-Featured

Add:
```yaml
# Labels
labels:
  casaos.name: "..."
  traefik.enable: "true"

# Resource limits
deploy:
  resources:
    limits:
      memory: 512M
```

---

## 📊 Comparison Table

| Feature | Simple | Plain | Full |
|---------|--------|-------|------|
| **Services** | ✅ | ✅ | ✅ |
| **Volumes** | ✅ | ✅ | ✅ |
| **Networks** | Default | Named | Custom Subnet |
| **Health Checks** | ❌ | ✅ | ✅ |
| **Restart Policy** | ❌ | ✅ | ✅ |
| **Container Names** | ❌ | ✅ | ✅ |
| **Resource Limits** | ❌ | ❌ | ✅ |
| **CasaOS Labels** | ❌ | ❌ | ✅ |
| **Traefik Labels** | ❌ | ❌ | ✅ |
| **Lines of Code** | 40 | 70 | 208 |
| **Complexity** | Low | Medium | High |

---

## 🎯 Quick Start by Version

### Simple Version

```bash
# 1. Create .env
cp .env.example .env
nano .env  # Set passwords

# 2. Start
docker-compose -f docker-compose.simple.yml up -d

# 3. Done!
```

### Plain Version (Default)

```bash
# Use helper script
./start.sh

# Or manually
cp .env.example .env
nano .env
docker-compose up -d
```

### Full-Featured Version

```bash
# Use deployment script
./START-DEPLOYMENT.sh

# Or manually
cp .env.example .env
nano .env
docker-compose -f docker-compose.old.yml up -d
```

---

## 💡 Tips

### Switching Versions

```bash
# Backup current version
cp docker-compose.yml docker-compose.backup.yml

# Copy the version you want
cp docker-compose.simple.yml docker-compose.yml

# Or symlink
ln -sf docker-compose.plain.yml docker-compose.yml
```

### Testing All Versions

```bash
# Test simple
docker-compose -f docker-compose.simple.yml config

# Test plain
docker-compose config

# Test full
docker-compose -f docker-compose.old.yml config
```

### Environment Variables

All versions use the same `.env`:

```env
DB_PASSWORD=secure_password
JWT_SECRET=secure_jwt_secret
FRONTEND_PORT=80
```

---

## 🆘 Troubleshooting

### "Service X has no health check"

You're using **Simple** version. Either:
1. Switch to **Plain** version
2. Manually wait 30s after starting

### "Unknown label casaos.name"

You're using **Full** version without CasaOS. Either:
1. Switch to **Plain** version
2. Ignore the warnings (labels don't hurt)

### "Resource limits not enforced"

You're using **Plain** or **Simple** version. Switch to **Full** version:

```bash
docker-compose -f docker-compose.old.yml up -d
```

---

## 📚 Documentation

- **Simple:** Quick, minimal docs
- **Plain:** This is in `README-PLAIN.md`
- **Full:** See `README-casaos.md`

---

## 🎉 Recommendation

**For most users: Use the Plain version (current default)!**

```bash
./start.sh
```

It's the sweet spot between simplicity and reliability! ⭐

---

**Questions? Check README-PLAIN.md or README-casaos.md** 📖
