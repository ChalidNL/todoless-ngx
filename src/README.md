# To Do Less

Self-hosted multi-user task manager powered by PocketBase.

## Quick Start

```bash
# Clone and start
cp .env.example .env        # Edit credentials if needed
docker compose up -d --build # Build and start

# Access
# App:      http://localhost:7070
# PocketBase Admin: http://localhost:7070/pb/_/
```

## Architecture

```
Frontend (React + Vite + Nginx) :7070
  |
  +-- /pb/* --> PocketBase :8090 (proxied via nginx)
```

- **Frontend**: React SPA served by Nginx, proxies `/pb/*` to PocketBase
- **PocketBase**: Database, auth, realtime, admin UI — all in one

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PB_ADMIN_EMAIL` | `admin@todoless.local` | PocketBase admin email |
| `PB_ADMIN_PASSWORD` | `changeme123` | PocketBase admin password |
| `WEBUI_PORT` | `7070` | Frontend port |

## Commands

```bash
docker compose up -d --build   # Start (build frontend)
docker compose down            # Stop
docker compose logs -f         # View logs
docker compose up -d --build frontend  # Rebuild frontend only
```

## Data

PocketBase data is stored in the `pb_data` Docker volume. Back it up with:

```bash
docker compose exec pocketbase cp -r /pb_data /pb_data_backup
```
