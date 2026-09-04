# Feature Specification: Rivals Core Features

**Feature Branch**: `001-core-features`

**Created**: 2026-09-02

**Status**: Draft

**Input**: User description: "Define the core features for Rivals: 1. Activity Logging: Users submit distance/time and upload a screenshot. Submissions start as PENDING and require manual Admin approval. 2. Points Engine: Running = 10 pts/km, Cycling = 4 pts/km, Swimming = 20 pts/km, Yoga = 1 pt/min. 3. Groups: Users can search for, create, and join multiple squads. 4. Leaderboards: Display global individual rankings, plus group rankings sortable by both total overall points and average points per member."

## Clarifications

### Session 2026-09-03

- Q: When a submission's points calculation produces a fractional value (e.g. 4.15 km cycling ×
  4 = 16.6), how should the system round it to award a whole-number point value? → A: Keep
  fractional (no rounding) — points are stored and displayed as decimals.
- Q: Besides the submitter and any admin, should any other employee be able to view a
  submission's uploaded screenshot? → A: Only the submitter and admins.
- Q: If two admins both try to approve or reject the same pending submission at nearly the same
  moment, what should happen to the second admin's action? → A: The second action is rejected as
  a conflict (the submission is no longer Pending by the time it runs).
- Q: Roughly how many employees is Rivals expected to support? → A: Up to ~5,000 employees.
- Q: When a Manager invites a user to their squad, does that user become a member immediately, or
  do they need to accept the invite first? → A: The invited user must explicitly accept a pending
  invite before becoming a Member (declining leaves them uninvited, not a member).
- Q: How does a Manager identify which employee to invite? → A: By searching/selecting from an
  employee directory (matching by name), not by typing a raw email address.
- Q: Can a squad have more than one Manager (e.g., can a Manager promote a Member to also be a
  Manager), especially to cover a Manager leaving the company? → A: Yes — a Manager can promote
  another Member of that squad to also be a Manager, so a squad can have multiple Managers and is
  not permanently orphaned when one Manager departs.

### Session 2026-09-03 (Group Roles & Leaderboard Toggling)

- Decision: When a user creates a squad, they are automatically assigned the "Manager" role for
  that specific squad.
- Decision: Squad roles are scoped per-squad — a user can be "Manager" of one squad while being a
  regular "Member" of another squad at the same time.
- Decision: Only a squad's Manager(s) may invite new users directly into that squad.
- Decision: The leaderboard view must offer a dropdown or tab selector letting a user switch
  between the Global company-wide ranking and the ranking of any specific squad they belong to.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit an Activity for Approval (Priority: P1)

An employee completes a workout (running, cycling, swimming, or yoga) and wants credit for it. They
open Rivals, choose the activity type, enter the distance (for running/cycling/swimming) or duration
(for yoga), and upload a screenshot as evidence. The submission is saved with a **Pending** status
and does not yet count toward any points or ranking.

**Why this priority**: This is the entry point of the entire app — no points, squads, or leaderboards
have any data without activity submissions. It is the smallest slice that is independently
demonstrable (a user can submit and see it recorded as Pending), even before approval exists.

**Independent Test**: Can be fully tested by submitting an activity with a type, a
distance/duration value, and a screenshot, and confirming it is stored with status "Pending" and
does not appear on any leaderboard.

**Acceptance Scenarios**:

1. **Given** a logged-in employee, **When** they submit a Running activity with a distance and a
   screenshot, **Then** the submission is saved with status "Pending" and is visible in their own
   submission history.
2. **Given** a logged-in employee, **When** they try to submit an activity without attaching a
   screenshot, **Then** the submission is rejected at entry with a validation message and is not
   saved.
3. **Given** a logged-in employee, **When** they submit a Yoga activity with a duration in minutes,
   **Then** the submission is saved with status "Pending" using minutes as its unit (not distance).

---

### User Story 2 - Admin Reviews, Approves, and Points Are Awarded (Priority: P1)

