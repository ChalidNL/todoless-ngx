# Commands - Todoless

## Docker Compose

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Status
docker-compose ps
```

## Database

```bash
# Open console
docker exec -it supabase-db psql -U postgres -d todoless

# Backup
docker exec supabase-db pg_dump -U postgres todoless > backup.sql

# Restore
docker exec -i supabase-db psql -U postgres todoless < backup.sql

# Stats
docker exec supabase-db psql -U postgres -d todoless -c "\
  SELECT 'Tasks' as table, COUNT(*) FROM tasks UNION ALL \
  SELECT 'Items', COUNT(*) FROM items UNION ALL \
  SELECT 'Notes', COUNT(*) FROM notes UNION ALL \
  SELECT 'Users', COUNT(*) FROM users;"
```

## Makefile

```bash
make start      # Start services
make stop       # Stop services
make logs       # View logs
make db         # Database console
make backup     # Create backup
make status     # Service status
make health     # Health check
make stats      # Database stats
```

## Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker logs todoless-app
docker logs supabase-db
docker logs supabase-kong

# Last 100 lines
docker-compose logs --tail=100
```

## Maintenance

```bash
# Clean up
docker system prune -f

# Reset everything (⚠️ deletes data!)
docker-compose down -v
docker-compose up -d

# Update images
docker-compose pull
docker-compose up -d
```

## Health Checks

```bash
# Check app
curl http://localhost:3000

# Check API
curl http://localhost:8000/health

# Check database
docker exec supabase-db pg_isready -U postgres
```

---

That's all you need! 🚀
