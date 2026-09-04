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
employee role and a securely hashed password, then redirects to the login page. Technical
approach: a Spring Boot 3 (Java 17) REST API backed by local PostgreSQL, a React 18 + TypeScript
(Vite, Tailwind) SPA built UI-first against checked-in mock JSON fixtures before wiring to the real
API, all developed and run via Windows PowerShell with no Docker.

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

**Scale/Scope**: Single internal company deployment; 5 user-facing capabilities (activity
submission, admin review/points, squads with group-scoped roles and invitations, leaderboards with
a Global/squad toggle) across roughly 8-12 screens/views, all restyled to the mandatory dark,
sidebar-navigated, Apple/macOS-inspired rounded design system and wrapped in the shared `AppLayout`

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
│   │                     # POST /api/auth/register and UserService.register (FR-036–FR-041)
│   ├── activity/         # ActivitySubmission entity, repository, controller, DTOs, validation
│   ├── points/            # ActivityPointRate lookup + points calculation, invoked only on approval
│   ├── squad/             # Squad + SquadMembership (with role) + SquadInvitation entities, repository, controller, DTOs
│   ├── leaderboard/        # Read-only leaderboard queries/controller (individual, squad, and squad-scoped individual; total/average)
│   ├── storage/            # Local-filesystem screenshot storage adapter
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
│   │                              # ActivitySubmit, AdminReviewQueue, Squads, SquadDetail
│   │                              # (members/roles/invite), Invitations, Leaderboards (Global/squad selector)
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
module, migration, or frontend framework is introduced.
