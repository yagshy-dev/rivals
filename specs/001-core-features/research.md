# Phase 0 Research: Rivals Core Features

All items in Technical Context were resolved with reasonable defaults consistent with the
Constitution's fixed stack (Java 17 + Spring Boot, React 18 + TS + Vite + Tailwind, local
PostgreSQL, PowerShell-only/no-Docker environment). No `NEEDS CLARIFICATION` markers remain. This
document records the decisions and why the alternatives were rejected.

## 1. Authentication & Roles

- **Decision**: Spring Security with session-based (form/cookie) authentication. Two roles,
  `ROLE_USER` and `ROLE_ADMIN`, seeded via a Flyway migration with a small fixed set of accounts
  for initial use; self-service registration and admin-granting are out of scope (per spec
  Assumptions).
- **Rationale**: Internal, single-company tool with a small user base — session auth avoids the
  complexity of token refresh/OAuth flows while still giving each request an authenticated
  `User` and role for authorization checks (e.g., only `ROLE_ADMIN` may approve/reject).
- **Alternatives considered**: JWT-based stateless auth (rejected — adds token-refresh complexity
  with no multi-service/mobile-client need); a third-party IdP/SSO (rejected — no such
  requirement was stated, and it would introduce a dependency outside the fixed stack).

## 2. Screenshot Storage

- **Decision**: Store uploaded screenshots as files on the local filesystem under a configurable
  `uploads/` directory; the `ActivitySubmission` row stores a relative file reference. A
  dedicated Spring controller endpoint streams the file back for admin review and for the
  submitter's own history view.
- **Rationale**: The environment excludes Docker and any cloud object storage; local PostgreSQL
  is the only externally-provisioned dependency. Storing large binary screenshots as a `bytea`
  column would bloat the database and complicate backups; a plain local directory is the
  simplest option that satisfies the no-Docker, PowerShell-only constraint.
