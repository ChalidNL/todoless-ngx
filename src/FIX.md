# 🚨 FIX YOUR ERRORS NOW

You have these errors:
```
❌ WebSocket error
❌ Error loading data: SyntaxError: Unexpected token '<', "<!DOCTYPE "...
```

## ⚡ ONE COMMAND TO FIX EVERYTHING

```bash
chmod +x emergency-fix.sh && ./emergency-fix.sh
```

**That's it!** 

⏱️ Takes 3-5 minutes.

---

## What This Does

1. ✅ Fixes Dockerfile (if it's a directory)
2. ✅ Fixes backend/Dockerfile (if it's a directory)
3. ✅ Rebuilds frontend with nginx proxy
4. ✅ Rebuilds backend with WebSocket
5. ✅ Tests everything
6. ✅ Shows you next steps

---

## OR: Test First to See What's Wrong

```bash
chmod +x test-now.sh && ./test-now.sh
```

This will tell you EXACTLY what's broken.

---

## After the Fix

### 1. Create Admin User
```bash
chmod +x scripts/create-admin.sh
./scripts/create-admin.sh admin@local admin123 Admin
```

### 2. Open Browser
```
http://localhost:3000
```

### 3. Login
- Email: `admin@local`
- Password: `admin123`

### 4. Check Browser Console (F12)
Should see:
```
✅ WebSocket connected
```

---

## Why You Have Errors

**The problem:** Your `Dockerfile` and `backend/Dockerfile` are DIRECTORIES instead of FILES.

Docker can't use directories as Dockerfiles, so it's using old cached builds that don't have:
- ❌ Nginx proxy configuration
- ❌ WebSocket endpoint
- ❌ Correct API routing

**The fix:** `emergency-fix.sh` will:
1. Convert directories to proper files
2. Rebuild containers with correct config
3. Test everything

---

## Manual Fix (If Scripts Don't Work)

### Step 1: Check if Dockerfiles are Directories
```bash
ls -la Dockerfile
ls -la backend/Dockerfile
```

If you see `drwx` (directory), that's the problem!

### Step 2: Fix Frontend Dockerfile
```bash
# Remove directory
rm -rf Dockerfile

# Create file
cat > Dockerfile << 'EOF'
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_API_URL=
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
```

### Step 3: Fix Backend Dockerfile
```bash
# Remove directory
rm -rf backend/Dockerfile

# Create file
cat > backend/Dockerfile << 'EOF'
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache wget
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
HEALTHCHECK CMD wget --spider -q http://localhost:4000/api/health || exit 1
CMD ["node", "server.js"]
EOF
```

### Step 4: Rebuild
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Step 5: Wait & Test
```bash
sleep 60
curl http://localhost:3000/api/health
```

Should return JSON, not HTML!

---

## Still Not Working?

### Check Logs
```bash
docker-compose logs -f
```

### Check Container Status
```bash
docker-compose ps
```

All should be "Up", db and backend should be "healthy"

### Test Individual Services
```bash
# Backend direct
curl http://localhost:4000/api/health

# Via proxy
curl http://localhost:3000/api/health

# Should return SAME JSON for both!
```

---

## Quick Commands

```bash
# Fix everything
./emergency-fix.sh

# Test what's wrong
./test-now.sh

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Complete reset (deletes data!)
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## The Root Cause

Your manual edits created **directories** named `Dockerfile` and `backend/Dockerfile` instead of **files**.

This happens when you:
1. Created files in a file manager that doesn't handle Docker well
2. Used an editor that created backup directories
3. Had a sync tool that converted files to directories

The `emergency-fix.sh` script detects this and fixes it automatically.

---

**Just run this:**

```bash
chmod +x emergency-fix.sh && ./emergency-fix.sh
```

**Problem solved!** ✨
