# Invite-fix parallel test- en go-live plan (oc-server / CasaOS)

Doel: invite-flow fix veilig en snel naar productie brengen met duidelijke gates, parallel uitvoering en rollback binnen minuten.

Context:
- Frontend container: `todoless-ngx`
- PocketBase container: `todoless-ngx-pocketbase`
- Compose project: `/opt/data/home/todoless-ngx/docker-compose.yml`
- Productie webpoort: `7070`

---

## 0) Rollen en parallelle werkstromen

Werk in 3 lanes parallel met 1 release-coördinator:

- **Lane A — App/Test (Frontend + invite-flow) [Owner: dev]**
  - Unit/integratie tests
  - Build-validatie
  - Handmatige invite E2E op staging/prod-like

- **Lane B — Platform/Deploy [Owner: ops]**
  - Server preflight
  - Backup van PocketBase data + migrations
  - Image pull / rollout / health checks

- **Lane C — Verificatie/Monitoring [Owner: qa/product]**
  - Post-deploy smoke + invite regressie
  - Logs/metrics check
  - Go/No-Go binnen afgesproken tijdvenster

- **Release coördinator**
  - Beslist Go/No-Go per gate
  - Bewaakt timing + rollback beslisregels

---

## 1) Pre-deploy checks (T-30 tot T-10 min)

## 1.1 Lane A — code + tests

Voer uit in repo:

```bash
cd /opt/data/home/todoless-ngx
git status --short --branch
git rev-parse --short HEAD
npm ci
npm run test
npm run build
```

**Gate A (must-pass):**
- `npm run build` = groen
- invite-gerelateerde tests groen (minimaal `src/lib/__tests__/pocketbase-client.test.ts` invite cases)
- geen onverwachte lokale changes

> Bekend in huidige status: volledige testsuite faalt op 1 test (`first user as admin`) door changed first-user detectie. Nodig: test fixen/mocken óf tijdelijk targetted testset als release-gate expliciet vastleggen.

## 1.2 Lane B — productie preflight op oc-server

```bash
# Systeem + docker check
uname -a
docker --version
docker compose version

# Containers/status
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' | grep -E 'todoless-ngx|todoless-ngx-pocketbase'

# Compose config validatie
cd /opt/data/home/todoless-ngx
docker compose config --quiet

# Schijfruimte (voor backup + nieuwe image)
df -h
```

**Gate B (must-pass):**
- Docker + compose beschikbaar
- beide containers running/stable
- voldoende diskruimte
- compose syntax ok

## 1.3 Lane C — baseline functionele check (voor deployment)

```bash
# Frontend bereikbaar
curl -fsS http://127.0.0.1:7070/ >/dev/null && echo 'frontend OK'

# PocketBase health vanuit container
docker exec todoless-ngx-pocketbase sh -lc "wget -qO- http://127.0.0.1:8090/api/health || curl -fsSL http://127.0.0.1:8090/api/health"

# Laatste logs baseline
docker logs --tail 100 todoless-ngx
docker logs --tail 100 todoless-ngx-pocketbase
```

**Gate C (must-pass):**
- baseline invite-flow werkt op huidige productie (ter vergelijking)
- geen bestaande kritieke errors in logs

---

## 2) Testplan (parallel, vóór go-live)

## 2.1 Geautomatiseerd (Lane A)

Minimaal:

```bash
cd /opt/data/home/todoless-ngx
npx vitest run src/lib/__tests__/pocketbase-client.test.ts -t invite
npm run build
```

Aanbevolen release-gate (na testfix):

```bash
npm run test
npm run build
```

## 2.2 Handmatig invite E2E (Lane C, op staging/prod-like)

Testcases:
1. Admin genereert invite code
2. Registratie met geldige code via `/register?invite=CODE`
3. Registratie met ongeldige code => duidelijke fout
4. Registratie met verlopen/gebruikte code => blokkeren
5. Na succesvolle signup: invite wordt `used=true`, `used_by`, `used_at` gezet
6. Bestaande login flow en niet-invite gebruikers blijven werken

PocketBase validatie (optioneel via API/console):
- `invite_codes` record status correct na signup

---

## 3) Deployplan (T0)

## 3.1 Backup (Lane B) — verplicht vóór rollout

