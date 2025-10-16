# API Documentation

This document covers all HTTP API endpoints exposed by the project server.

Notes
- Base path: All public endpoints use the /api prefix. In development, an additional non-prefixed alias exists for /auth/login.
- Content-Type: Use application/json for request and response bodies unless stated otherwise.


## 1) GET /api/ping
- Purpose: Health check / simple ping
- Request
  - Query: none
  - Body: none
- Response 200
```json
{ "message": "ping" }
```
Notes: message value may be overridden via the PING_MESSAGE environment variable.


## 2) GET /api/demo
- Purpose: Demo endpoint
- Request
  - Query: none
  - Body: none
- Response 200 (DemoResponse)
```json
{ "message": "Hello from Express server" }
```


## 3) POST /api/auth/login
Alias: POST /auth/login (development alias)  
- Purpose: Returns a demo JWT-like token for provided credentials
- Request (JSON body)
```json
{
  "email": "user@example.com",
  "password": "string (min 6 chars)",
  "remember": true
}
```
Validation: email must be a valid email; password min 6 chars; remember optional boolean.
- Success Response 200 (LoginResponse)
```json
{
  "token": "<header>.<payload>.<signature>",
  "user": { "email": "user@example.com" }
}
```
- Error Response 400
```json
{
  "error": "Invalid credentials payload",
  "issues": {
    "fieldErrors": {
      "email": ["..."],
      "password": ["..."],
      "remember": ["..."]
    },
    "formErrors": []
  }
}
```


## 4) GET /api/analytics
- Purpose: Returns synthetic analytics totals and a daily revenue time series
- Request
  - Query parameters (all required):
    - start: string (YYYY-MM-DD)
    - end: string (YYYY-MM-DD)
  - Body: none
- Success Response 200 (AnalyticsResponse)
```json
{
  "totals": {
    "proposals": 0,
    "accepted": 0,
    "declined": 0,
    "activeClients": 0,
    "aiTokens": 0,
    "revenue": 0
  },
  "series": [
    { "date": "2024-01-01", "revenue": 1234 }
  ]
}
```
- Error Response 400
```json
{ "error": "Invalid date range" }
```


## 5) POST /api/integrations/ghl/test
- Purpose: Server-side validation of GoHighLevel credentials (no external call)
- Request
  - Headers (required):
    - x-ghl-key: string (API key)
    - x-ghl-location: string (Location ID)
  - Body: none
- Success Response 200
```json
{ "ok": true }
```
- Error Response 400
```json
{ "ok": false, "error": "Invalid API key" }
```
(or)
```json
{ "ok": false, "error": "Location ID required" }
```


## 6) POST /api/integrations/ghl/sync
- Purpose: Acknowledge a sync request with simple numeric stats
- Request (JSON body)
```json
{ "clients": 10, "proposals": 25 }
```
Values must be numbers or numeric strings.
- Success Response 200
```json
{ "ok": true, "clients": 10, "proposals": 25 }
```
- Error Response 400
```json
{ "ok": false, "error": "Invalid payload" }
```


## Deployment routing (Netlify)
All /api/* routes are proxied to the serverless function handler by Netlify configuration in ./netlify.toml.


---

# Front-end Service Layer (temporary static data)

Until the Laravel backend is connected, the app uses typed services that read/write localStorage and seed from public JSON files under ./public/data. These services will be swapped to real HTTP calls later with the same interfaces.

General behavior
- Seed data endpoints (read-only):
  - Users: GET /data/users.json
  - Clients: GET /data/clients.json
  - Proposals: GET /data/proposals.json
  - Packages: GET /data/packages.json
- Persistence: localStorage keeps mutations in the browser between reloads
- Validation: All services validate payloads with zod before persisting

## UsersService (client/services/usersService.ts)
- listUsers(): Promise<UserRecord[]>
- createUser(input: { name; email; role?; company?; password? }): Promise<UserRecord>
- updateUser(user: UserRecord): Promise<void>
- deleteUser(id: string): Promise<void>
Schemas
```ts
interface UserRecord { id: string; name: string; email: string; password: string; role: 'admin'|'subscriber'; company?: string; createdAt: number }
```
Data source: /data/users.json → localStorage key: app_users

## ClientsService (client/services/clientsService.ts)
- listClients(): Promise<ClientRecord[]>
- createClient(input: { name; email; company?; status? }): Promise<ClientRecord>
- updateClient(rec: ClientRecord): Promise<void>
- deleteClient(id: string): Promise<void>
Schemas
```ts
interface ClientRecord { id: string; name: string; email: string; company?: string; status: 'active'|'inactive'; createdAt: number; updatedAt: number }
```
Data source: /data/clients.json → localStorage key: app_clients

## ProposalsService (client/services/proposalsService.ts)
- listProposals(): Promise<Proposal[]>
- getProposal(id: string): Promise<Proposal|undefined>
- getProposalByToken(token: string): Promise<Proposal|undefined>
- createProposal(partial?: Partial<Proposal>): Promise<Proposal>
- updateProposal(proposal: Proposal, opts?: { keepVersion?: boolean; note?: string }): Promise<void>
- deleteProposal(id: string): Promise<void>
- duplicateProposal(id: string): Promise<Proposal|undefined>
- toggleShare(proposal: Proposal, makePublic: boolean): Promise<Proposal>
- addComment(proposal: Proposal, sectionId: string, author: string, text: string): Promise<void>
- reorderSection(proposal: Proposal, from: number, to: number): Promise<void>
- addSection(proposal: Proposal, title?: string): Promise<void>
- removeSection(proposal: Proposal, id: string): Promise<void>
- valueTotal(proposal: Proposal): number
Schemas
```ts
interface Proposal { id: string; title: string; client: string; status: 'draft'|'sent'|'accepted'|'declined'; createdBy: string; createdAt: number; updatedAt: number; sections: Section[]; pricing: { currency: string; items: Item[]; taxRate: number }; settings: { dueDate?: string; approvalFlow?: string; sharing: { public: boolean; token?: string; allowComments: boolean } }; versions: Snapshot[] }
```
Data source: /data/proposals.json → localStorage key: app_proposals

## PackageService (client/services/packageService.ts)
- listPackages(): Promise<PackagePlan[]>
- createPackage(input: CreatePackageInput): Promise<PackagePlan>
Schemas
```ts
interface PackagePlan { id: string; code: string; name: string; description: string; price: number; currency: string; billingCycle: 'monthly'|'yearly'; features: string[]; isPopular: boolean; status: 'active'|'inactive'; createdAt: string }
```
Data source: /data/packages.json → localStorage key: proposal-ai.packages

## AnalyticsService (client/services/analyticsService.ts)
- getAnalytics({ start, end }): Promise<AnalyticsResponse>
Backend endpoint used: GET /api/analytics (see section above)

Migration plan to Laravel
- Replace fetch endpoints to your Laravel API and keep function signatures
- Remove localStorage persistence once real CRUD is implemented
- Keep zod validation to enforce payload contracts on the client side
