# Implementation Plan: Rivals Core Features

**Branch**: `001-core-features` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-core-features/spec.md`

## Summary

Deliver the five core Rivals capabilities: (1) employees log an activity (type, distance/duration,
screenshot) which starts as Pending; (2) an admin approves or rejects each Pending submission, with
approval automatically awarding points via a fixed per-activity-type rate table; (3) employees can
search for, create, and join multiple squads; (4) a squad's creator is automatically its Manager,
Managers can invite specific employees (who must accept before becoming Members) and can promote
Members to also be Managers, all scoped per-squad; (5) the app shows a global individual
leaderboard, a group leaderboard sortable by total or average points per member, and a dropdown/tab
selector to switch the individual leaderboard between the Global view and any squad the user
belongs to; (6, addendum) a prospective employee can self-register a new account (email, display
name, password) via a public, unauthenticated page, which creates the account with the standard
employee role and a securely hashed password, then redirects to the login page; (7, addendum)
squads become strictly invite-only (no self-service join), each squad now declares an allowed
subset of the four activity types (defaulting to all four), every activity submission must name a
target Squad the submitter belongs to and is restricted to that Squad's allowed types, squad point
totals are computed from submissions tagged to that squad, and a global employee directory search
lets any user open any other user's public profile (photo, quote, Global Average), revealing
Squad-specific detail only when the viewer shares a Squad with that profile's owner; (8, addendum)
a signed-in user manages their own profile photo (file upload), personal quote, and password from a
single Account Settings page, with a password change requiring the current password and a new
password meeting the same minimum length as registration; (9, addendum) an activity submission's
screenshot is deleted from storage as soon as an admin approves or rejects it, since it exists only
to support the review itself. Technical approach: a Spring Boot 3 (Java 17) REST API backed by
local PostgreSQL, a React 18 + TypeScript (Vite, Tailwind) SPA built UI-first against checked-in
mock JSON fixtures before wiring to the real API, all developed and run via Windows PowerShell with
no Docker.

## Technical Context

**Language/Version**: Java 17 (backend), TypeScript 5.x with React 18 (frontend)

**Primary Dependencies**: Spring Boot 3.x (Web, Validation, Data JPA, Security), Flyway
(versioned schema migrations); React 18, Vite, Tailwind CSS, React Router, a typed fetch/Axios API
client, Lucide React (icon set, stroke-width forced to 2.5 per UX-004)

**Storage**: Local PostgreSQL (relational data — users, submissions, squads, memberships); local
filesystem directory for uploaded screenshot files, referenced by path/URL from the database

**Testing**: JUnit 5 + Spring Boot Test + Testcontainers-free local Postgres for backend
(unit + integration); Vitest + React Testing Library for frontend (component + integration)

**Target Platform**: Web application, browser-based client, server run locally on Windows

**Project Type**: Web application (frontend + backend, per Constitution Principle V's fixed stack)

**Performance Goals**: Internal corporate tool scale — leaderboard and squad views MUST return in
under 1 second at up to a few thousand users and tens of thousands of approved submissions; no
high-throughput/real-time requirement

**Constraints**: All setup, build, and run steps MUST be expressible as Windows PowerShell
commands; no Docker, no Linux/WSL-only tooling (per Constitution's Environment & Tooling
Constraints); UI MUST be developed against mock JSON before backend wiring (Principle I); all API
DTOs MUST be strict/explicit on both sides of the Java↔TypeScript boundary (Principle II); points
MUST only ever be calculated/credited at admin-approval time, never at submission time
(Principle IV); every screen MUST conform to spec.md's mandatory UI/UX Design System
(UX-001–UX-006, added 2026-09-04, UX-003 revised 2026-09-04, UX-006 added 2026-09-04) — dark theme
only (deep dark grey page background / dark grey cards / white text, exact tones `#0a0a0b` and
`#121214` per UX-006), a persistent left-hand sidebar as the primary navigation, an Apple/macOS-
inspired aesthetic (smooth, generous rounded corners — large-radius cards/panels, pill/rounded
buttons — and subtle, soft borders like `border-zinc-800` or low-opacity `border-white/10` rather
than high-contrast ones), every page wrapped in a single shared `AppLayout` structural component
that fills the viewport, pins the sidebar left, and scrolls page content independently on the
right, Lucide React icons forced to `stroke-width: 2.5`, and neon status badges (electric green
Approved / crimson red Rejected / a third distinct vivid color for Pending)