An admin opens a queue of Pending submissions, reviews each one's activity type, distance/time, and
screenshot, and either approves or rejects it. When approved, the system automatically calculates
points using the fixed rate for that activity type and credits them to the submitting user. When
rejected, no points are awarded and the submitter can see why their submission did not count.

**Why this priority**: Approval and point calculation are what turn a raw submission into something
of value. Together with User Story 1 this is the minimum usable product — without it, submissions
sit in Pending forever and the app has no scoring.

**Independent Test**: Can be fully tested by having an admin approve a Pending Running submission
of a known distance and confirming the submitter's point total increases by exactly
distance × 10, and by rejecting a submission and confirming no points are added.

**Acceptance Scenarios**:

1. **Given** a Pending Cycling submission of 20 km, **When** an admin approves it, **Then** the
   submitter is credited 80 points (20 km × 4 pts/km) and the submission status changes to
   "Approved".
2. **Given** a Pending Swimming submission of 1.5 km, **When** an admin approves it, **Then** the
   submitter is credited 30 points (1.5 km × 20 pts/km).
3. **Given** a Pending Yoga submission of 45 minutes, **When** an admin approves it, **Then** the
   submitter is credited 45 points (45 min × 1 pt/min).
4. **Given** a Pending submission, **When** an admin rejects it, **Then** its status changes to
   "Rejected", zero points are awarded, and the submitter can see the rejected status.
5. **Given** an Approved or Rejected submission, **When** an admin views the review queue, **Then**
   that submission no longer appears in the list of items awaiting review.
6. **Given** a Pending Cycling submission of 4.15 km, **When** an admin approves it, **Then** the
   submitter is credited exactly 16.6 points (4.15 km × 4 pts/km), demonstrating that points are
   kept fractional and are never rounded.

---

### User Story 3 - Search, Create, and Join Squads (Priority: P2)

An employee wants to compete as part of a team. They search for an existing squad by name, or
create a new one if none fits, and join it. They can belong to more than one squad at the same
time (e.g., a company-wide squad and a department squad).

**Why this priority**: Squads are required before any group leaderboard can exist, but the app is
still usable (individual submissions and an individual leaderboard) without them, so this ranks
below the core submit/approve/points loop.

**Independent Test**: Can be fully tested by creating a squad, searching for it by name from a
different user account, joining it, and confirming the joining user now appears in that squad's
member list while remaining a member of any other squad they had already joined.

**Acceptance Scenarios**:

1. **Given** no squad named "Marketing Runners" exists, **When** a user creates a squad with that
   name, **Then** the squad exists with that user as its first member, and that user is assigned
   the "Manager" role for that squad.
2. **Given** an existing squad, **When** a different user searches for it by name, **Then** it
   appears in the search results and they can join it as a "Member".
3. **Given** a user who already belongs to one squad, **When** they join a second squad, **Then**
   they remain a member of both.
4. **Given** a squad name that already exists, **When** a user tries to create another squad with
   the same name, **Then** the creation is rejected with a message that the name is taken.

---

### User Story 4 - Group-Scoped Roles and Invitations (Priority: P2)

A squad's creator needs to manage who is allowed to join their squad directly, without waiting for
every member to find and self-join it. The creator is automatically the squad's "Manager" and can
invite specific employees into the squad. An invited employee sees the pending invite and must
explicitly accept it before becoming a Member — declining leaves them uninvited rather than a
member. Regular members of that same squad cannot send invites. A Manager can also promote another
Member of that same squad to also be a Manager, so a squad can have more than one Manager and is
not left without one if a Manager departs. Because roles are scoped per squad, the same employee
can be a Manager of one squad they started while simply being a Member of another squad they
joined.

**Why this priority**: Invitations are a faster on-ramp for squad membership than search-and-join
alone, and establishing who may extend that on-ramp (the Manager) protects squad composition. It
depends on squads already existing (User Story 3) but is not required for the core submit/approve/
points loop, so it ranks alongside squad creation rather than above the P1 stories.

