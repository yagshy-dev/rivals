---

description: "Task list for Rivals Core Features"
---

# Tasks: Rivals Core Features

**Input**: Design documents from `/specs/001-core-features/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in spec.md; no dedicated test tasks are generated. Testing
frameworks (JUnit 5 + Spring Boot Test, Vitest + React Testing Library) are still installed in
Setup so tests can be added later without re-tooling.

**Organization**: Tasks are grouped by user story (US1-US5, priorities from spec.md) so each can
be implemented, demoed, and validated independently. Per Constitution Principle I (UI-First
Development), every story's frontend task(s) against `frontend/src/mocks/` come before that
story's backend wiring task.

**2026-09-03 addendum**: spec.md was updated with Group-Scoped Roles and Leaderboard Toggling.
This inserted a new User Story 4 (Group-Scoped Roles and Invitations, P2) and renumbered the
former "User Story 4 - Leaderboards" to **User Story 5** (P3, unchanged in scope except for the
new Global/squad toggle). Tasks T001-T047 below are unchanged from the original generation; their
`[US4]` labels on the Leaderboards phase have been relabeled `[US5]` to match. T048 onward are new,
covering the addendum.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
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

## Phase 6: User Story 5 - View Individual and Group Leaderboards (Priority: P3)

**Goal**: Any employee can view a global individual leaderboard and a group leaderboard sortable
by total or average points per member.

**Independent Test**: With approved submissions across two differently-sized squads, confirm the
individual leaderboard orders by total approved points and the group leaderboard produces a
different order under total-vs-average sort, per spec.md's US5 Independent Test.

### Implementation for User Story 5

- [X] T039 [P] [US5] Create mock JSON fixtures matching `IndividualLeaderboardRow[]` and
      `SquadLeaderboardRow[]` from `contracts/leaderboards.md` in
      `frontend/src/mocks/leaderboard-individual.json` and
      `frontend/src/mocks/leaderboard-squads.json`
- [X] T040 [US5] Build Leaderboards page (individual ranking table, squad ranking table with a
      total/average sort toggle) against the mock fixtures in
      `frontend/src/pages/Leaderboards.tsx`
- [X] T041 [P] [US5] Implement individual leaderboard aggregate query and
      `GET /api/leaderboards/individual?limit=&offset=` (FR-013, FR-017 tie-break, paginated per
      SC-007) in `backend/src/main/java/com/rivals/leaderboard/LeaderboardController.java` and
      `LeaderboardService.java` (depends on: T021) — implemented via
      `LeaderboardRepository` (JdbcTemplate aggregate query; no single owning entity)
- [X] T042 [US5] Implement squad leaderboard aggregate query (total + average, zero-member
      handling per research.md #7, tie-break) and
      `GET /api/leaderboards/squads?sortBy=&limit=&offset=` (FR-014, FR-015, FR-016, FR-017,
      paginated per SC-007) in
      `backend/src/main/java/com/rivals/leaderboard/LeaderboardService.java` and
      `LeaderboardController.java` (depends on: T034, T041) — verified live: 2-member squad
      total=250/avg=125 vs 1-member squad total=50/avg=50; invalid sortBy → 400
- [X] T043 [US5] Wire `Leaderboards` page to the live API, remove mock dependency, in
      `frontend/src/pages/Leaderboards.tsx` (depends on: T042, T040)

**Checkpoint**: Original four user stories independently functional. Continued in the 2026-09-03
addendum below (Phase 7: US4 Group-Scoped Roles and Invitations; Phase 8: US5's Global/squad
leaderboard toggle, tasks T063-T066).

---

## Phase 7: User Story 4 - Group-Scoped Roles and Invitations (Priority: P2)

**Goal**: A squad's creator is automatically its Manager; only that squad's Manager(s) can invite
specific employees (who must accept before becoming Members) or promote a Member to also be a
Manager, with roles scoped independently per squad.

**Independent Test**: Create a squad as User A (confirm A is Manager); invite User B via the
employee directory (confirm B sees a pending invite, not yet a member); B accepts (confirm B is
now a Member); B's own attempt to invite a third user is rejected (403); A promotes B to Manager
(confirm B can now invite); per spec.md's US4 Independent Test.

### Implementation for User Story 4

- [X] T048 [US4] Create Flyway migration adding a `role` column (`MANAGER`/`MEMBER`, NOT NULL,
      default `MEMBER`) to `squad_memberships`, backfilling each existing squad's creator's
      membership row to `MANAGER`, and creating a `squad_invitations` table (`id`, `squad_id`,
      `invited_user_id`, `invited_by_user_id`, `status`, `created_at`, `decided_at`) with a
      partial unique index on `(invited_user_id, squad_id) WHERE status = 'PENDING'` and an index
      on `(invited_user_id, status)`, per data-model.md, in
      `backend/src/main/resources/db/migration/V3__squad_roles_and_invitations.sql`
- [X] T049 [P] [US4] Add a `role` field (new `SquadRole` enum: `MANAGER`, `MEMBER`) to the
      `SquadMembership` entity in `backend/src/main/java/com/rivals/squad/SquadMembership.java`
      and `backend/src/main/java/com/rivals/squad/SquadRole.java` (depends on: T048)
- [X] T050 [P] [US4] Implement `SquadInvitation` entity, `InvitationStatus` enum
      (`PENDING`/`ACCEPTED`/`DECLINED`), and `SquadInvitationRepository` (with an
      `existsBySquadIdAndInvitedUserIdAndStatus` lookup for FR-029) per data-model.md in
      `backend/src/main/java/com/rivals/squad/SquadInvitation.java`,
      `backend/src/main/java/com/rivals/squad/InvitationStatus.java`, and
      `backend/src/main/java/com/rivals/squad/SquadInvitationRepository.java` (depends on: T048)
- [X] T051 [P] [US4] Implement `SquadMemberResponse`, `SquadInvitationResponse`,
      `CreateInvitationRequest`, and `UserSummaryResponse` DTOs per `contracts/squads.md`,
      `contracts/invitations.md`, and `contracts/users.md` in
      `backend/src/main/java/com/rivals/squad/dto/` and
      `backend/src/main/java/com/rivals/user/dto/`
- [X] T052 [US4] Update `POST /api/squads` to set the creator's membership `role = MANAGER`
      (FR-020) and update `SquadSummaryResponse`/`GET /api/squads` (adding `currentUserRole` and
      the `mine=true` filter for FR-021/FR-035) in
      `backend/src/main/java/com/rivals/squad/SquadService.java` and `SquadController.java`
      (depends on: T049, T051)
- [X] T053 [US4] Implement `GET /api/squads/{id}/members` (FR-021), restricted to current members
      of that squad, returning each member's role, in
      `backend/src/main/java/com/rivals/squad/SquadController.java` and `SquadService.java`
      (depends on: T049, T051)
- [X] T054 [P] [US4] Implement `GET /api/users?search=` employee-directory search (FR-023) per
      `contracts/users.md` in `backend/src/main/java/com/rivals/user/UserController.java` and
      `backend/src/main/java/com/rivals/user/UserService.java` (depends on: T051)
- [X] T055 [US4] Implement `POST /api/squads/{id}/invitations`, **restricted to callers whose
      `SquadMembership.role = MANAGER` for that squad** (FR-022, FR-024) — return `403 FORBIDDEN`
      for any caller who is a `MEMBER` (not a `MANAGER`) of the target squad — and returning
      `409 CONFLICT` when the invitee is already a member (FR-030) or already has a `PENDING`
      invitation to that squad (FR-029), in
      `backend/src/main/java/com/rivals/squad/SquadController.java` and `SquadService.java`
      (depends on: T050, T051, T053) — this is the Manager-only invite-endpoint restriction —
      verified live: Manager invite → 201 Pending; duplicate pending invite → 409; Member's own
      invite attempt → 403
- [X] T056 [P] [US4] Implement `GET /api/invitations?status=` (FR-026, default `status=PENDING`)
      per `contracts/invitations.md` in
      `backend/src/main/java/com/rivals/squad/InvitationController.java` and
      `backend/src/main/java/com/rivals/squad/InvitationService.java` (depends on: T050, T051)
- [X] T057 [US4] Implement `POST /api/invitations/{id}/accept` (creates a `MEMBER`
      `SquadMembership`, FR-025, FR-027) and `POST /api/invitations/{id}/decline` (FR-028), both
      restricted to the invited user and both returning `409 CONFLICT` if the invitation is no
      longer `PENDING`, in
      `backend/src/main/java/com/rivals/squad/InvitationController.java` and
      `InvitationService.java` (depends on: T056) — verify: accept creates a membership with role
      `MEMBER`; decline creates no membership and a later invite to the same user/squad still
      succeeds (FR-028) — verified live: accept → 200 Accepted + Member row created; decline → 200
      Declined + no membership; re-invite after decline → 201; accept/decline on an
      already-decided invitation → 409
- [X] T058 [US4] Implement `POST /api/squads/{id}/members/{userId}/promote`, **restricted to
      callers whose `SquadMembership.role = MANAGER` for that squad** (FR-031, FR-032) — return
      `403 FORBIDDEN` for a `MEMBER` caller — in
      `backend/src/main/java/com/rivals/squad/SquadController.java` and `SquadService.java`
      (depends on: T053) — verified live: Member promote attempt → 403; Manager promote → 200,
      promoted user's role becomes MANAGER and can then invite/promote themselves
- [X] T059 [P] [US4] Create mock JSON fixtures matching `SquadMemberResponse[]`,
      `SquadInvitationResponse[]`, and `UserSummaryResponse[]` from `contracts/squads.md`,
      `contracts/invitations.md`, and `contracts/users.md` in
      `frontend/src/mocks/squad-members.json`, `frontend/src/mocks/invitations.json`, and
      `frontend/src/mocks/users.json`
- [X] T060 [US4] Build a Squad Detail view showing members and their roles, a Manager-only
      "Invite" control (employee-directory search-and-select against `users.json`), and a
      Manager-only "Promote to Manager" action per member row, against the mock fixtures, in
      `frontend/src/pages/SquadDetail.tsx` (new page, linked from `frontend/src/pages/Squads.tsx`)
      (depends on: T059)
- [X] T061 [P] [US4] Build a "My Invitations" inbox page (list pending invites with squad name and
      inviting Manager, Accept/Decline actions) against the mock fixture in
      `frontend/src/pages/Invitations.tsx` (depends on: T059)
- [X] T062 [US4] Wire `SquadDetail` and `Invitations` pages to the live API, remove mock
      dependency, in `frontend/src/pages/SquadDetail.tsx` and `frontend/src/pages/Invitations.tsx`
      (depends on: T052, T053, T054, T055, T057, T058, T060, T061) — verify end-to-end: create
      squad → creator shown as Manager → invite via directory search → invitee sees pending invite
      → accept → invitee appears as Member → that Member's own invite attempt → 403 → original
      Manager promotes the Member → both now show as Manager — verified live end-to-end via curl
      against the running backend for every step and every error case above

**Checkpoint**: User Story 4 fully functional and independently testable — Manager assignment on
creation, Manager-only invites with accept/decline, and Manager promotion all work per spec.md's
US4 Independent Test, without depending on the Leaderboard Toggle below.

---

## Phase 8: User Story 5 (continued) - Leaderboard Toggling — Global vs. Squad Selector

**Goal**: Extend User Story 5's Leaderboards page with a dropdown/tab selector that switches the
individual leaderboard between the Global ranking and the ranking of any squad the user belongs
to (FR-033-FR-035), per spec.md User Story 5 acceptance scenarios 5-6.

**Independent Test**: As a user in one or more squads, open the leaderboard selector; confirm it
defaults to "Global", lists only squads the user belongs to, and switching to a squad re-renders
the individual ranking restricted to that squad's members, per spec.md's US5 Independent Test.

### Implementation for the Leaderboard Toggle (User Story 5)

- [X] T063 [US5] Extend `GET /api/leaderboards/individual` with an optional `squadId` query
      parameter that restricts rows to that squad's current members (FR-033), returning
      `403 FORBIDDEN` if the caller is not currently a member of `squadId` (FR-035) per
      `contracts/leaderboards.md`, in
      `backend/src/main/java/com/rivals/leaderboard/LeaderboardController.java` and
      `LeaderboardService.java` (depends on: T041, T052) — this is the backend half of the
      leaderboard toggle — verified live: Global (no squadId) lists all users; `squadId` for a
      squad the caller belongs to restricts rows to that squad's members; unknown `squadId` → 404
- [X] T064 [P] [US5] Create a mock JSON fixture for the squad-scoped leaderboard view matching the
      `squadId`-filtered `IndividualLeaderboardRow[]` shape in
      `frontend/src/mocks/leaderboard-individual-squad.json`
- [X] T065 [US5] Add a dropdown/tab selector to the Leaderboards page for switching between
      "Global" and each squad the current user belongs to — defaulting to "Global" on first load
      (FR-034) and listing only the user's own squads (FR-035, via `GET /api/squads?mine=true`) —
      re-rendering the individual leaderboard table for the selected scope, against the mock
      fixtures, in `frontend/src/pages/Leaderboards.tsx` (depends on: T064) — this is the React
      dropdown/tab selector called out in the addendum
- [X] T066 [US5] Wire the leaderboard selector to the live `squadId`-scoped endpoint and the
      `mine=true` squads endpoint, remove mock dependency, in `frontend/src/pages/Leaderboards.tsx`
      (depends on: T063, T065) — verify: default view is Global; selecting a squad the user
      belongs to shows only that squad's members ranked; squads the user does not belong to are
      never offered by the selector — verified: `tsc --noEmit` and ESLint clean; `GET
      /api/squads?mine=true` confirmed to list only the caller's own squads

**Checkpoint**: User Story 5, including the Global/squad leaderboard toggle, fully functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency and validation pass across all five stories.

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
- [X] T067 [P] Confirm no wired addendum page still reads from `frontend/src/mocks/`
      (`squad-members.json`, `invitations.json`, `users.json`,
      `leaderboard-individual-squad.json`) across `frontend/src/pages/SquadDetail.tsx`,
      `Invitations.tsx`, and `Leaderboards.tsx` — grep confirms zero `mocks/` imports in any page;
      the fixtures remain checked in as the contract reference per Principle I
- [X] T068 [P] Audit the new Java entities/DTOs (`SquadRole`, `SquadInvitation`,
      `InvitationStatus`, and the member/invitation/user DTOs) for entity leakage across the
      controller boundary (Constitution Principle II) in `backend/src/main/java/com/rivals/squad/`
      and `backend/src/main/java/com/rivals/user/` — grep confirms every new controller method
      returns only DTOs/`ResponseEntity`, never an entity; `tsc --noEmit` and ESLint clean with
      zero `any` in the new frontend source
- [X] T069 Run the addendum's quickstart.md validation scenarios (US4 — invitations and role
      promotion; US5 — the Global/squad leaderboard toggle) via PowerShell, no Docker, per
      `specs/001-core-features/quickstart.md` — validated live via curl against the running
      backend: squad creation → Manager role; directory search (incl. blank-query 400); invite →
      Pending → accept → Member; duplicate-invite 409; non-Manager invite/promote → 403; promote →
      Manager; decline → no membership + re-invite still allowed; already-decided invite → 409;
      Global vs. squad-scoped leaderboard rows differ correctly; unknown `squadId` → 404;
      `mine=true` squads filter correct

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
- **User Story 5, original scope (Phase 6)**: Depends on Foundational; reads data produced by
  US1/US2 (points) and US3 (squads).
- **User Story 4 (Phase 7, addendum)**: Depends on Foundational and on US3's `Squad`/
  `SquadMembership` entities (T034) — it adds a `role` column to that same table and a new
  `SquadInvitation` entity. Independent of US1/US2/US5.
- **User Story 5, Leaderboard Toggle (Phase 8, addendum)**: Depends on US5's original individual
  leaderboard endpoint (T041, extended by T063) and on US3's squad membership (T034, for the
  `mine=true` selector list, T052). **Does not depend on US4** — the toggle only needs a user's
  squad memberships, not the Manager/Member role distinction, so it can be built in parallel with
  Phase 7.
- **Polish (Phase 9)**: Depends on all desired user stories being complete.

### Within Each User Story

- Mock fixture → UI against mock (Constitution Principle I) → backend entity/DTOs → backend
  endpoint(s) → wire UI to live endpoint, remove mock.

### Parallel Opportunities

- All Setup tasks marked [P] (T002-T006) run in parallel after T001.
- Within Foundational, T009-T017 marked [P] run in parallel once T007-T008 (migrations) land.
- Once Foundational is complete, US1 and US3 can start in parallel (US2 depends on US1's entity;
  US5's original scope depends on data from US1/US2/US3).
- Within each story, the mock-fixture task and any entity/DTO tasks marked [P] run in parallel;
  the "wire to live API" task is always last and never parallel.
- **Addendum**: Phase 7 (US4) and Phase 8 (US5 Leaderboard Toggle) can be worked in parallel by
  different developers once T034 (US3's `Squad`/`SquadMembership`) and T041 (US5's individual
  leaderboard) exist — they touch different backend endpoints (`squad`/`invitations` vs.
  `leaderboard`) and different new frontend pages (`SquadDetail.tsx`/`Invitations.tsx` vs.
  `Leaderboards.tsx`). Within Phase 7, T049 and T050 run in parallel (different new files); T054
  and T056 run in parallel (different controllers).

---

## Parallel Example: User Story 1

```text
# After Foundational (Phase 2) completes:
Task: "Create mock JSON fixture matching ActivitySubmissionResponse in frontend/src/mocks/activities.json"
Task: "Implement ActivitySubmission entity and ActivitySubmissionRepository in backend/src/main/java/com/rivals/activity/"
Task: "Implement ActivityType enum and request/response DTOs in backend/src/main/java/com/rivals/activity/dto/"
```

---

## Parallel Example: Addendum (User Story 4 + Leaderboard Toggle)

```text
# After T034 (Squad/SquadMembership) and T041 (individual leaderboard) exist:
Task: "Add role field to SquadMembership entity in backend/src/main/java/com/rivals/squad/SquadMembership.java"
Task: "Implement SquadInvitation entity, InvitationStatus enum, and SquadInvitationRepository in backend/src/main/java/com/rivals/squad/"
Task: "Extend GET /api/leaderboards/individual with an optional squadId query parameter in backend/src/main/java/com/rivals/leaderboard/"
Task: "Create mock JSON fixtures for squad-members, invitations, and users in frontend/src/mocks/"
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
4. US5 (original scope) → validate → demo (leaderboards complete the original feature).
5. **Addendum**: US4 (Phase 7) and US5's Leaderboard Toggle (Phase 8) → validate independently →
   demo (group-scoped roles/invitations, and the Global/squad leaderboard selector).
6. Polish pass (Phase 9) once all five stories are in.

### Addendum MVP (Group-Scoped Roles and Leaderboard Toggling)

If delivering the 2026-09-03 addendum as its own increment on top of the already-shipped four
stories:

1. Complete Phase 7: User Story 4 (roles, invitations, promotion) — independently testable per
   its own Independent Test above, with no dependency on the toggle.
2. Complete Phase 8: User Story 5's Leaderboard Toggle — independently testable, with no
   dependency on US4's role/invite work (only on existing squad membership from US3).
3. **STOP and VALIDATE**: run the US4 and Leaderboard Toggle scenarios from quickstart.md.
4. Complete Phase 9's new polish tasks (T067-T069).

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
- **2026-09-03 addendum**: T048-T069 were generated after spec.md/plan.md were updated with
  Group-Scoped Roles and Leaderboard Toggling. T001-T047 are unchanged except for relabeling the
  Leaderboards phase from `[US4]`/P4 to `[US5]`/P3 to match the renumbered spec.md.
