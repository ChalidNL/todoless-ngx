# ✅ Checklist Before Git Push

## 📋 Pre-Push Checklist

### 1. Maak Scripts Executable
```bash
chmod +x scripts/setup.sh
chmod +x scripts/migrate.sh
chmod +x scripts/git-prepare.sh
chmod +x Makefile.tmp

# Verplaats Makefile.tmp naar Makefile
mv Makefile.tmp Makefile
```

### 2. Verwijder Sensitive Data
```bash
# Check of .env NIET in git zit
git status | grep .env

# Als .env in staged files staat:
git reset .env

# Check .gitignore
cat .gitignore | grep "^\.env$"
```

### 3. Verwijder node_modules (indien aanwezig)
```bash
# Deze moet NIET in git
rm -rf node_modules
echo "node_modules/" >> .gitignore
```

### 4. Check Temporary/Build Directories
```bash
# Verwijder als aanwezig
rm -rf dist/
rm -rf build/
rm -rf .supabase/
rm -rf backups/
```

### 5. Check Environment Template
```bash
# Zorg dat .env.example bestaat
ls -la .env.example

# Check dat deze GEEN echte secrets bevat
cat .env.example | grep -E "(PASSWORD|SECRET|KEY)"
# Moet placeholders zijn, geen echte waarden!
```

### 6. Verwijder Lokale Test Data
```bash
# Als je test backups hebt
rm -f backup.json
rm -f *.sql
rm -f *.sql.gz
```

## 🔍 Final Checks

### Run Git Prepare Script
```bash
./scripts/git-prepare.sh
```

Dit script checkt automatisch:
- ✅ .env is niet in git
- ✅ .gitignore is correct
- ✅ Geen sensitive files
- ✅ Scripts zijn executable

### Manual Verification
```bash
# Check wat in git commit komt
git add .
git status

# Check voor sensitive data
git diff --cached | grep -i password
git diff --cached | grep -i secret
git diff --cached | grep -i key

# Als je iets vindt dat er niet in mag:
git reset <filename>
```

## 📤 Ready to Push

### Option A: Via Script
```bash
./scripts/git-prepare.sh
# Follow prompts
```

### Option B: Manual
```bash
# Stage all
git add .

# Review what's staged
git status

# Commit
git commit -m "Complete Todoless with Supabase self-hosted backend

- Multi-user task management
- Supabase self-hosted stack (10 services)
- Real-time sync via WebSockets
- Complete Docker setup
- Full documentation
- CasaOS compatible"

# Add remote (choose one):
# GitHub:
git remote add origin https://github.com/USERNAME/todoless.git

# GitLab:
git remote add origin https://gitlab.com/USERNAME/todoless.git

# Gitea:
git remote add origin https://your-gitea.com/USERNAME/todoless.git

# Push
git branch -M main
git push -u origin main
```

## ✅ Final Safety Checks

### What SHOULD be in Git:
- ✅ Source code (.tsx, .ts files)
- ✅ Documentation (.md files)
- ✅ Docker configs (docker-compose.yml)
- ✅ Scripts (setup.sh, migrate.sh, etc.)
- ✅ Database migrations (.sql)
- ✅ Config templates (.env.example)
- ✅ .gitignore
- ✅ README.md
- ✅ Makefile

### What should NOT be in Git:
- ❌ .env (only .env.example!)
- ❌ node_modules/
- ❌ .supabase/ directory
- ❌ backups/ directory
- ❌ dist/ or build/
- ❌ *.log files
- ❌ Real passwords/tokens
- ❌ Database dumps (.sql, .sql.gz)
- ❌ backup.json

## 🔐 Security Verification

```bash
# Search for potential secrets in staged files
git grep -i "password.*=" -- '*.yml' '*.yaml' '*.env*'
git grep -i "secret.*=" -- '*.yml' '*.yaml' '*.env*'
git grep -i "token.*=" -- '*.yml' '*.yaml' '*.env*'

# If you find any real values, replace with placeholders!
```

## 📊 Size Check

```bash
# Check total size
du -sh .

# Check git size
du -sh .git

# If .git is > 100MB, you might have committed large files
# Check what's taking space:
git count-objects -vH
```

## 🎯 After Successful Push

1. ✅ Verify on GitHub/GitLab that files are correct
2. ✅ Check that .env is NOT visible
3. ✅ Test clone in fresh directory:
   ```bash
   cd /tmp
   git clone <your-repo-url>
   cd todoless
   ls -la  # Check files
   cat .env  # Should NOT exist
   cat .env.example  # Should exist
   ```

## 🏠 Next: Import to CasaOS

See: **CASAOS_GUIDE.md** or **PUSH_TO_GIT.txt**

```bash
# Quick steps:
# 1. SSH to CasaOS
# 2. git clone <your-repo>
# 3. cp .env.example .env
# 4. Edit .env
# 5. ./scripts/setup.sh
```

---

**Ready?** Run: `./scripts/git-prepare.sh`
