# API Documentation

This document covers all HTTP API endpoints exposed by the project server with complete request and response structures.

## Base Configuration
- **Base URL**: `/api/` (all public endpoints)
- **Development Alias**: `/auth/login` (development only)
- **Content-Type**: `application/json` for all requests and responses
- **Port**: 8080 (development)

---

## API Endpoints

### 1) GET /api/ping
Health check endpoint for verifying server availability.

**Request**
- Query Parameters: None
- Body: None
- Headers: None

**Response 200 (Success)**
```json
{
  "message": "ping"
}
```

**Notes**
- Message value can be overridden via `PING_MESSAGE` environment variable
- No error states; always returns 200

**Type Definition**
```typescript
interface PingResponse {
  message: string;
}
```

---

### 2) GET /api/demo
Demo endpoint for testing basic Express server functionality.

**Request**
- Query Parameters: None
- Body: None
- Headers: None

**Response 200 (Success)**
```json
{
  "message": "Hello from Express server"
}
```

**Type Definition**
```typescript
interface DemoResponse {
  message: string;
}
```

---

### 3) POST /api/auth/login
Authenticate user and receive JWT-like token for session management.

**Development Alias**: `POST /auth/login`

**Request**
- Headers: None (Content-Type: application/json assumed)
- Body:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "remember": true
}
```

**Request Validation**
- `email`: Required, must be valid email format
- `password`: Required, minimum 6 characters
- `remember`: Optional, boolean flag to persist session

**Response 200 (Success)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzA0MzM2MDAwLCJleHAiOjE3MDQzNjMwMDB9.signature",
  "user": {
    "email": "user@example.com"
  }
}
```

**Response 400 (Validation Error)**
```json
{
  "error": "Invalid credentials payload",
  "issues": {
    "fieldErrors": {
      "email": ["Invalid email"],
      "password": ["String must contain at least 6 character(s)"],
      "remember": []
    },
    "formErrors": []
  }
}
```

**Type Definitions**
```typescript
interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

interface LoginResponse {
  token: string;
  user: {
    email: string;
  };
}

interface LoginErrorResponse {
  error: string;
  issues: {
    fieldErrors: Record<string, string[]>;
    formErrors: string[];
  };
}
```

---

### 4) GET /api/analytics
Retrieve synthetic analytics data for a specified date range.

**Request**
- Query Parameters:
  - `start`: Required, format `YYYY-MM-DD` (e.g., "2024-01-01")
  - `end`: Required, format `YYYY-MM-DD` (e.g., "2024-12-31")
- Body: None
- Headers: None

**Example Request**
```
GET /api/analytics?start=2024-01-01&end=2024-01-31
```

**Response 200 (Success)**
```json
{
  "totals": {
    "proposals": 450,
    "accepted": 261,
    "declined": 189,
    "activeClients": 85,
    "aiTokens": 54120,
    "revenue": 28540
  },
  "series": [
    {
      "date": "2024-01-01",
      "revenue": 1234
    },
    {
      "date": "2024-01-02",
      "revenue": 1567
    },
    {
      "date": "2024-01-03",
      "revenue": 1892
    }
  ]
}
```

**Response 400 (Invalid Date Range)**
```json
{
  "error": "Invalid date range"
}
```

**Type Definitions**
```typescript
type ISODate = string; // Format: YYYY-MM-DD

interface AnalyticsQuery {
  start: ISODate;
  end: ISODate;
}

interface AnalyticsTotals {
  proposals: number;
  accepted: number;
  declined: number;
  activeClients: number;
  aiTokens: number;
  revenue: number;
}

interface SeriesPoint {
  date: ISODate;
  revenue: number;
}

interface AnalyticsResponse {
  totals: AnalyticsTotals;
  series: SeriesPoint[];
}
```

**Data Generation Notes**
- Data is procedurally generated based on date range
- Uses seeded randomization for consistency
- Baseline revenue: 1200-2000 per day
- Weekly spikes (1.6x multiplier) on certain days
- AI tokens scale with proposal count (~120 tokens per proposal)

---

### 5) POST /api/integrations/ghl/test
Validate GoHighLevel API credentials without making external API calls.

**Request**
- Headers (required):
  - `x-ghl-key`: GoHighLevel API key (minimum 10 characters)
  - `x-ghl-location`: Location ID (non-empty string)
- Body: None
- Content-Type: application/json

**Example Request**
```
POST /api/integrations/ghl/test
Headers:
  x-ghl-key: "your-api-key-here"
  x-ghl-location: "location-id-123"
```

