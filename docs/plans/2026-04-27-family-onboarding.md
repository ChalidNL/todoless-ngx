# Family + Onboarding Improvements — Implementation Plan

**Goal:** Families als hoofd-entiteit toevoegen, onboarding verbeteren met family setup stap, flag-systeem voor admin registratie blokkeren na setup, invite API consistent maken.

**Architecture:**
- Nieuwe `families` PocketBase collectie. Users krijgen `family_id` field.
- Admin onboarding krijgt extra stap: family naam invoeren.
- `setup_complete` flag (al aanwezig in `app_settings`) bepaalt of admin registratie mogelijk is.
- Als `setup_complete = true` en niet ingelogd: toon onboarding als info (doorklikken), dan login.

**Tech Stack:** React 18 + TypeScript, PocketBase 0.34, Vite

---

## Task 1: Migration 009 — families collectie + family_id op users

**Files:**
- Create: `pb_migrations/009_families.js`

```js
migrate(
  (app) => {
    const familiesCollection = new Collection({
      name: 'families',
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: 'created_by = @request.auth.id',
      deleteRule: 'created_by = @request.auth.id',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'created_by', type: 'relation', collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1, required: true },
      ],
    });
    app.save(familiesCollection);

    // Add family_id to users
    const users = app.findCollectionByNameOrId('_pb_users_auth_');
    users.fields.add(new Field({
      name: 'family_id',
      type: 'relation',
      collectionId: familiesCollection.id,
      cascadeDelete: false,
      maxSelect: 1,
      required: false,
    }));
    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_');
    const field = users.fields.getByName('family_id');
    if (field) {
      users.fields.remove(field);
      app.save(users);
    }
    try {
      const families = app.findCollectionByNameOrId('families');
      app.delete(families);
    } catch (_) {}
  }
);
```

---

## Task 2: Types — Family interface toevoegen

**Files:**
- Modify: `src/types/index.ts`

Voeg toe:
```ts
export interface Family {
  id: string;
  name: string;
  created_by: string;
  created: string;
  updated: string;
}
```

---

## Task 3: API client — family CRUD + register update

**Files:**
- Modify: `src/lib/pocketbase-client.ts`

Voeg toe aan de `api` export:
```ts
// Family
async createFamily(name: string, createdBy: string): Promise<Family> {
  return await pb.collection('families').create({ name, created_by: createdBy });
},

async getFamilyById(id: string): Promise<Family> {
  return await pb.collection('families').getOne(id);
},

async updateUserFamily(userId: string, familyId: string): Promise<void> {
  await pb.collection('users').update(userId, { family_id: familyId });
},
```

---

## Task 4: Onboarding — family naam stap toevoegen (admin mode)

**Files:**
- Modify: `src/components/Onboarding.tsx`

Wijzigingen:
1. Voeg `familyName` state toe: `const [familyName, setFamilyName] = useState('');`
2. In admin mode: voeg een extra stap toe vóór het account aanmaken met een tekstveld "Jullie familienaam" (bv. "De Jansen Familie")
3. Na account aanmaken: `await api.createFamily(familyName, newUser.id)` → `await api.updateUserFamily(newUser.id, family.id)`
4. Voeg `mode: 'info'` toe als derde optie: toont dezelfde slides maar het laatste scherm heeft een "Ga naar inloggen" knop i.p.v. een registratieformulier

---

## Task 5: onboarding-gate.ts — setup_complete check

**Files:**
- Modify: `src/lib/onboarding-gate.ts`

```ts
export type OnboardingMode = 'admin' | 'user' | 'info' | 'none';

export function getOnboardingMode({
  hasUsers,
  isAuthenticated,
  hasUserSeenOnboarding,
  setupComplete,
}: {
  hasUsers: boolean;
  isAuthenticated: boolean;
  hasUserSeenOnboarding: boolean;
  setupComplete: boolean;
}): OnboardingMode {
  if (!hasUsers) return 'admin';
  if (!isAuthenticated) {
    if (setupComplete) return 'info'; // setup gedaan, toon info + ga naar login
    return 'none'; // ga naar login
  }
  if (!hasUserSeenOnboarding) return 'user';
  return 'none';
}
```

---

## Task 6: App.tsx — info mode + setup_complete ophalen

**Files:**
- Modify: `src/App.tsx`

1. Haal `setup_complete` op uit `app_settings` (unauthenticated fetch als de app de status checkt)
2. Geef `setupComplete` door aan `getOnboardingMode()`
3. Voeg `'info'` toe aan screen states en render `<Onboarding mode="info" />`

---

## Task 7: Commit + push + deploy

```bash
git add pb_migrations/009_families.js src/types/index.ts src/lib/pocketbase-client.ts src/components/Onboarding.tsx src/lib/onboarding-gate.ts src/App.tsx
git commit -m "feat: family as root entity, onboarding family step, setup_complete flag gates admin registration"
git push origin main
```

Dan wachten op GitHub Actions build en deployen.
