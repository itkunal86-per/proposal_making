# Pages and Routes Documentation

This document describes the functionality, access control, data dependencies, and navigation for every page in this app.

## Routing overview

Router: client/App.tsx (React Router 6)

Guards: client/components/auth/RouteGuards.tsx
- RequireAuth: redirects unauthenticated users to /login and preserves intended destination in state
- RequireRole: restricts access by role; fallback is /dashboard (admin) or /my/proposals (subscriber)

Top-level routes:
- Public
  - / → Index (client/pages/Index.tsx)
  - /get-started → GetStarted (client/pages/GetStarted.tsx)
  - /login → Login (client/pages/Login.tsx)
  - /reset → Reset (client/pages/Reset.tsx)
  - /register → Register (client/pages/Register.tsx)
  - /p/:token → ProposalView (client/pages/ProposalView.tsx)
  - /invite/:token → AcceptInvite (client/pages/AcceptInvite.tsx)
  - * → NotFound (client/pages/NotFound.tsx)
- Authenticated
  - Any role
    - /proposals/:id/edit → ProposalEditor (client/pages/ProposalEditor.tsx)
    - /proposals/:id/settings → ProposalSettings (client/pages/ProposalSettings.tsx)
  - Admin only
    - /dashboard → Dashboard (client/pages/Dashboard.tsx)
    - /admin/users → AdminUsers (client/pages/AdminUsers.tsx)
    - /admin/packages → AdminPackages (client/pages/AdminPackages.tsx)
    - /admin/templates → AdminTemplates (client/pages/AdminTemplates.tsx)
    - /admin/settings → AdminSettings (client/pages/AdminSettings.tsx)
  - Subscriber only
    - /my/proposals → MyProposals (client/pages/MyProposals.tsx)
    - /my/clients → MyClients (client/pages/MyClients.tsx)
    - /my/settings → SubscriberSettings (client/pages/SubscriberSettings.tsx)

Roles come from client/data/users.ts and are enforced client-side via the AuthProvider and RouteGuards.

## Pages

### 1) Home (Index)
- Path: /
- Access: Public
- File: client/pages/Index.tsx
- Purpose: Marketing/landing page explaining the AI‑powered proposal platform; CTAs to Login and feature anchors.
- Key UI: Hero, How it works, Features, CTA; no data dependencies.

### 2) Get Started
- Path: /get-started
- Access: Public
- File: client/pages/GetStarted.tsx
- Purpose: Simple onboarding entry; button placeholder to launch a demo; link back to home.
- Data/API: None.

### 3) Login
- Path: /login
- Access: Public (redirects if already authenticated in UX flows)
- File: client/pages/Login.tsx
- Purpose: Email/password sign‑in using AuthProvider.
- Behavior:
  - Validates email/password locally; calls useAuth().signIn(); on success toasts and redirects:
    - If redirected from guard: location.state.from
    - Else: /dashboard (admin) or /my/proposals (subscriber)
- Data/API: Client-side auth via client/lib/auth.ts and client/providers/AuthProvider.tsx; users from client/data/users.ts.

### 4) Reset password
- Path: /reset
- Access: Public
- File: client/pages/Reset.tsx
- Purpose: Collect email to send reset link (UI only).
- Data/API: None (no network call yet).

### 5) Register
- Path: /register
- Access: Public
- File: client/pages/Register.tsx
- Purpose: Create tenant/account form (UI only).
- Data/API: None (no network call yet).

### 6) Public Proposal View
- Path: /p/:token
- Access: Public (tokenized)
- File: client/pages/ProposalView.tsx
- Purpose: Read‑only client view of a proposal, with optional print/PDF.
- Behavior:
  - Loads proposal by share token via getProposalByToken(token)
  - If query ?print=1, triggers window.print() after 500ms
  - Renders sections, media, and pricing summary
- Data: client/lib/proposalsStore.ts (localStorage: key "app_proposals")

### 7) Accept Invite
- Path: /invite/:token
- Access: Public (tokenized)
- File: client/pages/AcceptInvite.tsx
- Purpose: Accept an org/user invite and activate account locally.
- Behavior:
  - Reads localStorage "app_invites" and "app_users"
  - Verifies token + expiry; marks user active, removes invite; shows status (ok/invalid/expired)
- Data: localStorage keys app_invites, app_users (managed within the page)

### 8) Admin Dashboard
- Path: /dashboard
- Access: Authenticated, role: admin
- File: client/pages/Dashboard.tsx
- Purpose: Analytics overview with time‑range presets and auto‑refresh.
- Behavior:
  - Fetches /api/analytics?start=YYYY-MM-DD&end=YYYY-MM-DD
  - Auto‑refreshes every 10s; renders totals and revenue area chart (recharts)
- Data/API: GET /api/analytics (server/routes/analytics.ts)

### 9) Admin Users
- Path: /admin/users
- Access: Authenticated, role: admin
- File: client/pages/AdminUsers.tsx
- Purpose: Manage users list (demo data), simple client‑side add and filter.
- Behavior: Filter by query; prompt‑based add; toasts feedback.
- Data: In‑memory state seeded from client/data/users.ts.

