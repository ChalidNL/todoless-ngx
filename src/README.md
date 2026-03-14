# Todoless-ngx

Multi-user task management app with PostgreSQL backend, real-time sync, private labels, and auto-archive functionality.

## ✨ Features

- 🔐 Multi-user support with invite-only registration
- 🏷️ Private labels - make labels visible only to specific users
- 📦 Auto-archive system with configurable retention (30/60/90 days or unlimited)
- 🔄 Real-time sync via WebSocket for all connected users
- 📊 Compact task management - Inbox, Tasks, Items, Notes, Calendar
- 🏃 Sprint tracking integrated via individual card icons
- 🌍 Multi-language support (EN, FR, NL, DE)
- 🔍 Smart search/input with @user, #label, //date parsing

## 🚀 Quick Start

### Deploy with Docker Compose

```bash
# Clone the repository
git clone https://github.com/ChalidNL/todoless-ngx.git
cd todoless-ngx

# Start all containers
docker-compose up -d --build

# Check if everything is running
docker-compose ps
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4001/api/health

Done! 🎉

## 🔐 First Time Setup

1. Open http://localhost:3000
2. You'll need an invite code to register
3. Generate an invite code:

```bash
# Enter the backend container
docker exec -it todoless-ngx-backend sh

# Generate an invite code
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

4. Insert it manually into the database:

```bash
# Enter the database container
docker exec -it todoless-ngx-db psql -U todoless -d todoless

# Insert invite code (replace YOUR_CODE_HERE)
INSERT INTO invites (code, created_by) VALUES ('YOUR_CODE_HERE', NULL);

# Exit
\q
```

5. Use the invite code to register your first user

## ⚙️ Configuration

**Default settings** - change these in production!

Edit `docker-compose.yml` before deploying:

```yaml
environment:
  DB_PASSWORD: todoless_secure_password_change_me  # ⚠️ CHANGE THIS!
  JWT_SECRET: change-this-secret-key-in-production-use-at-least-32-random-characters  # ⚠️ CHANGE THIS!
```

**Ports**

- Frontend: `3000:80` (change left number)
- Backend: `4001:4000` (change left number)

Example: `8080:80` makes frontend available on port 8080

## 🏷️ CasaOS / Portainer Deployment

1. Import `docker-compose.yml`
2. Change `DB_PASSWORD` and `JWT_SECRET` in environment variables
3. Deploy the stack
4. Access at `http://your-server:3000`

CasaOS metadata is included for one-click deployment.

## 🎯 Management Commands

```bash
# View logs
docker-compose logs -f

# Stop all containers
docker-compose down

# Stop and remove all data
docker-compose down -v

# Restart all containers
docker-compose restart

# Update to latest version
git pull
docker-compose up -d --build
```

## 🗄️ Database Backup

```bash
# Backup
docker exec todoless-ngx-db pg_dump -U todoless -d todoless > backup.sql

# Restore
cat backup.sql | docker exec -i todoless-ngx-db psql -U todoless -d todoless
```

## 🔧 Troubleshooting

**Backend won't start?**
```bash
docker-compose logs backend
```

**Database connection issues?**
```bash
# Check if database is ready
docker exec todoless-ngx-db pg_isready -U todoless
```

**Reset everything?**
```bash
docker-compose down -v
docker-compose up -d --build
```

**Check backend health**
```bash
curl http://localhost:4001/api/health
```

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS + Nginx
- **Backend**: Node.js + Express + WebSocket
- **Database**: PostgreSQL 16 with LISTEN/NOTIFY
- **Deployment**: 3 Docker containers

## 📝 License

See LICENSE file for details.