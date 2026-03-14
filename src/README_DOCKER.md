# Todoless - Docker Deployment

A compact task management app with multi-user support, designed for self-hosted deployment.

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The app will be available at `http://localhost:3000`

### Using Docker directly

```bash
# Build the image
docker build -t todoless .

# Run the container
docker run -d \
  --name todoless \
  -p 3000:3000 \
  -v todoless_data:/app/data \
  todoless

# View logs
docker logs -f todoless

# Stop the container
docker stop todoless
docker rm todoless
```

## Data Persistence

All data is stored in JSON files in the `/app/data` directory inside the container. This directory is mounted as a volume to ensure data persists across container restarts.

The following files are stored:
- `users.json` - User accounts
- `tasks.json` - All tasks
- `items.json` - Shopping list items
- `notes.json` - Notes
- `labels.json` - Labels and categories
- `invites.json` - Invitation codes
- `settings.json` - App settings

## Environment Variables

- `PORT` - Server port (default: 3000)
- `DATA_DIR` - Data directory path (default: /app/data)
- `NODE_ENV` - Environment mode (default: production)

## Health Check

The container includes a health check endpoint at `/health` that runs every 30 seconds.

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' todoless
```

## CasaOS Integration

This app includes CasaOS labels for easy integration:

- **Name**: Todoless
- **Category**: Productivity
- **Port**: 3000

## Backup & Restore

### Backup data

```bash
# Create backup directory
mkdir -p backups

# Copy data from container
docker cp todoless:/app/data ./backups/todoless-backup-$(date +%Y%m%d)
```

### Restore data

```bash
# Stop the container
docker-compose down

# Copy backup to volume
docker run --rm -v todoless_data:/app/data -v $(pwd)/backups/your-backup:/backup alpine cp -r /backup/* /app/data/

# Start the container
docker-compose up -d
```

## Development

For local development without Docker:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Migration from localStorage

If you're migrating from a browser-based version, you can export your data and import it via the API:

```bash
# Example: Import tasks
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d @your-tasks-export.json
```

## API Endpoints

The server exposes a REST API:

- `GET /health` - Health check
- `GET/POST/PUT/DELETE /api/users` - User management
- `GET/POST/PUT/DELETE /api/tasks` - Task management
- `GET/POST/PUT/DELETE /api/items` - Item management
- `GET/POST/PUT/DELETE /api/notes` - Notes management
- `GET/POST/PUT/DELETE /api/labels` - Label management
- `GET/POST/DELETE /api/invites` - Invite management
- `GET/PUT /api/settings` - Settings management
- `POST /api/tasks/bulk` - Bulk task operations

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Data loss

Check if the volume is properly mounted:

```bash
docker volume inspect todoless_data
```

### Port already in use

Change the port in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Use port 3001 instead
```

## Security Notes

- The app runs as a non-root user (`todoless:nodejs`)
- Data directory has restricted permissions
- No external dependencies in production
- CORS is enabled for local development

## License

Private use only.
