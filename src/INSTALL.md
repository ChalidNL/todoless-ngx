# Install Todoless

## CasaOS

```
1. App Store
2. "Install customized app"
3. Upload docker-compose.yml
4. Start
```

Done! → http://your-ip:3000

---

## Docker

```bash
cp .env.example .env
node scripts/generate-jwt.js $(openssl rand -base64 32)
# Copy output to .env
docker-compose up -d
```

Done! → http://localhost:3000

---

## First Login

1. Open app
2. Follow onboarding
3. Create admin account
4. Generate invite codes

---

**That's it!** 🚀
