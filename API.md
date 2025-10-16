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
