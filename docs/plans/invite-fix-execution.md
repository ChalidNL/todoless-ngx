# Invite-fix release runbook (oc-server / Docker)

Doel: veilige, snelle productie-release met directe rollback-optie.

Scope:
- Host: `oc-server` (`192.168.2.150`)
- Repo: `/opt/data/home/todoless-ngx`
- Containers: `todoless-ngx` (frontend), `todoless-ngx-pocketbase` (PocketBase)
- Compose file: `docker-compose.yml`
- Web endpoint: `http://127.0.0.1:7070/`
- PB health endpoint: `http://127.0.0.1:8090/api/health`

## 1) Precheck (must pass)

```bash
cd /opt/data/home/todoless-ngx

# host/runtime
docker --version
docker compose version

# compose valid
docker compose config --quiet

# containers nu
docker compose ps

docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' | grep -E 'todoless-ngx|todoless-ngx-pocketbase'

# disk voor pull + backup
df -h

# baseline health
curl -fsS http://127.0.0.1:7070/ >/dev/null && echo 'frontend OK'
docker exec todoless-ngx-pocketbase sh -lc "wget -qO- http://127.0.0.1:8090/api/health || curl -fsSL http://127.0.0.1:8090/api/health"

# baseline logs
docker logs --tail 100 todoless-ngx
docker logs --tail 100 todoless-ngx-pocketbase
```

## 2) Backup (verplicht)

Gebruik script:

```bash
cd /opt/data/home/todoless-ngx
bash scripts/deploy-invite-fix.sh --precheck-only
bash scripts/deploy-invite-fix.sh
```

Wat wordt gebackupt:
- `/DATA/AppData/todoless-ngx/pb_data`
- `/DATA/AppData/todoless-ngx/pb_migrations`
- `docker-compose.yml`
- release metadata (`git sha`, actuele images, timestamp)

Backups staan in:
- `/DATA/AppData/todoless-ngx/backups/invite-fix/<timestamp>/`

## 3) Deploy

Standaard rollout (pull + recreate):

```bash
cd /opt/data/home/todoless-ngx
bash scripts/deploy-invite-fix.sh
```

Optioneel met expliciete frontend-image:

```bash
bash scripts/deploy-invite-fix.sh --frontend-image ghcr.io/chalidnl/todoless-ngx:latest
```

## 4) Postcheck

Wordt automatisch gedaan door deploy-script. Handmatig extra check:

```bash
curl -fsS http://127.0.0.1:7070/ >/dev/null && echo 'frontend UP'
docker exec todoless-ngx-pocketbase sh -lc "wget -qO- http://127.0.0.1:8090/api/health || curl -fsSL http://127.0.0.1:8090/api/health"

docker logs --since 20m todoless-ngx 2>&1 | grep -Ei 'error|exception|failed' || true
docker logs --since 20m todoless-ngx-pocketbase 2>&1 | grep -Ei 'error|exception|failed' || true
```

Functionele smoke (kort):
1. Admin kan invite code maken
2. Nieuwe user registreert via invite-link
3. Nieuwe user kan inloggen
4. Invite staat op gebruikt

## 5) Rollback

### Fast rollback (images)

```bash
cd /opt/data/home/todoless-ngx
bash scripts/rollback-invite-fix.sh
```

Dit pakt standaard de laatste backup metadata en zet vorige images terug.

### Rollback + data restore (alleen bij dataprobleem)

```bash
bash scripts/rollback-invite-fix.sh --restore-data
```

Of expliciet backup-dir:

```bash
bash scripts/rollback-invite-fix.sh --backup-dir /DATA/AppData/todoless-ngx/backups/invite-fix/2026-04-21_104500 --restore-data
```

## 6) Beslisregels

Direct rollback bij:
- invite/signup flow stuk in productie
- auth regressie voor bestaande users
- container crashloop / niet healthy
- data-integriteitsproblemen rond invites/users

Release geslaagd als:
- precheck + postcheck groen
- invite smoke groen
- geen kritieke errors in logs (eerste 20 minuten)
