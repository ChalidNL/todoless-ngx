# Helper Scripts

Collection of useful scripts for managing Todoless-ngx.

## 📋 Available Scripts

### `init-setup.sh`
**Initial setup wizard** - Run this on first installation

```bash
./scripts/init-setup.sh
```

Features:
- Creates `.env` file from template
- Generates secure random passwords (if openssl available)
- Starts Docker containers
- Waits for services to be healthy
- Optionally creates admin user
- Interactive and beginner-friendly

### `create-admin.sh`
**Create admin user**

```bash
# Default values
./scripts/create-admin.sh

# Custom values
./scripts/create-admin.sh admin@local admin123 "Admin User"

# With environment variables
EMAIL=admin@local PASSWORD=admin123 NAME=Admin ./scripts/create-admin.sh

# Or via Makefile
make admin EMAIL=admin@local PASSWORD=admin123 NAME=Admin
```

Parameters:
1. Email (default: `admin@local`)
2. Password (default: `admin123`)
3. Name (default: `Admin`)

### `create-invite.sh`
**Generate invite code** for new user registration

```bash
# Default: 1 use, valid 30 days
./scripts/create-invite.sh

# Custom: 5 uses, valid 90 days
./scripts/create-invite.sh 5 90

# Unlimited uses (999), valid 1 year
./scripts/create-invite.sh 999 365

# Or via Makefile
make invite USES=5 DAYS=90
```

Parameters:
1. Max uses (default: `1`)
2. Days valid (default: `30`)

### `health-check.sh`
**Check system health**

```bash
./scripts/health-check.sh

# Or via Makefile
make health
```

Shows:
- Container status
- Database health
- Backend API health
- Frontend health
- Database stats (users, tasks, items, notes, labels)
- Disk usage
- URLs

## 🔧 Making Scripts Executable

If you get "Permission denied":

```bash
# Make all scripts executable
chmod +x scripts/*.sh

# Or individually
chmod +x scripts/init-setup.sh
chmod +x scripts/create-admin.sh
chmod +x scripts/create-invite.sh
chmod +x scripts/health-check.sh
```

## 💡 Usage Tips

### First Time Setup

```bash
# Run init wizard
./scripts/init-setup.sh

# That's it! Script handles everything
```

### Adding Users

```bash
# Option 1: Create admin and they can generate invites in UI
./scripts/create-admin.sh

# Option 2: Generate invite code directly
./scripts/create-invite.sh 1 30
```

### Regular Maintenance

```bash
# Daily health check
./scripts/health-check.sh

# Weekly backup (automate with cron)
make backup
```

## 🐛 Troubleshooting Scripts

### "node: not found" error

The scripts run inside Docker containers, not on your host. Make sure containers are running:

```bash
docker-compose ps
# If not running:
docker-compose up -d
```

### "Cannot connect to database"

Wait for PostgreSQL to be ready:

```bash
docker-compose logs -f todoless-ngx-db
# Wait for: "database system is ready to accept connections"
```

### Scripts don't have execute permission

```bash
chmod +x scripts/*.sh
```

### macOS: "Operation not permitted"

```bash
# Use sudo or run from terminal with disk access
sudo ./scripts/init-setup.sh
```

## 🔄 Advanced Usage

### Create Multiple Admins

```bash
./scripts/create-admin.sh alice@company.com password123 "Alice Admin"
./scripts/create-admin.sh bob@company.com password456 "Bob Admin"
```

### Batch Invite Generation

```bash
for i in {1..10}; do
  ./scripts/create-invite.sh 1 30
done > invite-codes.txt
```

### Automated Health Monitoring

```bash
# Add to crontab (run every hour)
0 * * * * /path/to/todoless-ngx/scripts/health-check.sh >> /var/log/todoless-health.log 2>&1
```

### Database Stats Collection

```bash
# Add to cron for daily stats
0 0 * * * docker exec todoless-ngx-db psql -U todoless -d todoless -c \
  "SELECT 'Users:', COUNT(*) FROM users; SELECT 'Tasks:', COUNT(*) FROM tasks;" \
  >> /var/log/todoless-stats.log
```

## 📝 Creating Your Own Scripts

Scripts use Docker exec to run commands inside containers:

```bash
#!/bin/bash

# Example: List all tasks
docker exec -i todoless-ngx-backend node -e "
const { query } = require('./database');
(async () => {
  const result = await query('SELECT title FROM tasks');
  console.log(result.rows);
  process.exit(0);
})();
"
```

## 🔐 Security Notes

- Scripts create users with passwords provided as arguments
- **Change default passwords** immediately after first login
- Don't commit `.env` file with real passwords
- Invite codes are random 8-character strings (36^8 combinations)
- Use strong passwords in production

## 📚 See Also

- [QUICKSTART.md](../QUICKSTART.md) - Quick start guide
- [COMMANDS.md](../docs/COMMANDS.md) - All available commands
- [README.md](../README.md) - Full documentation

---

**💡 Tip**: Bookmark `scripts/health-check.sh` for quick system status!
