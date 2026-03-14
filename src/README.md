# Todoless

Lightweight self-hosted task management app with multi-user support.

## Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd todoless

# Start with Docker Compose
docker-compose up -d
```

## Access

- **Web Interface**: `http://localhost:3000`
- **Default Login**:
  - Email: `admin@todoless.local`
  - Password: `admin123`

## Features

- Multi-user task management
- Inbox, Tasks, Items, Notes, Calendar
- Sprint tracking with card icons
- Private labels per user
- Auto-archive with configurable retention
- Smart search with @user, #label, //date parsing
- Self-hosted with Supabase backend

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (GoTrue + PostgREST)
- **Database**: PostgreSQL 15
- **Deployment**: Docker Compose

## Ports

- `3000` - Web application
- `5432` - PostgreSQL (internal)
- `9999` - GoTrue Auth (internal)
- `3001` - PostgREST API (internal)

## Data Persistence

All data is stored in Docker volume `todoless-data`.

## Stopping

```bash
docker-compose down
```

## Reset

```bash
docker-compose down -v
docker-compose up -d
```
