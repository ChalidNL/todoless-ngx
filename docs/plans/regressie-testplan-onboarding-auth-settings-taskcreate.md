# Regressie testplan (onboarding/auth/app_settings/task-create)

## Doel en scope
Doel: regressies voorkomen op de 4 hoogste-risico stromen:
1. **Onboarding flow** (eerste run + localStorage status)
2. **Auth flow** (login/register/invite)
3. **App settings singleton per user**
4. **Task create flow**

Scope is sprint-ready en sluit aan op de huidige stack (React + Vite + Vitest + PocketBase + GitHub Actions).

## Risico-gedreven prioriteiten
- **P0 (release blocker):** user kan niet inloggen/registreren, onboarding-loop, app_settings race/fail, task create faalt.
- **P1 (hoog):** verkeerde rol/toegang, invite niet correct geconsumeerd, settings update inconsistent.
- **P2 (middel):** edge-cases, foutmeldingen, UX-verificatie.

---

## 1) Testmatrix (prioriteit, owner, automation)

| ID | Domein | Scenario | Prioriteit | Type | Owner | Automatisering | Gate |
|---|---|---|---|---|---|---|---|
| REG-ONB-01 | Onboarding | Eerste run + 0 users => onboarding zichtbaar | P0 | E2E | FE owner + QA | Playwright | PR + Main |
| REG-ONB-02 | Onboarding | Onboarding afgerond => geen onboarding-loop (localStorage key) | P0 | E2E | FE owner | Playwright | PR |
| REG-ONB-03 | Onboarding/Auth | `/api/health` fail/403 fallback => login/app pad correct | P1 | Integratie | FE owner | Vitest (fetch mocks) | PR |
| REG-AUTH-01 | Auth | Login succes + token/authStore valid | P0 | Unit/Integratie | FE owner | Bestaande Vitest + uitbreiding | PR |
| REG-AUTH-02 | Auth | Eerste user register => role=admin | P0 | Unit/Contract | FE+BE owner | Vitest contract checks | PR |
| REG-AUTH-03 | Auth | Niet-eerste user zonder invite => hard fail | P0 | Unit/Contract | FE+BE owner | Vitest (bestaat, hardenen) | PR |
| REG-AUTH-04 | Auth | Geldige invite => user aangemaakt + invite marked used | P0 | Unit/Contract + E2E | FE+BE + QA | Vitest + Playwright | PR + Main |
| REG-SET-01 | app_settings | `getSettings` maakt default record wanneer ontbreekt | P0 | Unit/Integratie | FE owner | Vitest | PR |
| REG-SET-02 | app_settings | Concurrency race: 2 parallel calls => 1 record/user | P0 | Integratie/Contract | BE owner | Vitest + migratie-check | Main |
| REG-SET-03 | app_settings | Update settings bij bestaand record werkt idempotent | P1 | Unit/Integratie | FE owner | Vitest | PR |
| REG-TASK-01 | Task create | Authenticated user kan task aanmaken | P0 | Unit/Integratie + E2E | FE owner + QA | Vitest + Playwright | PR + Main |
| REG-TASK-02 | Task create | Payload mapping (`due_date`, `assigned_to`, `labels`) correct | P0 | Contract | FE+BE owner | Vitest payload assertions | PR |
| REG-TASK-03 | Task create | Foutpad toont toast + geen silent fail | P1 | Unit/UI | FE owner | Vitest RTL | PR |
| REG-SEC-01 | Autorisatie | User ziet alleen eigen tasks/settings (filter op user.id) | P0 | Contract/Integratie | BE owner | Vitest contract checks | Main |

**Owner-definities (rollen):**
- **FE owner:** eigenaar frontend flows/tests
- **BE owner:** eigenaar PocketBase schema/rules/migraties
- **QA:** eigenaar e2e regressieset + release smoke

---

## 2) Kritieke E2E-scenario’s (minimal smoke set)

## P0 smoke (altijd op PR)
1. **First-run onboarding happy path**
   - Start met lege users
   - Onboarding zichtbaar
   - Onboarding afronden
   - App start zonder loop
2. **Invite registration flow**
   - Admin genereert invite
   - Register met invite
   - Invite wordt `used=true`
   - Nieuwe user kan inloggen
3. **Login + task create**
   - Login met bestaande user
   - Task aanmaken met basisvelden
   - Task zichtbaar in Tasks/Inbox
