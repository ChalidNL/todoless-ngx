# Todoless-NGX Development Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan phase-by-phase.

**Goal:** Werkend gezinsproduct — tasks, groceries, notes, calendar met multi-user support, quick-add syntax, child rewards, en PWA.

**Architecture:** React 18 + Vite + PocketBase. SPA met bottom nav. Realtime sync via PB subscriptions. Tailwind + Radix UI. Mobile-first PWA.

**Tech Stack:** TypeScript, React 18, Vite 6, PocketBase, Tailwind CSS, Radix UI, Recharts, Lucide icons

**Repo:** `/home/henry/todoless-ngx` on oc-server (192.168.2.150)
**Running:** Frontend :7070, PocketBase :8090 (Docker)

---

## Current State (v0.1.0)

### What works:
- Auth: login, register, invite codes, onboarding
- Tasks: CRUD, backlog/todo/done, sprints, archiving, priorities, horizons
- Items/Groceries: CRUD, shops, quantities
- Notes: CRUD, pinning, linking to tasks/items
- Calendar: events, day/week/month views (627 LOC)
- Settings: theme, language, sprint config, user management, labels, shops
- Labels & filters (basic)
- Real-time sync (PB subscriptions)
- Docker deployment (CasaOS compatible)
- i18n (EN/NL translations)

### What's missing (from Notion requirements):
1. Quick-add syntax — `#label $shop *qty ~linked !!private @assignee //due`
2. Child role UI — role exists but no differentiated UI
3. Rewards & goals system — star/point economy for children
4. PWA — service worker, manifest, offline support
5. Smart routing — URL-based (currently state-only)
6. Dashboard — tablet view with burndown charts
7. Advanced filtering — JQL-style query builder
8. Shared vs private items — field exists but no UI
9. Tests — zero tests exist
10. Error handling — API errors silently swallowed

---

## Phase 1: Foundation & Quick Wins
- 1.1 React Router setup (replace state-based navigation)
- 1.2 Quick-add syntax parser
- 1.3 PWA setup (manifest, service worker, installable)
- 1.4 Private items toggle UI

## Phase 2: Multi-User & Child Features
- 2.1 Role-based permissions (admin/user/child)
- 2.2 Rewards & goals system (new PB collections + UI)
- 2.3 Family shared view (see household tasks/items)

## Phase 3: Dashboard & Advanced Features
- 3.1 Dashboard with burndown charts
- 3.2 Component splitting (Settings 987 LOC, Calendar 627 LOC)
- 3.3 JQL-style advanced filtering
- 3.4 Error handling & loading states

## Phase 4: Integration & Polish
- 4.1 REST API documentation
- 4.2 Vitest setup & core tests
- 4.3 Offline support & sync queue
- 4.4 Final polish (swipe gestures, haptics, dark mode)
