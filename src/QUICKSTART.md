# Todoless-ngx Quick Start Guide

## 🚀 Get Running in 3 Minutes

### Step 1: Download & Configure

```bash
# Clone the repository
git clone <your-repo-url>
cd todoless-ngx

# Copy environment file
cp .env.example .env
```

### Step 2: **IMPORTANT** - Edit Security Settings

Open `.env` and change these:

```env
# Change this password!
POSTGRES_PASSWORD=your-secure-database-password

# Change this secret (generate random 32+ chars)
JWT_SECRET=use-a-random-generator-for-this-min-32-chars

# Backend API URL (keep as-is for local, change for production)
VITE_API_URL=http://localhost:4000
```

💡 **Generate a secure JWT secret:**
```bash
# Linux/Mac
openssl rand -base64 32

# Or online
# https://www.uuidgenerator.net/
```

### Step 3: Start Services

```bash
# Start all containers
docker-compose up -d

# Check if everything is healthy
docker-compose ps

# Watch the logs (optional)
docker-compose logs -f
```

Wait until you see:
```
✅ PostgreSQL connected
✅ Database initialized
✅ Real-time listener active
🚀 Todoless-ngx backend running on port 4000
```

### Step 4: Create First Admin User

```bash
# Make script executable
chmod +x scripts/create-admin.sh

# Create admin account
./scripts/create-admin.sh admin@local admin123 "Admin"
```

You'll see:
```
✅ Admin user created successfully!
You can now login with:
  Email: admin@local
  Password: admin123
```

### Step 5: Login! 🎉

Open your browser:
```
http://localhost:3000
```

Login with:
- **Email**: admin@local
- **Password**: admin123

**⚠️ Change the password immediately after first login!**

---

## 🔐 Create Invite Codes for Team Members

```bash
# Make script executable
chmod +x scripts/create-invite.sh

# Create invite code (1 use, valid 30 days)
./scripts/create-invite.sh 1 30

# Create invite code (unlimited uses, valid 90 days)
./scripts/create-invite.sh 999 90
```

Share the generated link with your team:
```
http://localhost:3000?invite=ABC12345
```

---

## 🔧 Common Issues

### "Can't connect to database"

Wait 30-60 seconds for PostgreSQL to initialize:
```bash
docker-compose logs todoless-ngx-db
```

Look for: `database system is ready to accept connections`

### "Port already in use"

Change ports in `.env`:
```env
FRONTEND_PORT=3001
BACKEND_PORT=4001
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

### "Forgot admin password"

Create a new admin:
```bash
./scripts/create-admin.sh newadmin@local newpassword "New Admin"
```

Or reset via SQL:
```bash
docker exec -it todoless-ngx-db psql -U todoless -d todoless

-- View users
SELECT id, email, name, role FROM users;

-- Delete old admin (use ID from above)
DELETE FROM users WHERE id = 'old-user-id';

-- Exit
\q
```

---

## 📱 Next Steps

1. **Create labels** - Organize your tasks with colors
2. **Invite team members** - Use invite codes
3. **Setup sprints** - Plan your work in iterations
4. **Try private labels** - Hide personal tasks from others
5. **Configure auto-archive** - Settings → Archive retention

---

## 🛑 Stopping the App

```bash
# Stop all containers
docker-compose down

# Stop and remove all data (WARNING!)
docker-compose down -v
```

---

## 💾 Backup Your Data

```bash
# Backup database
docker exec todoless-ngx-db pg_dump -U todoless todoless | gzip > backup.sql.gz

# Restore database
gunzip -c backup.sql.gz | docker exec -i todoless-ngx-db psql -U todoless -d todoless
```

---

## 🔄 Updating Todoless-ngx

```bash
# Pull latest code
git pull

# Rebuild containers (keeps your data)
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

---

## 📚 Full Documentation

See [README.md](./README.md) for:
- Complete API documentation
- Real-time sync details
- Production deployment guide
- Security best practices
- Advanced configuration

---

**Need help?** Open an issue on GitHub!