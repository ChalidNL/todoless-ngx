# 🧪 ONBOARDING TESTEN MET POSTGRESQL

## ✅ JA! Je Kunt Nu Testen!

---

## ⚡ QUICK START

### Optie 1: Automatische Test (Aanbevolen)

```bash
chmod +x test-onboarding.sh
./test-onboarding.sh
```

Dit test **alles automatisch**:
- ✅ Start services als nodig
- ✅ Checkt database schema
- ✅ Genereert invite code
- ✅ Test registration API
- ✅ Verifieert user in database
- ✅ Test authenticated API calls

### Optie 2: Manuele Test

```bash
# 1. Start services
./RUN-THIS-NOW.sh

# 2. Generate invite
docker-compose exec backend node -e "console.log(Math.random().toString().slice(2,8))"

# 3. Open browser
http://localhost/

# 4. Test onboarding!
```

---

## 📋 Wat Je Ziet

### 1. Services Starten

```
🔥 ULTIMATE FIX 🔥

Step 1: Cleaning up old containers...
✅ Containers stopped

Step 2: Removing directory conflicts...
✅ Conflicts removed

Step 3: Verifying Dockerfiles...
✅ Dockerfile.frontend is a FILE
✅ Dockerfile.backend is a FILE

Step 4: Creating .env...
✅ Created .env with secure passwords

Step 5: Building fresh images...
✅ Images built

Step 6: Starting services...
✅ Services started

⏳ Waiting 60 seconds...
[Progress bar]

✅ Backend is responding
✅ Frontend is serving
✅ Database is ready

🎉 FIX COMPLETE! 🎉
```

### 2. Database Schema

PostgreSQL creates deze tables automatisch:

```sql
-- Users table (for onboarding)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tasks, Items, Notes, Labels, Sprints, etc.
-- All created automatically!
```

Check met:
```bash
docker-compose exec db psql -U todoless -d todoless -c "\dt"
```

Output:
```
          List of relations
 Schema |    Name    | Type  |  Owner   
--------+------------+-------+----------
 public | users      | table | todoless
 public | tasks      | table | todoless
 public | items      | table | todoless
 public | notes      | table | todoless
 public | labels     | table | todoless
 public | sprints    | table | todoless
 public | invites    | table | todoless
```

---

## 🎯 Onboarding Flow Test

### Stap 1: Open Onboarding Page

```
http://localhost/
```

Je ziet:

```
┌────────────────────────────────────┐
│       TODOLESS-NGX                 │
│                                    │
│  📧 Email                           │
│  [_____________________]           │
│                                    │
│  🔑 Password                        │
│  [_____________________]           │
│                                    │
│  👤 Name                            │
│  [_____________________]           │
│                                    │
│  🎫 Invite Code                     │
│  [______]                          │
│                                    │
│       [ Register ]                 │
│                                    │
│  Already have account? Login       │
│                                    │
└────────────────────────────────────┘
```

### Stap 2: Generate Invite Code

```bash
docker-compose exec backend node -e "console.log(Math.random().toString().slice(2,8))"
```

Output bijvoorbeeld: `847293`

### Stap 3: Register Test User

Fill in:
- **Email:** `test@example.com`
- **Password:** `TestPassword123!`
- **Name:** `Test User`
- **Invite Code:** `847293`

Click **Register**

### Stap 4: Verify in PostgreSQL

```bash
# Check user is created
docker-compose exec db psql -U todoless -d todoless -c "SELECT * FROM users;"
```

Output:
```
 id |      email       |    name    |     password (hashed)      | created_at 
----+------------------+------------+----------------------------+------------
  1 | test@example.com | Test User  | $2a$10$xxxxxxxxxxxxx... | 2026-03-14
```

### Stap 5: Login

Na registratie wordt je automatisch ingelogd en zie je:

```
┌────────────────────────────────────────────────────────────┐
│  TODOLESS-NGX                    👤 Test User    [Logout]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🔍 Search or add task... @user #label //date             │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📥 Inbox    📋 Tasks    🛒 Items    📝 Notes    📅 Cal    │
│                                                            │
│  [Your tasks will appear here]                            │
│                                                            │
│  No tasks yet. Create your first task!                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔍 Database Verification Commands

### Check All Users

```bash
docker-compose exec db psql -U todoless -d todoless -c "
  SELECT id, email, name, created_at 
  FROM users 
  ORDER BY created_at DESC;
"
```

### Check User Count

```bash
docker-compose exec db psql -U todoless -d todoless -c "
  SELECT COUNT(*) as total_users FROM users;
"
```

### Check User's Tasks

```bash
docker-compose exec db psql -U todoless -d todoless -c "
  SELECT t.id, t.title, t.status, u.email as owner
  FROM tasks t
  JOIN users u ON t.user_id = u.id
  ORDER BY t.created_at DESC;
"
```

### Check All Tables Are Created

```bash
docker-compose exec db psql -U todoless -d todoless -c "
  SELECT tablename 
  FROM pg_tables 
  WHERE schemaname = 'public';
"
```

---

## 🧪 Test Scenarios

### Test 1: Basic Registration

```bash
# Automated test
./test-onboarding.sh
```

Checks:
- ✅ Can generate invite code
- ✅ Can register new user
- ✅ User appears in database
- ✅ Password is hashed
- ✅ Can login with credentials
- ✅ JWT token is generated

### Test 2: Duplicate Email

Try registering with same email twice:

1. Register: `test@example.com`
2. Try again: `test@example.com`

Expected: ❌ Error "Email already exists"

### Test 3: Invalid Invite Code

Try registering with wrong invite:

- Invite: `000000` (wrong)

Expected: ❌ Error "Invalid invite code"

### Test 4: Multi-User

Register 3 users:

```bash
# User 1
Email: user1@test.com
Invite: [generate new]

