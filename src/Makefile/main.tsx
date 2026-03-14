# Todoless Makefile

.PHONY: start stop restart logs status db backup

start:
	docker-compose up -d

stop:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

status:
	docker-compose ps

db:
	docker exec -it supabase-db psql -U postgres -d todoless

backup:
	mkdir -p backups
	docker exec supabase-db pg_dump -U postgres todoless > backups/backup-$(shell date +%Y%m%d).sql

health:
	@curl -s http://localhost:3000 > /dev/null && echo "✅ App OK" || echo "❌ App down"
	@curl -s http://localhost:8000/health > /dev/null && echo "✅ API OK" || echo "❌ API down"
	@docker exec supabase-db pg_isready -U postgres > /dev/null && echo "✅ DB OK" || echo "❌ DB down"

stats:
	@docker exec supabase-db psql -U postgres -d todoless -c "SELECT 'Tasks' as table, COUNT(*) FROM tasks UNION ALL SELECT 'Items', COUNT(*) FROM items UNION ALL SELECT 'Notes', COUNT(*) FROM notes UNION ALL SELECT 'Users', COUNT(*) FROM users;"
