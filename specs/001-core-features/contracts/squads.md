# Contract: Squads

Covers User Story 3 and User Story 4. Implements FR-010 through FR-012, FR-020 through FR-025,
FR-031, FR-032.

## GET /api/squads?search={query}&mine={bool}&limit={n}&offset={n}

`search` is optional; omitted or empty matches all squads. `mine` is optional (default `false`);
when `true`, restricts results to squads the current user is currently a member of — used to
populate the leaderboard's squad selector (FR-035) and the promote/invite squad picker. `limit`
defaults to 50 (max 200); `offset` defaults to 0. Pagination keeps this endpoint responsive at the
~5,000-employee scale targeted by SC-007 (spec.md Clarifications 2026-09-03).

**Response 200** (`SquadSummaryResponse[]`, at most `limit` items):

```json
[
  { "id": "uuid", "name": "string", "memberCount": 12, "isCurrentUserMember": false, "currentUserRole": null }
]
```

`currentUserRole` is `"MANAGER"` | `"MEMBER"` | `null` (not a member), reflecting FR-021.

## POST /api/squads (authenticated user)

Implements FR-011, FR-020. Creator is automatically added as the first member with role
`MANAGER`.

**Request body**:

```json
{ "name": "string, 1-100 chars" }
```

**Response 201**: `SquadSummaryResponse` (`memberCount: 1`, `isCurrentUserMember: true`,
`currentUserRole: "MANAGER"`).

**Response 400**: `VALIDATION_ERROR` if `name` is blank/too long, or `CONFLICT` (409) if the name
already exists case-insensitively (FR-011).

## POST /api/squads/{id}/join (authenticated user)

Implements FR-012. Idempotent-safe: joining a squad already joined returns 200 without creating a
duplicate membership. Role is `MEMBER` (FR-025) — self-service join never grants `MANAGER`.

**Response 200**: `SquadSummaryResponse` (`isCurrentUserMember: true`, `currentUserRole: "MEMBER"`).

**Response 404**: unknown squad id.

## POST /api/squads/{id}/leave (authenticated user)

Implements FR-012.

**Response 200**: `SquadSummaryResponse` (`isCurrentUserMember: false`, `currentUserRole: null`).

**Response 404**: unknown squad id, or caller was not a member.

## GET /api/squads/{id}/members (any current member of the squad)

Implements FR-021. Lists every current member and their per-squad role, so the UI can show who is
a Manager and let a Manager pick a Member to promote.

**Response 200** (`SquadMemberResponse[]`):

```json
[
  { "userId": "uuid", "displayName": "string", "role": "MANAGER", "joinedAt": "2026-09-01T00:00:00Z" }
]
```

**Response 403**: caller is not a current member of the squad.

**Response 404**: unknown squad id.

## POST /api/squads/{id}/members/{userId}/promote (Manager of that squad only)

Implements FR-031, FR-032. Sets the target member's role to `MANAGER`; irreversible in this
feature (no demote action, per spec Assumptions).

**Response 200**: `SquadMemberResponse` (`role: "MANAGER"`).

**Response 403**: `FORBIDDEN` — caller is not a `MANAGER` of this squad (FR-032).

**Response 404**: unknown squad id, or `userId` is not a current member of the squad.

## POST /api/squads/{id}/invitations (Manager of that squad only)

Implements FR-022 through FR-024. Creates a `PENDING` `SquadInvitation`; does **not** create a
membership (see `contracts/invitations.md` for accept/decline).

**Request body**:

```json
{ "invitedUserId": "uuid" }
```

**Response 201**: `SquadInvitationResponse` (see `contracts/invitations.md`), `status: "PENDING"`.

**Response 403**: `FORBIDDEN` — caller is not a `MANAGER` of this squad (FR-024).

**Response 409**: `CONFLICT` — `invitedUserId` is already a member of this squad (FR-030), or
already has a `PENDING` invitation to this squad (FR-029).

**Response 404**: unknown squad id or `invitedUserId`.
