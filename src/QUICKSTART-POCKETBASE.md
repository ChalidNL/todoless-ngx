# 🚀 QUICK START — PocketBase Migration

## ⚡ 5-Minute Setup

### Step 1: Environment Setup (30 seconds)

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_POCKETBASE_URL=http://localhost:8090
PB_ADMIN_EMAIL=admin@todoless.local
PB_ADMIN_PASSWORD=YourSecurePassword123!
```

### Step 2: Start Services (1 minute)

```bash
docker-compose -f docker-compose.pocketbase.yml up -d
```

Wait for health checks:
```bash
docker-compose -f docker-compose.pocketbase.yml ps
```

All services should show "Up (healthy)" or "Up".

### Step 3: Setup Database (2 minutes)

1. Open **http://localhost:8090/_/**
2. Login with your admin credentials from `.env`
3. Click **"Collections"** → **"New Collection"**

Create these 10 collections (copy from `/pb_migrations/README.md`):

**Quick List:**
1. ✅ `users` (auth) - Add custom field: `name` (text)
2. ✅ `tasks` (base)
3. ✅ `items` (base)
4. ✅ `notes` (base)
5. ✅ `labels` (base)
6. ✅ `shops` (base)
7. ✅ `sprints` (base)
8. ✅ `calendar_events` (base)
9. ✅ `invite_codes` (base)
10. ✅ `app_settings` (base)

For each collection, set API rules to:
```
List: user = @request.auth.id
View: user = @request.auth.id
Create: @request.auth.id != ""
Update: user = @request.auth.id
Delete: user = @request.auth.id
```

### Step 4: Create Invite Code (30 seconds)

In PocketBase Admin:
1. Go to **Collections** → **invite_codes**
2. Click **"New Record"**
3. Fill in:
   - **code:** `WELCOME2024`
   - **expires_at:** `2025-12-31 23:59:59`
   - **used:** `false`
4. Save

### Step 5: Register First User (30 seconds)

1. Open **http://localhost/**
2. Click **"Register"**
3. Fill in:
   - **Email:** `test@example.com`
   - **Password:** `TestPassword123!`
   - **Name:** `Test User`
   - **Invite Code:** `WELCOME2024`
4. Click **Register**

### Step 6: Start Using! 🎉

You're in! Create tasks, items, notes, etc.

---

## 🧪 Test Real-time Sync

1. Open **http://localhost/** in 2 browser tabs
2. In Tab 1: Create a task
3. In Tab 2: Task appears instantly! ✨

---

## 🆘 Quick Troubleshooting

### Problem: Can't access PocketBase Admin

```bash
# Check PocketBase is running
docker-compose -f docker-compose.pocketbase.yml logs pocketbase

# Restart if needed
docker-compose -f docker-compose.pocketbase.yml restart pocketbase
```

### Problem: Frontend shows "Not authenticated"

1. Check PocketBase is running: http://localhost:8090/_/
2. Make sure you created the collections
3. Clear browser cache and refresh

### Problem: "Invalid invite code"

1. Go to PocketBase Admin → Collections → invite_codes
2. Make sure the code exists and `used = false`
3. Check `expires_at` is in the future

---

## 📚 Next Steps

- **Read full guide:** `README-POCKETBASE.md`
- **Check migration status:** `MIGRATION-STATUS.md`
- **Database schema details:** `pb_migrations/README.md`

---

## 🎉 Done!

Your To Do Less app now runs on PocketBase! 🚀
