# Todoless - Access & URLs

Snel overzicht van alle toegangspunten en credentials.

## 🌐 URLs (Development)

| Service | URL | Purpose |
|---------|-----|---------|
| **Todoless App** | http://localhost:3000 | Hoofd applicatie |
| **Supabase Studio** | http://localhost:3010 | Database management UI |
| **Supabase API** | http://localhost:8000 | REST API endpoint |
| **PostgreSQL** | localhost:5432 | Direct database access |

## 🔑 Credentials (Default Development)

### Database (PostgreSQL)

```
Host:     localhost
Port:     5432
Database: todoless
User:     postgres
Password: (zie .env > POSTGRES_PASSWORD)
```

**Verbinding string:**
```
postgresql://postgres:<password>@localhost:5432/todoless
```

### Supabase API Keys

```bash
# Anon Key (public, safe voor client-side)
ANON_KEY=(zie .env)

# Service Role Key (secret, server-side only!)
SERVICE_ROLE_KEY=(zie .env)

# JWT Secret
JWT_SECRET=(zie .env)
```

### Eerste Admin Account

Na onboarding:
```
Email:    (door jou gekozen tijdens onboarding)
Password: (door jou gekozen tijdens onboarding)
Role:     admin
```

## 🔐 API Authentication

### Voor Client-Side Requests

```javascript
// Headers
{
  'apikey': 'YOUR_ANON_KEY',
  'Content-Type': 'application/json'
}
```

### Voor Server-Side Requests

```javascript
// Headers
{
  'apikey': 'YOUR_SERVICE_ROLE_KEY',
  'Authorization': 'Bearer YOUR_SERVICE_ROLE_KEY',
  'Content-Type': 'application/json'
}
```

## 📡 API Endpoints

Base URL: `http://localhost:8000/rest/v1`

### Tasks

```bash
GET    /tasks              # Get all tasks
GET    /tasks?id=eq.123    # Get specific task
POST   /tasks              # Create task
PATCH  /tasks?id=eq.123    # Update task
DELETE /tasks?id=eq.123    # Delete task
```

### Items

```bash
GET    /items              # Get all items
POST   /items              # Create item
PATCH  /items?id=eq.123    # Update item
DELETE /items?id=eq.123    # Delete item
```

### Notes

```bash
GET    /notes              # Get all notes
POST   /notes              # Create note
PATCH  /notes?id=eq.123    # Update note
DELETE /notes?id=eq.123    # Delete note
```

### Users

```bash
GET    /users              # Get all users (RLS applies)
GET    /users?id=eq.123    # Get specific user
PATCH  /users?id=eq.123    # Update user (own only)
```

### Labels

```bash
GET    /labels             # Get all labels (public + own private)
POST   /labels             # Create label
PATCH  /labels?id=eq.123   # Update label (own only)
DELETE /labels?id=eq.123   # Delete label (own only)
```

### Sprints

```bash
GET    /sprints            # Get all sprints
POST   /sprints            # Create sprint
DELETE /sprints?id=eq.123  # Delete sprint
```

## 🔍 Query Parameters

PostgREST supports powerful query parameters:

### Filtering

```bash
# Equality
?status=eq.todo

# Greater than
?created_at=gt.2026-01-01

# Less than
?due_date=lt.2026-12-31

# In list
?priority=in.(urgent,normal)

# Like (pattern matching)
?title=like.*project*

# Is null
?due_date=is.null

# Multiple filters (AND)
?status=eq.todo&priority=eq.urgent
```

### Ordering

```bash
# Ascending
?order=created_at.asc

# Descending
?order=created_at.desc

# Multiple columns
?order=priority.desc,created_at.asc
```

### Limiting & Pagination

```bash
# Limit results
?limit=10

# Offset
?offset=20

# Pagination
?limit=10&offset=0   # Page 1
?limit=10&offset=10  # Page 2
?limit=10&offset=20  # Page 3
```

### Selection

```bash
# Select specific fields
?select=id,title,status

# Select all
?select=*
```

## 🌐 Production URLs

Update deze voor productie deployment:

```bash
# .env production values
SITE_URL=https://todoless.yourdomain.com
API_EXTERNAL_URL=https://todoless.yourdomain.com/api
SUPABASE_PUBLIC_URL=https://todoless.yourdomain.com/api
```