**Independent Test**: Can be fully tested by creating a squad as User A (confirming A is Manager),
inviting User B (confirming B sees a pending invite but is not yet a Member), having B accept it
(confirming B becomes a Member), and then confirming User B's attempt to invite User C is rejected
while User A's invite of User C succeeds. Separately, confirm a declined invite does not create a
membership, that User A can promote Member D to Manager and D can then also invite/promote, and
that User A can be Manager of that squad while being a Member of a second squad created by someone
else.

**Acceptance Scenarios**:

1. **Given** User A creates a new squad, **When** the squad is created, **Then** User A holds the
   "Manager" role for that squad.
2. **Given** User A is Manager of a squad, **When** User A searches the employee directory by name,
   selects User B, and sends the invite, **Then** User B sees a pending invite for that squad but
   does not yet become a Member.
3. **Given** User B has a pending invite to a squad, **When** User B accepts the invite, **Then**
   User B becomes a "Member" of that squad and the invite is marked "Accepted".
4. **Given** User B has a pending invite to a squad, **When** User B declines the invite, **Then**
   User B does not become a member of that squad and the invite is marked "Declined".
5. **Given** User B is a "Member" (not Manager) of a squad, **When** User B attempts to invite
   another user, **Then** the invite is rejected with an authorization error and no invite is sent.
6. **Given** User A is Manager of Squad 1 and a Member of Squad 2, **When** User A's role is viewed
   in each squad, **Then** Squad 1 shows User A as Manager and Squad 2 shows User A as Member,
   independently of each other.
7. **Given** User A is Manager of a squad that also has Member User D, **When** User A promotes
   User D to Manager, **Then** the squad has two Managers (A and D), and D can now invite users and
   promote other Members.
8. **Given** User B is a Member (not Manager) of a squad, **When** User B attempts to promote
   another Member to Manager, **Then** the action is rejected with an authorization error.

---

### User Story 5 - View Individual and Group Leaderboards (Priority: P3)

Any employee wants to see how they and their squads compare to others. They open a global
leaderboard ranking all individual users by total approved points, and a group leaderboard ranking
squads — which they can sort either by each squad's total combined points or by each squad's
average points per member. From the leaderboard view, they can switch between the Global ranking
and the ranking of any specific squad they belong to using a dropdown or tab selector.

**Why this priority**: Leaderboards are the payoff feature that makes the points and squads
meaningful, but they are read-only views that depend on data produced by the first three stories,
so they are built last.

**Independent Test**: Can be fully tested by approving submissions for several users across two
squads with different member counts, then confirming the individual leaderboard orders users by
total approved points, the group leaderboard produces a different order when sorted by total versus
by average, and a user belonging to those squads can switch the leaderboard view between Global and
each squad via the selector.

**Acceptance Scenarios**:

1. **Given** several users with different total approved points, **When** the global leaderboard
   is viewed, **Then** users are listed in descending order of total approved points.
2. **Given** two squads with different numbers of members and different combined points, **When**
   the group leaderboard is sorted by total points, **Then** squads are ordered by their summed
   member points, descending.
3. **Given** the same two squads, **When** the group leaderboard is sorted by average points,
   **Then** squads are ordered by (summed member points ÷ member count), descending, and this order
   can differ from the total-points order.
4. **Given** a submission that is still Pending or has been Rejected, **When** leaderboards are
   viewed, **Then** its points are not included in any user's or squad's total.
5. **Given** a user who is a member of one or more squads, **When** they open the leaderboard view,
   **Then** a dropdown or tab selector lets them switch between "Global" rankings and the ranking of
   any specific squad they belong to, and the displayed rankings update accordingly.
6. **Given** a user who belongs to no squads, **When** they open the leaderboard selector, **Then**
   only the "Global" option is available and no squad options are shown.

---

