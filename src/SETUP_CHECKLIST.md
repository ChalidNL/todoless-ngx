# Setup Checklist - Todoless

## Initial Setup

- [ ] Copy `.env.example` to `.env`
- [ ] Generate JWT tokens (`node scripts/generate-jwt.js`)
- [ ] Set `POSTGRES_PASSWORD` in `.env`
- [ ] Start services (`docker-compose up -d`)
- [ ] Check all containers running (`docker ps`)
- [ ] Access app at http://localhost:3000
- [ ] Complete onboarding flow

---

## Security

- [ ] Change default passwords
- [ ] Strong `POSTGRES_PASSWORD` (20+ chars)
- [ ] Keep `SERVICE_ROLE_KEY` secret
- [ ] Don't expose database port externally
- [ ] Use firewall rules
- [ ] Regular backups enabled

---

## Production (Optional)

### SSL/TLS
- [ ] Domain name configured
- [ ] SSL certificate (Let's Encrypt)
- [ ] HTTPS redirect enabled

### Reverse Proxy
- [ ] Nginx/Caddy/Traefik configured
- [ ] Headers set correctly
- [ ] WebSocket proxy enabled

### Backups
- [ ] Automated daily backups
- [ ] Backup retention policy
- [ ] Test restore procedure
- [ ] Off-site backup storage

### Monitoring
- [ ] Health checks configured
- [ ] Log aggregation
- [ ] Alert system
- [ ] Uptime monitoring

### Performance
- [ ] Database indexes optimized
- [ ] Connection pooling enabled
- [ ] Resource limits set
- [ ] CDN for static assets (optional)

---

## CasaOS Specific

- [ ] Import `docker-compose.yml`
- [ ] Set environment variables in UI
- [ ] Check all containers started
- [ ] Test from CasaOS dashboard
- [ ] Configure remote access (optional)

---

**That's it!** ✅
