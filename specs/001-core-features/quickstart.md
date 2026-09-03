# Quickstart: Validate Rivals Core Features

Windows PowerShell only — no Docker. Assumes PostgreSQL is already installed locally and Java 17
/ Node.js are on PATH.

## Prerequisites

- Local PostgreSQL running, with a `rivals` database and a role that can create tables (Flyway
  will apply migrations on backend startup — research.md #3).
- `backend/src/main/resources/application.yml` (or an environment override) pointing at that
  local database, e.g. `jdbc:postgresql://localhost:5432/rivals`.
- Two seeded accounts available after the first migration run: one `ADMIN`, one `USER` (per
  Assumptions in spec.md — role provisioning is pre-seeded, not self-service).

## 1. Frontend against mocks (Principle I — no backend required yet)

```powershell
cd frontend
npm install
npm run dev
```

Open the dev server URL. Every screen (submit activity, admin queue, squads, leaderboards) MUST
be fully navigable using only `frontend/src/mocks/*.json` — confirms the UI-first slice is
demoable before any backend work lands.

## 2. Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

On startup, Flyway MUST apply all migrations under `src/main/resources/db/migration` against the
local `rivals` database with no manual SQL step.

## 3. End-to-end validation scenarios

Run these against the live backend (`http://localhost:8081`) with the frontend pointed at it, or
via direct HTTP calls, to prove each user story from spec.md:

### US1 — Submit an activity (P1)

1. Log in as the seeded `USER` account.
2. Submit a Running activity, distance `5`, with a screenshot attached.
3. **Expect**: response `status: "PENDING"`, `pointsAwarded: null`; the submission appears under
   "my submissions" with status Pending.

### US2 — Admin approves and points are awarded (P1)

1. Log in as the seeded `ADMIN` account; open the pending queue — the US1 submission is there.
2. Approve it.
3. **Expect**: status becomes `APPROVED`, `pointsAwarded: 50` (5 km × 10 pts/km per
   data-model.md's rate table); the submission no longer appears in the pending queue; the
   submitting user's individual leaderboard total increases by 50.
4. Submit and reject a second activity as a sanity check.
5. **Expect**: status becomes `REJECTED`, `pointsAwarded` stays null, no leaderboard change.

### US3 — Search, create, join squads (P2)

1. As the `USER` account, create a squad named `Marketing Runners`.
2. Attempt to create another squad with the same name (any case).
3. **Expect**: second creation fails with `CONFLICT`/`VALIDATION_ERROR` per `contracts/squads.md`.
4. Search for `Marketing` from a different account and join the squad found.
5. **Expect**: that account now appears in the squad's member list without leaving any other
   squad it already belonged to.

### US4 — Group-scoped roles and invitations (P2)

1. As User A, create a squad `Design Guild`.
2. **Expect**: `GET /api/squads/{id}/members` shows A with `role: "MANAGER"`.
3. As A, `GET /api/users?search=B` to find User B, then `POST /api/squads/{id}/invitations` with
   B's id.
4. **Expect**: `201`, invitation `status: "PENDING"`; B is not yet in the members list.
5. As User B, `GET /api/invitations` shows the pending invite; `POST
   /api/invitations/{id}/accept`.
6. **Expect**: `200`, invitation `status: "ACCEPTED"`; B now appears in `GET
   /api/squads/{id}/members` with `role: "MEMBER"`.
7. As B (still a `MEMBER`), attempt `POST /api/squads/{id}/invitations` for a third user.
8. **Expect**: `403 FORBIDDEN` per `contracts/errors.md` (only Managers may invite).
9. As A, `POST /api/squads/{id}/members/{B's userId}/promote`.
10. **Expect**: `200`, B's role becomes `"MANAGER"`; B can now invite/promote in this squad, while
    still being a `MEMBER` of any other squad they belong to.

### US5 — Leaderboards, including the Global/squad toggle (P3)

1. With at least two squads of different sizes and differing approved points (reuse US1/US2/US3
   data plus one more approved submission for a second squad), open the squad leaderboard sorted
   by `total`, then by `average`.
2. **Expect**: the two sort orders are demonstrably different when member counts differ, and the
   individual leaderboard (`GET /api/leaderboards/individual`, no `squadId`) lists users strictly
   by descending total approved points, matching `contracts/leaderboards.md`.
3. As a user who belongs to `Design Guild`, call `GET
   /api/leaderboards/individual?squadId={Design Guild's id}`.
4. **Expect**: `200`, rows restricted to `Design Guild`'s current members only; the selector in the
   UI defaults to "Global" on first load (FR-034) and lists only squads that user belongs to
   (FR-035).
5. As a user who is NOT a member of `Design Guild`, repeat step 3's call with that squad's id.
6. **Expect**: `403 FORBIDDEN` per `contracts/errors.md` (FR-035 enforced server-side).

## Success signal

All scenarios above pass without any manual database edits or restarts beyond the initial
`spring-boot:run` — confirms SC-001 through SC-010 from spec.md are met end-to-end.
