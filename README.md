
# todoless-ngx

`todoless-ngx` is a self-hosted, multi-user productivity app built with React, Vite, and PocketBase.
It is designed for a shared *family* workspace with invite-based onboarding, realtime sync, and a unified model for tasks and items.

## What this project does
- Shared family workspace with roles like owner, admin, member, and agent
- Invite-based registration and onboarding flow
- Unified inbox/backlog and task workflow
- Grocery / item tracking with shops and quantities
- Notes, labels, projects, goals, rewards, and reminders
- Sprint support and calendar events
- PocketBase-backed realtime updates and server-side hooks
- API tokens, shared routes, and PocketBase migrations for the backend logic

## Tech stack
- Frontend: React 18 + Vite 6
- Backend: PocketBase 0.35.x
- UI: Tailwind CSS + Radix UI components
- Runtime: Docker / Docker Compose

## Local development

### Prerequisites
- Node.js 20+ and npm
- Docker + Docker Compose

### Environment
Start from the example file:

```bash
cp .env.example .env
```

Then fill in the values you need for your local setup.

### Run the dev stack
Use the development compose file:

```bash
docker compose -f docker-compose.dev.yml up --build
```

This starts the frontend and PocketBase locally.

### Frontend-only workflow
If the backend is already running elsewhere, you can work on the frontend with Vite directly:

```bash
npm install
npm run dev
```

## Quality checks
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run security:secrets`

## Deployment
- Production and development images are defined in `docker-compose.yml` and `docker-compose.dev.yml`
- Deployment helper: `./scripts/deploy.sh <dev|main>`
- Backend hooks and migrations live in `pb_hooks/` and `pb_migrations/`

## Security baseline
- Keep real secrets out of git; use `.env` locally or a secret manager
- Use `.env.example` as the template for new environments
- Policy document: `docs/security/secrets-rotation-policy.md`

## Repository layout
- `src/` — React app, views, components, context, and shared utilities
- `pb_hooks/` — PocketBase server-side routes and business logic
- `pb_migrations/` — schema and data migrations
- `scripts/` — deployment and maintenance helpers
- `e2e/` — end-to-end checks

## Notes
- This repo is meant for self-hosted use
- The app relies on PocketBase for auth, data storage, and realtime subscriptions
  