```bash
mkdir -p /DATA/AppData/todoless-ngx/backups/$(date +%F-%H%M)
BACKUP_DIR=/DATA/AppData/todoless-ngx/backups/$(date +%F-%H%M)

# PocketBase data en migrations backup
cp -a /DATA/AppData/todoless-ngx/pb_data "$BACKUP_DIR/"
cp -a /DATA/AppData/todoless-ngx/pb_migrations "$BACKUP_DIR/"

# Optioneel: gecomprimeerd archief
tar -czf "$BACKUP_DIR/pocketbase-backup.tgz" -C /DATA/AppData/todoless-ngx pb_data pb_migrations

echo "Backup gemaakt in: $BACKUP_DIR"
```

## 3.2 Rollout (Lane B)

```bash
cd /opt/data/home/todoless-ngx

# Exacte release vastzetten (optioneel maar sterk aanbevolen)
git rev-parse --short HEAD

# Nieuwe images ophalen
docker compose pull

# Gefaseerd herstarten
docker compose up -d pocketbase
docker compose up -d todoless-ngx

# Status check
docker compose ps
```

## 3.3 Snelle technische health (Lane B + C)

```bash
# Frontend lokaal health
curl -fsS http://127.0.0.1:7070/ >/dev/null && echo 'frontend up'

# PB health vanuit container
docker exec todoless-ngx-pocketbase sh -lc "wget -qO- http://127.0.0.1:8090/api/health || curl -fsSL http://127.0.0.1:8090/api/health"

# Logs (laatste 200)
docker logs --tail 200 todoless-ngx
docker logs --tail 200 todoless-ngx-pocketbase
```

---

## 4) Post-deploy verificatie (T+5 tot T+20 min)

## 4.1 Smoke checks (Lane C)

1. Login bestaand account
2. Invite genereren als admin
3. Nieuwe gebruiker registreren met invite-link
4. Nieuw account kan inloggen
5. Invite staat op gebruikt
6. Regressie quick smoke: tasks laden, dashboard opent, settings opent

## 4.2 Error/log verificatie (Lane B)

```bash
docker logs --since 20m todoless-ngx 2>&1 | grep -Ei 'error|exception|failed' || true
docker logs --since 20m todoless-ngx-pocketbase 2>&1 | grep -Ei 'error|exception|failed' || true
```

**Go-live acceptatiecriteria:**
- invite-flow end-to-end geslaagd
- geen P1/P2 errors in logs
- geen auth regressie

---

## 5) Rollback plan (binnen 10 min uitvoerbaar)

Trigger rollback bij één van:
- signup/invite broken in productie
- auth regressie voor bestaande users
- crashloop / onstabiele container
- data-integriteitsproblemen in `invite_codes`/users

## 5.1 Rollback stappen

1) **Stop nieuwe rollout en terug naar vorige image tag/digest**

```bash
cd /opt/data/home/todoless-ngx
# Zet in docker-compose.yml tijdelijk vorige bewezen image tags
# daarna:
docker compose pull
docker compose up -d
```

2) **Indien nodig data restore (alleen bij datacorruptie)**

```bash
# Voorbeeld: restore uit BACKUP_DIR (pas pad aan)
BACKUP_DIR=/DATA/AppData/todoless-ngx/backups/<timestamp>

# Services kort stoppen voor consistente restore
docker compose stop todoless-ngx-pocketbase

rm -rf /DATA/AppData/todoless-ngx/pb_data
rm -rf /DATA/AppData/todoless-ngx/pb_migrations
cp -a "$BACKUP_DIR/pb_data" /DATA/AppData/todoless-ngx/
cp -a "$BACKUP_DIR/pb_migrations" /DATA/AppData/todoless-ngx/

docker compose up -d todoless-ngx-pocketbase todoless-ngx
```

3) **Rollback verificatie**

```bash
curl -fsS http://127.0.0.1:7070/ >/dev/null && echo 'frontend rollback ok'
docker exec todoless-ngx-pocketbase sh -lc "wget -qO- http://127.0.0.1:8090/api/health || curl -fsSL http://127.0.0.1:8090/api/health"
```

---

## 6) Praktische runbook-timing (voorbeeld)

- **T-30** Start lanes A/B/C parallel
- **T-15** Gates A/B/C review
- **T-10** Backup afgerond + Go-besluit
- **T0** Deploy
- **T+5** Technische health groen
- **T+20** Functionele invite smoke groen => release definitief
- **T+20..T+60** Verhoogde monitoring

---

## 7) Beslislogica (kort)

- **GO**: alle must-pass gates groen
- **NO-GO**: test/build rood of baseline/prod health rood
- **AUTO-ROLLBACK**: P1 auth/invite failure direct na deploy
