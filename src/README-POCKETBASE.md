# To Do Less — PocketBase Migration Complete

This app has been migrated from Node.js + PostgreSQL to **PocketBase**.

## ✅ What Changed

| Before | After |
|--------|-------|
| React + Node.js Backend + PostgreSQL | React + PocketBase |
| 3 services (frontend, backend, database) | 2 services (frontend, pocketbase) |
| Manual auth implementation | Built-in PocketBase auth |
| Custom WebSocket for realtime | Built-in PocketBase realtime |
| Complex database migrations | Simple PocketBase schema |

## 🚀 Quick Start

### 1. Setup Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_POCKETBASE_URL=http://localhost:8090
PB_ADMIN_EMAIL=admin@todoless.local
PB_ADMIN_PASSWORD=YourSecurePassword123!
```

### 2. Start with Docker Compose

```bash
docker-compose -f docker-compose.pocketbase.yml up -d
```

### 3. Setup PocketBase Database

1. Open PocketBase Admin UI: **http://localhost:8090/_/**
2. Login with your `PB_ADMIN_EMAIL` and `PB_ADMIN_PASSWORD`
3. Create the database schema (see "Database Setup" below)

### 4. Open the App

**http://localhost/**

You're done! 🎉

---

## 📦 Database Setup

### Option 1: Manual Setup (Recommended for first time)

1. Go to http://localhost:8090/_/
2. Click "Collections" → "New Collection"
3. Create each collection following the schema in `/pb_migrations/README.md`

### Option 2: Import Schema (if available)

1. Export schema from `/pb_migrations/schema.json` (if exists)
2. Import via PocketBase Admin UI

### Required Collections

1. **users** (auth type) — built-in, just add custom fields
2. **tasks**
3. **items**
4. **notes**
5. **labels**
6. **shops**
7. **sprints**
8. **calendar_events**
9. **invite_codes**
10. **app_settings**

See `/pb_migrations/README.md` for detailed field specifications.

---

## 🔐 First User Registration

### Step 1: Create an Invite Code

PocketBase Admin UI → Collections → `invite_codes` → New Record

```json
{
  "code": "WELCOME2024",
  "created_by": "<your-admin-user-id>",
  "expires_at": "2025-12-31 23:59:59",
  "used": false
}
```

### Step 2: Register

Go to **http://localhost/** and click "Register"

Use the invite code you just created.

---

## 🛠️ Development

### Run Locally (without Docker)

#### Terminal 1: Start PocketBase

```bash
# Download PocketBase binary
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
unzip pocketbase_0.22.0_linux_amd64.zip
./pocketbase serve --http 0.0.0.0:8090
```

#### Terminal 2: Start Frontend

```bash
npm install
VITE_POCKETBASE_URL=http://localhost:8090 npm run dev
```

Open **http://localhost:5173/**

---

## 📊 Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─────────── HTTP/WebSocket ──────────┐
       │                                      │
┌──────▼────────┐                   ┌────────▼────────┐
│   Frontend    │                   │   PocketBase    │
│ (Nginx+React) │                   │  (DB+Auth+API)  │
│   Port 80     │                   │   Port 8090     │
└───────────────┘                   └─────────────────┘
```

### Before (3 Services)

- Frontend (Nginx + React)
- Backend (Node.js + Express)
- Database (PostgreSQL)

### After (2 Services)

- Frontend (Nginx + React)
- PocketBase (all-in-one: DB + Auth + API + Realtime)

---

## 🔄 Real-time Updates

PocketBase provides automatic real-time synchronization:

- Open the app in 2 browser tabs
- Create/edit/delete a task in tab 1
- **Tab 2 updates automatically** without refresh!

This uses PocketBase's built-in WebSocket subscriptions.

---

## 🗂️ Data Isolation (Multi-User)

All collections use these API rules:

```javascript
// List Rule
user = @request.auth.id

// View Rule
user = @request.auth.id

// Create Rule
@request.auth.id != ""

// Update Rule
user = @request.auth.id

// Delete Rule
user = @request.auth.id
```

This ensures users only see their own data!

