# Quick Start - Todoless

## CasaOS (Easiest)

```
1. Open CasaOS App Store
2. Click "Install a customized app"
3. Upload docker-compose.yml
4. Done!
```

Access: `http://your-casaos-ip:3000`

---

## Manual Setup

### 1. Environment

```bash
cp .env.example .env
nano .env
```

### 2. Generate JWT Tokens

```bash
node scripts/generate-jwt.js $(openssl rand -base64 32)
```

Copy output to `.env`:
- `JWT_SECRET`
- `ANON_KEY`
- `SERVICE_ROLE_KEY`

### 3. Set Password

Edit `.env`:
```bash
POSTGRES_PASSWORD=your-strong-password-here
```

### 4. Start

```bash
docker-compose up -d
```

### 5. Access

- **App:** http://localhost:3000
- **Studio:** http://localhost:3010
- **API:** http://localhost:8000

---

## First Login

1. Open http://localhost:3000
2. Follow onboarding
3. Create admin account
4. Generate invite codes (Settings)
5. Done!

---

## Troubleshooting

**Containers won't start:**
```bash
docker-compose logs
```

**Port conflicts:**
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

**Reset everything:**
```bash
docker-compose down -v
docker-compose up -d
```

---

**That's it!** 🎉
