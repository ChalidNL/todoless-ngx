# Migration Guide - localStorage to Supabase

## Overview

Todoless has two AppContext versions:
- `AppContext.tsx` - localStorage (current)
- `AppContext.supabase.tsx` - Supabase backend (new)

---

## Step 1: Backup Data

**In browser console (http://localhost:3000):**

```javascript
const backup = {
  tasks: JSON.parse(localStorage.getItem('todoless_tasks') || '[]'),
  items: JSON.parse(localStorage.getItem('todoless_items') || '[]'),
  notes: JSON.parse(localStorage.getItem('todoless_notes') || '[]'),
  labels: JSON.parse(localStorage.getItem('todoless_labels') || '[]'),
  shops: JSON.parse(localStorage.getItem('todoless_shops') || '[]'),
  calendarEvents: JSON.parse(localStorage.getItem('todoless_calendarEvents') || '[]'),
  sprints: JSON.parse(localStorage.getItem('todoless_sprints') || '[]'),
  users: JSON.parse(localStorage.getItem('todoless_users') || '[]'),
  inviteCodes: JSON.parse(localStorage.getItem('todoless_inviteCodes') || '[]'),
  appSettings: JSON.parse(localStorage.getItem('todoless_appSettings') || '{}'),
};

console.log(JSON.stringify(backup, null, 2));
// Copy output and save as backup.json
```

---

## Step 2: Setup Supabase

```bash
# 1. Environment
cp .env.example .env

# 2. Generate tokens
node scripts/generate-jwt.js $(openssl rand -base64 32)
# Copy to .env

# 3. Start Supabase
docker-compose up -d

# Wait 1-2 minutes for startup
```

---

## Step 3: Import Data

```bash
# Import from backup.json
node scripts/import-localstorage.js backup.json
```

---

## Step 4: Switch Context

```bash
# Backup old context
mv context/AppContext.tsx context/AppContext.localStorage.tsx

# Activate Supabase context
mv context/AppContext.supabase.tsx context/AppContext.tsx

# Rebuild
npm run build
```

---

## Step 5: Verify

1. **Open app:** http://localhost:3000
2. **Login** with admin account
3. **Check data:**
   - Tasks in Tasks view
   - Items in Items view
   - Notes in Notes view

---

## Rollback

If something goes wrong:

```bash
# Switch back to localStorage
mv context/AppContext.tsx context/AppContext.supabase.tsx
mv context/AppContext.localStorage.tsx context/AppContext.tsx

# Rebuild
npm run build
```

Your data is still in localStorage!

---

## Manual Import

### Via Supabase Studio

1. **Open Studio:** http://localhost:3010
2. **Connect to database**
3. **SQL Editor** → Paste:

```sql
-- Import tasks
INSERT INTO tasks (id, title, description, status, user_id)
VALUES 
  ('uuid-1', 'Task 1', 'Description', 'todo', 'user-uuid'),
  ('uuid-2', 'Task 2', 'Description', 'done', 'user-uuid');

-- Import items
INSERT INTO items (id, name, shop_id, user_id)
VALUES
  ('uuid-1', 'Milk', 'shop-uuid', 'user-uuid');

-- etc...
```

### Via API

```bash
curl -X POST http://localhost:8000/rest/v1/tasks \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Imported task","status":"inbox"}'
```

---

## Differences

### localStorage
- Local browser storage
- No sync between devices
- No authentication
- Data lost on cache clear

### Supabase
- PostgreSQL database
- Real-time sync
- Multi-user authentication
- Persistent data
- Backup/restore support

---

**That's it!** 🚀

Your data is now in Supabase!
