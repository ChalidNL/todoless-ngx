# Regression test plan (onboarding/auth/app_settings/task-create)

## Goal and scope
Goal: prevent regressions on the 4 highest-risk flows:
1. **Onboarding flow** (first run + localStorage status)
2. **Auth flow** (login/register/invite)
3. **App settings singleton per user**
4. **Task create flow**

Scope is sprint-ready and aligned with the current stack (React + Vite + Vitest + PocketBase + GitHub Actions).

## Risk-driven priorities
- **P0 (release blocker):** user cannot login/register, onboarding loop, app_settings race/fail, task create fails.
- **P1 (high):** wrong role/access, invite not consumed correctly, settings update inconsistent.
- **P2 (medium):** edge cases, error messages, UX verification.

---

## 1) Test matrix (priority, owner, automation)

| ID | Domain | Scenario | Priority | Type | Owner | Automation | Gate |
|---|---|---|---|---|---|---|---|
| REG-ONB-01 | Onboarding | First run + 0 users => onboarding visible | P0 | E2E | FE owner + QA | Playwright | PR + Main |
| REG-ONB-02 | Onboarding | Onboarding completed => no onboarding-loop (localStorage key) | P0 | E2E | FE owner | Playwright | PR |
| REG-ONB-03 | Onboarding/Auth | `/api/health` fail/403 fallback => login/app path correct | P1 | Integration | FE owner | Vitest (fetch mocks) | PR |
| REG-AUTH-01 | Auth | Login success + token/authStore valid | P0 | Unit/Integration | FE owner | Existing Vitest + extension | PR |
| REG-AUTH-02 | Auth | First user register => role=admin | P0 | Unit/Contract | FE+BE owner | Vitest contract checks | PR |
| REG-AUTH-03 | Auth | Non-first user without invite => hard fail | P0 | Unit/Contract | FE+BE owner | Vitest (existing, hardened) | PR |
| REG-AUTH-04 | Auth | Valid invite => user created + invite marked used | P0 | Unit/Contract + E2E | FE+BE + QA | Vitest + Playwright | PR + Main |
| REG-SET-01 | app_settings | `getSettings` creates default record when missing | P0 | Unit/Integration | FE owner | Vitest | PR |
| REG-SET-02 | app_settings | Concurrency race: 2 parallel calls => 1 record/user | P0 | Integration/Contract | BE owner | Vitest + migration check | Main |
| REG-SET-03 | app_settings | Update settings on existing record works idempotently | P1 | Unit/Integration | FE owner | Vitest | PR |
| REG-TASK-01 | Task create | Authenticated user can create task | P0 | Unit/Integration + E2E | FE owner + QA | Vitest + Playwright | PR + Main |
| REG-TASK-02 | Task create | Payload mapping (`due_date`, `assigned_to`, `labels`) correct | P0 | Contract | FE+BE owner | Vitest payload assertions | PR |
| REG-TASK-03 | Task create | Error path shows toast + no silent fail | P1 | Unit/UI | FE owner | Vitest RTL | PR |
| REG-SEC-01 | Authorization | User sees only own tasks/settings (filter on user.id) | P0 | Contract/Integration | BE owner | Vitest contract checks | Main |

**Owner definitions (roles):**
- **FE owner:** owner of frontend flows/tests
- **BE owner:** owner of PocketBase schema/rules/migrations
- **QA:** owner of e2e regression set + release smoke

---

## 2) Critical E2E scenarios (minimal smoke set)

## P0 smoke (always on PR)
1. **First-run onboarding happy path**
   - Start with empty users
   - Onboarding visible
   - Complete onboarding
   - App starts without loop
2. **Invite registration flow**
   - Admin generates invite
   - Register with invite
   - Invite becomes `used=true`
   - New user can login
3. **Login + task create**
   - Login with existing user
   - Create task with basic fields
   - Task visible in Tasks/Inbox
