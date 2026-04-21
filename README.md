
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

## Security baseline (secrets/tokens)
- Use `.env.example` as a template; keep real values only in local `.env` files or a secret manager.
- Install pre-commit hooks:

```bash
pipx install pre-commit || pip install pre-commit
pre-commit install
```

- Run a full repository scan:

```bash
npm run security:secrets
```

- Policy document: `docs/security/secrets-rotation-policy.md`

## Deploy to CasaOS
See README-casaos.md

## Tech Stack
- Frontend: React 18 + Vite 6
- Database / Backend: PocketBase 0.34.2
- Container: Docker Compose
  