### User Story 6 - Register a New Account (Priority: P1)

A prospective employee who does not yet have a Rivals account opens the public registration page,
enters their work email, a display name, and a password, and submits the form. The system creates
their account with the standard employee role and redirects them to the login page so they can
sign in with their new credentials.

**Why this priority**: Account creation is the on-ramp for every other capability in this app —
without a way to create an account, employees can only rely on pre-provisioned seed accounts,
which does not scale to the full ~5,000-employee population this spec targets (SC-007). It is
prioritized alongside the P1 submission/approval loop as a prerequisite for onboarding real users.

**Independent Test**: Can be fully tested by submitting the registration form with a new email, a
display name, and a valid password; confirming a new account is created with the standard employee
role, zero starting points, and no squad memberships; confirming the browser lands on the login
page; and confirming the new credentials successfully log the user in from there.

**Acceptance Scenarios**:

1. **Given** no account exists for a given email, **When** a visitor submits the registration form
   with that email, a display name, and a valid password, **Then** a new account is created with
   the standard employee role and the visitor is redirected to the login page.
2. **Given** an account already exists for a given email, **When** a visitor tries to register
   using that same email (regardless of letter casing), **Then** the registration is rejected with
   a message that the email is already in use, and no duplicate account is created.
3. **Given** a visitor leaves the email, display name, or password field empty, **When** they
   submit the registration form, **Then** the submission is rejected at entry with a validation
   message and no account is created.
4. **Given** a visitor enters a password shorter than the minimum required length, **When** they
   submit the registration form, **Then** the submission is rejected with a validation message
   describing the minimum requirement, and no account is created.
5. **Given** a visitor successfully registers, **When** they enter their new email and password on
   the login page, **Then** they are logged in successfully.
6. **Given** a visitor who is not logged in, **When** they navigate directly to the registration
   page's URL, **Then** the page loads without requiring them to sign in first.

---

### Edge Cases

- What happens when a user submits an activity with a zero or negative distance/duration? The
  submission MUST be rejected at entry as invalid.
- What happens when a user leaves a squad after some of their submissions were already approved?
  Their already-earned points are removed from that squad's total and average going forward, since
  squad totals reflect current membership.
- What happens when a squad has zero members (e.g., last member leaves)? Its average-points value
  has no meaningful denominator; the system MUST show it as zero or unranked rather than erroring.
- What happens when two users or two squads are exactly tied on points? Ties MUST be broken by a
  stable, deterministic secondary rule (e.g., alphabetical) so the leaderboard order never appears
  to change randomly.
- What happens when an admin rejects a submission — can the user resubmit? Yes; the user MUST be
  able to submit a new activity entry, since a Rejected submission is terminal and not editable.
- What happens when a user tries to submit an activity type outside the four supported types
  (Running, Cycling, Swimming, Yoga)? The submission MUST be rejected at entry as invalid.
- What happens when two admins try to approve or reject the same Pending submission at nearly the
  same time? The second admin's action MUST be rejected as a conflict, since the submission is no
  longer Pending once the first decision is applied — submissions are never double-processed.
- What happens when a squad's only Manager leaves that squad without first promoting anyone? The
  squad continues to exist with its remaining Members, but has no Manager and therefore no one can
  invite new users or promote a new Manager; the squad remains without a Manager until an admin
  intervenes, since this feature does not include an admin-driven squad-management capability.
- What happens when a Member (not a Manager) tries to invite a user to a squad? The invite MUST be
  rejected with an authorization error, since only that squad's Manager(s) may invite.
- What happens when a user already has a pending invite to a squad and is invited again for that
  same squad? The system MUST NOT create a duplicate pending invite; the existing pending invite
  stands.
- What happens when a user declines a squad invite? No membership is created, and the decline MUST
  NOT permanently block future invites — a squad's Manager MAY invite that same user again later.
- What happens when a Manager invites a user who is already a Member of that squad? The invite MUST
  be rejected at creation as redundant, since the user is already a member.