### Nginx Reverse Proxy

```nginx
# Frontend
https://todoless.yourdomain.com
  → http://localhost:3000

# API
https://todoless.yourdomain.com/api
  → http://localhost:8000

# Studio (optioneel, disable in productie)
https://studio.todoless.yourdomain.com
  → http://localhost:3010
```

## 🔒 Security Best Practices

### Development

- ✅ Use ANON_KEY in client-side code
- ✅ Keep SERVICE_ROLE_KEY secret
- ✅ Use environment variables
- ✅ Never commit .env to git

### Production

- ✅ Change ALL default passwords
- ✅ Generate new JWT tokens
- ✅ Use HTTPS/SSL everywhere
- ✅ Restrict database access to localhost
- ✅ Disable Supabase Studio (port 3010)
- ✅ Setup firewall rules
- ✅ Use strong passwords (20+ chars)
- ✅ Regular backups
- ✅ Monitor access logs

## 🧪 Testing Access

### Test Frontend

```bash
curl http://localhost:3000
# Should return HTML
```

### Test API

```bash
curl http://localhost:8000/rest/v1/tasks \
  -H "apikey: YOUR_ANON_KEY"
# Should return JSON array
```

### Test Database

```bash
docker exec supabase-db psql -U postgres -d todoless -c "SELECT COUNT(*) FROM tasks;"
# Should return count
```

### Test Supabase Studio

Open http://localhost:3010 in browser
- Should show Supabase Studio interface

## 📱 Mobile/Remote Access

### Local Network

1. Find your local IP:
```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# Linux
hostname -I
```

2. Update firewall:
```bash
# Allow port 3000 from local network
ufw allow from 192.168.1.0/24 to any port 3000
```

3. Access from mobile:
```
http://192.168.1.XXX:3000
```

### Ngrok (Temporary Public URL)

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from ngrok.com

# Expose port 3000
ngrok http 3000

# Use the provided URL (e.g., https://abc123.ngrok.io)
```

⚠️ **Warning:** Never expose Supabase API publicly without proper authentication!

## 🔐 Password Reset (Emergency)

Als je het admin wachtwoord vergeten bent:

```bash
# Verbind met database
docker exec -it supabase-db psql -U postgres -d todoless

# Reset password (in production: use bcrypt hash!)
UPDATE users 
SET password_hash = 'new-temp-password' 
WHERE email = 'admin@example.com';

# Exit
\q
```

## 📊 Health Check Endpoints

```bash
# Supabase API health
curl http://localhost:8000/health

# Database connection
docker exec supabase-db pg_isready -U postgres

# Service status
docker-compose -f docker-compose.supabase.yml ps
```

## 🆘 Common Access Issues

### "Can't connect to localhost:3000"

```bash
# Check if service is running
docker ps | grep todoless-app

# Check logs
docker logs todoless-app

# Restart
docker restart todoless-app
```

### "API returns 401 Unauthorized"

- Check if ANON_KEY is correct in request headers
- Verify .env file has correct keys
- Check if keys match between frontend and backend

### "Database connection refused"

```bash
# Check if database is running
docker ps | grep supabase-db

# Check database logs
docker logs supabase-db

# Restart database
docker restart supabase-db
```

### "Studio won't load"

```bash
# Check if Studio is running
docker ps | grep supabase-studio

# Check logs
docker logs supabase-studio

# Restart Studio
docker restart supabase-studio
```

## 📚 Quick Links

- **Supabase Docs:** https://supabase.com/docs
- **PostgREST API Docs:** https://postgrest.org/en/stable/api.html
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Docker Docs:** https://docs.docker.com/

## 🎯 Bookmarks (Development)

Save these in your browser:

```
Todoless App:     http://localhost:3000
Supabase Studio:  http://localhost:3010
API Explorer:     http://localhost:8000/rest/v1/
```

## 📞 Quick Support

```bash
# View all logs
make logs

# Check status
make status

# Database console
make db

# Full restart
make restart
```

---

**Last Updated:** 2026-03-14
**Default Admin:** Created during onboarding
**Database:** todoless
**Environment:** Development
