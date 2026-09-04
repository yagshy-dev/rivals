# Contract: Leaderboards

Covers User Story 5. Implements FR-013 through FR-017 and FR-033 through FR-035. Read-only; both
endpoints require an authenticated session but no specific role.

## GET /api/leaderboards/individual?squadId={uuid}&limit={n}&offset={n}

`squadId` is optional. Omitted → the "Global" view (FR-034's default): all users, ranked
company-wide. Provided → the per-squad view (FR-033, FR-035, research.md #12): rows are restricted
to that squad's current members only, using the same shape and tie-break rule. `limit` defaults to
50 (max 200); `offset` defaults to 0. Pagination keeps this endpoint responsive at the
~5,000-employee scale targeted by SC-007 (spec.md Clarifications 2026-09-03).

**Response 200** (`IndividualLeaderboardRow[]`, at most `limit` items, ordered per
data-model.md's tie-break rule):

```json
[
  { "rank": 1, "userId": "uuid", "displayName": "string", "totalPoints": 340.5 }
]
```

**Response 403**: `FORBIDDEN` — `squadId` was provided but the requesting user is not currently a
member of that squad (FR-035, enforced server-side per research.md #12).

**Response 404**: `squadId` provided but does not exist.

## GET /api/leaderboards/squads?sortBy={total|average}&limit={n}&offset={n}

`sortBy` defaults to `total` if omitted. `limit` defaults to 50 (max 200); `offset` defaults to 0
(same rationale as the individual leaderboard above).

**Response 200** (`SquadLeaderboardRow[]`, at most `limit` items):

```json
[
  {
    "rank": 1,
    "squadId": "uuid",
    "name": "string",
    "memberCount": 8,
    "totalPoints": 960.5,
    "averagePoints": 120.06
  }
]
```

Both `totalPoints` and `averagePoints` are always included regardless of `sortBy`, so the
frontend can render either column without a second request; only the row order (and `rank`)
changes with `sortBy` (FR-014). A squad with `memberCount: 0` has `averagePoints: 0` and sorts
last under `sortBy=average` (research.md #7).

**2026-09-04 addendum (Squad-Strict Submission Rules)**: `totalPoints` is now the sum of Approved
points from submissions **tagged to that squad** (FR-015, FR-047) — previously it summed every
current member's cross-squad total. The response shape and `sortBy` semantics are unchanged.

**Response 400**: `VALIDATION_ERROR` if `sortBy` is present but not `total` or `average`.
