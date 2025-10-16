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

### Service Interfaces

#### UsersService
```typescript
interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'subscriber';
  company?: string;
  createdAt: number;
}

interface UsersService {
  listUsers(): Promise<UserRecord[]>;
  createUser(input: { name; email; role?; company?; password? }): Promise<UserRecord>;
  updateUser(user: UserRecord): Promise<void>;
  deleteUser(id: string): Promise<void>;
}
```

#### ClientsService
```typescript
interface ClientRecord {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: 'active' | 'inactive';
  createdAt: number;
  updatedAt: number;
}

interface ClientsService {
  listClients(): Promise<ClientRecord[]>;
  createClient(input: { name; email; company?; status? }): Promise<ClientRecord>;
  updateClient(rec: ClientRecord): Promise<void>;
  deleteClient(id: string): Promise<void>;
}
```

#### ProposalsService
```typescript
interface Proposal {
  id: string;
  title: string;
  client: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  sections: Section[];
  pricing: {
    currency: string;
    items: Item[];
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
  versions: Snapshot[];
}

interface ProposalsService {
  listProposals(): Promise<Proposal[]>;
  getProposal(id: string): Promise<Proposal | undefined>;
  getProposalByToken(token: string): Promise<Proposal | undefined>;
  createProposal(partial?: Partial<Proposal>): Promise<Proposal>;
  updateProposal(proposal: Proposal, opts?: { keepVersion?: boolean; note?: string }): Promise<void>;
  deleteProposal(id: string): Promise<void>;
  duplicateProposal(id: string): Promise<Proposal | undefined>;
  toggleShare(proposal: Proposal, makePublic: boolean): Promise<Proposal>;
  addComment(proposal: Proposal, sectionId: string, author: string, text: string): Promise<void>;
  reorderSection(proposal: Proposal, from: number, to: number): Promise<void>;
  addSection(proposal: Proposal, title?: string): Promise<void>;
  removeSection(proposal: Proposal, id: string): Promise<void>;
  valueTotal(proposal: Proposal): number;
}
```

#### PackageService
```typescript
interface PackagePlan {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  isPopular: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface PackageService {
  listPackages(): Promise<PackagePlan[]>;
  createPackage(input: CreatePackageInput): Promise<PackagePlan>;
}
```

#### AnalyticsService
```typescript
interface AnalyticsService {
  getAnalytics(query: { start: ISODate; end: ISODate }): Promise<AnalyticsResponse>;
}
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
