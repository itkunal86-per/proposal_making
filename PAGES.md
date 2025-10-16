# Pages Documentation (Concise)

Only the essentials for each page: Role, Purpose, UI Component, Action.

## Home
- Role: Public
- Purpose: Explain product value; CTAs
- UI Component: Index (client/pages/Index.tsx)
- Action: Read features, Open CTAs

## Get Started
- Role: Public
- Purpose: Entry to demo/onboarding
- UI Component: GetStarted (client/pages/GetStarted.tsx)
- Action: Launch Demo, Back to Home

## Login
- Role: Public (auth entry)
- Purpose: Authenticate user
- UI Component: Login (client/pages/Login.tsx)
- Action: Validate form, Sign in, Remember me, Navigate to Reset/Register

## Reset Password
- Role: Public
- Purpose: Collect email for reset flow
- UI Component: Reset (client/pages/Reset.tsx)
- Action: Enter email, Request reset link

## Register
- Role: Public
- Purpose: Create tenant/account (UI only)
- UI Component: Register (client/pages/Register.tsx)
- Action: Enter details, Submit registration

## Public Proposal View
- Role: Public (tokenized)
- Purpose: Read‑only proposal view and print
- UI Component: ProposalView (client/pages/ProposalView.tsx)
- Action: View sections/media/pricing, Print/PDF

## Accept Invite
- Role: Public (tokenized)
- Purpose: Accept/activate invite locally
- UI Component: AcceptInvite (client/pages/AcceptInvite.tsx)
- Action: Validate token, Activate user, Go to Login/Dashboard

## Admin Dashboard
- Role: Admin
- Purpose: Analytics overview
- UI Component: Dashboard (client/pages/Dashboard.tsx)
- Action: Change date presets, Auto‑refresh, View charts/metrics

## Admin Users
- Role: Admin
- Purpose: Manage user list (demo)
- UI Component: AdminUsers (client/pages/AdminUsers.tsx)
- Action: Search, Add user, View table

## Admin Packages
- Role: Admin
- Purpose: Manage package catalog
- UI Component: AdminPackages (client/pages/AdminPackages.tsx)
- Action: Load list, Create package, Refresh, Validate inputs

## Admin Templates
- Role: Admin
- Purpose: Manage proposal templates
- UI Component: AdminTemplates (client/pages/AdminTemplates.tsx)
- Action: Search/filter/paginate, New template, Preview, Edit, Duplicate, Export PDF, Delete

## Admin Settings
- Role: Admin
- Purpose: Org‑level settings
- UI Component: AdminSettings (client/pages/AdminSettings.tsx)
- Action: Edit fields, Toggle invites, Save changes

## My Proposals
- Role: Subscriber
- Purpose: Manage own proposals
- UI Component: MyProposals (client/pages/MyProposals.tsx)
- Action: Search, Create, Edit, Duplicate, Delete, Paginate

## My Clients
- Role: Subscriber
- Purpose: Manage client directory
- UI Component: MyClients (client/pages/MyClients.tsx)
- Action: Search, Filter by status, Add, Edit, Delete

## Subscriber Settings
- Role: Subscriber
- Purpose: Profile, CRM, and subscription
- UI Component: SubscriberSettings (client/pages/SubscriberSettings.tsx)
- Action: Edit/save profile, Test CRM, Sync now, Change plan

## Proposal Editor
- Role: Authenticated (admin or subscriber)
- Purpose: Author proposals
- UI Component: ProposalEditor (client/pages/ProposalEditor.tsx)
- Action: Edit titles/content, Manage sections/media, AI actions, Comment, Version restore

## Proposal Settings
- Role: Authenticated (admin or subscriber)
- Purpose: Configure proposal metadata
- UI Component: ProposalSettings (client/pages/ProposalSettings.tsx)
- Action: Edit general/pricing/approval, Enable/disable sharing, Copy link

## Not Found
- Role: Public
- Purpose: 404 fallback
- UI Component: NotFound (client/pages/NotFound.tsx)
- Action: Return to home
