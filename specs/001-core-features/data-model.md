# Phase 1 Data Model: Rivals Core Features

Entities are derived from spec.md's Key Entities section. This describes the domain model
(persisted entities and derived/computed values), not the wire-level DTOs — see `contracts/` for
the strict request/response shapes exchanged with the frontend (Constitution Principle II keeps
these separate: entities never cross the controller boundary directly).

## Entity: User

Represents an employee account.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| displayName | string | Shown on leaderboards |
| email | string | Unique, used for login |
| passwordHash | string | Session-auth credential |
| role | enum: `USER`, `ADMIN` | Authorization gate for approve/reject endpoints |
| createdAt | timestamp | |

**Derived (not stored)**: `totalApprovedPoints` (decimal) = `SUM(points)` over that user's
`ActivitySubmission` rows where `status = APPROVED`. Computed at read time (see research.md #5).

**Relationships**: many-to-many with `Squad` via `SquadMembership`; one-to-many with
`ActivitySubmission` as submitter; one-to-many with `ActivitySubmission` as reviewing admin;
one-to-many with `SquadInvitation` as invitee and as inviting Manager.

## Entity: ActivitySubmission

Represents one logged workout awaiting or having received review.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID (FK → User) | Submitter |
| activityType | enum: `RUNNING`, `CYCLING`, `SWIMMING`, `YOGA` | Fixed set, per FR-001/FR-002 |
| metricValue | decimal | Distance in km (Running/Cycling/Swimming) or duration in minutes (Yoga); MUST be > 0 (FR-002) |
| screenshotRef | string | Path/key of the stored screenshot file (see research.md #2) |
| status | enum: `PENDING`, `APPROVED`, `REJECTED` | State machine below |
| pointsAwarded | decimal, nullable | Null until `APPROVED`; set exactly once by the points engine (FR-006); kept fractional, never rounded (spec Clarifications 2026-09-03) |
| submittedAt | timestamp | Set on creation |
| reviewedByUserId | UUID (FK → User), nullable | Set on approval/rejection (FR-008) |
| reviewedAt | timestamp, nullable | Set on approval/rejection (FR-008) |

**State machine** (Constitution Principle IV — enforced in code, not just data):

```text
PENDING --(admin approves)--> APPROVED   [pointsAwarded computed & set, immutable thereafter]
PENDING --(admin rejects)--> REJECTED    [pointsAwarded stays null]
```

`APPROVED` and `REJECTED` are terminal — no further transitions (spec Edge Cases: rejected
submissions are terminal, not editable; a new submission is created instead).

**Validation rules** (from FR-002): `metricValue > 0`; `activityType` must be one of the four
supported values; `screenshotRef` must be present; `status` always starts `PENDING`.

**Required indexes** (SC-007, research.md #5 update): `(status)` — for the admin pending queue
(FR-004) — and `(user_id, status)` — for a user's own approved-points total — both on
`activity_submissions`.

## Entity: Squad

Represents a named team users can join.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | string | Unique case-insensitively (FR-011) |
| createdByUserId | UUID (FK → User) | Creator, becomes first member |
| createdAt | timestamp | |

**Derived (not stored)**: `totalPoints` = `SUM` of current members' `totalApprovedPoints`;
`averagePoints` = `totalPoints / memberCount`, or `0` if `memberCount = 0` (research.md #7). Both
computed at read time so they always reflect *current* membership (spec Assumptions).

**Relationships**: many-to-many with `User` via `SquadMembership`.

## Entity: SquadMembership

Join table representing a user's membership in a squad.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID (FK → User) | |
| squadId | UUID (FK → Squad) | |
| role | enum: `MANAGER`, `MEMBER` | Scoped to this membership only (FR-021); set `MANAGER` at squad creation for the creator, `MEMBER` for anyone who joins/accepts otherwise (FR-020, FR-025) |
| joinedAt | timestamp | |

**Constraints**: unique on `(userId, squadId)` — a user cannot join the same squad twice; no
upper bound on how many `SquadMembership` rows a `User` or `Squad` may have (FR-012, spec
Assumptions). Deleting a row represents "leave squad." A squad MAY have more than one row with
`role = MANAGER` (research.md #9 — a Manager can promote another Member to Manager, FR-031); there
is no action that changes a row's role back from `MANAGER` to `MEMBER` (spec Assumptions).

**Required index** (SC-007, research.md #5 update): `(squadId)` on `SquadMembership`, for
computing a squad's member count/total/average without scanning the whole table.

## Entity: SquadInvitation

Represents an offer for a specific user to join a specific squad, sent by that squad's Manager
(spec Key Entities — Squad Invitation; research.md #10).

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| squadId | UUID (FK → Squad) | |
| invitedUserId | UUID (FK → User) | The invitee |
| invitedByUserId | UUID (FK → User) | The Manager who sent the invite |
| status | enum: `PENDING`, `ACCEPTED`, `DECLINED` | State machine below |
| createdAt | timestamp | Set on creation |
| decidedAt | timestamp, nullable | Set on accept/decline |

**State machine**:

```text
PENDING --(invited user accepts)--> ACCEPTED   [creates a SquadMembership row, role = MEMBER]
PENDING --(invited user declines)--> DECLINED  [no SquadMembership row created]
```

`ACCEPTED` and `DECLINED` are terminal (FR-027, FR-028). A `DECLINED` invitation does not block a
future invitation to the same `(invitedUserId, squadId)` pair (FR-028, spec Assumptions).

**Validation rules**: creation requires the caller to hold a `SquadMembership` with
`role = MANAGER` for `squadId` (FR-022, FR-024); rejected if `invitedUserId` already has a
`SquadMembership` for `squadId` (FR-030) or already has a `PENDING` invitation for `squadId`
(FR-029).

**Required index**: partial unique index on `(invitedUserId, squadId)` where
`status = 'PENDING'` — enforces FR-029 at the database level and serves the "my pending invites"
lookup (FR-026) via `(invitedUserId, status)`.

## Reference Data: ActivityPointRate

Not a mutable entity — a fixed lookup used exclusively by the points engine at approval time
(research.md #4).

| activityType | unit | pointsPerUnit |
|---|---|---|
| RUNNING | km | 10 |
| CYCLING | km | 4 |
| SWIMMING | km | 20 |
| YOGA | minute | 1 |

`pointsAwarded = metricValue × pointsPerUnit` for the submission's `activityType`, kept as an
exact fractional (decimal) value — never rounded (spec Clarifications 2026-09-03).

## Derived View: Leaderboard Rows

Not persisted; computed per request (research.md #5):

- **Individual leaderboard row**: `{ userId, displayName, totalApprovedPoints }`, ordered by
  `totalApprovedPoints DESC, displayName ASC` (tie-break, research.md #6), paginated via
  `limit`/`offset` (SC-007, research.md #5 update).
- **Squad leaderboard row**: `{ squadId, name, memberCount, totalPoints, averagePoints }`,
  ordered by `totalPoints DESC, name ASC` (total view) or `averagePoints DESC, name ASC`
  (average view), paginated via `limit`/`offset` (SC-007, research.md #5 update).
- **Squad-scoped individual leaderboard row**: same shape and tie-break as the individual
  leaderboard row above, but restricted to `SquadMembership` rows for one `squadId` — the "Global
  vs. a specific squad" selector view (spec User Story 5 scenarios 5-6, FR-033–FR-035;
  research.md #12). The requesting user MUST currently be a member of `squadId`.