- What happens when someone submits the registration form twice in quick succession (e.g.,
  double-clicking submit) with the same email? Only the first request MUST create an account; the
  second MUST be rejected as a duplicate email, since email uniqueness is enforced regardless of
  request timing.
- What happens when someone registers with an email that differs from an existing account's email
  only in letter case (e.g., "User@Company.com" vs. "user@company.com")? Email matching MUST be
  case-insensitive, so this MUST be rejected as a duplicate.

## UI/UX Design System *(mandatory)*

These are strict, non-negotiable presentation rules for every screen and component delivered by
this feature. Unlike the functional requirements above, this section intentionally specifies
concrete visual tokens (not just outcomes) because the stakeholder has mandated a fixed design
language; implementers MUST NOT substitute alternative colors, layouts, icon sets, or corner
treatments.

- **UX-001 (Dark Mode Theme)**: The application MUST use a premium dark-mode theme only (no light
  mode in scope): page backgrounds MUST use `zinc-950`, surface/card backgrounds MUST use
  `zinc-900`, and primary text MUST be white.
- **UX-002 (Sidebar Navigation)**: The application MUST use a persistent left-hand sidebar as the
  primary navigation layout (covering areas such as Activity Submission, Admin Review, Squads, and
  Leaderboards). Top-nav-only or bottom-tab navigation MUST NOT be used as the primary navigation
  pattern.
- **UX-003 (Apple/macOS-Inspired Aesthetic)**: All containers, cards, buttons, and inputs MUST use
  smooth, generous rounded corners (e.g., large-radius rounding such as `rounded-2xl` for cards and
  panels, and `rounded-full`/`rounded-lg` for buttons and pill-shaped controls) and MUST use subtle,
  soft borders (e.g., `border-zinc-800` or a low-opacity `border-white/10`) rather than
  high-contrast ones — surfaces should be separated primarily through soft elevation/contrast in
  background shade, not hard outlines. The overall feel MUST read as elegant, modern, and easy on
  the eyes. Sharp corners, minimal/near-zero border-radius, and high-contrast or blocky borders
  MUST NOT be used anywhere in this feature.
