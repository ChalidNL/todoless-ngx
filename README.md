
# todoless-ngx

Self-hosted multi-user task manager. Built with React + Vite. Powered by PocketBase.

## Features
- Login, first-run onboarding, and invite-based registration
- Inbox/backlog, task board, and sprint-aware task workflow
- Notes, item tracking, labels, shops, and user settings
- Calendar scheduling from tasks and date-driven views
- Realtime updates via PocketBase subscriptions

## Local Development
Use `docker-compose.local.yml`:

```bash
docker compose -f docker-compose.local.yml up --build
```

## Deploy to CasaOS
See README-casaos.md

## Tech Stack
- Frontend: React 18 + Vite 6
- Database / Backend: PocketBase 0.34.2
- Container: Docker Compose
  