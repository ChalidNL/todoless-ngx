# 🚀 START HIER - Git Push & CasaOS Import

## ⚡ Snelle Instructies

### Stap 1️⃣: Voorbereiden (in je huidige development omgeving)

```bash
# Maak scripts executable
chmod +x scripts/*.sh

# Verplaats Makefile
mv Makefile.tmp Makefile
chmod +x Makefile

# Run git prepare script
./scripts/git-prepare.sh
```

Het script zal automatisch:
- ✅ Checken op sensitive files
- ✅ Git initialiseren (als nodig)
- ✅ Tonen wat gecommit wordt
- ✅ Vragen of je wilt committen
- ✅ Pushen naar remote (als geconfigureerd)

### Stap 2️⃣: Push naar Git

Als het script een remote detecteert, push automatisch.

Anders:
```bash
# Voeg remote toe (kies een):
git remote add origin https://github.com/USERNAME/todoless.git

# Push
git push -u origin main
```

### Stap 3️⃣: Import in CasaOS

**SSH naar je CasaOS server:**
```bash
ssh user@your-casaos-ip
```

**Clone repository:**
```bash
cd /DATA/AppData
git clone https://github.com/USERNAME/todoless.git
cd todoless
```

**Setup:**
```bash
# Kopieer environment template
cp .env.example .env

# Edit .env (BELANGRIJK!)
nano .env
```

**Vul in .env IN:**
```bash
POSTGRES_PASSWORD=<kies-sterk-wachtwoord>
JWT_SECRET=<wordt-gegenereerd>
ANON_KEY=<wordt-gegenereerd>
SERVICE_ROLE_KEY=<wordt-gegenereerd>
```

**Genereer JWT tokens:**
```bash
node scripts/generate-jwt.js $(openssl rand -base64 32)
```

Kopieer de output naar je `.env` file!

**Run setup:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Of gebruik docker-compose direct:**
```bash
# Met de hoofd docker-compose.yml (bevat alle services!)
docker-compose up -d

# Of met de supabase variant (identiek)
docker-compose -f docker-compose.supabase.yml up -d
```

### Stap 4️⃣: Verificatie

```bash
# Check containers
docker ps

# Check logs
docker-compose -f docker-compose.supabase.yml logs

# Test app
curl http://localhost:3000
```

### Stap 5️⃣: Open de App! 🎉

- **App:** http://your-casaos-ip:3000
- **Studio:** http://your-casaos-ip:3010
- **API:** http://your-casaos-ip:8000

---

## 📚 Meer Informatie

| Als je wilt... | Lees dit bestand |
|----------------|------------------|
| Quick start (5 min) | [QUICKSTART.md](QUICKSTART.md) |
| Gedetailleerde CasaOS setup | [CASAOS_GUIDE.md](CASAOS_GUIDE.md) |
| Git push instructies | [GIT_PUSH.md](GIT_PUSH.md) |
| Pre-push checklist | [TODO_BEFORE_PUSH.md](TODO_BEFORE_PUSH.md) |
| Alle commando's | [COMMANDS.md](COMMANDS.md) |
| Supabase info | [README_SUPABASE.md](README_SUPABASE.md) |
| Docker info | [README_DOCKER.md](README_DOCKER.md) |
| API & URLs | [ACCESS.md](ACCESS.md) |

---

## ⚠️ BELANGRIJK

**Voor je pusht naar Git:**
- ❌ Geen `.env` file (alleen `.env.example`)
- ❌ Geen `node_modules/`
- ❌ Geen `.supabase/` directory
- ❌ Geen passwords/secrets in code
- ✅ Alleen source code & documentatie

**Run altijd eerst:**
```bash
./scripts/git-prepare.sh
```

---

## 🆘 Problemen?

**Script werkt niet:**
```bash
# Check file exists
ls -la scripts/git-prepare.sh

# Make executable
chmod +x scripts/git-prepare.sh

# Run
./scripts/git-prepare.sh
```

**"Permission denied":**
```bash
chmod +x scripts/*.sh
```

**"node: command not found" op CasaOS:**
```bash
# Install Node.js
docker run --rm -it node:20-alpine sh
```

**Meer hulp:**
- Check [CASAOS_GUIDE.md](CASAOS_GUIDE.md) - Troubleshooting sectie
- Check [README_SUPABASE.md](README_SUPABASE.md) - Complete docs

---

## ✅ Alles Klaar?

**Nu kun je:**

1. **Push naar git:**
   ```bash
   ./scripts/git-prepare.sh
   ```

2. **Clone op CasaOS en setup:**
   ```bash
   cd /DATA/AppData
   git clone <your-repo>
   cd todoless
   ./scripts/setup.sh
   ```

3. **Start using Todoless! 🎉**

---

**Succes!** 🚀