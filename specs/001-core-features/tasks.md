---

description: "Task list for Rivals Core Features"
---

# Tasks: Rivals Core Features

**Input**: Design documents from `/specs/001-core-features/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in spec.md; no dedicated test tasks are generated. Testing
frameworks (JUnit 5 + Spring Boot Test, Vitest + React Testing Library) are still installed in
Setup so tests can be added later without re-tooling.

**Organization**: Tasks are grouped by user story (US1-US4, priorities from spec.md) so each can
be implemented, demoed, and validated independently. Per Constitution Principle I (UI-First
Development), every story's frontend task(s) against `frontend/src/mocks/` come before that
story's backend wiring task.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- File paths are relative to the repository root

## Path Conventions

Web application per plan.md: `backend/src/main/java/com/rivals/...` (Java) and
`frontend/src/...` (TypeScript/React).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — nothing here is story-specific.

- [X] T001 Create backend Maven project (Java 17, Spring Boot 3: Web, Validation, Data JPA,
      Security, Flyway, PostgreSQL driver) in `backend/pom.xml` and `backend/src/main/java/com/rivals/RivalsApplication.java`
- [X] T002 [P] Create frontend Vite + React 18 + TypeScript project with `strict: true` in
      `frontend/tsconfig.json`, `frontend/package.json`, `frontend/vite.config.ts`
- [X] T003 [P] Configure Tailwind CSS in `frontend/tailwind.config.js` and `frontend/src/index.css`
- [X] T004 [P] Configure backend `application.yml` for local PostgreSQL connection in
      `backend/src/main/resources/application.yml`
- [X] T005 [P] Configure ESLint + Prettier with TypeScript-strict rules in
      `frontend/.eslintrc.cjs` and `frontend/.prettierrc`
- [X] T006 [P] Add `.gitignore` entries for `uploads/`, `backend/target/`,
      `frontend/node_modules/`, `frontend/dist/` in `.gitignore`

**Checkpoint**: Both projects build and run empty shells via PowerShell (`mvnw.cmd
spring-boot:run`, `npm run dev`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure every user story depends on — schema, auth, error handling,
storage, and the frontend app shell/API client.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Create Flyway baseline migration (users, activity_submissions, squads,
      squad_memberships tables per data-model.md, plus the required indexes —
      `activity_submissions(status)`, `activity_submissions(user_id, status)`,
      `squad_memberships(squad_id)` — for SC-007 scale) in
      `backend/src/main/resources/db/migration/V1__baseline_schema.sql`
- [X] T008 Create Flyway seed migration for one ADMIN and one USER account (per spec.md
      Assumptions: role provisioning is pre-seeded) in
      `backend/src/main/resources/db/migration/V2__seed_accounts.sql`
- [X] T009 [P] Implement `User` entity and `UserRepository` in
      `backend/src/main/java/com/rivals/user/User.java` and `UserRepository.java`
- [X] T010 [P] Configure Spring Security session-based auth (research.md #1) in
      `backend/src/main/java/com/rivals/config/SecurityConfig.java`
- [X] T011 [P] Implement global exception handler emitting the error envelope from
      `contracts/errors.md` in `backend/src/main/java/com/rivals/config/GlobalExceptionHandler.java`
- [X] T012 [P] Implement local filesystem screenshot storage adapter (research.md #2) in
      `backend/src/main/java/com/rivals/storage/ScreenshotStorageService.java`
- [X] T013 [P] Implement `AuthController` (`POST /api/auth/login`, `POST /api/auth/logout`,
      `GET /api/auth/me`) per `contracts/auth.md` in
      `backend/src/main/java/com/rivals/user/AuthController.java`
- [X] T014 [P] Create TypeScript types mirroring backend DTOs (ActivitySubmission, Squad,
      LeaderboardRow, ErrorEnvelope) in `frontend/src/types/`
- [X] T015 [P] Create typed API client with error-envelope handling in
      `frontend/src/api/client.ts`
- [X] T016 [P] Create app shell, routing, and navigation stubs for the four pages (Submit
      Activity, Admin Review Queue, Squads, Leaderboards) in `frontend/src/App.tsx` and
      `frontend/src/pages/`
- [X] T017 [P] Create login page and auth session hook in `frontend/src/pages/Login.tsx` and
      `frontend/src/api/auth.tsx` (`.tsx` — the hook's provider renders JSX)

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Submit an Activity for Approval (Priority: P1) 🎯 MVP slice 1/2

**Goal**: An employee can submit an activity (type, distance/duration, screenshot) and see it
saved as Pending.

**Independent Test**: Submit an activity with a type, metric value, and screenshot; confirm it is
stored with status "Pending" and appears in the user's own submission history, per spec.md's US1
Independent Test.

### Implementation for User Story 1

- [X] T018 [P] [US1] Create mock JSON fixture matching `ActivitySubmissionResponse` from
      `contracts/activities.md` in `frontend/src/mocks/activities.json`
- [X] T019 [US1] Build Activity Submission form (activity type select, metric value input,
      screenshot upload, client-side validation per FR-002) against the mock fixture in
      `frontend/src/pages/SubmitActivity.tsx`
- [X] T020 [US1] Build "My Submissions" list view (status, points if approved) against the mock
      fixture in `frontend/src/pages/MySubmissions.tsx`
- [X] T021 [P] [US1] Implement `ActivitySubmission` entity and `ActivitySubmissionRepository`
      (state machine per data-model.md) in
      `backend/src/main/java/com/rivals/activity/ActivitySubmission.java` and
      `ActivitySubmissionRepository.java`
- [X] T022 [P] [US1] Implement `ActivityType` enum and request/response DTOs per
      `contracts/activities.md` in `backend/src/main/java/com/rivals/activity/dto/`
- [X] T023 [US1] Implement submission validation (metricValue > 0, screenshot required,
      activityType in the fixed set — FR-002) in
      `backend/src/main/java/com/rivals/activity/ActivitySubmissionValidator.java`
      (depends on: T022)
- [X] T024 [US1] Implement `POST /api/activities` and `GET /api/activities/mine` (FR-001, FR-003,
      FR-009) in `backend/src/main/java/com/rivals/activity/ActivityController.java` and
      `ActivityService.java` (depends on: T021, T022, T023, T012)
- [X] T025 [US1] Wire `SubmitActivity` and `MySubmissions` pages to the live API, remove mock
      dependency, in `frontend/src/pages/SubmitActivity.tsx` and `MySubmissions.tsx`
      (depends on: T024, T019, T020) — verified end-to-end against the running backend
      (submit → Pending → visible in "my submissions")

**Checkpoint**: User Story 1 fully functional and independently testable/demoable.

---

## Phase 4: User Story 2 - Admin Reviews, Approves, and Points Are Awarded (Priority: P2) 🎯 MVP slice 2/2

**Goal**: An admin can review Pending submissions and approve/reject them; approval automatically
awards points via the fixed rate table.

**Independent Test**: Approve a Pending Running submission of a known distance and confirm the
submitter's point total increases by exactly distance × 10; reject a submission and confirm no
points are added, per spec.md's US2 Independent Test.

### Implementation for User Story 2

- [X] T026 [P] [US2] Create mock JSON fixture matching `PendingSubmissionResponse` from
      `contracts/activities.md` in `frontend/src/mocks/pending-queue.json`
- [X] T027 [US2] Build Admin Review Queue page (list, screenshot preview, Approve/Reject actions)
      against the mock fixture in `frontend/src/pages/AdminReviewQueue.tsx`
- [X] T028 [P] [US2] Implement `ActivityPointRate` lookup and `PointsEngine` service, invoked
      exclusively from the approval transition (Constitution Principle IV, research.md #4) in
      `backend/src/main/java/com/rivals/points/ActivityPointRate.java` and `PointsEngine.java`
- [X] T029 [US2] Implement `GET /api/activities/pending` and `GET /api/activities/{id}/screenshot`
      (FR-004), restricting the screenshot endpoint to the submitting user or an admin only —
      no other employee may fetch it (FR-018) — in
      `backend/src/main/java/com/rivals/activity/ActivityController.java`
      (depends on: T021, T012)
- [X] T030 [US2] Implement `POST /api/activities/{id}/approve` and
      `POST /api/activities/{id}/reject` with admin-only authorization, reviewer/timestamp
      recording (FR-005, FR-006, FR-007, FR-008), and a PENDING-only state guard that returns
      409 CONFLICT if the submission has already been decided, so a second admin's concurrent
      action never double-processes it (FR-019) in
      `backend/src/main/java/com/rivals/activity/ActivityController.java` and `ActivityService.java`
      (depends on: T028, T029) — verified live: 20km cycling → 80.00 pts, double-approve → 409,
      non-admin approve → 403
- [X] T031 [US2] Wire `AdminReviewQueue` page to the live API, remove mock dependency, in
      `frontend/src/pages/AdminReviewQueue.tsx` (depends on: T030, T027)

**Checkpoint**: User Stories 1 and 2 both work independently — this is the app's minimum usable
scoring loop.

---

## Phase 5: User Story 3 - Search, Create, and Join Squads (Priority: P3)

**Goal**: An employee can search for, create, and join (or leave) multiple squads.

**Independent Test**: Create a squad, search for it by name from a different account, join it,
and confirm membership without losing membership in any other squad, per spec.md's US3
Independent Test.

### Implementation for User Story 3

- [X] T032 [P] [US3] Create mock JSON fixture matching `SquadSummaryResponse` from
      `contracts/squads.md` in `frontend/src/mocks/squads.json`
- [X] T033 [US3] Build Squads page (search box, create form, join/leave buttons, membership
      indicator) against the mock fixture in `frontend/src/pages/Squads.tsx`
- [X] T034 [P] [US3] Implement `Squad` and `SquadMembership` entities and repositories
      (unique membership constraint per data-model.md) in
      `backend/src/main/java/com/rivals/squad/Squad.java`, `SquadMembership.java`, and their
      repositories
- [X] T035 [P] [US3] Implement squad request/response DTOs per `contracts/squads.md` in
      `backend/src/main/java/com/rivals/squad/dto/`
- [X] T036 [US3] Implement `GET /api/squads?search=&limit=&offset=` (paginated per SC-007) and
      `POST /api/squads` with case-insensitive unique-name enforcement (FR-010, FR-011) in
      `backend/src/main/java/com/rivals/squad/SquadController.java` and `SquadService.java`
      (depends on: T034, T035) — pagination via `OffsetLimitPageable`
      (`backend/src/main/java/com/rivals/common/OffsetLimitPageable.java`)
- [X] T037 [US3] Implement `POST /api/squads/{id}/join` and `POST /api/squads/{id}/leave`
      (FR-012) in `backend/src/main/java/com/rivals/squad/SquadController.java` and
      `SquadService.java` (depends on: T036) — verified live: create → duplicate 409 → search →
      join (count 1→2) → leave (count 2→1)
- [X] T038 [US3] Wire `Squads` page to the live API, remove mock dependency, in
      `frontend/src/pages/Squads.tsx` (depends on: T037, T033)

**Checkpoint**: User Stories 1, 2, and 3 all work independently.

---

## Phase 6: User Story 4 - View Individual and Group Leaderboards (Priority: P4)

**Goal**: Any employee can view a global individual leaderboard and a group leaderboard sortable
by total or average points per member.

**Independent Test**: With approved submissions across two differently-sized squads, confirm the
individual leaderboard orders by total approved points and the group leaderboard produces a
different order under total-vs-average sort, per spec.md's US4 Independent Test.

### Implementation for User Story 4

- [X] T039 [P] [US4] Create mock JSON fixtures matching `IndividualLeaderboardRow[]` and
      `SquadLeaderboardRow[]` from `contracts/leaderboards.md` in
      `frontend/src/mocks/leaderboard-individual.json` and
      `frontend/src/mocks/leaderboard-squads.json`
- [X] T040 [US4] Build Leaderboards page (individual ranking table, squad ranking table with a
      total/average sort toggle) against the mock fixtures in
      `frontend/src/pages/Leaderboards.tsx`
- [X] T041 [P] [US4] Implement individual leaderboard aggregate query and
      `GET /api/leaderboards/individual?limit=&offset=` (FR-013, FR-017 tie-break, paginated per
      SC-007) in `backend/src/main/java/com/rivals/leaderboard/LeaderboardController.java` and
      `LeaderboardService.java` (depends on: T021) — implemented via
      `LeaderboardRepository` (JdbcTemplate aggregate query; no single owning entity)
- [X] T042 [US4] Implement squad leaderboard aggregate query (total + average, zero-member
      handling per research.md #7, tie-break) and
      `GET /api/leaderboards/squads?sortBy=&limit=&offset=` (FR-014, FR-015, FR-016, FR-017,
      paginated per SC-007) in
      `backend/src/main/java/com/rivals/leaderboard/LeaderboardService.java` and
      `LeaderboardController.java` (depends on: T034, T041) — verified live: 2-member squad
      total=250/avg=125 vs 1-member squad total=50/avg=50; invalid sortBy → 400
- [X] T043 [US4] Wire `Leaderboards` page to the live API, remove mock dependency, in
      `frontend/src/pages/Leaderboards.tsx` (depends on: T042, T040)

**Checkpoint**: All four user stories independently functional — full feature complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency and validation pass across all four stories.

- [X] T044 [P] Add navigation links between all pages (Submit, My Submissions, Admin Review
      Queue, Squads, Leaderboards) in `frontend/src/App.tsx` — done as part of T016's `NavBar`
- [X] T045 [P] Audit all Java DTOs for entity leakage and confirm `frontend/tsconfig.json` strict
      mode has zero violations (Constitution Principle II) across `backend/src/main/java/com/rivals/**/dto/`
      and `frontend/src/**/*.tsx` — grep confirms every controller returns only DTOs/`ResponseEntity`/
      `byte[]`/`Void`, zero `any` in frontend source, `tsc --noEmit` clean
- [X] T046 [P] Confirm no wired page still reads from `frontend/src/mocks/` (Constitution
      Principle I mock-to-live cutover complete) across `frontend/src/pages/` — grep confirms zero
      `mocks/` imports outside the mocks directory itself
- [X] T047 Run the full quickstart.md validation (US1-US4 end-to-end scenarios) via PowerShell,
      no Docker, per `specs/001-core-features/quickstart.md` — validated twice: (1) via curl
      against the live backend for every endpoint/error case, and (2) live in a real browser
      (login as user → submit RUNNING 8km → My Submissions shows Pending → log in as admin →
      Admin Review Queue → Approve → queue empties → log back in as user → Uma's total 50→130
      on both leaderboards, squad totals/averages recompute correctly, sort toggle re-fetches)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational only.
- **User Story 2 (Phase 4)**: Depends on Foundational; reuses `ActivitySubmission` from US1
  (T021) — implement after US1 for a working scoring loop, though its own review-queue UI/points
  engine are separable.
- **User Story 3 (Phase 5)**: Depends on Foundational only — fully independent of US1/US2.
- **User Story 4 (Phase 6)**: Depends on Foundational; reads data produced by US1/US2 (points)
  and US3 (squads), so implement last even though its own code is a thin read-only layer.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### Within Each User Story

- Mock fixture → UI against mock (Constitution Principle I) → backend entity/DTOs → backend
  endpoint(s) → wire UI to live endpoint, remove mock.

### Parallel Opportunities

- All Setup tasks marked [P] (T002-T006) run in parallel after T001.
- Within Foundational, T009-T017 marked [P] run in parallel once T007-T008 (migrations) land.
- Once Foundational is complete, US1 and US3 can start in parallel (US2 depends on US1's entity;
  US4 depends on data from US1/US2/US3).
- Within each story, the mock-fixture task and any entity/DTO tasks marked [P] run in parallel;
  the "wire to live API" task is always last and never parallel.

---

## Parallel Example: User Story 1

```text
# After Foundational (Phase 2) completes:
Task: "Create mock JSON fixture matching ActivitySubmissionResponse in frontend/src/mocks/activities.json"
Task: "Implement ActivitySubmission entity and ActivitySubmissionRepository in backend/src/main/java/com/rivals/activity/"
Task: "Implement ActivityType enum and request/response DTOs in backend/src/main/java/com/rivals/activity/dto/"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (blocks everything).
3. Complete Phase 3: User Story 1 (submissions land as Pending).
4. Complete Phase 4: User Story 2 (approval + points) — **this is the smallest end-to-end
   scoring loop and the suggested MVP**, since points and leaderboards have no meaning without it.
5. **STOP and VALIDATE**: run the US1+US2 scenarios from quickstart.md.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 → US2 → validate → demo (MVP: submit, approve, points awarded).
3. US3 → validate → demo (squads usable).
4. US4 → validate → demo (leaderboards complete the feature).
5. Polish pass (Phase 7) once all four stories are in.

---

## Notes

- [P] tasks touch different files with no unmet dependencies.
- [Story] labels trace every task back to its spec.md user story.
- No dedicated test tasks were generated (not requested in spec.md); Setup still installs JUnit
  5/Spring Boot Test and Vitest/React Testing Library so tests can be added later.
- Per Constitution Principle III, commit after each task or small logical group rather than
  batching a whole phase into one commit.
- The base `specs/001-core-features/04-tasks.md` referenced for this generation was empty, so
  this task list was produced directly from plan.md, spec.md, data-model.md, contracts/, and
  research.md.
