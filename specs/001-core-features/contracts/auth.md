# Contract: Authentication

Session-based auth (research.md #1). All endpoints below except login require an authenticated
session cookie; admin-only endpoints additionally require `role = ADMIN`.

## POST /api/auth/login

**Request body**:

```json
{ "email": "string", "password": "string" }
```

**Response 200**:

```json
{ "userId": "uuid", "displayName": "string", "role": "USER | ADMIN" }
```

**Response 401**: invalid credentials, no body fields beyond a standard error envelope (see
`errors.md`).

## POST /api/auth/logout

**Response 204**: session cleared, no body.

## GET /api/auth/me

**Response 200**: same shape as login's 200 response, for the current session.

**Response 401**: no active session.
