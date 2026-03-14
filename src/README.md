# Todoless

Lightweight self-hosted task management app with multi-user support.

## Quick Start

```bash
# Clone the repository
git clone <your-repo>
cd todoless

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Access

Open your browser and navigate to: `http://localhost:3000`

## Features

- **Multi-user task management** - Collaborate with your team
- **Inbox & Tasks** - Organize work efficiently
- **Items & Notes** - Track everything in one place
- **Calendar integration** - See your timeline
- **Private labels** - Keep sensitive tasks hidden per user
- **Smart search** - Parse with @user, #label, //date
- **Auto-archive** - Configurable retention (30/60/90 days or unlimited)
- **Sprint tracking** - Individual card icons for sprint management

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Storage**: JSON files (persistent via Docker volume)
- **Deployment**: Docker Compose

## Ports

- `3000` - Web application

## Data Storage

All data is stored in the Docker volume `todoless-data` as JSON files:
- `/app/data/users.json`
- `/app/data/tasks.json`
- `/app/data/items.json`
- `/app/data/notes.json`
- `/app/data/labels.json`
- `/app/data/invites.json`
- `/app/data/settings.json`

## Reset Database

```bash
# This will delete all data!
docker-compose down -v
docker-compose up -d
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Endpoints

- `GET /health` - Health check
- `GET/POST/PUT/DELETE /api/users` - User management
- `GET/POST/PUT/DELETE /api/tasks` - Task management
- `GET/POST/PUT/DELETE /api/items` - Item management
- `GET/POST/PUT/DELETE /api/notes` - Notes management
- `GET/POST/PUT/DELETE /api/labels` - Label management
- `GET/POST/DELETE /api/invites` - Invite management
- `GET/PUT /api/settings` - Settings management
- `POST /api/tasks/bulk` - Bulk task operations

## License

Private project
