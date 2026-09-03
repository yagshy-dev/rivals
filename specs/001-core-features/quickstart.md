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

### US4 — Leaderboards (P3)

1. With at least two squads of different sizes and differing approved points (reuse US1/US2/US3
   data plus one more approved submission for a second squad), open the squad leaderboard sorted
   by `total`, then by `average`.
2. **Expect**: the two sort orders are demonstrably different when member counts differ, and the
   individual leaderboard lists users strictly by descending total approved points, matching
   `contracts/leaderboards.md`.

## Success signal

All four scenarios above pass without any manual database edits or restarts beyond the initial
`spring-boot:run` — confirms SC-001 through SC-006 from spec.md are met end-to-end.