# User 2  
Email: user2@test.com
Invite: [generate new]

# User 3
Email: user3@test.com
Invite: [generate new]
```

Verify in database:
```bash
docker-compose exec db psql -U todoless -d todoless -c "SELECT * FROM users;"
```

Should show 3 users.

### Test 5: Private Labels

After registration:

1. User 1: Create label "🔒 Private" (mark private)
2. User 2: Login → Should NOT see User 1's private label
3. User 1: Create task with private label
4. User 2: Should NOT see that task

---

## 📊 PostgreSQL Connection Info

### Connection Details

```
Host:     localhost (from host machine)
Host:     db (from Docker containers)
Port:     5432 (internal only, NOT exposed to host!)
Database: todoless
User:     todoless
Password: [random generated in .env]
```

### Connect with psql

```bash
# From host (via Docker)
docker-compose exec db psql -U todoless -d todoless

# Interactive session
todoless=# \dt              -- List tables
todoless=# \d users         -- Show users table structure
todoless=# SELECT * FROM users;
todoless=# \q               -- Quit
```

### Connect with GUI Tool

Since database is NOT exposed to host, use port forwarding:

```bash
# Temporarily expose port
docker-compose -f docker-compose.test.yml up -d
```

Or create temporary connection:
```bash
docker-compose exec db pg_dump -U todoless todoless > backup.sql
# Then restore to local PostgreSQL for GUI access
```

---

## 🎨 Frontend Component Testing

### Onboarding Component Location

```
/components/Register.tsx      - Registration form
/components/Login.tsx         - Login form
/components/Onboarding.tsx    - Onboarding flow (if exists)
/components/AuthProvider.tsx  - Authentication logic
```

### Test in Browser DevTools

Open browser console (F12):

```javascript
// Check if API is reachable
fetch('http://localhost:4000/api/health')
  .then(r => r.json())
  .then(console.log)

// Expected: {status: "ok", database: "connected"}

// Test registration API
fetch('http://localhost:4000/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
    invite_code: '847293'
  })
})
.then(r => r.json())
.then(console.log)

// Expected: {token: "xxx", user: {...}}
```

---

## 🔄 Reset and Test Again

### Quick Reset (Keep Structure)

```bash
# Delete all users
docker-compose exec db psql -U todoless -d todoless -c "TRUNCATE users CASCADE;"

# Restart backend
docker-compose restart backend
```

### Full Reset (Delete Everything)

```bash
# Stop and remove all data
docker-compose down -v

# Start fresh
./RUN-THIS-NOW.sh

# Wait 2 minutes
# Test again!
```

---

## 📈 Performance Testing

### Load Test Onboarding

```bash
# Install Apache Bench (if needed)
# sudo apt-get install apache2-utils

# Test registration endpoint
ab -n 100 -c 10 \
   -p register.json \
   -T application/json \
   http://localhost:4000/api/auth/register
```

Create `register.json`:
```json
{
  "email": "test@example.com",
  "password": "TestPassword123!",
  "name": "Test User",
  "invite_code": "847293"
}
```

### Monitor Database Performance

```bash
# Watch active connections
watch -n 1 'docker-compose exec db psql -U todoless -d todoless -c "SELECT COUNT(*) FROM pg_stat_activity;"'

# Check query performance
docker-compose exec db psql -U todoless -d todoless -c "
  SELECT query, calls, total_time, mean_time 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 10;
"
```

---

## ✅ Success Checklist

### After Running Test

- [ ] Services are running (`docker-compose ps`)
- [ ] Database has schema (`\dt` shows tables)
- [ ] Can generate invite code
- [ ] Can open http://localhost/
- [ ] Registration form loads
- [ ] Can submit registration
- [ ] User appears in database
- [ ] Can login with credentials
- [ ] Dashboard loads after login
- [ ] Can create tasks
- [ ] Data persists in PostgreSQL
- [ ] Real-time updates work

### If All Checked: 🎉 SUCCESS!

---

## 🆘 Troubleshooting

### Issue: "Invalid invite code"

**Check backend logs:**
```bash
docker-compose logs backend | grep invite
```

**Check invite validation:**
```bash
docker-compose exec db psql -U todoless -d todoless -c "SELECT * FROM invites;"
```

### Issue: "Email already exists"

**Check existing users:**
```bash
docker-compose exec db psql -U todoless -d todoless -c "SELECT email FROM users;"
```

**Delete user:**
```bash
docker-compose exec db psql -U todoless -d todoless -c "DELETE FROM users WHERE email='test@example.com';"
```

### Issue: Backend not connecting to database

**Check connection:**
```bash
docker-compose exec backend env | grep DB_
```

**Check database is ready:**
```bash
docker-compose exec db pg_isready -U todoless
```

**Check logs:**
```bash
docker-compose logs backend | grep -i error
docker-compose logs db | grep -i error
```

---

## 📞 Quick Commands

```bash
# Start everything
./RUN-THIS-NOW.sh

# Test onboarding automatically
./test-onboarding.sh

# Generate invite
docker-compose exec backend node -e "console.log(Math.random().toString().slice(2,8))"

# Check database
docker-compose exec db psql -U todoless -d todoless

# View logs
docker-compose logs -f

# Reset everything
docker-compose down -v && ./RUN-THIS-NOW.sh
```

---

## 🎉 KLAAR OM TE TESTEN!

```bash
./test-onboarding.sh
```

**Of open direct:** http://localhost/

**Happy testing!** 🚀
