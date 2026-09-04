# Contract: Authentication

Session-based auth (research.md #1). All endpoints below except login and register require an
authenticated session cookie; admin-only endpoints additionally require `role = ADMIN`.

## POST /api/auth/register

Public — no authentication required (FR-036, FR-042).

**Request body**:

```json
{ "email": "string", "displayName": "string", "password": "string (min 8 chars)" }
```

**Response 201**: same shape as login's 200 response, for the newly created account. The caller is
**not** signed in by this response — the frontend redirects to the login page (FR-041) rather than
establishing a session.

```json
{ "userId": "uuid", "displayName": "string", "role": "USER" }
```

**Response 400**: validation failure (missing field, invalid email, password under 8 characters) —
standard error envelope (see `errors.md`).

**Response 409**: an account already exists for that email, matched case-insensitively (FR-038) —
standard error envelope.

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
