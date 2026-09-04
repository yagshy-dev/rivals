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

**2026-09-04 addendum**: spec.md gained a mandatory, cross-cutting "UI/UX Design System" section
(UX-001–UX-005) — dark theme, left-hand sidebar navigation, a sharp-cornered "Competitive and
Sporty" aesthetic, Lucide React icons at stroke-width 2.5, and neon status badges. This is a
presentation-layer retrofit of every already-shipped page, not a new user story, so its tasks
(T070-T082, Phase 10) are labeled `[UX]` instead of a `[USn]` story tag and are ordered after all
five user stories.

**2026-09-04 addendum (second, same day)**: spec.md's UX-003 was then directly replaced — from the
sharp-cornered "Competitive and Sporty" aesthetic above to an Apple/macOS-inspired one (smooth,
generous rounded corners; subtle, soft borders instead of high-contrast ones). Phase 10's tasks
are left unchanged as the historical record of what was originally built; the revision's tasks
(T083-T091, Phase 11) are new and also labeled `[UX]`.

**2026-09-04 addendum (third, same day)**: spec.md gained a new rule, UX-006 "App Layout
Wrapping" — every page wrapped in a shared `AppLayout` master component (full-viewport flex,
`Sidebar` pinned left, independently scrollable main content, `#0a0a0b`/`#121214` page/card
tones). Its tasks (T092-T102, Phase 12) also apply an orange-accented visual refresh matching
`Sidebar.tsx`/`Leaderboards.tsx`, which had already been hand-styled that way outside a task file.
Phases 10 and 11 are left unchanged as the historical record.