4. **Settings persistence**
   - Settings wijzigen (bijv. language/theme)
   - Refresh pagina
   - Waarde blijft behouden

## P1 extended (main/nightly)
5. Health endpoint error/fallback pad
6. Parallel browser tabs: settings race-condition gedrag
7. Register zonder invite op niet-lege installatie moet blokkeren

---

## 3) API contract checks (gericht op regressierisico)

Contract-checks toevoegen in `src/lib/__tests__/pocketbase-client.test.ts` (en opsplitsen per domein):

1. **Health / boot contracts**
   - `GET /api/health` verwacht JSON response en status handling in App.tsx.
2. **Users existence contract**
   - `GET /api/collections/users/records?perPage=1`
   - Bij `totalItems===0` => first-user pad.
3. **Invite validation contract**
   - `GET /api/collections/invite_codes/records?...&code=...&fields=id,code`
   - Ongeldige response => `Invalid or expired invite code`.
4. **Invite consume contract**
   - Na succesvolle non-first registration: `invite_codes.update(invite.id, { used, used_by, used_at })`.
5. **app_settings singleton contract**
   - `getSettings()` mag per user maximaal één record gebruiken/aanmaken.
   - Race pad: create fail -> retry list -> existing record returnen.
6. **Task create payload contract**
   - Verifieer mapping van frontend velden naar PB velden (`sprint_id`, `due_date`, `is_private`, etc.).
7. **Data isolation contract**
   - Filters voor user-gebonden collecties blijven exact op `user.id = "<id>"`.

---

## 4) Automation-strategie (sprint-ready)

## Testpiramide
- **Unit/Integratie (±80%)**: Vitest (snel, PR gate)
- **E2E smoke (±15%)**: Playwright (kritieke user journeys)
- **Handmatige release checks (±5%)**: checklist hieronder

## Implementatievolgorde (2 sprints)

### Sprint 1 (must-have)
1. Playwright toevoegen + 4 P0 smoke tests
2. Vitest uitbreiden voor app_settings race + task payload contract
3. CI quality gate uitbreiden met e2e smoke job
4. Testdata seed-script voor deterministische runs

### Sprint 2
1. P1 extended e2e
2. API contract tests opsplitsen per domeinbestand
3. Nightly volledige regressiesuite + rapportage

---

## 5) CI gates (concreet)

## PR gate (verplicht, <10 min target)
1. `npm ci`
2. `npm test` (unit/integratie)
3. `npm run build`
4. `e2e:smoke` (P0 scenarios)

**Merge policy:** alle 4 groen, anders geen merge.

## Main gate
- Alles van PR gate
- + extended contract checks
- + migratie-validatie tegen schone PocketBase instance

## Nightly
- Volledige e2e regressieset
- Flaky-test detectie (rerun 1x, trend logging)

---

## 6) Release checklist (go/no-go)

1. **Migrations**
   - `005_invite_registration_rules` toegepast
   - `006_app_settings_singleton_per_user` toegepast
2. **Auth/onboarding smoke handmatig (5 min)**
   - Nieuwe install: onboarding verschijnt correct
   - Bestaande install: geen onboarding-loop
3. **Invite flow**
   - Invite genereren, registreren, invite gebruikt
4. **Task create**
   - Nieuwe task aanmaken + zichtbaar na refresh
5. **Settings persistence**
   - Wijzig setting en verifieer persist
6. **Rollback readiness**
   - Vorige image-tag en DB backup beschikbaar

**Go-live criterium:** geen open P0/P1 defects op bovenstaande 4 risicodomeinen.

---

## 7) Concrete backlog-items (direct planbaar)

- [ ] QA-101: Playwright setup + `onboarding-first-run.spec.ts`
- [ ] QA-102: `invite-registration.spec.ts`
- [ ] QA-103: `login-task-create.spec.ts`
- [ ] QA-104: `settings-persistence.spec.ts`
- [ ] FE-201: Vitest `getSettings` race test (parallel calls)
- [ ] FE-202: Vitest task payload contract test uitbreiden
- [ ] DEVOPS-301: `.github/workflows/quality-gate.yml` uitbreiden met e2e smoke job
- [ ] DEVOPS-302: nightly regression workflow toevoegen

## Definition of Done (per item)
- Test faalt zonder fix, slaagt met fix
- Draait stabiel 3x achter elkaar in CI
- Gedocumenteerd in regressieplan
