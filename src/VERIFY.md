# ✅ Verification Checklist

Run these commands to verify everything is correct:

## 1. Check Dockerfiles

```bash
# Should show FILES, not directories
ls -la Dockerfile backend/Dockerfile

# Expected output:
# -rw-r--r-- ... Dockerfile
# -rw-r--r-- ... backend/Dockerfile
```

✅ Both should be regular files, NOT directories

## 2. Check Environment Files

```bash
ls -la .env* | grep -v node_modules
```

Expected files:
- ✅ `.env.example` - Template
- ✅ `.env.development` - Dev mode (VITE_API_URL=http://localhost:4000)
- ✅ `.env.production` - Production (VITE_API_URL=)
- ⚠️ `.env` - Your config (create from .env.example)

## 3. Check Scripts

```bash
ls -la *.sh
```

Expected scripts:
- ✅ `setup.sh` - Main setup
- ✅ `fix-errors.sh` - Error fixer
- ✅ `diagnose.sh` - Diagnostic
- ✅ `start.sh` - Production start
- ✅ `dev.sh` - Development start
- ✅ `health-check.sh` - Health check
- ✅ `generate-invite.sh` - Invite codes
- ✅ `build.sh` - Build images

All should be executable (`-rwxr-xr-x`)

## 4. Check Docker Compose Files

```bash
ls -la docker-compose*.yml
```

Expected files:
- ✅ `docker-compose.yml` - Production
- ✅ `docker-compose.dev.yml` - Development

## 5. Check Configuration Files

```bash
# Nginx config
cat nginx.conf | grep -A 5 "location /api"
cat nginx.conf | grep -A 5 "location /ws"

# Vite config
cat vite.config.ts | grep -A 10 "proxy"
```

Should show:
- ✅ Nginx proxies `/api/` to backend
- ✅ Nginx proxies `/ws` to backend with WebSocket upgrade
- ✅ Vite proxies `/api` and `/ws` in dev mode

## 6. Quick Test

### Test Docker Compose:

```bash
# Build
docker-compose build

# Check images exist
docker images | grep todoless-ngx

# Expected:
# todoless-ngx-frontend   latest   ...
# todoless-ngx-backend    latest   ...
```

### Test Development Mode:

```bash
# Check .env.development
cat .env.development

# Expected:
# VITE_API_URL=http://localhost:4000

# Check vite.config.ts
cat vite.config.ts | grep -A 15 "server:"

# Should show proxy config
```

## 7. Verify No Wrong Locations

```bash
# These should NOT exist (they're wrong locations)
ls -la Dockerfile/main.tsx 2>/dev/null
ls -la backend/Dockerfile/main.tsx 2>/dev/null

# Expected: "No such file or directory"
```

## 8. Test Scripts Work

```bash
# Make executable
chmod +x *.sh

# Test diagnostic (doesn't start anything)
./diagnose.sh

# Should show current status without errors
```

## Full Verification Script

Run this to check everything at once:

```bash
#!/bin/bash

echo "🔍 Verification Check"
echo "===================="
echo ""

# Check files
echo "1. Dockerfiles:"
[ -f Dockerfile ] && echo "  ✅ /Dockerfile" || echo "  ❌ /Dockerfile missing"
[ -f backend/Dockerfile ] && echo "  ✅ /backend/Dockerfile" || echo "  ❌ /backend/Dockerfile missing"
[ -d Dockerfile ] && echo "  ❌ /Dockerfile is a directory (WRONG!)"
[ -d backend/Dockerfile ] && echo "  ❌ /backend/Dockerfile is a directory (WRONG!)"

echo ""
echo "2. Environment files:"
[ -f .env.example ] && echo "  ✅ .env.example" || echo "  ❌ .env.example missing"
[ -f .env.development ] && echo "  ✅ .env.development" || echo "  ❌ .env.development missing"
[ -f .env.production ] && echo "  ✅ .env.production" || echo "  ❌ .env.production missing"
[ -f .env ] && echo "  ✅ .env" || echo "  ⚠️  .env missing (create from .env.example)"

echo ""
echo "3. Scripts:"
for script in setup.sh fix-errors.sh diagnose.sh start.sh dev.sh health-check.sh generate-invite.sh build.sh; do
    [ -f "$script" ] && echo "  ✅ $script" || echo "  ❌ $script missing"
done

echo ""
echo "4. Docker Compose:"
[ -f docker-compose.yml ] && echo "  ✅ docker-compose.yml" || echo "  ❌ docker-compose.yml missing"
[ -f docker-compose.dev.yml ] && echo "  ✅ docker-compose.dev.yml" || echo "  ❌ docker-compose.dev.yml missing"

echo ""
echo "5. Config files:"
[ -f nginx.conf ] && echo "  ✅ nginx.conf" || echo "  ❌ nginx.conf missing"
[ -f vite.config.ts ] && echo "  ✅ vite.config.ts" || echo "  ❌ vite.config.ts missing"

echo ""
echo "6. .dockerignore:"
[ -f .dockerignore ] && echo "  ✅ .dockerignore" || echo "  ❌ .dockerignore missing"
[ -f backend/.dockerignore ] && echo "  ✅ backend/.dockerignore" || echo "  ❌ backend/.dockerignore missing"

echo ""
echo "===================="

# Count issues
issues=0
[ ! -f Dockerfile ] && ((issues++))
[ ! -f backend/Dockerfile ] && ((issues++))
[ -d Dockerfile ] && ((issues++))
[ -d backend/Dockerfile ] && ((issues++))
[ ! -f .env.development ] && ((issues++))
[ ! -f .env.production ] && ((issues++))

if [ $issues -eq 0 ]; then
    echo "✅ All checks passed!"
    echo ""
    echo "Ready to run:"
    echo "  ./setup.sh     - For automatic setup"
    echo "  ./start.sh     - For production"
    echo "  ./dev.sh       - For development"
else
    echo "❌ Found $issues issue(s)"
    echo ""
    echo "Run this to fix:"
    echo "  ./setup.sh"
fi
```

Save this as `verify.sh` and run:

```bash
chmod +x verify.sh
./verify.sh
```

## Expected Result

```
🔍 Verification Check
====================

1. Dockerfiles:
  ✅ /Dockerfile
  ✅ /backend/Dockerfile

2. Environment files:
  ✅ .env.example
  ✅ .env.development
  ✅ .env.production
  ⚠️  .env missing (create from .env.example)

3. Scripts:
  ✅ setup.sh
  ✅ fix-errors.sh
  ✅ diagnose.sh
  ✅ start.sh
  ✅ dev.sh
  ✅ health-check.sh
  ✅ generate-invite.sh
  ✅ build.sh

4. Docker Compose:
  ✅ docker-compose.yml
  ✅ docker-compose.dev.yml

5. Config files:
  ✅ nginx.conf
  ✅ vite.config.ts

6. .dockerignore:
  ✅ .dockerignore
  ✅ backend/.dockerignore

====================
✅ All checks passed!

Ready to run:
  ./setup.sh     - For automatic setup
  ./start.sh     - For production
  ./dev.sh       - For development
```

## If Verification Fails

Run the setup script to fix everything:

```bash
./setup.sh
```

This will:
1. Fix Dockerfile locations
2. Create missing environment files
3. Create .dockerignore files
4. Make scripts executable
5. Start the app

## Next Steps After Verification

1. **If using Docker Compose:**
   ```bash
   ./start.sh
   ./generate-invite.sh
   # Open http://localhost:3000
   ```

2. **If developing locally:**
   ```bash
   ./dev.sh
   # Then start backend and frontend manually
   ```

3. **Check health:**
   ```bash
   ./health-check.sh
   ```
