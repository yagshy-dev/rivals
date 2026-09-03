<!--
Sync Impact Report
Version change: [none] → 1.0.0 (initial ratification)
Modified principles: N/A (initial creation)
Added sections:
  - Core Principles: I. UI-First Development, II. Strict Type Safety (Non-Negotiable),
    III. Small Atomic Steps, IV. Human-in-the-Loop Approval (Non-Negotiable), V. Fixed Technology Stack
  - Environment & Tooling Constraints
  - Development Workflow
  - Governance
Removed sections: none
Deferred / TODO placeholders: none
Deferred non-governance intents: see Next Actions in command output (product/feature description
  for the Rivals app itself — activity logging, points formula, squads, leaderboards).
-->

# Rivals Constitution

## Core Principles

### I. UI-First Development
Every feature MUST be built and demonstrable against static mock JSON fixtures before any real
backend integration begins. The UI layer is built first, wired to hand-authored mock data that
mirrors the eventual API contract, and only later connected to live Spring Boot endpoints.
Mock fixtures MUST be checked into the frontend codebase (not fabricated ad hoc) so they serve as
a de facto contract for the backend to implement against.
Rationale: decouples frontend and backend work, surfaces UX and data-shape problems before
backend effort is spent, and keeps the app demoable at every stage.

### II. Strict Type Safety (Non-Negotiable)
Java: all API request/response payloads MUST be modeled as explicit, immutable DTOs (Java
records preferred); JPA entities MUST NEVER be returned or accepted directly at a controller
boundary. TypeScript: the project MUST compile with `strict: true`; `any` is forbidden except
with an inline comment justifying why no narrower type is possible. Every DTO/type on one side of
the Java↔TypeScript boundary MUST have a corresponding explicit type on the other side.
Rationale: in a two-language stack, the DTO/type boundary is the primary correctness guardrail —
loosening it silently reintroduces the bugs static typing exists to prevent.

### III. Small Atomic Steps
Work MUST be delivered as small, independently buildable, independently reviewable increments,
each addressing a single concern. Large multi-concern commits or PRs that mix unrelated changes
(e.g., a feature plus an unrelated refactor) are not permitted.
Rationale: small steps keep the main branch always in a working state, make review tractable, and
make it easy to pinpoint the source of a regression.

### IV. Human-in-the-Loop Approval (Non-Negotiable)
An activity submission (including its screenshot evidence) MUST be reviewed and explicitly
approved by an admin before any points are credited to a user or reflected on a leaderboard.
Automatic, unattended point crediting from a raw submission is forbidden. Points calculations
(e.g., rate per km, rate per minute) MUST be applied only at the moment of admin approval, never
speculatively before approval.
Rationale: manual review is the app's sole safeguard against fraudulent or gamed submissions;
removing it undermines the integrity of every leaderboard the app produces.

### V. Fixed Technology Stack
Backend: Java 17 with Spring Boot. Frontend: React 18 with TypeScript, built with Vite, styled
with Tailwind CSS. Database: local PostgreSQL. No component of this stack may be substituted,
and no new major dependency category (e.g., a second database, a second frontend framework) may
be introduced without a constitution amendment.
Rationale: keeps the stack consistent with the team's environment and skills and prevents stack
sprawl in what is an internal, single-team tool.

## Environment & Tooling Constraints

All local development, scripting, and tooling MUST target Windows PowerShell. Docker MUST NOT be
used or assumed available. Bash, WSL, or other Linux/POSIX-only commands, shell scripts, or
tooling MUST NOT be introduced anywhere in the repository (scripts, CI-equivalent tasks, setup
docs). Any setup or run instructions MUST be expressed as PowerShell commands runnable directly on
Windows, against a locally installed PostgreSQL instance (no containerized database).

## Development Workflow

Features proceed in this order: (1) define/extend mock JSON fixtures for the feature's data shape,
(2) build the React/TypeScript UI against those fixtures, (3) implement the Spring Boot DTOs and
endpoints to match the fixture shape, (4) wire the UI to the real endpoints and remove the mock
dependency for that feature. Each of these steps SHOULD land as its own small, atomic change per
Principle III rather than as one combined change.
Before a change is considered done: TypeScript MUST type-check with no `strict` violations, and
Java DTOs MUST NOT leak entities across the controller boundary. Any deviation from UI-first
sequencing, DTO strictness, or the manual-approval rule MUST be called out and justified in the
relevant plan/PR description rather than silently introduced.

## Governance

This constitution supersedes all other project practices, templates, and prior informal
conventions. All feature plans and PR reviews MUST verify compliance with the Core Principles
above; any deviation MUST be explicitly justified in the plan/PR and, if it represents a durable
change in practice rather than a one-off exception, MUST be accompanied by a constitution
amendment.

Amendments are made by editing this file and MUST update the Sync Impact Report at the top of the
file and the version/date line below. Versioning follows semantic versioning:
- MAJOR: backward-incompatible governance changes, or removal/redefinition of a principle.
- MINOR: a new principle or section added, or materially expanded guidance.
- PATCH: wording clarifications and non-semantic fixes.

Compliance is reviewed at each planning (`/speckit-plan`) and implementation (`/speckit-implement`)
step; any change that violates a Non-Negotiable principle MUST be rejected or revised before
proceeding.

**Version**: 1.0.0 | **Ratified**: 2026-09-02 | **Last Amended**: 2026-09-02
