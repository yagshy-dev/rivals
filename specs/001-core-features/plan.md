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
belongs to. Technical approach: a Spring Boot 3 (Java 17) REST API backed by local PostgreSQL, a
React 18 + TypeScript (Vite, Tailwind) SPA built UI-first against checked-in mock JSON fixtures
before wiring to the real API, all developed and run via Windows PowerShell with no Docker.

## Technical Context

**Language/Version**: Java 17 (backend), TypeScript 5.x with React 18 (frontend)

**Primary Dependencies**: Spring Boot 3.x (Web, Validation, Data JPA, Security), Flyway
(versioned schema migrations); React 18, Vite, Tailwind CSS, React Router, a typed fetch/Axios API
client

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
(Principle IV)

**Scale/Scope**: Single internal company deployment; 5 user-facing capabilities (activity
submission, admin review/points, squads with group-scoped roles and invitations, leaderboards with
a Global/squad toggle) across roughly 8-12 screens/views

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
│   ├── user/            # User entity, repository, controller, DTOs
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
│   ├── components/               # Shared/presentational components
│   ├── pages/                     # ActivitySubmit, AdminReviewQueue, Squads, SquadDetail (members/roles/invite), Invitations, Leaderboards (Global/squad selector)
│   └── App.tsx / main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── src/**/*.test.tsx           # Vitest + React Testing Library specs colocated with source

uploads/                          # Local screenshot storage at runtime (gitignored, not source)
```

**Structure Decision**: Web application split into `backend/` (Spring Boot REST API) and
`frontend/` (React SPA), matching Constitution Principle V's fixed stack. `frontend/src/mocks/`
is a first-class, checked-in directory (not scratch data) so each feature's UI can be built and
demoed against it before the corresponding `backend/` endpoint exists, per Principle I. Screenshot
files are stored on the local filesystem under `uploads/` rather than a cloud object store, since
the environment excludes Docker/cloud dependencies and only local PostgreSQL is available.