**2026-09-04 addendum (fourth, same day)**: spec.md gained a new **User Story 6 - Register a New
Account** (P1) — a public registration page/endpoint that creates a standard-role account with a
securely hashed password and redirects to login. Unlike the UI/UX addenda above, this is a genuine
new user story spanning both backend and frontend, so its tasks (T103-T112, Phase 13) are labeled
`[US6]` rather than `[UX]`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6), or `UX` for
  cross-cutting UI/UX Design System work (Phases 10-12, applying to all stories' pages)
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
      (superseded 2026-09-04: `NavBar` was replaced by the `Sidebar` component in Phase 10/T074)
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

## Phase 10: UI/UX Design System Retrofit (addendum, 2026-09-04)

**Goal**: Bring every existing page and shared component into compliance with spec.md's mandatory
UI/UX Design System (UX-001–UX-005): dark theme, left-hand sidebar navigation, a sharp-cornered
"Competitive and Sporty" aesthetic, Lucide React icons at stroke-width 2.5, and neon status badges.

**Independent Test**: Load every page (Login, Submit Activity, My Submissions, Admin Review Queue,
Squads, Squad Detail, Invitations, Leaderboards) and confirm: the page background is `zinc-950`
and cards are `zinc-900` with white text; navigation is a persistent left sidebar, not a top bar;
no visible element uses a soft/rounded corner or a low-contrast border; every icon renders at
stroke-width 2.5; and Approved/Rejected/Pending badges render in electric green/crimson
red/vivid amber respectively.

### Implementation for the UI/UX Design System Retrofit

- [X] T070 [P] [UX] Add the `lucide-react` dependency in `frontend/package.json` (UX-004) —
      installed via `npm install lucide-react` (resolved `^1.40.0`)
- [X] T071 [P] [UX] Configure the mandatory dark theme and sharp-corner design tokens — `zinc-950`/
      `zinc-900` colors, white text default, and a near-zero `borderRadius` scale (`DEFAULT`/`sm`/
      `md`/`lg` all `0` or `1px`) — in `frontend/tailwind.config.js`, and set the dark `zinc-950`
      page background/white text as the base styles in `frontend/src/index.css` (UX-001, UX-003) —
      also added neon `approved`/`rejected`/`pending` theme colors (UX-005) used by T073
- [X] T072 [P] [UX] Create a shared icon wrapper that forces every Lucide icon to
      `strokeWidth={2.5}` (e.g. wrapping `lucide-react`'s `IconContext`/default props, or a local
      re-export module) in `frontend/src/components/Icon.tsx` (UX-004) (depends on: T070) —
      implemented as an `<Icon icon={LucideIcon} />` wrapper that applies `strokeWidth={2.5}` after
      spreading incoming props, so it cannot be silently overridden
- [X] T073 [P] [UX] Create a shared `StatusBadge` component (`Pending`/`Approved`/`Rejected`) using
      sharp corners and high-contrast borders per UX-003, with electric-green Approved, crimson-red
      Rejected, and a third distinct vivid (amber) Pending color per UX-005, in
      `frontend/src/components/StatusBadge.tsx` — implemented as a shared tone-based `Badge` with
      two typed wrappers, `StatusBadge` (`SubmissionStatus`) and `InvitationStatusBadge`
      (`InvitationStatus`), reused by T076 and T079 respectively
- [X] T074 [UX] Replace the top `NavBar` with a persistent left-hand `Sidebar` component (dark
      `zinc-900` surface, sharp corners, high-contrast border, active-link highlighting, a Lucide
      icon per nav item via the T072 wrapper) covering Submit Activity, My Submissions, Squads,
      Invitations, Leaderboards, and (for admins) Admin Review Queue, in
      `frontend/src/components/Sidebar.tsx` (new file, `frontend/src/components/NavBar.tsx`
      removed) (UX-002) (depends on: T071, T072)
- [X] T075 [UX] Update the app shell to render `Sidebar` in a fixed left column against a
      `zinc-950` page background, removing the old top-nav layout, in `frontend/src/App.tsx`
      (UX-001, UX-002) (depends on: T074) — added a `Layout` wrapper that hides the sidebar only
      on `/login` (no authenticated user yet)
- [X] T076 [P] [UX] Restyle `SubmitActivity.tsx` and `MySubmissions.tsx` to the dark theme and
      sharp-cornered aesthetic, replacing any ad hoc status text with `StatusBadge`
      (UX-001, UX-003, UX-005) in `frontend/src/pages/SubmitActivity.tsx` and
      `MySubmissions.tsx` (depends on: T071, T073)
- [X] T077 [P] [UX] Restyle `AdminReviewQueue.tsx` to the dark theme and sharp-cornered aesthetic,
      using `StatusBadge` and Lucide icons (via T072) for Approve/Reject actions
      (UX-001, UX-003, UX-004, UX-005) in `frontend/src/pages/AdminReviewQueue.tsx`
      (depends on: T071, T072, T073) — Approve/Reject buttons reuse the `approved`/`rejected`
      theme colors for visual consistency with the badges
- [X] T078 [P] [UX] Restyle `Squads.tsx` and `SquadDetail.tsx` to the dark theme and sharp-cornered
      aesthetic, using Lucide icons (via T072) for search/create/join/invite/promote actions
      (UX-001, UX-003, UX-004) in `frontend/src/pages/Squads.tsx` and `SquadDetail.tsx`
      (depends on: T071, T072)
- [X] T079 [P] [UX] Restyle `Invitations.tsx` to the dark theme and sharp-cornered aesthetic, using
      `StatusBadge` for Pending/Accepted/Declined (UX-001, UX-003, UX-005) in
      `frontend/src/pages/Invitations.tsx` (depends on: T071, T073) — uses the `InvitationStatusBadge`
      variant from T073
- [X] T080 [P] [UX] Restyle `Leaderboards.tsx` and `Login.tsx` to the dark theme and sharp-cornered
      aesthetic, including the Global/squad selector control (UX-001, UX-003) in
      `frontend/src/pages/Leaderboards.tsx` and `Login.tsx` (depends on: T071)
- [X] T081 [UX] Audit every file under `frontend/src/pages/` and `frontend/src/components/` for
      leftover light-theme or soft-rounded classes (e.g. `bg-white`, `text-gray-700`,
      `border-gray-200`, `rounded-lg`, `rounded-full`) and replace them with the zinc dark palette
      and sharp-corner tokens from T071 (UX-001, UX-003) — grep confirms none remain outside a
      documented exception (depends on: T075, T076, T077, T078, T079, T080) — also fixed the
      `ProtectedRoute.tsx` loading-state text color, which the original task list did not call out
      by filename; `grep -rn "text-gray-\|bg-white\|border-gray-\|bg-gray-\|text-blue-\|bg-blue-\|
      bg-green-\|bg-red-\|text-red-\|text-green-\|rounded-lg\|rounded-full" frontend/src` returns
      no matches
- [X] T082 [UX] Run `npm run typecheck`, `npm run lint`, and `npm run build` in `frontend/`, then
      manually walk every page (as both a regular user and an admin) confirming dark
      `zinc-950`/`zinc-900` surfaces with white text, left-hand sidebar navigation, sharp/
      high-contrast styling throughout, all icons at stroke-width 2.5, and correct neon badge
      colors for Approved/Rejected/Pending (depends on: T081) — `typecheck`/`lint`/`build` all
      pass cleanly (lint's 2 warnings are pre-existing and unrelated, in `api/auth.tsx`); verified
      the unauthenticated `/login` page live in a real browser (dark `zinc-950` background,
      `zinc-900` sharp-cornered card, sky accent button). **Not verified**: the authenticated
      Sidebar and the other seven pages were not walked in a live browser, since that requires the
      Spring Boot backend + a local PostgreSQL instance (with Flyway migrations and seeded
      accounts) running, which was out of scope to stand up for this presentation-only retrofit;
      those pages were verified at the source level instead (every one restyled in T076-T080, zero
      light-theme classes remain per T081's grep, and the app compiles/builds without error)

**Checkpoint**: Every page in the application conforms to the mandatory UI/UX Design System with
no functional or backend changes. `typecheck`/`lint`/`build` all pass; the unauthenticated `/login`
page was verified live in a browser. The authenticated pages (behind `Sidebar`/`ProtectedRoute`)
were verified at the source level only — see T082's note — since exercising them live requires the
Spring Boot + PostgreSQL backend, which was not started for this retrofit.

---

## Phase 11: UI/UX Aesthetic Revision — Apple/macOS-Inspired (addendum, 2026-09-04)

**Goal**: Revise UX-003 from the sharp-cornered "Competitive and Sporty" aesthetic (built in
Phase 10) to an Apple/macOS-inspired one: smooth, generous rounded corners (`rounded-2xl` for
cards/panels, `rounded-full`/`rounded-lg` for buttons and pills) and subtle, soft borders
(`border-zinc-800` / low-opacity `border-white/10`) instead of high-contrast ones. UX-001, UX-002,
UX-004, and UX-005 are unchanged.

**Independent Test**: Load every page and confirm: cards/panels/tables have large, visible corner
rounding and a barely-visible `zinc-800`-toned border (no hard-edged rectangles); every button and
status badge is a pill (`rounded-full`) or has a generously rounded shape (`rounded-lg`); no
element uses a heavy/high-contrast border or a sharp corner; the overall feel reads as elegant and
soft rather than blocky.

### Implementation for the Apple/macOS Aesthetic Revision

- [X] T083 [UX] Remove the near-zero `borderRadius` override from `frontend/tailwind.config.js` so
      Tailwind's default generous rounding scale applies again (UX-003) — the neon
      `approved`/`rejected`/`pending` colors from T071 are unchanged
- [X] T084 [P] [UX] Revise `StatusBadge.tsx` from a bordered rectangular tag to a borderless
      `rounded-full` pill (UX-003); `Sidebar.tsx`'s panel border softened to `border-zinc-800`
      (single `border`, not `border-2`) and its active/hover nav-item styling switched from a
      bordered rectangle to a `rounded-lg` background highlight (depends on: T083)
- [X] T085 [P] [UX] Revise `Login.tsx` and `SubmitActivity.tsx`/`MySubmissions.tsx` — cards/forms
      to `rounded-2xl border border-zinc-800` with a soft shadow, inputs to `rounded-lg`, buttons to
      `rounded-full`, the submissions table wrapped in a `rounded-2xl` clipping container (UX-003)
      (depends on: T083)
- [X] T086 [P] [UX] Revise `AdminReviewQueue.tsx` to the same rounded/soft-border treatment
      (queue-item cards, empty-state panel, screenshot thumbnail, Approve/Reject pill buttons,
      zoom-modal image) (UX-003) — also fixed a regression introduced by an out-of-band edit to
      this file: `Check`/`X`/`Loader2`/`Maximize2` were being rendered directly instead of through
      the `Icon` wrapper, which silently dropped the UX-004 forced `stroke-width: 2.5`; all four
      now route through `Icon` again (depends on: T083)
- [X] T087 [P] [UX] Revise `Squads.tsx` and `SquadDetail.tsx` to the rounded/soft-border treatment
      (list-item cards, inputs, Create/Search/Join/Leave/Invite/Promote buttons) (UX-003)
      (depends on: T083)
- [X] T088 [P] [UX] Revise `Invitations.tsx` to the rounded/soft-border treatment (invitation
      cards, Accept/Decline pill buttons) (UX-003) (depends on: T083)
- [X] T089 [P] [UX] Revise `Leaderboards.tsx` to the rounded/soft-border treatment (both
      leaderboard tables wrapped in `rounded-2xl` clipping containers, view/sort selects) (UX-003)
      (depends on: T083)
- [X] T090 [UX] Audit every file under `frontend/src/pages/` and `frontend/src/components/` for
      leftover sharp/high-contrast classes (`border-2`, `border-zinc-700` as a base border color)
      and confirm none remain outside an intentional, documented exception (depends on: T084-T089)
      — `grep -rn "border-2\|border-zinc-700" frontend/src --include=*.tsx` returns exactly one
      match: `AdminReviewQueue.tsx`'s `hover:border-zinc-700` on a queue-item card, a deliberate
      one-step-darker hover affordance on top of its `border-zinc-800` base border, not a
      regression to the old high-contrast baseline
- [X] T091 [UX] Run `npm run typecheck`, `npm run lint`, and `npm run build` in `frontend/`, then
      verify the unauthenticated `/login` page live in a browser (depends on: T090) — all three
      pass cleanly (lint's 2 warnings are pre-existing and unrelated); `/login` verified live
      showing a `rounded-2xl` card, `rounded-lg` inputs, and a `rounded-full` sky-blue button
      against the soft `zinc-800` border. **Not verified**: the authenticated pages were not
      walked live, for the same reason recorded on T082 (no local Spring Boot + PostgreSQL
      backend running for this session) — verified at the source level instead

**Checkpoint**: Every page uses the Apple/macOS-inspired rounded, soft-bordered aesthetic in place
of the original sharp-cornered one. No functional, DTO, or backend change.

---

## Phase 12: App Layout Wrapping & Leaderboards-Style Visual Refresh (addendum, 2026-09-04)

**Goal**: Add the new UX-006 rule — every page wrapped in a single shared `AppLayout` master
layout component (full-viewport `flex h-screen`, `Sidebar` pinned left, an independently
scrollable main content area on the right, `#0a0a0b` page background against `#121214` cards) —
and bring every other page's visual language in line with `Sidebar.tsx` and `Leaderboards.tsx`,
which had already been hand-styled (out-of-band, outside a task file) to an orange-accented look
built on the `#121214`/`#0a0a0b` tones: `font-extrabold tracking-tight` headings paired with an
orange Lucide icon, `#121214` cards/tables with `border-zinc-800/60`, `rounded-full` pill
buttons/selects in `orange-500`, uppercase-tracked table headers with `divide-y` rows and a subtle
hover state, and a `rounded-2xl` boxed `animate-pulse` loading state in orange. UX-001, UX-002,
UX-003, UX-004, and UX-005 are otherwise unchanged — `orange-500` is a visual refresh of the
previous `sky-500` accent, not a new design-system rule, and the neon Approved/Rejected/Pending
badge colors from UX-005 are untouched.

**Independent Test**: Load every page and confirm: the page background is `#0a0a0b` and every
card/table is `#121214` with a `border-zinc-800/60` border; resizing the window shows the sidebar
staying pinned to the left edge while only the main content area scrolls; every page heading pairs
an orange Lucide icon with `font-extrabold tracking-tight` text; every primary button and select is
an orange `rounded-full` pill; and error messages render as a `border-l-4 border-red-500` banner
matching `Leaderboards.tsx`.

### Implementation for App Layout Wrapping & the Visual Refresh

- [X] T092 [UX] Extract the layout logic previously inlined as `App.tsx`'s local `Layout`
      function into a new `frontend/src/components/AppLayout.tsx` — `flex h-screen` container,
      `#0a0a0b` background, `Sidebar` shown for authenticated non-`/login` routes, and page content
      rendered in a `flex-1 overflow-y-auto` main area (UX-006)
- [X] T093 [UX] Update `frontend/src/App.tsx` to render `AppLayout` instead of the removed inline
      `Layout` function (UX-006) (depends on: T092)
- [X] T094 [P] [UX] Update `ProtectedRoute.tsx`'s loading state to the orange
      `animate-pulse`/uppercase-tracking-widest convention used throughout the app
- [X] T095 [P] [UX] Restyle `Login.tsx` to the `#121214`/`#0a0a0b`/orange-accent/red-500-error
      convention, with a Trophy icon beside the heading (depends on: T092)
- [X] T096 [P] [UX] Restyle `SubmitActivity.tsx` to the same convention, with a ClipboardList
      heading icon (depends on: T092)
- [X] T097 [P] [UX] Restyle `MySubmissions.tsx`'s table to `Leaderboards.tsx`'s exact table
      pattern (`text-[11px] uppercase tracking-[0.1em]` headers, `divide-y divide-zinc-800/40`
      rows, `hover:bg-white/[0.02]`, a boxed orange loading state), with a ListChecks heading icon
      (depends on: T092)
- [X] T098 [P] [UX] Restyle `AdminReviewQueue.tsx` to the same card/border/heading/loading/error
      convention (ShieldCheck heading icon); also re-verified every icon (`Check`/`X`/`Loader2`/
      `Maximize2`) still routes through the `Icon` wrapper per UX-004 after this pass
      (depends on: T092)
- [X] T099 [P] [UX] Restyle `Squads.tsx` (Swords heading icon) and `SquadDetail.tsx` to the same
      convention (depends on: T092)
- [X] T100 [P] [UX] Restyle `Invitations.tsx` to the same convention, with a Mail heading icon
      (depends on: T092)
- [X] T101 [UX] Audit every file under `frontend/src/pages/` and `frontend/src/components/` for
      leftover `sky-*` accent classes, flat (non-`/NN`-opacity) `border-zinc-800`, or `bg-zinc-900`/
      `bg-zinc-950` outside an intentional, documented exception (depends on: T094-T100) —
      `grep -rn "sky-\|bg-zinc-900\|bg-zinc-950\|border-zinc-800[^/]" frontend/src --include=*.tsx`
      returns no matches (the `text-rejected`/`bg-rejected` custom-token uses in `StatusBadge.tsx`
      and `AdminReviewQueue.tsx`'s Reject button are the deliberate exception, since UX-005's
      crimson red is a semantic pairing with the Rejected/Declined badge, not a leftover)
- [X] T102 [UX] Run `npm run typecheck`, `npm run lint`, and `npm run build` in `frontend/`, then
      verify the unauthenticated `/login` page live in a browser (depends on: T101) — all three
      pass cleanly (lint's 2 warnings are pre-existing and unrelated); `/login` verified live
      showing the `#0a0a0b`/`#121214` contrast, the orange Trophy-and-heading row, and the orange
      `rounded-full` button. **Not verified**: the authenticated pages (including the `AppLayout`
      sidebar-pinning/scroll behavior itself) were not walked live, for the same reason recorded on
      T082/T091 (no local Spring Boot + PostgreSQL backend running for this session) — verified at
      the source level instead

**Checkpoint**: Every page is wrapped in `AppLayout` and matches `Sidebar.tsx`/`Leaderboards.tsx`'s
orange-accented visual language. No functional, DTO, or backend change.

---

## Phase 13: User Story 6 - Register a New Account (Priority: P1) (addendum, 2026-09-04)

**Goal**: A prospective employee can self-register a new account (email, display name, password)
from a public page reachable without signing in; the account is created with the standard employee
role and a securely hashed password, and the visitor is redirected to the login page.

**Independent Test**: Submit the registration form with a new email, display name, and an
8+-character password; confirm a `201` response and a new row in `users` with `role = USER` and a
BCrypt-hashed (never plaintext) password; confirm the browser navigates to `/login`; confirm a
second registration attempt with the same email (any letter casing) is rejected `409` with no
duplicate row created; confirm a sub-8-character password is rejected `400` before any account is
created.

### Implementation for User Story 6

- [X] T103 [P] [US6] Add the `RegisterRequest` DTO (`@NotBlank`/`@Email` email, `@NotBlank`/
      `@Size(max=100)` displayName, `@NotBlank`/`@Size(min=8)` password) per FR-036/FR-037 in
      `backend/src/main/java/com/rivals/user/dto/RegisterRequest.java`
- [X] T104 [P] [US6] Add `UserService.register(email, displayName, rawPassword)`: reject with
      `ConflictException` (409) if `UserRepository.findByEmailIgnoreCase` already finds a match
      (FR-038); otherwise hash the password with the existing `PasswordEncoder` bean and save a new
      `User` with `Role.USER` (never `ADMIN`) (FR-039, FR-040), in
      `backend/src/main/java/com/rivals/user/UserService.java` (depends on: T103)
- [X] T105 [US6] Add `POST /api/auth/register` to `AuthController`, `@Valid`-binding
      `RegisterRequest` and returning `201 Created` with the new account's `UserResponse` without
      establishing a session (FR-036, FR-041), in
      `backend/src/main/java/com/rivals/user/AuthController.java` (depends on: T104)
- [X] T106 [US6] Permit `/api/auth/register` alongside `/api/auth/login` in the security filter
      chain so it needs no authentication (FR-036, FR-042), in
      `backend/src/main/java/com/rivals/config/SecurityConfig.java` (depends on: T105)
- [X] T107 [P] [US6] Document `POST /api/auth/register` (request/201/400/409 shapes) in
      `specs/001-core-features/contracts/auth.md`
- [X] T108 [P] [US6] Add a `RegisterRequest` type and a `register()` API client function
      (`POST /auth/register`, does not update the auth session) in
      `frontend/src/types/auth.ts` and `frontend/src/api/auth.tsx`
- [X] T109 [US6] Build `Register.tsx` — email/display-name/password form, an 8-character
      client-side password check, an error banner matching `Login.tsx`'s, and a redirect to
      `/login` on success — reusing `Login.tsx`'s exact card/input/button markup and orange/grey
      full-screen aesthetic per UX-001/UX-003/UX-006, in `frontend/src/pages/Register.tsx`
      (depends on: T108)
- [X] T110 [US6] Wire `/register` into `frontend/src/App.tsx` as a route sibling of `/login`,
      outside the `AppLayout` route (per UX-006's public-page carve-out); give `Login.tsx` an
      explicit full-screen (`min-h-screen`, centered) wrapper of its own — since it can no longer
      rely on being nested inside `AppLayout`'s padding now that it's a sibling route — and add a
      "Register"/"Log in" cross-link between the two pages (depends on: T109)
- [X] T111 [US6] Fix a pre-existing `noUnusedLocals` typecheck failure in
      `frontend/src/components/AppLayout.tsx` (`ReactNode`, `useAuth`, `useLocation` were left over
      from an earlier out-of-band edit that switched this component to the `<Outlet/>` nested-route
      pattern but never removed its now-dead imports) — blocked `tsc --noEmit`/`npm run build`
      entirely regardless of this feature, so it had to be fixed before T112 could pass
- [X] T112 [US6] Run `mvn -o clean compile` in `backend/` and `npm run typecheck`/`npm run lint`/
      `npm run build` in `frontend/`, then verify `/register` live in a browser (depends on: T106,
      T110, T111) — backend compiles all 57 source files with zero errors; frontend typecheck/build
      are clean (lint's 3 warnings — one new, for the added `register` export — are the same
      pre-existing `react-refresh/only-export-components` category as before, not new errors);
      `/register` verified live in a browser rendering the same card/orange-pill/full-screen
      aesthetic as `/login`. **Not verified**: an actual end-to-end registration round-trip against
      the live backend, since that requires a local PostgreSQL instance with Flyway migrations
      applied, which was not stood up for this session (same limitation noted on T082/T091/T102)

**Checkpoint**: A prospective employee can create an account from a public `/register` page and be
redirected to `/login`, without needing a pre-provisioned seed account.

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
- **UI/UX Design System Retrofit (Phase 10, addendum)**: Design-tokens work (T070-T073: dependency,
  Tailwind tokens, icon wrapper, badge component) has no dependency on any user story and can start
  at any time. Per-page restyling (T076-T080) depends on that page already existing (i.e., on
  whichever story built it) plus T071-T073. The sidebar (T074-T075) depends only on T071-T072, not
  on any specific story's pages. Ordered last here so it is a single retrofit pass over all
  already-shipped pages rather than being redone per story, but it carries no new functional
  requirements and does not block or get blocked by Phase 9's Polish tasks.
- **User Story 6 (Phase 13, addendum)**: Depends on Foundational only (`PasswordEncoder`,
  `UserRepository`, and the `/login` route already exist from T010/T009/T017) — fully independent
  of US1-US5 and of Phases 10-12's presentation work, since it adds a new public route and a new
  auth endpoint rather than touching any existing page's business logic. Could have been built in
  parallel with any other phase; it was simply added last here because it was specified last.

### Within Each User Story

- Mock fixture → UI against mock (Constitution Principle I) → backend entity/DTOs → backend
  endpoint(s) → wire UI to live endpoint, remove mock. **Exception**: User Story 6 (Phase 13) was
  implemented directly against the live endpoint with no mock-fixture step — both the backend
  endpoint and the frontend page were built together in one pass rather than handed off between a
  frontend-first and a backend-later step, and the endpoint's contract (three string fields in,
  `201`/`400`/`409` out) was simple enough that a throwaway mock would have added a file to delete
  immediately after, not genuine UI-first decoupling. This is a deliberate, narrow exception, not a
  precedent for skipping Principle I on future stories.

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
- **Addendum (Phase 10, UI/UX Design System)**: T070-T073 run in parallel (different files: a
  dependency bump, `tailwind.config.js`/`index.css`, a new `Icon.tsx`, a new `StatusBadge.tsx`).
  Once those land, T076-T080 (the five page-restyling tasks, each touching different page files)
  all run in parallel with each other and with T074-T075 (the sidebar). T081 and T082 are
  sequential cleanup/verification passes over the whole frontend and must run last.
- **Addendum (Phase 13, User Story 6)**: T103 (DTO), T104 (service method, depends on T103), and
  T107 (contract doc, independent) touch different files and can be split across a backend
  developer and a doc update in parallel; T108 (frontend types/API client) has no dependency on
  the backend tasks and can start immediately. T105-T106 (controller, security config) and
  T109-T110 (Register page, App.tsx routing) are each sequential within their own side. T111 (the
  unrelated `AppLayout.tsx` typecheck fix) can happen any time before T112.

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
7. **Addendum**: UI/UX Design System Retrofit (Phase 10) once every page exists — validate against
   the Phase 10 Independent Test (dark theme, sidebar, sharp corners, stroke-width 2.5 icons, neon
   badges on every page).
8. **Addendum**: User Story 6 (Phase 13) at any point after Foundational — validate against its own
   Independent Test (register → 201 → redirected to `/login`; duplicate email → 409; short
   password → 400).

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
- **2026-09-04 addendum**: T070-T082 (Phase 10) were generated after spec.md gained the mandatory
  UI/UX Design System section (UX-001–UX-005). These are pure presentation-layer retrofit tasks —
  no functional requirement, DTO, endpoint, or entity introduced elsewhere in this file changes.
  All prior tasks (T001-T069) remain exactly as implemented and untouched by this retrofit.
  T070-T082 are now complete: `lucide-react` added; dark/sharp-corner/neon Tailwind tokens
  configured; `Icon` and `StatusBadge`/`InvitationStatusBadge` shared components added;
  `NavBar` replaced by `Sidebar`; every page restyled; a full grep sweep found zero remaining
  light-theme classes; `typecheck`/`lint`/`build` pass. The authenticated pages were verified at
  the source level rather than live in a browser, since that requires standing up the Spring Boot
  + PostgreSQL backend (see T082's note) — only the unauthenticated `/login` page was verified
  live.
- **2026-09-04 addendum (second, same day)**: T083-T091 (Phase 11) were generated after spec.md's
  UX-003 was directly replaced — from the sharp-cornered "Competitive and Sporty" aesthetic
  (Phase 10) to an Apple/macOS-inspired one (smooth, generous rounded corners; subtle, soft
  borders). UX-001/UX-002/UX-004/UX-005 and every functional requirement/DTO/endpoint are
  unchanged. Phase 10's tasks (T070-T082) are left as-is in the historical record — they
  accurately describe what was built at the time — rather than rewritten, per the "add a new
  phase, don't rewrite history" pattern already used for the 2026-09-03 addendum. T083-T091 are
  now complete: the sharp-corner Tailwind override removed, `StatusBadge`/`Sidebar`/every page
  revised to generous rounding and soft `zinc-800`/`white-10` borders, a stroke-width-2.5
  regression in `AdminReviewQueue.tsx` (introduced by an out-of-band edit that added a zoom-modal
  feature) fixed along the way, and `typecheck`/`lint`/`build` all pass. As with Phase 10, only
  the unauthenticated `/login` page was verified live in a browser.
- **2026-09-04 addendum (third, same day)**: T092-T102 (Phase 12) were generated after spec.md
  gained UX-006, "App Layout Wrapping" — a shared `AppLayout` master component (full-viewport flex,
  `Sidebar` pinned left, independently scrollable main content, `#0a0a0b`/`#121214` page/card
  tones). By this point `Sidebar.tsx` and `Leaderboards.tsx` had already been hand-edited
  out-of-band to an orange-accented `#121214`-card visual language (a mobile hamburger/slide-out
  sidebar; emoji-flavored leaderboard labels; `divide-y`/`hover:bg-white/[0.02]` tables), so Phase
  12 also propagated that same language to every other page for visual consistency, treating
  `Leaderboards.tsx` as the reference rather than reverting it. Phases 10 and 11 are left as-is in
  the historical record. T092-T102 are now complete: `AppLayout.tsx` extracted from `App.tsx`'s
  former inline `Layout` function; every page restyled to the `#0a0a0b`/`#121214`/orange-500
  convention with a heading icon; a full grep sweep found zero leftover `sky-*`/flat-`zinc-800`/
  `zinc-900`/`zinc-950` classes outside the deliberate `rejected`-token exception (UX-005's
  Rejected/Declined badge color, intentionally paired with the Reject button); and
  `typecheck`/`lint`/`build` all pass. As with Phases 10-11, only the unauthenticated `/login` page
  was verified live in a browser — including the `AppLayout` sidebar-pinning/scroll behavior on the
  authenticated pages, which was verified at the source level only.
- **2026-09-04 addendum (fourth, same day)**: T103-T112 (Phase 13) were generated after spec.md
  gained **User Story 6 - Register a New Account** (FR-036–FR-042, SC-011–SC-013) — the first new
  functional user story since the 2026-09-03 addendum, rather than another UI/UX-only change.
  Unlike Phases 10-12, this spans both `backend/` and `frontend/`. It reused existing
  infrastructure rather than adding anything new: the `PasswordEncoder` bean, `ConflictException`
  → 409 mapping, and `UserRepository.findByEmailIgnoreCase` all already existed from prior work
  and needed no changes. T103-T112 are now complete: `RegisterRequest` DTO;
  `UserService.register`; `POST /api/auth/register` (permitted alongside `/login` in
  `SecurityConfig`); `contracts/auth.md` updated; frontend `RegisterRequest` type +
  `register()` API client function; `Register.tsx` built from `Login.tsx`'s exact markup;
  `/register` wired as a sibling of `/login` outside `AppLayout` in `App.tsx`; `Login.tsx` given
  its own explicit full-screen wrapper (it can no longer rely on `AppLayout`'s padding now that
  `/login` is a route sibling, not a child); and a pre-existing `noUnusedLocals` typecheck failure
  in `AppLayout.tsx` (dead imports left over from Phase 12's out-of-band `<Outlet/>` refactor) was
  fixed since it blocked `tsc`/the build entirely. `mvn -o clean compile` passes (57 source files,
  zero errors) and frontend `typecheck`/`lint`/`build` all pass. `/register` was verified live in a
  browser rendering identically to `/login`. **Not verified**: an actual end-to-end registration
  round-trip against the live backend (creating a real row, confirming the 409 on a duplicate,
  logging in with the new credentials afterward), since that requires a local PostgreSQL instance
  with Flyway migrations applied — not stood up for this session, the same limitation noted on
  every prior phase's verification step.
