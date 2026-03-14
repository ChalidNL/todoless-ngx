# Access - Todoless

## URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Todoless** | http://localhost:3000 | Main app |
| **Studio** | http://localhost:3010 | Database UI |
| **API** | http://localhost:8000 | REST API |
| **Database** | localhost:5432 | PostgreSQL (internal) |

## Credentials

### Database

```
Host: localhost (or db from inside Docker)
Port: 5432
Database: todoless
User: postgres
Password: <your POSTGRES_PASSWORD from .env>
```

### Supabase Studio

```
URL: http://localhost:3010
Database URL: postgres://postgres:<POSTGRES_PASSWORD>@db:5432/todoless
```

### API Keys

```bash
# Public (frontend)
ANON_KEY=<from .env>

# Admin (backend)
SERVICE_ROLE_KEY=<from .env>
```

## API Endpoints

### Base URL
```
http://localhost:8000
```

### Health Check
```bash
curl http://localhost:8000/health
```

### REST API
```bash
# Get tasks (requires auth)
curl http://localhost:8000/rest/v1/tasks \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $USER_TOKEN"

# Get users
curl http://localhost:8000/rest/v1/users \
  -H "apikey: $ANON_KEY"
```

### Auth
```bash
# Register
curl http://localhost:8000/auth/v1/signup \
  -H "apikey: $ANON_KEY" \
  -d '{"email":"user@example.com","password":"password"}'

# Login
curl http://localhost:8000/auth/v1/token?grant_type=password \
  -H "apikey: $ANON_KEY" \
  -d '{"email":"user@example.com","password":"password"}'
```

## Environment Variables

All in `.env`:

```bash
# Database
POSTGRES_PASSWORD=your-password

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=3600

# API Keys
ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-role-key

# URLs
API_EXTERNAL_URL=http://localhost:8000
SITE_URL=http://localhost:3000
```

## Remote Access

### CasaOS
```
http://your-casaos-ip:3000
http://your-casaos-ip:3010
http://your-casaos-ip:8000
```

### Tailscale
```
http://your-tailscale-hostname:3000
```

---

That's it! 🔑
