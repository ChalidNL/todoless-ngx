.PHONY: help start stop restart logs build clean admin invite health backup restore

help: ## Show this help message
	@echo "Todoless-ngx - Make commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

start: ## Start all services
	docker-compose up -d
	@echo "✅ Services started. Run 'make logs' to view output."
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔌 Backend: http://localhost:4000"

stop: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

build: ## Build containers from scratch
	docker-compose build --no-cache

clean: ## Stop and remove all containers, networks (keeps data)
	docker-compose down

clean-all: ## ⚠️  Stop and remove everything including data
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "✅ All data removed."; \
	fi

admin: ## Create admin user (usage: make admin EMAIL=admin@local PASSWORD=admin123 NAME=Admin)
	@chmod +x scripts/create-admin.sh
	./scripts/create-admin.sh $(EMAIL) $(PASSWORD) $(NAME)

invite: ## Create invite code (usage: make invite USES=1 DAYS=30)
	@chmod +x scripts/create-invite.sh
	./scripts/create-invite.sh $(USES) $(DAYS)

health: ## Check health of all services
	@chmod +x scripts/health-check.sh
	./scripts/health-check.sh

backup: ## Backup PostgreSQL database to backups/backup-YYYYMMDD.sql.gz
	@mkdir -p backups
	docker exec todoless-ngx-db pg_dump -U todoless todoless | gzip > backups/backup-$$(date +%Y%m%d-%H%M%S).sql.gz
	@echo "✅ Backup saved to: backups/backup-$$(date +%Y%m%d-%H%M%S).sql.gz"

restore: ## Restore from backup (usage: make restore FILE=backups/backup-20260314.sql.gz)
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Error: Please specify FILE=path/to/backup.sql.gz"; \
		exit 1; \
	fi
	@echo "⚠️  WARNING: This will replace current database!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		gunzip -c $(FILE) | docker exec -i todoless-ngx-db psql -U todoless -d todoless; \
		echo "✅ Database restored from $(FILE)"; \
	fi

shell-db: ## Open PostgreSQL shell
	docker exec -it todoless-ngx-db psql -U todoless -d todoless

shell-backend: ## Open backend container shell
	docker exec -it todoless-ngx-backend sh

shell-frontend: ## Open frontend container shell
	docker exec -it todoless-ngx-frontend sh

update: ## Update to latest version (preserves data)
	git pull
	docker-compose down
	docker-compose up -d --build
	@echo "✅ Updated to latest version"

dev: ## Start development environment
	@echo "Starting PostgreSQL..."
	docker-compose up -d todoless-ngx-db
	@echo "✅ Database ready at localhost:5432"
	@echo "📝 Run 'cd backend && npm run dev' to start backend"
	@echo "📝 Run 'npm run dev' to start frontend"