**Scale/Scope**: Single internal company deployment; 9 user-facing capabilities (registration,
squad-scoped activity submission with time-limited screenshot retention, admin review/points,
invite-only squads with group-scoped roles and per-squad allowed activity types, leaderboards with
a Global/squad toggle, a global user directory with public profiles, and self-service account
settings) across roughly 11-15 screens/views, all restyled to the mandatory dark, sidebar-navigated,
Apple/macOS-inspired rounded design system and wrapped in the shared `AppLayout` (except the public
Login/Register pages)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. UI-First Development | Frontend built against checked-in mock JSON before live API wiring | PASS — Project Structure below reserves `frontend/src/mocks/` (now including squad-members and invitations fixtures, research.md #13); task generation (`/speckit-tasks`) will sequence mock-first per feature slice |
| II. Strict Type Safety | Java DTOs are explicit records, never entities, at controller boundary; TS `strict: true`, no unjustified `any` | PASS — `contracts/` (incl. new `invitations.md`, `users.md`) defines explicit request/response shapes; `data-model.md` separates entities (`SquadMembership.role`, `SquadInvitation`) from DTOs |
| III. Small Atomic Steps | No large multi-concern commits | PASS — enforced at task/PR level, not a plan-time artifact; deferred to `/speckit-tasks` |
| IV. Human-in-the-Loop Approval | No automatic point crediting; points computed only on admin approval | PASS — FR-003/FR-006/FR-007 and `data-model.md` state machine enforce this; points engine is invoked exclusively from the approval transition |
| V. Fixed Technology Stack | Java 17 + Spring Boot; React 18 + TS + Vite + Tailwind; local PostgreSQL; no substitutions | PASS — Technical Context above uses exactly this stack; no second database or frontend framework introduced |
| Environment & Tooling Constraints | PowerShell-only, no Docker, no Linux-only tooling | PASS — `quickstart.md` uses only PowerShell commands; Postgres assumed locally installed, not containerized |

No violations identified. Complexity Tracking table is omitted (nothing to justify).

*Post-Phase 1 re-check (Group-Scoped Roles & Leaderboard Toggling addendum)*: `SquadInvitation` is
a new entity and `contracts/invitations.md`/`contracts/users.md` are new files, but both extend the
existing `squad` module/pattern rather than introducing a new module, database, or frontend
framework — all six gates above still PASS with no new violations.

*Post-Phase 1 re-check (UI/UX Design System addendum, 2026-09-04)*: spec.md gained a mandatory
UI/UX Design System section (UX-001–UX-005: dark theme, sidebar navigation, sharp-cornered
aesthetic, Lucide React icons at stroke-width 2.5, neon status badges). This is a presentation-layer
retrofit only — it adds one small icon dependency (`lucide-react`) and Tailwind config/token
changes, introduces no new backend module, database, or frontend framework, and does not change any
functional requirement, DTO, or the points/approval flow. Principle V (Fixed Technology Stack)
still PASSES — React 18 + TS + Vite + Tailwind remains the only frontend stack, and an icon library
is not a stack substitution. All other gates are unaffected. No violations identified.

*Post-Phase 1 re-check (UX-003 aesthetic revision, 2026-09-04)*: spec.md's UX-003 was changed from
a sharp-cornered "Competitive and Sporty" aesthetic to an Apple/macOS-inspired one (smooth,
generous rounded corners; subtle/soft borders instead of high-contrast ones). This is a pure
Tailwind-token/className revision to the same components introduced by the prior addendum
(`tailwind.config.js`'s `borderRadius` scale, `Sidebar`, `StatusBadge`, and every page) — no new
dependency, module, database, or frontend framework, and no functional/DTO/points-flow change.
Principle V still PASSES. All other gates unaffected. No violations identified.

*Post-Phase 1 re-check (App Layout Wrapping, UX-006, 2026-09-04)*: spec.md gained a new rule
requiring every page to be wrapped in a single shared `AppLayout` structural component (full-
viewport flex container, `Sidebar` pinned left, independently scrollable main content on the
right, deep dark grey `#0a0a0b` page background against `#121214` cards). This extracts the
layout logic that already lived inline in `App.tsx` into its own named component and updates the
exact background hex values — it introduces no new dependency, module, database, or frontend
framework, and does not change any functional requirement, DTO, or the points/approval flow.
Principle V still PASSES. All other gates unaffected. No violations identified.

*Post-Phase 1 re-check (User Registration, 2026-09-04)*: spec.md gained **User Story 6 - Register a
New Account** (FR-036–FR-042, SC-011–SC-013). This extends the existing `user` module on both
sides — a new `RegisterRequest` DTO and `POST /api/auth/register` endpoint reusing the
already-provisioned `PasswordEncoder`/`UserRepository` beans (Principle V: no new dependency), and
a new `Register.tsx` page reusing `Login.tsx`'s established visual pattern — rather than
introducing a new backend module, database, or frontend framework. Principle IV (Human-in-the-Loop
Approval) is unaffected: registration creates an account, not a submission or a point award.
Principle II (Strict Type Safety) still holds: `RegisterRequest` is an explicit record validated
with `@Valid`, never the `User` entity, at the controller boundary. All gates PASS. No violations
identified.

*Post-Phase 1 re-check (Squad-Strict Submissions & User Search, 2026-09-04)*: spec.md gained
**Squad-Strict Submission Rules** (FR-001/FR-002/FR-010–FR-012/FR-015/FR-025/FR-046–FR-048 revised
or added) and **User Story 7 - Search Users and View Public Profiles** (FR-043–FR-045, FR-049,
SC-014–SC-017). This extends the existing `squad`, `activity`, and `user` modules rather than
introducing a new module or database: `Squad` gains an `allowedActivityTypes` column,
`ActivitySubmission` gains a required `targetSquadId` column, and `user/` gains a directory-search
endpoint and a public-profile read endpoint reusing the existing `UserRepository`/`SquadMembership`
data (Principle V: no new dependency). Removing self-service squad joining is a controller/route
deletion, not a new concern. Principle IV (Human-in-the-Loop Approval) is unaffected: the points
engine still only runs at admin-approval time — the only change is that a submission's points are
now attributed to its tagged Squad rather than to every Squad the user happens to belong to.
Principle II (Strict Type Safety) still holds: the new `SubmitActivityRequest` field and the new
`UserSearchResult`/`PublicProfile` DTOs are explicit records, never entities, at the controller
boundary. All gates PASS. No violations identified.

*Post-Phase 1 re-check (Account Settings & Screenshot Retention, 2026-09-04)*: spec.md gained
**User Story 8 - Manage Account Settings** (FR-050–FR-055, SC-018–SC-019) and **Screenshot
Retention** (FR-018 revised, FR-056–FR-057, SC-020). Both extend existing modules rather than
introducing new ones: `user/` gains a password-change endpoint (reusing the existing
`PasswordEncoder` bean) and a photo-upload/serve pair of endpoints reusing the existing
`ScreenshotStorageService` (renamed in spirit, not code, to a general file-storage adapter —
Principle V: no new dependency or storage technology); `activity/`'s `ActivityService` now calls
that same storage service's new `delete` method from the existing approve/reject transition,
immediately after the points engine runs. Principle IV (Human-in-the-Loop Approval) is unaffected:
screenshot deletion happens strictly after — never instead of, or in place of — the admin's
approve/reject decision, and does not touch point calculation. Principle II (Strict Type Safety)
still holds: `ChangePasswordRequest` is a new explicit record validated with `@Valid`, never the
`User` entity, at the controller boundary. All gates PASS. No violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-features/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/rivals/
│   ├── user/            # User entity, repository, controller, DTOs, incl. AuthController's
│   │                     # POST /api/auth/register and UserService.register (FR-036–FR-041), the
│   │                     # global directory search and public-profile endpoints
│   │                     # (FR-043–FR-045, FR-049), and Account Settings' password-change
│   │                     # (FR-052–FR-054) and photo-upload/serve endpoints (FR-051)
│   ├── activity/         # ActivitySubmission entity (incl. required targetSquadId, FR-047, and a
│   │                      # nullable screenshotRef post-decision, FR-056), repository, controller,
│   │                      # DTOs, validation (incl. Squad-membership and Squad-allowed-type
│   │                      # checks, FR-002/FR-048)
│   ├── points/            # ActivityPointRate lookup + points calculation, invoked only on approval
│   ├── squad/             # Squad (incl. allowedActivityTypes, FR-046) + SquadMembership (with
│   │                       # role) + SquadInvitation entities, repository, controller, DTOs
│   ├── leaderboard/        # Read-only leaderboard queries/controller (individual, squad, and squad-scoped individual; total/average)
│   ├── storage/            # Local-filesystem file storage adapter (screenshots and, per the
│   │                        # Account Settings addendum, profile photos — same adapter, FR-051)
│   ├── config/              # Security, web, storage configuration
│   └── RivalsApplication.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/        # Flyway versioned SQL migrations
└── src/test/java/com/rivals/
    ├── activity/
    ├── points/
    ├── squad/
    └── leaderboard/

frontend/
├── src/
│   ├── mocks/                # Checked-in mock JSON fixtures (Principle I — built/consumed first)
│   ├── api/                    # Typed API client (mock-backed, then live-backed)
│   ├── types/                   # TypeScript types mirroring backend DTOs
│   ├── components/               # Shared/presentational components, incl. AppLayout.tsx (UX-006,
│   │                              # the master layout every page is wrapped in), Sidebar.tsx
│   │                              # (UX-002), and StatusBadge.tsx (UX-005, neon Approved/Rejected/Pending)
│   ├── pages/                     # Login, Register (both public, outside AppLayout — UX-006),
│   │                              # ActivitySubmit (target-Squad selector + dynamically-filtered
│   │                              # Activity Type dropdown, FR-047/FR-048), AdminReviewQueue,
│   │                              # Squads (browse-only directory, no Join control, FR-010),
│   │                              # SquadDetail (members/roles/invite/allowed-types),
│   │                              # Invitations, Leaderboards (Global/squad selector),
│   │                              # UserDirectory (global name search, FR-043),
│   │                              # UserProfile (public photo/quote/Global Average, plus
│   │                              # shared-Squad detail, FR-044/FR-045),
│   │                              # AccountSettings (photo upload, quote, password change,
│   │                              # FR-050–FR-055)
│   └── App.tsx / main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.js           # Dark theme + Apple/macOS-inspired rounded-corner tokens (UX-001, UX-003)
└── src/**/*.test.tsx           # Vitest + React Testing Library specs colocated with source

uploads/                          # Local screenshot storage at runtime (gitignored, not source)
```

**Structure Decision**: Web application split into `backend/` (Spring Boot REST API) and
`frontend/` (React SPA), matching Constitution Principle V's fixed stack. `frontend/src/mocks/`
is a first-class, checked-in directory (not scratch data) so each feature's UI can be built and
demoed against it before the corresponding `backend/` endpoint exists, per Principle I. Screenshot
files are stored on the local filesystem under `uploads/` rather than a cloud object store, since
the environment excludes Docker/cloud dependencies and only local PostgreSQL is available. Per the
2026-09-04 UI/UX Design System addendum, `frontend/tailwind.config.js` carries the mandatory dark
zinc-950/zinc-900 palette, `lucide-react` is added as the sole icon dependency (globally forced to
`stroke-width: 2.5`), and the former top `NavBar` is replaced by a persistent left-hand `Sidebar`
component — no backend or data-model changes are implied. Per the same-day UX-003 revision,
`tailwind.config.js`'s `borderRadius` scale carries generous rounding (large-radius cards/panels,
pill-shaped buttons) instead of the originally-shipped near-zero scale, and component/page borders
use subtle `zinc-800`/`white/10` tones rather than high-contrast ones. Per the same-day UX-006
addition, the layout logic previously inlined in `App.tsx` is extracted into
`frontend/src/components/AppLayout.tsx` — a `flex h-screen` container with a `#0a0a0b` page
background pinning `Sidebar` to the left and rendering routed page content in an
`overflow-y-auto` main area on the right — and the card/surface background across all components
and pages moves from `zinc-900` to the exact `#121214` tone UX-006 specifies. Per the same-day
User Registration addition, `App.tsx` gains a `/register` route as a sibling of `/login` (both
outside `AppLayout`'s `<Route>`, matching UX-006's public-page carve-out), backed by a new
`frontend/src/pages/Register.tsx` built from `Login.tsx`'s existing markup/styling, and by a new
`POST /api/auth/register` endpoint in the existing `backend/.../user/` module — no new backend
module, migration, or frontend framework is introduced. Per the same-day Squad-Strict Submissions &
User Search addition: `backend/.../squad/`'s `Squad` entity gains an `allowedActivityTypes` column
(Flyway migration, defaulting existing rows to all four types) and its controller drops the
self-service join endpoint; `backend/.../activity/`'s `ActivitySubmission` entity gains a required
`targetSquadId` column (also via migration) and its submission validation now checks the submitter's
Squad membership and that Squad's allowed types; `backend/.../user/` gains a directory-search
endpoint and a public-profile endpoint that conditionally includes Squad-specific detail based on
shared membership. On the frontend, `ActivitySubmit.tsx` gains a required Squad selector that
dynamically filters the Activity Type dropdown, `Squads.tsx` drops its "Join" control in favor of a
read-only browse list, and two new pages — `UserDirectory.tsx` and `UserProfile.tsx` — are added
under `frontend/src/pages/`, both authenticated routes wrapped in the existing `AppLayout` (UX-006)
like every other signed-in page. No new backend module, frontend framework, or database is
introduced. Per the same-day Account Settings & Screenshot Retention addition:
`backend/.../user/dto/ChangePasswordRequest.java` is a new explicit record; `UserController` gains
`POST /api/users/me/password`, `POST /api/users/me/photo` (multipart, reusing
`ScreenshotStorageService`), and `GET /api/users/{id}/photo`; `backend/.../user/User.java`'s
`photo_url` column is renamed `photo_ref` (it now stores a storage reference, not a pasted URL,
per FR-051) via a new Flyway migration that also relaxes `activity_submissions.screenshot_ref` to
nullable; `ActivityService`'s approve/reject transition gains a call to
`ScreenshotStorageService.delete` immediately after the points engine runs, and
`ActivityService.getScreenshot` now 404s once `screenshotRef` is null. On the frontend, a new
`frontend/src/pages/AccountSettings.tsx` is added (photo upload, quote textarea, password-change
form) and wired into `App.tsx`/`Sidebar.tsx` alongside the other authenticated pages. No new
backend module, frontend framework, or database is introduced.