**Response 200 (Credentials Valid)**
```json
{
  "ok": true
}
```

**Response 400 (Invalid API Key)**
```json
{
  "ok": false,
  "error": "Invalid API key"
}
```

**Response 400 (Missing Location ID)**
```json
{
  "ok": false,
  "error": "Location ID required"
}
```

**Type Definitions**
```typescript
interface GhlTestResponse {
  ok: boolean;
  error?: string;
}

interface GhlTestErrorResponse {
  ok: false;
  error: "Invalid API key" | "Location ID required";
}
```

**Security Notes**
- API keys are NOT logged to prevent credential exposure
- Validation is performed on the server side
- No external API calls made at this stage

---

### 6) POST /api/integrations/ghl/sync
Acknowledge a sync request and record client/proposal statistics from GoHighLevel.

**Request**
- Headers: None
- Body:
```json
{
  "clients": 10,
  "proposals": 25
}
```

**Request Validation**
- `clients`: Required, must be a number or numeric string
- `proposals`: Required, must be a number or numeric string

**Response 200 (Success)**
```json
{
  "ok": true,
  "clients": 10,
  "proposals": 25
}
```

**Response 400 (Invalid Payload)**
```json
{
  "ok": false,
  "error": "Invalid payload"
}
```

**Type Definitions**
```typescript
interface GhlSyncRequest {
  clients: number | string;
  proposals: number | string;
}

interface GhlSyncResponse {
  ok: boolean;
  clients?: number;
  proposals?: number;
  error?: string;
}

interface GhlSyncErrorResponse {
  ok: false;
  error: "Invalid payload";
}
```

**Notes**
- Values are coerced to numbers using `Number()`
- Confirms sync acknowledgment from GoHighLevel
- Production implementation should proxy to GoHighLevel API

---

## Netlify Deployment Routing

All `/api/*` routes are automatically proxied to serverless functions via `./netlify.toml` configuration.

```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api:splat"
  status = 200
```

**Serverless Handler**: `netlify/functions/api.ts`

---

## Error Response Patterns

### Standard Error Response
```json
{
  "error": "Human readable error message"
}
```

### Validation Error Response
```json
{
  "error": "Validation error description",
  "issues": {
    "fieldErrors": {
      "fieldName": ["Error message 1", "Error message 2"]
    },
    "formErrors": ["General form error"]
  }
}
```

### Integration Error Response
```json
{
  "ok": false,
  "error": "Integration specific error message"
}
```

---

## HTTP Status Codes

