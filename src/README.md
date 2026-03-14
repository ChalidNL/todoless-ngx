# Todoless-ngx

Multi-user task management with PostgreSQL - Real-time sync, private labels, auto-archive.

## Quick Deploy on CasaOS

1. Import `docker-compose.yml` in CasaOS
2. Start the stack
3. Access at `http://localhost:3000`
4. First user is admin and can create invite codes

## Docker Compose

```bash
docker-compose up -d
```

## Default Ports

- Frontend: 3000
- Backend API: 4000
- Database: internal only

## Environment Variables (optional)

Create `.env` file:

```env
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_min_32_chars
FRONTEND_PORT=3000
BACKEND_PORT=4000
```

That's it!