- **UX-004 (Bold Iconography)**: All icons MUST come from the Lucide React icon set, with
  stroke-width forced to `2.5` everywhere (overriding the library's default stroke-width) to
  produce a heavier, more aggressive line weight.
- **UX-005 (Neon Status Badges)**: Status badges MUST use vivid/neon accent colors that stand out
  against the dark theme: an Approved submission's badge MUST be electric green, and a Rejected
  submission's badge MUST be crimson red. The Pending badge MUST use a third, visually distinct
  vivid color so all three statuses remain unambiguous at a glance.
- **UX-006 (App Layout Wrapping)**: Every authenticated page (every screen reachable only after
  signing in — Activity Submission, Admin Review, Squads, Invitations, Leaderboards, etc.) MUST be
  wrapped in a single, shared master layout structure (an `AppLayout`) that owns the overall screen
  composition rather than each page building its own top-level scaffolding. This layout MUST:
  (a) fill the full viewport height as a flex container; (b) pin the Sidebar navigation (UX-002) to
  the left edge, fixed in place; and (c) render the current page's content in an independently
  scrollable main area to the right, so scrolling a long page never moves or hides the sidebar. The
  layout's own background MUST be a deep dark grey (e.g., `#0a0a0b`) that is visually distinct from
  and darker than the card/surface background (e.g., `#121214`), so that cards read as clearly
  elevated above the page underneath them. The public, unauthenticated pages (Login, Register) are
  the sole exception: they render as full-screen pages outside `AppLayout` (no Sidebar, since there
  is no signed-in session yet), but MUST still use the same dark background, card, and accent tones
  as every other screen so the visual identity is continuous across the sign-in/sign-up boundary.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated user to submit an activity with an activity
  type (Running, Cycling, Swimming, or Yoga), a numeric distance (km) for Running/Cycling/Swimming
  or a numeric duration (minutes) for Yoga, and one screenshot as evidence.
- **FR-002**: The system MUST reject a submission at entry if it is missing a screenshot, has a
  zero/negative distance or duration, or specifies an activity type outside the supported four.
- **FR-003**: The system MUST set every new activity submission to status "Pending" and MUST
  exclude Pending submissions from all point totals and leaderboards.
- **FR-004**: The system MUST let an admin view a queue of all Pending submissions, including each
  submission's user, activity type, distance/duration, and screenshot.
- **FR-005**: The system MUST let an admin approve or reject each Pending submission, and MUST
  remove it from the review queue once decided.
- **FR-006**: Upon approval, the system MUST automatically calculate the submission's points using
  the fixed rate for its activity type — Running: 10 pts/km, Cycling: 4 pts/km, Swimming: 20 pts/km,
  Yoga: 1 pt/min — and credit those points to the submitting user. Points are calculated as
  rate × distance/duration exactly, kept as a fractional (decimal) value with no rounding.
- **FR-007**: Upon rejection, the system MUST award zero points and MUST make the "Rejected" status
  visible to the submitting user.
- **FR-008**: The system MUST record which admin approved or rejected a submission and when.
- **FR-009**: The system MUST let a user view the status (Pending, Approved, or Rejected) and, if
  applicable, the points awarded for each of their own past submissions.
- **FR-010**: The system MUST let a user search for existing squads by name.
- **FR-011**: The system MUST let a user create a new squad with a name that is unique
  (case-insensitive) among existing squads.
- **FR-012**: The system MUST let a user join any number of squads simultaneously, and leave any
  squad they belong to.
- **FR-013**: The system MUST display a global leaderboard ranking all users by their total
  Approved points, descending.
- **FR-014**: The system MUST display a group leaderboard ranking squads, with the user able to
  switch between sorting by each squad's total combined member points and sorting by each squad's
  average points per member, both descending.
- **FR-015**: The system MUST compute a squad's total points as the sum of its current members'
  Approved points, and its average points as that total divided by its current member count.
- **FR-016**: The system MUST update leaderboards to reflect a submission's points as soon as that
  submission is approved, without requiring any action beyond the admin's approval.
- **FR-017**: The system MUST apply a deterministic, stable tie-breaking rule when two users or two
  squads have equal points, so leaderboard ordering is consistent across views.
- **FR-018**: The system MUST restrict access to a submission's screenshot to the submitting user
  and admins only; no other employee may view it.
- **FR-019**: The system MUST reject an approve or reject action on a submission that is no
  longer Pending (e.g., already decided by another admin) with a conflict error, rather than
  applying the decision a second time.
- **FR-020**: The system MUST automatically assign the "Manager" role, scoped to that squad, to the
  user who creates it.
- **FR-021**: The system MUST track a squad membership role ("Manager" or "Member") per user, per
  squad, independently — a user's role in one squad MUST NOT affect their role in any other squad.
- **FR-022**: The system MUST let only a squad's Manager(s) invite new users to that squad by
  creating a "Pending" invitation for the invited user; an invite MUST NOT create membership by
  itself.
- **FR-023**: The system MUST let a Manager search for and select an employee from an employee
  directory (matching by name) when creating an invite, rather than requiring a raw email address
  entry.
- **FR-024**: The system MUST reject an invite action attempted by a user who is a Member (not a
  Manager) of the target squad, with an authorization error, and MUST NOT send the invite.
- **FR-025**: The system MUST assign the "Member" role to any user who joins a squad other than by
  creating it (whether by accepting a Pending invite or via self-service search-and-join).
- **FR-026**: The system MUST let an invited user view their own Pending invites and either accept
  or decline each one.
- **FR-027**: Upon acceptance, the system MUST add the invited user as a "Member" of that squad and
  mark the invitation "Accepted".
- **FR-028**: Upon decline, the system MUST NOT add the invited user to the squad and MUST mark the
  invitation "Declined"; a Declined invite MUST NOT prevent a squad Manager from inviting that same
  user again later.
- **FR-029**: The system MUST prevent a duplicate Pending invitation from being created for the
  same user and squad pair while one already exists.
- **FR-030**: The system MUST reject an invite to a user who is already a Member of the target
  squad.
- **FR-031**: The system MUST let a squad's Manager promote another Member of that same squad to
  also hold the "Manager" role for that squad, so a squad MAY have more than one Manager.
- **FR-032**: The system MUST reject a promote-to-Manager action attempted by a user who is a
  Member (not a Manager) of the target squad, with an authorization error.
- **FR-033**: The system MUST provide a dropdown or tab selector on the leaderboard view letting the
  user switch between the Global company-wide ranking and the ranking of any specific squad they
  are currently a member of.
- **FR-034**: The system MUST default the leaderboard view to the Global ranking when a user first
  opens it.
- **FR-035**: The leaderboard selector MUST list only squads the current user is a member of, not
  every squad in the system.
- **FR-036**: The system MUST provide a registration page/flow that does not require the visitor to
  be authenticated, letting them submit an email, a display name, and a password to create an
  account.
- **FR-037**: The system MUST reject a registration attempt at entry if the email, display name, or
  password is missing, or if the password does not meet the minimum length requirement, with a
  validation message and without creating an account.
- **FR-038**: The system MUST reject a registration attempt whose email matches (case-insensitively)
  an existing account's email, with a message that the email is already registered, and MUST NOT
  create a duplicate account.
- **FR-039**: Upon successful registration, the system MUST securely hash the submitted password
  before storing it and MUST NOT retain or expose the plaintext password beyond the registration
  request itself.
- **FR-040**: Upon successful registration, the system MUST create a new account assigned the
  standard employee role (not Admin), with zero starting points and no squad memberships.
- **FR-041**: Upon successful registration, the system MUST redirect the visitor to the login page
  rather than automatically signing them in.
- **FR-042**: The registration page MUST be reachable directly (e.g., via its own URL) without
  first navigating through any authenticated part of the application.

### Key Entities

- **User**: An employee account. Attributes: email (unique, case-insensitive, used to sign in),
  display name, password (stored only as a secure hash, never as plaintext), company-wide role
  ("employee" or "Admin"), list of squads they belong to, total Approved points (derived from their
  own approved submissions).
- **Activity Submission**: A single logged workout awaiting or having received review. Attributes:
  submitting user, activity type (Running/Cycling/Swimming/Yoga), distance or duration value,
  screenshot (visible only to the submitting user and admins), status (Pending/Approved/Rejected),
  points awarded (once Approved; a fractional/decimal value, not rounded), submitted timestamp,
  reviewing admin and decision timestamp (once decided).
- **Squad**: A named team that users can join. Attributes: name (unique), member list, total points
  (derived, sum of members' approved points), average points (derived, total ÷ member count).
- **Squad Membership**: The relationship between one user and one squad. Attributes: user, squad,
  role ("Manager" or "Member", scoped to this squad only), joined timestamp. A user has one
  independent Squad Membership record — and therefore one independent role — per squad they belong
  to. Created when a self-service join completes or a Squad Invitation is Accepted. A squad MAY
  have more than one Membership with role "Manager", since a Manager can promote another Member to
  also be a Manager.
- **Squad Invitation**: An offer for a specific user to join a specific squad, sent by that squad's
  Manager. Attributes: inviting Manager, invited user, squad, status (Pending/Accepted/Declined),
  created timestamp, decision timestamp (once Accepted or Declined). Accepting creates a Squad
  Membership for the invited user with role "Member"; declining creates no membership.
- **Activity Point Rate**: The fixed scoring rule per activity type — Running 10 pts/km, Cycling 4
  pts/km, Swimming 20 pts/km, Yoga 1 pt/min — used to calculate points at approval time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can complete and submit an activity (type, distance/time, and screenshot) in
  under 2 minutes.
- **SC-002**: 100% of approved submissions are credited the exact fractional point value implied by
  the fixed rate table (rate × distance or duration, unrounded), with zero calculation
  discrepancies.
- **SC-003**: 100% of Pending and Rejected submissions are excluded from every leaderboard and every
  squad/user point total at all times.
- **SC-004**: A user can find and join an existing squad by name in under 1 minute.
- **SC-005**: A newly approved submission's points are reflected in the relevant individual and
  squad leaderboards without any manual recalculation step.
- **SC-006**: For squads with differing member counts, sorting the group leaderboard by total points
  versus by average points per member produces a demonstrably different, correct ordering.
- **SC-007**: The system supports up to approximately 5,000 employees, with leaderboard and squad
  search/list views returning results in under 1 second at that scale.
- **SC-008**: A user can switch the leaderboard view between Global rankings and any of their
  squads' rankings in a single interaction (e.g., one click or tap), without navigating to a
  different page.
- **SC-009**: 100% of invite attempts made by a non-Manager member of a squad are rejected, and
  100% of invite attempts made by that squad's Manager succeed in creating a Pending invitation
  (assuming a valid, not-already-invited, not-already-member invitee).
- **SC-010**: An invited user can accept or decline a pending squad invite in a single interaction,
  and the resulting membership state (Member vs. no membership) is immediately reflected.
- **SC-011**: A prospective employee can complete registration (email, display name, password) and
  land on the login page in under 1 minute.
- **SC-012**: 100% of registration attempts using an email already associated with an existing
  account are rejected without creating a duplicate account.
- **SC-013**: 100% of stored passwords are kept as irreversible hashes; no plaintext password is
  ever retrievable from the system after registration completes.

## Assumptions

- Two account roles exist: regular employee and admin; every self-registered account is assigned
  the standard employee role. Promotion to Admin is outside this feature's scope and is assumed to
  remain a separate, pre-provisioned action (e.g., performed directly by IT/ops), not something a
  user can request or trigger via registration. This is a company-wide role, separate from the
  per-squad Manager/Member role described below.
- Each activity submission carries exactly one screenshot as evidence.
- A user may belong to an unlimited number of squads, and a squad has no maximum member count.
- The squad's creator becomes its first Manager; that Manager (or any other current Manager) may
  promote additional Members to Manager, but there is no "demote a Manager back to Member" or
  "remove a Manager" action in this feature — once promoted, a Manager stays a Manager unless they
  leave the squad entirely.
- A Pending invite has no expiration; it remains Pending indefinitely until the invited user
  accepts or declines it.
- Declining an invite is not a permanent block: the same Manager (or a later Manager) may invite
  that user again.
- A Rejected submission is terminal (not editable); a user wanting credit for that workout submits
  a new entry.
- A squad's total and average points always reflect its *current* membership — points travel with
  the user, not with a snapshot of past membership.
- The four supported activity types and their point rates (Running, Cycling, Swimming, Yoga) are
  fixed for this feature; adding new activity types is out of scope.
- The Pending status badge's exact vivid color is not specified by the stakeholder beyond "must be
  visually distinct from the Approved (electric green) and Rejected (crimson red) badges"; a vivid
  amber/yellow is assumed as a reasonable third neon accent consistent with UX-005.
- Registration does not include an email verification/confirmation step in this feature; a newly
  registered account can sign in immediately with no further action, consistent with this being an
  internal tool for a pre-vetted company population rather than a public-facing consumer product.
- A minimum password length (e.g., 8 characters) is enforced as a reasonable default; no additional
  complexity rules (required uppercase/numbers/symbols, etc.) are mandated by this feature.
- Display names are not required to be unique across accounts; only the email is enforced as
  unique, since email is the sign-in identifier.
