# Specification Quality Checklist: Rivals Core Features

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-02
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs) — exception: the UI/UX Design System
      section deliberately specifies concrete design tokens (color values, icon library,
      stroke-width) per explicit, non-negotiable stakeholder mandate; see note below.
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- All checklist items pass on first validation pass. No [NEEDS CLARIFICATION] markers were needed —
  reasonable defaults (documented in the Assumptions section) were used for role provisioning,
  screenshot cardinality, squad membership limits, rejected-submission handling, and membership
  snapshotting for squad totals.
- 2026-09-03 update: added Group-Scoped Roles (User Story 4) and Leaderboard Toggling (User Story 5
  acceptance scenarios 5–6), FR-020–FR-035.
- 2026-09-03 clarify session: resolved 3 ambiguities via `/speckit-clarify` — invite requires
  explicit accept/decline (not immediate join), Manager selects invitees via employee-directory
  search (not raw email), and a squad may have multiple Managers via promotion (closing the
  orphaned-squad gap when a Manager leaves). All answers integrated into User Story 4, Edge Cases,
  Functional Requirements (FR-023, FR-026–FR-032), Key Entities (Squad Invitation), and
  Assumptions. Re-validated: no [NEEDS CLARIFICATION] markers introduced; all checklist items still
  pass.
- 2026-09-04 update: added a mandatory "UI/UX Design System" section (UX-001–UX-005) per explicit
  stakeholder direction — dark-mode theme (zinc-950/zinc-900/white text), left-hand sidebar
  navigation, a sharp-cornered "Competitive and Sporty" aesthetic, Lucide React icons forced to
  stroke-width 2.5, and neon status badges (electric green Approved / crimson red Rejected). These
  are intentional, literal design-token requirements and are the sole accepted exception to the
  "no implementation details" content-quality rule. Added a corresponding Assumptions entry for the
  unspecified Pending badge color (assumed vivid amber/yellow). Re-validated: no [NEEDS
  CLARIFICATION] markers introduced; all other checklist items still pass.
- 2026-09-04 update (Rule 3 replacement): UX-003 was changed from the sharp-cornered "Competitive
  and Sporty" aesthetic to an "Apple/macOS-Inspired" aesthetic per explicit stakeholder direction —
  smooth, generous rounded corners (large-radius cards/panels, pill/rounded buttons) and subtle,
  soft borders (e.g., `border-zinc-800` / low-opacity `border-white/10`) instead of high-contrast
  ones, favoring soft elevation over hard outlines. UX-001, UX-002, UX-004, and UX-005 are
  unchanged. This is a direct, literal replacement of an existing rule, not an ambiguity, so no
  [NEEDS CLARIFICATION] marker was needed. Re-validated: all checklist items still pass. (This
  rule change was subsequently synced into `plan.md`/`tasks.md`/`frontend/` on the same day — see
  the Phase 11 addendum in `tasks.md`.)
- 2026-09-04 update (new rule, UX-006): added "App Layout Wrapping" per explicit stakeholder
  direction — every page MUST be wrapped in a single shared `AppLayout` structural component
  (full-viewport-height flex container, Sidebar pinned left, an independently scrollable main
  content area on the right) with a deep dark grey layout background (e.g., `#0a0a0b`) distinct
  from the card background (e.g., `#121214`). This is an additive rule (UX-001–UX-005 unchanged)
  naming a specific component and exact hex values, consistent with this section's established
  exception to the "no implementation details" rule. No [NEEDS CLARIFICATION] marker was needed —
  direct, unambiguous stakeholder direction. Re-validated: all checklist items still pass. Note:
  `frontend/`'s current app shell (`App.tsx`'s inline `Layout` function) already approximates this
  structurally (flex container, Sidebar on the left, scrollable content) but is not yet extracted
  into a named `AppLayout` component, and uses the `zinc-950`/`zinc-900` tokens from UX-001 rather
  than the exact `#0a0a0b`/`#121214` hex values this rule specifies — `plan.md`/`tasks.md`/the
  frontend code have not yet been updated to match.
- 2026-09-04 update (new feature, User Registration): added **User Story 6 - Register a New
  Account** (P1) with 6 acceptance scenarios, 2 new Edge Cases, FR-036–FR-042, SC-011–SC-013, and
  updated the **User** Key Entity to add email/password/company-wide-role attributes. Also revised
  UX-006 to clarify that public/unauthenticated pages (Login, and now Register) render outside
  `AppLayout` as full-screen pages with no Sidebar, rather than being "wrapped but sidebar-less" as
  UX-006's original wording implied — this matches how `frontend/`'s `App.tsx`/`AppLayout.tsx` had
  already been restructured (out-of-band) to a nested-route pattern with `/login` as a sibling of
  the `AppLayout` route, not a child of it. Reconciled the existing Assumptions bullet on role
  provisioning: self-registration always assigns the standard employee role; Admin promotion
  remains a separate, pre-provisioned action, unaffected by this feature. Kept all Functional
  Requirements technology-agnostic (no framework/database/hashing-algorithm names), consistent
  with every other FR in this spec — the stakeholder's Java Spring Boot/PostgreSQL/password-hashing
  implementation direction belongs in `plan.md`/`tasks.md`, not here. No [NEEDS CLARIFICATION]
  marker was needed: email-verification scope, password minimum length, and display-name
  uniqueness were resolved with reasonable defaults recorded in Assumptions rather than treated as
  blocking ambiguities. Re-validated: all checklist items still pass.