4. **Settings persistence**
   - Change settings (e.g. language/theme)
   - Refresh page
   - Value persists

## P1 extended (main/nightly)
5. Health endpoint error/fallback path
6. Parallel browser tabs: settings race-condition behavior
7. Register without invite on non-empty install must block

---

## 3) API contract checks (focused on regression risk)

Add contract checks in `src/lib/__tests__/pocketbase-client.test.ts` (split per domain):

1. **Health / boot contracts**
   - `GET /api/health` expects JSON response and status handling in App.tsx.
2. **Users existence contract**
   - `GET /api/collections/users/records?perPage=1`
   - When `totalItems===0` => first-user path.
3. **Invite validation contract**
   - `GET /api/collections/invite_codes/records?...&code=...&fields=id,code`
   - Invalid response => `Invalid or expired invite code`.
4. **Invite consume contract**
   - After successful non-first registration: `invite_codes.update(invite.id, { used, used_by, used_at })`.
5. **app_settings singleton contract**
   - `getSettings()` must use at most one record per user.
   - Race path: create fail -> retry list -> return existing record.
6. **Task create payload contract**
   - Verify mapping of frontend fields to PB fields (`sprint_id`, `due_date`, `is_private`, etc.).
7. **Data isolation contract**
   - Filters for user-bound collections remain exactly `user.id = "<id>"`.

---

## 4) Automation strategy (sprint-ready)

## Test pyramid
- **Unit/Integration (±80%)**: Vitest (fast, PR gate)
- **E2E smoke (±15%)**: Playwright (critical user journeys)
- **Manual release checks (±5%)**: checklist below

## Implementation order (2 sprints)

### Sprint 1 (must-have)
1. Add Playwright + 4 P0 smoke tests
2. Extend Vitest for app_settings race + task payload contract
3. Extend CI quality gate with e2e smoke job
4. Test data seed script for deterministic runs

### Sprint 2
1. P1 extended e2e
2. Split API contract tests per domain file
3. Nightly full regression suite + reporting

---

## 5) CI gates (concrete)

## PR gate (mandatory, <10 min target)
1. `npm ci`
2. `npm test` (unit/integration)
3. `npm run build`
4. `e2e:smoke` (P0 scenarios)

**Merge policy:** all 4 green, otherwise no merge.

## Main gate
- Everything from PR gate
- + extended contract checks
- + migration validation against clean PocketBase instance

## Nightly
- Full e2e regression set
- Flaky-test detection (rerun 1x, trend logging)

---

## 6) Release checklist (go/no-go)

1. **Migrations**
   - `005_invite_registration_rules` applied
   - `006_app_settings_singleton_per_user` applied
2. **Auth/onboarding smoke manual (5 min)**
   - New install: onboarding appears correctly
   - Existing install: no onboarding loop
3. **Invite flow**
   - Generate invite, register, invite used
4. **Task create**
   - Create new task + visible after refresh
5. **Settings persistence**
   - Change setting and verify persistence
6. **Rollback readiness**
   - Previous image tag and DB backup available

**Go-live criterion:** no open P0/P1 defects on the above 4 risk domains.

---

## 7) Concrete backlog items (directly actionable)

- [ ] QA-101: Playwright setup + `onboarding-first-run.spec.ts`
- [ ] QA-102: `invite-registration.spec.ts`
- [ ] QA-103: `login-task-create.spec.ts`
- [ ] QA-104: `settings-persistence.spec.ts`
- [ ] FE-201: Vitest `getSettings` race test (parallel calls)
- [ ] FE-202: Vitest task payload contract test extension
- [ ] DEVOPS-301: `.github/workflows/quality-gate.yml` extend with e2e smoke job
- [ ] DEVOPS-302: Add nightly regression workflow

## Definition of Done (per item)
- Test fails without fix, passes with fix
- Runs stable 3x in CI
- Documented in regression plan