- **Alternatives considered**: Database BLOB storage (rejected — unnecessary DB bloat for an
  internal tool); cloud object storage such as S3 (rejected — introduces a dependency outside the
  fixed stack and requires infrastructure this environment doesn't provide).

## 3. Schema Migrations

- **Decision**: Flyway versioned SQL migrations under `backend/src/main/resources/db/migration`,
  run automatically on application startup against local PostgreSQL.
- **Rationale**: Gives an explicit, reviewable, incremental schema history that matches
  Principle III (small atomic steps) — each schema change is its own numbered migration file
  rather than relying on Hibernate's `ddl-auto` to infer schema from entities.
- **Alternatives considered**: Hibernate `ddl-auto=update` (rejected — implicit, non-reviewable
  schema changes, riskier for a Postgres database that persists across restarts).

## 4. Points Calculation Trigger

- **Decision**: Points are computed by a single `PointsEngine` service method invoked only from
  the admin-approval transition (`Pending → Approved`) in the `activity` module; the same method
  is never reachable from the submission-creation path.
- **Rationale**: Directly enforces Constitution Principle IV (Human-in-the-Loop Approval,
  Non-Negotiable) at the architecture level — there is no code path that can award points without
  going through admin approval.
- **Alternatives considered**: Computing/storing a "projected points" value at submission time
  and confirming it at approval (rejected — adds a redundant, easily-desynced value; the spec
  requires zero points exist until approval, not a preview).

## 5. Leaderboard Computation

- **Decision**: Leaderboard rankings (individual total, squad total, squad average) are computed
  as read-time SQL aggregate queries (`SUM`/`COUNT`/`AVG` grouped by user or squad) over Approved
  submissions and current squad membership, not as continuously-maintained denormalized counters.
- **Rationale**: At the stated scale (a few thousand users, tens of thousands of approved
  submissions) an aggregate query comfortably meets the <1s performance goal, and avoids the
  correctness risk of keeping denormalized running totals in sync with membership changes
  (spec Edge Cases: leaving a squad must immediately affect its total/average).
- **Alternatives considered**: Maintaining a denormalized `total_points` column updated via
  triggers/application code on every approval and every membership change (rejected — more
  moving parts and a real risk of drift, for no performance benefit at this scale).
- **Update (spec Clarifications 2026-09-03, SC-007)**: scale was fixed at ~5,000 employees with a
  <1s target. To meet this with plain aggregate queries, `V1__baseline_schema.sql` (see
  data-model.md) MUST index `activity_submissions(status)`, `activity_submissions(user_id,
  status)`, and `squad_memberships(squad_id)`; and the squad list and both leaderboard endpoints
  MUST paginate (`limit`/`offset`, see `contracts/squads.md` and `contracts/leaderboards.md`)
  rather than returning all ~5,000 rows in one response.

## 6. Leaderboard Tie-Breaking

- **Decision**: Ties are broken by ascending display name (individual) or squad name (group) as
  a stable secondary sort key, applied identically regardless of which primary sort (total vs.
  average) is active.
- **Rationale**: Satisfies the spec's Edge Case requirement for a deterministic, stable
  tie-break with the simplest possible rule — no extra data needed beyond what's already
  displayed.
- **Alternatives considered**: Tie-break by earliest submission/join date (rejected — less
  intuitive to a viewer than alphabetical, and not visibly explainable from the leaderboard UI
  itself).

## 7. Zero-Member Squad Average

- **Decision**: A squad with zero current members displays an average of `0` and is sorted to
  the bottom of the average-points leaderboard view (rather than causing a division-by-zero
  error or being hidden).
- **Rationale**: Directly satisfies the spec's Edge Case ("MUST show it as zero or unranked
  rather than erroring") with the simpler of the two allowed behaviors.
- **Alternatives considered**: Omitting zero-member squads from the leaderboard entirely
  (rejected — the spec allows it but showing `0` is more transparent and requires no special-case
  filtering logic).

## 9. Squad Roles & Multiple Managers

- **Decision**: Store `role` (`MANAGER` | `MEMBER`) directly on the `SquadMembership` row rather
  than a separate roles/permissions table. A squad may have more than one `MANAGER` membership row
  (spec Clarifications 2026-09-03 — promotion). Authorization checks (invite, promote) load the
  caller's `SquadMembership` for the target squad and require `role = MANAGER`.
- **Rationale**: The role is entirely scoped to one `(user, squad)` pair (FR-021) — it is a
  property of the membership, not of the user or the squad independently. A single-column enum on
  the existing join row is the simplest structure that supports both per-squad scoping and
  multiple Managers with no schema beyond one new column.
- **Alternatives considered**: A separate `SquadRole` table keyed by `(squadId, userId, role)`
  (rejected — only ever one role per membership at a time in this spec, so it would be a
  needlessly normalized 1:1 relationship); a single `managerId` column on `Squad` (rejected —
  cannot represent multiple Managers, which the clarified spec explicitly requires).

## 10. Squad Invitations

- **Decision**: Model invitations as a separate `SquadInvitation` entity with a 3-state lifecycle
  (`PENDING` → `ACCEPTED` | `DECLINED`, both terminal), decoupled from `SquadMembership`. Accepting
  an invitation is the only path that creates a `SquadMembership` row from an invite (in addition
  to self-service join). A partial unique index on `(invitedUserId, squadId)` where
  `status = 'PENDING'` prevents duplicate pending invites (FR-029) without an extra existence-check
  query.
- **Rationale**: Spec Clarifications 2026-09-03 established that invites require explicit
  accept/decline, not immediate membership — this is a genuine intermediate state that needs its
  own identity (an invitation can be listed, accepted, or declined independently of any
  membership), not just a boolean flag on `SquadMembership`.
- **Alternatives considered**: A `status` column directly on a pre-created `SquadMembership` row
  (`INVITED`/`ACTIVE`) (rejected — conflates "not yet a member" with "is a member," complicating
  every membership-count/leaderboard query, which must only ever see confirmed members); no
  persistence at all, e.g. an ephemeral notification (rejected — the spec requires the invited user
  to be able to view and act on the invite at any later time, per FR-026).

## 11. Employee Directory Search for Invites

- **Decision**: Reuse the existing `User` table for invite target search — `GET
  /api/users?search={query}` matches `displayName` case-insensitively (same pattern as squad name
  search, FR-010) — rather than introducing a separate employee-directory service or dataset.
- **Rationale**: Spec Clarifications 2026-09-03 established that Managers pick invitees from a
  searchable directory, not a raw email field. Employees are already the `User` table; no
  additional data source exists or is needed at this scale (~5,000 employees, SC-007).
- **Alternatives considered**: A separate `Employee` directory synced from an external HR system
  (rejected — no such integration exists or was requested; out of scope per spec Assumptions).

## 12. Per-Squad Leaderboard Scoping

- **Decision**: Extend the existing `GET /api/leaderboards/individual` endpoint with an optional
  `squadId` query parameter that restricts rows to that squad's current members, rather than
  adding a parallel endpoint. The server MUST verify the requesting user is currently a member of
  `squadId` and return `403 FORBIDDEN` otherwise — mirroring FR-035's UI-facing rule ("selector
  lists only the user's own squads") with a server-side check, since a client-only restriction is
  not a real access boundary.
- **Rationale**: The per-squad view (spec User Story 5, scenarios 5-6) is structurally identical to
  the existing global individual leaderboard — same row shape, same tie-break rule — just filtered
  to one squad's membership. Reusing the endpoint avoids duplicating pagination/sorting logic that
  the group leaderboard (`/api/leaderboards/squads`, ranking squads against each other) does not
  need to change at all.
- **Alternatives considered**: A new `GET /api/leaderboards/squads/{squadId}/members` endpoint
  (rejected — would duplicate the individual leaderboard's query/pagination/tie-break logic for no
  behavioral difference beyond the `WHERE` clause).

## 13. Frontend Mock-First Data Shape

- **Decision**: `frontend/src/mocks/` holds one JSON fixture file per resource (activities,
  submissions-queue, squads, leaderboard-individual, leaderboard-squads, squad-members,
  invitations) whose shape is hand-authored to match the `contracts/` response DTOs exactly, and
  the typed API client in `frontend/src/api/` is written against those types from the start so
  swapping the mock reader for a real `fetch` call requires no type changes.
- **Rationale**: Operationalizes Constitution Principle I (UI-First Development) — the mock
  fixtures are the contract the backend implements against, not throwaway data.
- **Alternatives considered**: Inline mock objects scattered in component files (rejected —
  harder to keep in sync with the eventual API contract, violates the "checked into the frontend
  codebase" requirement of Principle I).
