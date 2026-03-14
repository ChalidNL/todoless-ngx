# Quick Git Push Guide

Stappen om Todoless naar Git te pushen en in CasaOS te importeren.

## 🚀 Stap 1: Voorbereiden voor Git

```bash
# Run preparation script
chmod +x scripts/git-prepare.sh
./scripts/git-prepare.sh

# Of handmatig:
git init
git add .
git commit -m "Initial commit - Todoless with Supabase"
```

## 📤 Stap 2: Push naar Git Repository

### GitHub

```bash
# Create repository on GitHub.com
# Then:

git remote add origin https://github.com/YOUR_USERNAME/todoless.git
git branch -M main
git push -u origin main
```

### GitLab

```bash
git remote add origin https://gitlab.com/YOUR_USERNAME/todoless.git
git branch -M main
git push -u origin main
```

### Gitea (Self-hosted)

```bash
git remote add origin https://your-gitea-server.com/YOUR_USERNAME/todoless.git
git branch -M main
git push -u origin main
```

## 🏠 Stap 3: Import in CasaOS

### Methode A: Clone op CasaOS Server

```bash
# SSH naar CasaOS
ssh user@your-casaos-ip

# Clone repository
cd /DATA/AppData
git clone https://github.com/YOUR_USERNAME/todoless.git
cd todoless

# Setup environment
cp .env.example .env
nano .env  # Edit with your values

# Run setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Methode B: Import Docker Compose in CasaOS UI

1. **Open CasaOS Dashboard:** http://your-casaos-ip
2. **Ga naar App Store**
3. **Klik "Install a customized app"**
4. **Upload `docker-compose.supabase.yml`**
5. **Configureer environment variables in UI**
6. **Klik "Install"**

## ✅ Stap 4: Verificatie

```bash
# Check containers
docker ps

# Check logs
docker-compose -f docker-compose.supabase.yml logs

# Test app
curl http://localhost:3000
```

## 🌐 Stap 5: Open Todoless

- **App:** http://your-casaos-ip:3000
- **Studio:** http://your-casaos-ip:3010
- **API:** http://your-casaos-ip:8000

## 🔄 Toekomstige Updates

```bash
# Op je development machine
git add .
git commit -m "Update description"
git push

# Op CasaOS server
cd /DATA/AppData/todoless
git pull
docker-compose -f docker-compose.supabase.yml up -d --build
```

## ⚡ Quick Commands

```bash
# Complete workflow
./scripts/git-prepare.sh  # Prepare
git push origin main      # Push to git
# Then import in CasaOS

# Or with Makefile
make help  # See all commands
```

## 📋 Checklist

Voor git push:
- [ ] `.env` is NIET in git (alleen `.env.example`)
- [ ] `node_modules/` is in `.gitignore`
- [ ] `.supabase/` is in `.gitignore`
- [ ] `backups/` is in `.gitignore`
- [ ] Alle scripts zijn executable (`chmod +x`)
- [ ] README.md is up-to-date
- [ ] No sensitive data in commits

Voor CasaOS import:
- [ ] `.env` file is aangemaakt
- [ ] JWT tokens zijn gegenereerd
- [ ] Passwords zijn strong
- [ ] Ports zijn beschikbaar (3000, 8000, 3010)
- [ ] Minimaal 2GB RAM beschikbaar
- [ ] Minimaal 5GB disk beschikbaar

## 🆘 Troubleshooting

**"remote: Repository not found"**
- Check repository URL
- Check permissions
- Use HTTPS or SSH consistently

**"Port already in use"**
- Check `docker ps`
- Stop conflicting containers
- Or change ports in docker-compose.yml

**"Permission denied"**
- Run `chmod +x scripts/*.sh`
- Check file ownership
- Run with `sudo` if needed

## 📚 Meer Info

- **Complete CasaOS Guide:** [CASAOS_GUIDE.md](CASAOS_GUIDE.md)
- **Docker Deployment:** [README_DOCKER.md](README_DOCKER.md)
- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)

---

**Ready to push? Run:**
```bash
./scripts/git-prepare.sh
```
