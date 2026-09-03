# Contract: Squads

Covers User Story 3. Implements FR-010, FR-011, FR-012.

## GET /api/squads?search={query}&limit={n}&offset={n}

`search` is optional; omitted or empty matches all squads. `limit` defaults to 50 (max 200);
`offset` defaults to 0. Pagination keeps this endpoint responsive at the ~5,000-employee scale
targeted by SC-007 (spec.md Clarifications 2026-09-03).

**Response 200** (`SquadSummaryResponse[]`, at most `limit` items):

```json
[
  { "id": "uuid", "name": "string", "memberCount": 12, "isCurrentUserMember": false }
]
```

## POST /api/squads (authenticated user)

Implements FR-011. Creator is automatically added as the first member.

**Request body**:

```json
{ "name": "string, 1-100 chars" }
```

**Response 201**: `SquadSummaryResponse` (`memberCount: 1`, `isCurrentUserMember: true`).

**Response 400**: `VALIDATION_ERROR` if `name` is blank/too long, or `CONFLICT` (409) if the name
already exists case-insensitively (FR-011).

## POST /api/squads/{id}/join (authenticated user)

Implements FR-012. Idempotent-safe: joining a squad already joined returns 200 without creating a
duplicate membership.

**Response 200**: `SquadSummaryResponse` (`isCurrentUserMember: true`).

**Response 404**: unknown squad id.

## POST /api/squads/{id}/leave (authenticated user)

Implements FR-012.

**Response 200**: `SquadSummaryResponse` (`isCurrentUserMember: false`).

**Response 404**: unknown squad id, or caller was not a member.