**Exception:** Labels can be public or private:
- Public labels: visible to everyone
- Private labels: only visible to creator

---

## 📁 Project Structure

```
/
├── docker-compose.pocketbase.yml   # Docker services
├── Dockerfile.pocketbase            # Frontend build
├── nginx-frontend.conf              # Nginx config
├── .env.example                     # Environment template
│
├── lib/
│   ├── pocketbase.ts                # PocketBase client
│   └── pocketbase-client.ts         # API wrapper
│
├── components/
│   └── AuthProvider.tsx             # Auth logic
│
├── context/
│   └── AppContext.api.tsx           # State management
│
└── pb_migrations/
    └── README.md                    # Schema documentation
```

---

## 🧪 Testing

### Test Real-time Sync

```bash
# Start the app
docker-compose -f docker-compose.pocketbase.yml up -d

# Open 2 browser windows
open http://localhost/  # Tab 1
open http://localhost/  # Tab 2

# In Tab 1: Create a task
# In Tab 2: Task appears instantly!
```

### Test Multi-User Isolation

```bash
# Create 2 users with different invite codes
# Login as User 1 → create tasks
# Login as User 2 → should NOT see User 1's tasks
```

---

## 🆘 Troubleshooting

### Frontend can't connect to PocketBase

**Check the URL:**
```bash
# In browser console (F12)
console.log(import.meta.env.VITE_POCKETBASE_URL)
```

Should show: `http://localhost:8090`

**Fix:**
```bash
# Rebuild with correct URL
docker-compose -f docker-compose.pocketbase.yml build --no-cache
docker-compose -f docker-compose.pocketbase.yml up -d
```

### PocketBase Admin UI not accessible

```bash
# Check PocketBase is running
docker-compose -f docker-compose.pocketbase.yml ps

# View logs
docker-compose -f docker-compose.pocketbase.yml logs pocketbase
```

### CORS Errors

PocketBase allows all origins by default. If you see CORS errors:

1. Go to PocketBase Admin → Settings → Application
2. Add your domain to allowed origins

---

## 💾 Backup & Restore

### Backup

```bash
# Backup PocketBase data
docker run --rm \
  -v todoless_pb_data:/pb_data \
  -v $(pwd):/backup \
  alpine tar czf /backup/pb_backup.tar.gz /pb_data
```

### Restore

```bash
# Restore from backup
docker run --rm \
  -v todoless_pb_data:/pb_data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/pb_backup.tar.gz -C /
```

---

## 🚀 Production Deployment

### CasaOS

1. Edit `.env` with your server's IP:
   ```env
   VITE_POCKETBASE_URL=http://<your-server-ip>:8090
   ```

2. Rebuild the frontend:
   ```bash
   docker-compose -f docker-compose.pocketbase.yml build
   ```

3. Deploy to CasaOS using the compose file

### Regular Server

Same steps, but use standard Docker Compose:

```bash
docker-compose -f docker-compose.pocketbase.yml up -d
```

---

## 📚 API Reference

The app uses PocketBase JavaScript SDK under the hood.

### Auth

```typescript
// Login
await pb.collection('users').authWithPassword(email, password);

// Register
await pb.collection('users').create({ email, password, passwordConfirm, name });

// Logout
pb.authStore.clear();

// Check if logged in
pb.authStore.isValid
```

### CRUD

```typescript
// Create
await pb.collection('tasks').create({ title, user: userId, ... });

// Read
await pb.collection('tasks').getFullList({ filter: `user = "${userId}"` });

// Update
await pb.collection('tasks').update(id, { title: 'New title' });

// Delete
await pb.collection('tasks').delete(id);
```

### Realtime

```typescript
// Subscribe
pb.collection('tasks').subscribe('*', (e) => {
  console.log(e.action); // 'create', 'update', 'delete'
  console.log(e.record);
});

// Unsubscribe
pb.collection('tasks').unsubscribe();
```

---

## 🎉 Done!

Your app now runs on PocketBase!

**Questions?** Check the [PocketBase docs](https://pocketbase.io/docs/).