| Code | Meaning | Common Endpoints |
|------|---------|------------------|
| 200 | Success | All endpoints |
| 400 | Bad Request / Validation Error | /auth/login, /analytics, /integrations/* |
| 401 | Unauthorized | (Future auth validation) |
| 404 | Not Found | Invalid route |
| 500 | Server Error | All endpoints |

---

## Client-Side Service Layer

Until the backend is fully connected, the app uses typed services that read/write localStorage and seed from static JSON files.

### Data Sources
- Users: `GET /data/users.json` → localStorage: `app_users`
- Clients: `GET /data/clients.json` → localStorage: `app_clients`
- Proposals: `GET /data/proposals.json` → localStorage: `app_proposals`
- Packages: `GET /data/packages.json` → localStorage: `proposal-ai.packages`

---

### 1) UsersService
Client-side service for managing user records with localStorage persistence.

**Location**: `client/services/usersService.ts`

**Data Types**

```typescript
type UserRole = 'admin' | 'subscriber';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company?: string;
  createdAt: number;
}

type CreateUserInput = {
  name: string;
  email: string;
  role?: UserRole;
  company?: string;
  password?: string;
};
```

**Methods**

#### listUsers()
Returns all stored users, sorted by most recently created.

```typescript
listUsers(): Promise<UserRecord[]>
```

**Response Example**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Admin",
    "email": "admin@example.com",
    "password": "hashed_password",
    "role": "admin",
    "company": "Acme Corp",
    "createdAt": 1704336000000
  },
  {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "name": "Jane Subscriber",
    "email": "jane@example.com",
    "password": "hashed_password",
    "role": "subscriber",
    "company": "Tech Inc",
    "createdAt": 1704249600000
  }
]
```

#### createUser(input)
Creates a new user record and persists to localStorage.

```typescript
createUser(input: CreateUserInput): Promise<UserRecord>
```

**Request**
```json
{
  "name": "Alice Developer",
  "email": "alice@example.com",
  "role": "subscriber",
  "company": "Dev Studios",
  "password": "securePass123"
}
```

**Response (201 Created)**
```json
{
  "id": "7ce7c807-e29b-41d4-a716-446655440001",
  "name": "Alice Developer",
  "email": "alice@example.com",
  "password": "securePass123",
  "role": "subscriber",
  "company": "Dev Studios",
  "createdAt": 1704422400000
}
```

**Error Handling**
```
- "Name and email are required" - Missing required fields
- "A user with this email already exists" - Email already in use
```

#### updateUser(user)
Updates an existing user record in localStorage.

```typescript
updateUser(user: UserRecord): Promise<void>
```

**Request**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Updated",
  "email": "admin@example.com",
  "password": "new_hashed_password",
  "role": "admin",
  "company": "New Company Name",
  "createdAt": 1704336000000
}
```

**Response (200 OK)**
```
No response body
```

**Error Handling**
```
- "User not found" - ID does not exist
- Validation errors from Zod schema
```

#### deleteUser(id)
Removes a user record from localStorage.

```typescript
deleteUser(id: string): Promise<void>
```

**Response (200 OK)**
```
No response body
```

---

### 2) ClientsService
Client-side service for managing client records with localStorage persistence.

**Location**: `client/services/clientsService.ts`

**Data Types**

```typescript
type ClientStatus = 'active' | 'inactive';

interface ClientRecord {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: ClientStatus;
  createdAt: number;
  updatedAt: number;
}

type CreateClientInput = {
  name: string;
  email: string;
  company?: string;
  status?: ClientStatus;
};
```

**Methods**

#### listClients()
Returns all stored clients, sorted by most recently updated (descending).

```typescript
listClients(): Promise<ClientRecord[]>
```

**Response Example**
```json
[
  {
    "id": "client-001",
    "name": "Google LLC",
    "email": "contact@google.com",
    "company": "Google",
    "status": "active",
    "createdAt": 1704336000000,
    "updatedAt": 1704422400000
  },
  {
    "id": "client-002",
    "name": "Amazon Corp",
    "email": "contact@amazon.com",
    "company": "Amazon",
    "status": "inactive",
    "createdAt": 1704249600000,
    "updatedAt": 1704336000000
  }
]
```

#### createClient(input)
Creates a new client record and persists to localStorage.

```typescript
createClient(input: CreateClientInput): Promise<ClientRecord>
```

**Request**
```json
{
  "name": "Microsoft Enterprises",
  "email": "enterprise@microsoft.com",
  "company": "Microsoft",
  "status": "active"
}
```

**Response (201 Created)**
```json
{
  "id": "client-003",
  "name": "Microsoft Enterprises",
  "email": "enterprise@microsoft.com",
  "company": "Microsoft",
  "status": "active",
  "createdAt": 1704508800000,
  "updatedAt": 1704508800000
}
```

**Error Handling**
```
- "Name and email are required" - Missing required fields
- Email validation errors
```

#### updateClient(rec)
Updates an existing client record and refreshes updatedAt timestamp.

```typescript
updateClient(rec: ClientRecord): Promise<void>
```

**Request**
```json
{
  "id": "client-001",
  "name": "Google LLC Updated",
  "email": "contact@google.com",
  "company": "Alphabet Inc",
  "status": "active",
  "createdAt": 1704336000000,
  "updatedAt": 1704336000000
}
```

**Response (200 OK)**
```
No response body (updatedAt automatically refreshed)
```

**Error Handling**
```
- "Client not found" - ID does not exist
```

#### deleteClient(id)
Removes a client record from localStorage.

```typescript
deleteClient(id: string): Promise<void>
```

**Response (200 OK)**
```
No response body
```

---

### 3) ProposalsService
Client-side service for managing proposal documents with full versioning and collaboration features.

**Location**: `client/services/proposalsService.ts`

**Data Types**

```typescript
type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'declined';

interface ProposalSection {
  id: string;
  title: string;
  content: string;
  media?: { type: 'image' | 'video'; url: string }[];
  comments?: { id: string; author: string; text: string; createdAt: number }[];
}

interface ProposalPricingItem {
  id: string;
  label: string;
  qty: number;
  price: number;
}

interface ProposalVersionSnapshot {
  id: string;
  createdAt: number;
  note?: string;
  data: Proposal;
}

interface Proposal {
  id: string;
  title: string;
  client: string;
  status: ProposalStatus;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  sections: ProposalSection[];
  pricing: {
    currency: string;
    items: ProposalPricingItem[];
    taxRate: number;
  };
  settings: {
    dueDate?: string;
    approvalFlow?: string;
    sharing: {
      public: boolean;
      token?: string;
      allowComments: boolean;
    };
  };
  versions: ProposalVersionSnapshot[];
}
```

**Methods**

#### listProposals()
Returns all proposals, sorted by most recently updated (descending).

```typescript
listProposals(): Promise<Proposal[]>
```

**Response Example**
```json
[
  {
    "id": "prop-001",
    "title": "Website Redesign Project",
    "client": "client-001",
    "status": "sent",
    "createdBy": "admin@example.com",
    "createdAt": 1704336000000,
    "updatedAt": 1704422400000,
    "sections": [
      {
        "id": "sec-001",
        "title": "Overview",
        "content": "Complete website redesign...",
        "media": [],
        "comments": []
      },
      {
        "id": "sec-002",
        "title": "Scope",
        "content": "Scope of work includes...",
        "media": [],
        "comments": []
      }
    ],
    "pricing": {
      "currency": "USD",
      "items": [
        { "id": "item-001", "label": "Design", "qty": 1, "price": 3000 },
        { "id": "item-002", "label": "Development", "qty": 1, "price": 9000 }
      ],
      "taxRate": 0.1
    },
    "settings": {
      "dueDate": "2024-02-15",
      "approvalFlow": "Single approver",
      "sharing": {
        "public": false,
        "token": "share-token-123",
        "allowComments": true
      }
    },
    "versions": []
  }
]
```

#### getProposal(id)
Retrieves a single proposal by ID.

```typescript
getProposal(id: string): Promise<Proposal | undefined>
```

**Response (200 OK)**
```json
{
  "id": "prop-001",
  "title": "Website Redesign Project",
  "client": "client-001",
  "status": "sent",
  "createdBy": "admin@example.com",
  "createdAt": 1704336000000,
  "updatedAt": 1704422400000,
  "sections": [],
  "pricing": { "currency": "USD", "items": [], "taxRate": 0.1 },
  "settings": { "sharing": { "public": false, "allowComments": true } },
  "versions": []
}
```

**Response (404 Not Found)**
```
undefined
```

#### getProposalByToken(token)
Retrieves a proposal by its public share token.

```typescript
getProposalByToken(token: string): Promise<Proposal | undefined>
```

**Response (200 OK)**
```json
{
  "id": "prop-001",
  "title": "Website Redesign Project",
  "status": "sent",
  "settings": { "sharing": { "public": true, "token": "share-token-123" } },
  "..."
}
```

**Response (404 Not Found)**
```
undefined
```

#### createProposal(partial?)
Creates a new proposal with optional partial data.

```typescript
createProposal(partial?: Partial<Proposal>): Promise<Proposal>
```

**Request (Optional)**
```json
{
  "title": "Custom Proposal",
  "client": "client-123",
  "status": "draft",
  "createdBy": "user@example.com"
}
```

**Response (201 Created)**
```json
{
  "id": "prop-new-uuid",
  "title": "Custom Proposal",
  "client": "client-123",
  "status": "draft",
  "createdBy": "user@example.com",
  "createdAt": 1704508800000,
  "updatedAt": 1704508800000,
  "sections": [
    {
      "id": "uuid-1",
      "title": "Overview",
      "content": "Project overview...",
      "media": [],
      "comments": []
    },
    {
      "id": "uuid-2",
      "title": "Scope",
      "content": "Scope of work...",
      "media": [],
      "comments": []
    },
    {
      "id": "uuid-3",
      "title": "Timeline",
      "content": "Timeline...",
      "media": [],
      "comments": []
    }
  ],
  "pricing": {
    "currency": "USD",
    "items": [
      { "id": "uuid-4", "label": "Design", "qty": 1, "price": 3000 },
      { "id": "uuid-5", "label": "Development", "qty": 1, "price": 9000 }
    ],
    "taxRate": 0.1
  },
  "settings": {
    "dueDate": null,
    "approvalFlow": "Single approver",
    "sharing": { "public": false, "allowComments": true }
  },
  "versions": []
}
```

#### updateProposal(proposal, options?)
Updates an existing proposal with optional version snapshot.

```typescript
updateProposal(proposal: Proposal, options?: { keepVersion?: boolean; note?: string }): Promise<void>
```

**Request**
```json
{
  "id": "prop-001",
  "title": "Website Redesign - Updated",
  "sections": [],
  "pricing": {},
  "settings": {},
  "versions": []
}
```

**Options**
```json
{
  "keepVersion": true,
  "note": "Updated pricing and timeline"
}
```

**Response (200 OK)**
```
No response body
```

**Version Snapshot Creation** (when keepVersion=true)
```json
{
  "id": "snap-uuid",
  "createdAt": 1704508800000,
  "note": "Updated pricing and timeline",
  "data": {
    "id": "prop-001",
    "title": "Previous version data..."
  }
}
```

#### deleteProposal(id)
Removes a proposal from localStorage.

```typescript
deleteProposal(id: string): Promise<void>
```

**Response (200 OK)**
```
No response body
```

#### duplicateProposal(id)
Creates a copy of an existing proposal with "(Copy)" suffix.

```typescript
duplicateProposal(id: string): Promise<Proposal | undefined>
```

**Response (201 Created)**
```json
{
  "id": "prop-duplicate-uuid",
  "title": "Website Redesign Project (Copy)",
  "client": "client-001",
  "status": "draft",
  "sections": [],
  "pricing": { "items": [] },
  "settings": {},
  "versions": [],
  "createdAt": 1704508800000,
  "updatedAt": 1704508800000
}
```

**Response (404 Not Found)**
```
undefined
```

#### toggleShare(proposal, makePublic)
Enables or disables public sharing with share token generation.

```typescript
toggleShare(proposal: Proposal, makePublic: boolean): Promise<Proposal>
```

**Request**
```json
{
  "id": "prop-001",
  "makePublic": true
}
```

**Response (200 OK)**
```json
{
  "id": "prop-001",
  "title": "Website Redesign Project",
  "settings": {
    "sharing": {
      "public": true,
      "token": "generated-share-token-uuid",
      "allowComments": true
    }
  }
}
```

#### addComment(proposal, sectionId, author, text)
Adds a comment to a specific proposal section.

```typescript
addComment(proposal: Proposal, sectionId: string, author: string, text: string): Promise<void>
```

**Request**
```json
{
  "sectionId": "sec-001",
  "author": "reviewer@example.com",
  "text": "This overview needs more detail about the timeline."
}
```

**Response (200 OK)**
```
No response body
```

**Section Update (internally)**
```json
{
  "comments": [
    {
      "id": "comment-uuid",
      "author": "reviewer@example.com",
      "text": "This overview needs more detail about the timeline.",
      "createdAt": 1704508800000
    }
  ]
}
```

#### reorderSection(proposal, from, to)
Reorders sections within a proposal by index.

```typescript
reorderSection(proposal: Proposal, from: number, to: number): Promise<void>
```

**Request**
```json
{
  "from": 0,
  "to": 2
}
```

**Response (200 OK)**
```
No response body
```

#### addSection(proposal, title?)
Appends a new section to the proposal.

```typescript
addSection(proposal: Proposal, title?: string): Promise<void>
```

**Request**
```json
{
  "title": "Budget Breakdown"
}
```

**Response (200 OK)**
```
No response body
```

**Section Created (internally)**
```json
{
  "id": "section-uuid",
  "title": "Budget Breakdown",
  "content": "",
  "media": [],
  "comments": []
}
```

#### removeSection(proposal, id)
Removes a section from the proposal.

```typescript
removeSection(proposal: Proposal, id: string): Promise<void>
```

**Response (200 OK)**
```
No response body
```

#### valueTotal(proposal)
Calculates total proposal value including tax.

```typescript
valueTotal(proposal: Proposal): number
```

**Response Example**
```
13200
```

**Calculation**
```
subtotal = sum(qty * price for each item)
tax = subtotal * taxRate
total = subtotal + tax

Example: (3000 + 9000) * 1.1 = 13200
```

---

### 4) PackageService
Client-side service for managing subscription package plans.

**Location**: `client/services/packageService.ts`

**Data Types**

```typescript
type BillingCycle = 'monthly' | 'yearly';

interface PackagePlan {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  features: string[];
  isPopular: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
}

type CreatePackageInput = {
  name: string;
  code?: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  features: string[];
  isPopular?: boolean;
  status?: 'active' | 'inactive';
};
```

**Methods**

#### listPackages()
Returns all active packages, sorted by price (ascending) then name.

```typescript
listPackages(): Promise<PackagePlan[]>
```

**Response Example**
```json
[
  {
    "id": "pkg-starter-uuid",
    "code": "starter",
    "name": "Starter Plan",
    "description": "Perfect for getting started",
    "price": 29,
    "currency": "USD",
    "billingCycle": "monthly",
    "features": [
      "Up to 5 proposals/month",
      "Basic templates",
      "Email support"
    ],
    "isPopular": false,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "pkg-professional-uuid",
    "code": "professional",
    "name": "Professional Plan",
    "description": "For growing teams",
    "price": 79,
    "currency": "USD",
    "billingCycle": "monthly",
    "features": [
      "Unlimited proposals",
      "Premium templates",
      "Priority support",
      "Team collaboration"
    ],
    "isPopular": true,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "pkg-enterprise-uuid",
    "code": "enterprise",
    "name": "Enterprise Plan",
    "description": "For large organizations",
    "price": 199,
    "currency": "USD",
    "billingCycle": "monthly",
    "features": [
      "Custom branding",
      "API access",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations"
    ],
    "isPopular": false,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### createPackage(input)
Creates a new subscription package plan.

```typescript
createPackage(input: CreatePackageInput): Promise<PackagePlan>
```

**Request**
```json
{
  "name": "Advanced Plan",
  "code": "advanced",
  "description": "Advanced features for professionals",
  "price": 149,
  "currency": "USD",
  "billingCycle": "monthly",
  "features": [
    "Unlimited proposals",
    "Advanced analytics",
    "Custom templates",
    "Priority email support"
  ],
  "isPopular": false,
  "status": "active"
}
```

**Response (201 Created)**
```json
{
  "id": "pkg-advanced-uuid",
  "code": "advanced",
  "name": "Advanced Plan",
  "description": "Advanced features for professionals",
  "price": 149,
  "currency": "USD",
  "billingCycle": "monthly",
  "features": [
    "Unlimited proposals",
    "Advanced analytics",
    "Custom templates",
    "Priority email support"
  ],
  "isPopular": false,
  "status": "active",
  "createdAt": "2024-01-10T15:30:00Z"
}
```

**Error Handling**
```
- "Package code cannot be empty" - Code generation failed
- "A package with this code already exists" - Duplicate code
- Validation errors for missing required fields
```

**Code Generation**
- If code is not provided, it's auto-generated from name (slugified)
- Example: "Premium Plan" → "premium-plan"
- Code must be unique across all packages

---

### 5) AnalyticsService
Client-side service wrapper for server analytics endpoint.

**Location**: `client/services/analyticsService.ts`

**Data Types** (see [GET /api/analytics](#4-get-apianalytics))

```typescript
type ISODate = string; // Format: YYYY-MM-DD

interface AnalyticsQuery {
  start: ISODate;
  end: ISODate;
}

interface AnalyticsResponse {
  totals: {
    proposals: number;
    accepted: number;
    declined: number;
    activeClients: number;
    aiTokens: number;
    revenue: number;
  };
  series: Array<{
    date: ISODate;
    revenue: number;
  }>;
}
```

**Methods**

#### getAnalytics(params)
Fetches analytics data from the server for the specified date range.

```typescript
getAnalytics(params: { start: string; end: string }): Promise<AnalyticsResponse>
```

**Request**
```json
{
  "start": "2024-01-01",
  "end": "2024-01-31"
}
```

**Response (200 OK)**
```json
{
  "totals": {
    "proposals": 450,
    "accepted": 261,
    "declined": 189,
    "activeClients": 85,
    "aiTokens": 54120,
    "revenue": 28540
  },
  "series": [
    { "date": "2024-01-01", "revenue": 1234 },
    { "date": "2024-01-02", "revenue": 1567 },
    { "date": "2024-01-03", "revenue": 1892 }
  ]
}
```

**Response (400 Bad Request)**
```
Error thrown: "Failed to load analytics"
```

**Error Handling**
```
- Invalid date format (must be YYYY-MM-DD)
- Network errors
- Server errors
```

---

## Migration Plan to Backend

When integrating with a backend service (e.g., Laravel API):

1. Replace fetch endpoints while keeping function signatures
2. Remove localStorage persistence once CRUD operations are backend-driven
3. Maintain zod validation on the client for payload contracts
4. Update service implementations to call backend APIs instead of local JSON files
5. Keep the same response types for consistency

---

## Development Notes

- All endpoints use TypeScript for type safety
- Zod is used for runtime validation of payloads
- Mock JWT tokens are generated for demo purposes (signature field is hardcoded)
- Analytics data is seeded and procedurally generated based on date parameters
- No external API calls are made in test/validation endpoints