### 10) Admin Packages
- Path: /admin/packages
- Access: Authenticated, role: admin
- File: client/pages/AdminPackages.tsx
- Purpose: View and configure package catalog; persists to localStorage; fetches seed from public/data.
- Behavior:
  - Lists packages via React Query (client/services/packageService.ts)
  - Create package validates via zod; persists to localStorage
- Data/API:
  - GET /data/packages.json (public file)
  - localStorage key: "proposal-ai.packages"

### 11) Admin Templates
- Path: /admin/templates
- Access: Authenticated, role: admin
- File: client/pages/AdminTemplates.tsx
- Purpose: CRUD over proposal templates (uses same proposal store), quick preview and export.
- Behavior:
  - Search/filter/sort/paginate locally
  - Create → navigates to editor; Duplicate/Delete; Export PDF triggers share link and opens printable view
- Data: client/lib/proposalsStore.ts (localStorage: key "app_proposals")

### 12) Admin Settings
- Path: /admin/settings
- Access: Authenticated, role: admin
- File: client/pages/AdminSettings.tsx
- Purpose: Org‑level config stored locally.
- Data: localStorage key: "admin_settings"

### 13) My Proposals
- Path: /my/proposals
- Access: Authenticated, role: subscriber
- File: client/pages/MyProposals.tsx
- Purpose: List and manage proposals owned by the current user.
- Behavior: Create (seeds defaults), Edit, Duplicate, Delete, search, paginate.
- Data: client/lib/proposalsStore.ts (localStorage: key "app_proposals")

### 14) My Clients
- Path: /my/clients
- Access: Authenticated, role: subscriber
- File: client/pages/MyClients.tsx
- Purpose: Manage personal client directory.
- Behavior: Add/Edit/Delete clients; filter by status and search; dialogs for add/edit.
- Data: client/lib/clientsStore.ts (localStorage: key "app_clients")

### 15) Subscriber Settings
- Path: /my/settings
- Access: Authenticated, role: subscriber
- File: client/pages/SubscriberSettings.tsx
- Purpose: Profile, CRM integration (GoHighLevel), and subscription settings.
- Behavior:
  - Saves profile and CRM settings to localStorage per user
  - Test connection → POST /api/integrations/ghl/test with headers x-ghl-key and x-ghl-location
  - Sync now → counts local proposals/clients and POSTs to /api/integrations/ghl/sync
  - Plan selection saved locally
- Data/API:
  - localStorage key: subscriber_settings_{user.id}
  - POST /api/integrations/ghl/test, POST /api/integrations/ghl/sync (server/routes/ghl.ts)

### 16) Proposal Editor
- Path: /proposals/:id/edit
- Access: Authenticated (any role)
- File: client/pages/ProposalEditor.tsx
- Purpose: Full proposal authoring with sections, media, AI actions, comments, versions, and totals.
- Behavior:
  - Loads proposal by id from store; autosaves with 400ms debounce via updateProposal
  - Manage sections (add/reorder/remove), titles, rich text (textarea), media embeds
  - AI Assistant buttons simulate generate/rewrite/summarize/translate and keep a version snapshot
  - Comment on a section (stored per section)
  - Version restore to any snapshot
  - Navigation links to settings and back to list
- Data: client/lib/proposalsStore.ts

### 17) Proposal Settings
- Path: /proposals/:id/settings
- Access: Authenticated (any role)
- File: client/pages/ProposalSettings.tsx
- Purpose: Configure general, pricing, approval, and sharing.
- Behavior:
  - Update fields directly into store
  - Sharing: toggles public link; on enable copies /p/{token} to clipboard
  - Shows live total via valueTotal()
- Data: client/lib/proposalsStore.ts

### 18) Not Found
- Path: *
- Access: Public
- File: client/pages/NotFound.tsx
- Purpose: 404 screen; logs attempted path to console error; link back home.

## Data stores and keys
- Proposals: client/lib/proposalsStore.ts → localStorage key "app_proposals"
- Clients: client/lib/clientsStore.ts → localStorage key "app_clients"
- Auth session: client/lib/auth.ts → local/session storage key "proposal_ai_auth_user"
- Admin Settings: client/pages/AdminSettings.tsx → localStorage key "admin_settings"
- Subscriber Settings: client/pages/SubscriberSettings.tsx → localStorage key "subscriber_settings_{user.id}"
- Invite/Users (accept flow): client/pages/AcceptInvite.tsx → localStorage keys "app_invites", "app_users"
- Packages: client/services/packageService.ts → localStorage key "proposal-ai.packages"; seed at public/data/packages.json

## Server endpoints used
- GET /api/analytics → Admin Dashboard (server/routes/analytics.ts)
- POST /api/integrations/ghl/test → Subscriber Settings (server/routes/ghl.ts)
- POST /api/integrations/ghl/sync → Subscriber Settings (server/routes/ghl.ts)
- Other demo APIs: /api/ping, /api/demo, /api/auth/login exist but are not bound directly in pages above.

## Navigation patterns
- Auth redirects preserve intended destination via RouteGuards.
- Editor/Settings cross‑link each other; templates/proposals lists link into editor; public view allows print.

## Notes
- All persistence is client‑side (localStorage) unless explicitly calling server endpoints above.
- Seeding occurs on first access to proposals/clients/packages if no data is present.
- Role model: "admin" and "subscriber" only.
