# Todoless

Lightweight task management app.

## Quick Start

```bash
# Clone
git clone https://github.com/ChalidNL/Todolessngx
cd Todolessngx

# Start
docker-compose up -d
```

Access: http://localhost:3000

**Login:**
- Email: `admin@todoless.local`
- Password: `admin123`

## Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Backup database
docker exec todoless-db pg_dump -U postgres todoless > backup.sql
```

## Ports

- 3000 - App
- 3001 - API
- 5432 - Database
- 9999 - Auth

## Resources

- RAM: ~300MB
- Services: 4