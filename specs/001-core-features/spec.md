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

### Session 2026-09-04 (Squad-Strict Submissions & User Search)

- Decision: Squads become strictly invite-only — a user may no longer self-join a squad directly
  from search/browse results; the only way to become a Member of an existing squad is to accept a
  Manager's invitation (User Story 4). Squad search/browse remains available but read-only.
- Decision: The employee/user directory and its search remain globally accessible to every
  authenticated user (not only Squad Managers), primarily so a Squad Manager can find a specific
  employee to invite, but usable by anyone to look up a colleague.
- Decision: Any user may open any other user's public profile, seeing at minimum that user's photo,
  a short personal quote, and their Global Average (their overall Approved-points standing across
  all submissions, the same figure used on the Global leaderboard). A viewer sees Squad-specific
  detail on that profile only if the viewer shares at least one Squad with the profile's owner;
  otherwise only the public fields are shown.
- Decision: Activity submission becomes strictly Squad-scoped — a user must belong to at least one
  Squad to submit at all, and every submission MUST specify exactly one target Squad (from the
  Squads the user currently belongs to) via a required selector. A squad's point total is thereafter
  computed from submissions tagged to that squad, not from a member's entire cross-squad total.
- Decision: Each Squad defines its own allowed subset of the four activity types (e.g., a
  "Swimmers Only" squad allows only Swimming; a squad with no explicit selection defaults to
  allowing all four). The Activity Type choice on the submission form MUST be restricted to only the
  types the selected target Squad allows, updating dynamically when the Squad selection changes.

### Session 2026-09-04 (Account Settings)

- Q: Should there be one combined "Account Settings" page covering profile photo, quote, and
  password change together, or should these be split into separate flows? → A: One combined
  "Account Settings" page holds photo, quote, and password change together.
- Q: Should a user set their profile picture by uploading an image file directly, or by pasting a
  URL to an image hosted elsewhere? → A: File upload, reusing the existing screenshot-storage
  pattern already built for activity submissions.
- Q: When a user changes their password, must they re-enter their current password to confirm it's
  really them? → A: Yes — the current password is required before a new one is accepted.
- Q: Should the new password on the Account Settings change-password flow follow the same
  minimum-length rule as registration (8 characters), or need stronger requirements? → A: Same
  rule as registration — minimum 8 characters, no additional complexity rules.
- Q: Besides photo, quote, and password, should Account Settings also let a user change their
  display name or email address? → A: Out of scope — Account Settings covers only photo, quote,
  and password; display name/email changes are not part of this feature.

### Session 2026-09-04 (Screenshot Retention)

- Decision: An activity submission's screenshot is deleted from storage as soon as an admin
  records a decision (Approved or Rejected) — screenshots exist only to support the review itself,
  not as a long-term audit record, so retaining them afterward wastes storage.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit an Activity for Approval (Priority: P1)

An employee who belongs to at least one Squad completes a workout (running, cycling, swimming, or
yoga) and wants credit for it. They open Rivals, select which of their Squads the submission counts
toward, choose an activity type from the subset that Squad allows, enter the distance (for
running/cycling/swimming) or duration (for yoga), and upload a screenshot as evidence. The
submission is saved with a **Pending** status and does not yet count toward any points or ranking.
An employee who does not belong to any Squad cannot submit an activity until they are invited into
and accept membership in one (User Story 4).

**Why this priority**: This is the entry point of the entire app — no points, squads, or leaderboards
have any data without activity submissions. It is the smallest slice that is independently
demonstrable (a user can submit and see it recorded as Pending), even before approval exists.

**Independent Test**: Can be fully tested by submitting an activity as a Squad member — picking that
Squad, a type it allows, a distance/duration value, and a screenshot — and confirming it is stored
with status "Pending", tagged to the chosen Squad, and does not appear on any leaderboard; and
separately confirming a user with no Squad membership cannot submit at all.

**Acceptance Scenarios**:

1. **Given** a logged-in employee who is a Member of at least one Squad, **When** they select that
   Squad, an activity type the Squad allows, a distance, and a screenshot, **Then** the submission is
   saved with status "Pending", tagged to that Squad, and is visible in their own submission history.
2. **Given** a logged-in employee who belongs to no Squad, **When** they attempt to open the
   submission form, **Then** they are blocked from submitting and prompted to get invited into a
   Squad first.
3. **Given** a logged-in employee who is a Member of a Squad that only allows Swimming, **When** they
   open the submission form with that Squad selected, **Then** the Activity Type options offered are
   limited to Swimming.
4. **Given** a logged-in employee, **When** they try to submit an activity without attaching a
   screenshot, **Then** the submission is rejected at entry with a validation message and is not
   saved.
5. **Given** a logged-in employee whose selected Squad allows Yoga, **When** they submit a Yoga
   activity with a duration in minutes, **Then** the submission is saved with status "Pending" using
   minutes as its unit (not distance).

---

### User Story 2 - Admin Reviews, Approves, and Points Are Awarded (Priority: P1)

An admin opens a queue of Pending submissions, reviews each one's activity type, distance/time, and
screenshot, and either approves or rejects it. When approved, the system automatically calculates
points using the fixed rate for that activity type and credits them to the submitting user. When
rejected, no points are awarded and the submitter can see why their submission did not count. Once
a decision is recorded, the submission's screenshot has served its purpose as review evidence and
is deleted from storage — it is not retained afterward.

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
7. **Given** a Pending submission with its screenshot, **When** an admin approves or rejects it,
   **Then** the screenshot is deleted from storage and is no longer retrievable by anyone,
   including the submitter and admins.

---

### User Story 3 - Create a Squad and Define Its Allowed Activities (Priority: P2)

An employee wants to lead a team. They create a new squad with a name that is unique among existing
squads and choose which of the four activity types (Running, Cycling, Swimming, Yoga) that squad
will accept submissions for — e.g., a squad might allow only Swimming. Creating a squad makes them
its first Manager. Because squads are strictly invite-only, there is no self-service "join" action:
every other Member gets in only by accepting an invitation from that squad's Manager (User Story 4).
An employee may still belong to more than one squad, as long as they were invited into and accepted
each one.

**Why this priority**: Squads are required before any group leaderboard, invitation, or
squad-scoped submission can exist, but the app is still usable (an individual can be invited into a
seed squad) without a user having created one themselves, so this ranks below the core
submit/approve/points loop.

**Independent Test**: Can be fully tested by creating a squad with a chosen name and a chosen subset
of allowed activity types, confirming the creator is its Manager and the squad appears in the global
squad directory with exactly those activity types enabled, and confirming that no self-service
"Join" control is offered to other users browsing that directory — they can only become Members by
receiving and accepting an invitation (User Story 4).

**Acceptance Scenarios**:

1. **Given** no squad named "Marketing Runners" exists, **When** a user creates a squad with that
   name and selects one or more allowed activity types, **Then** the squad exists with that user as
   its Manager and with exactly the chosen activity types enabled for submissions.
2. **Given** an existing squad, **When** a different user browses or searches the squad directory,
   **Then** the squad's name and allowed activity types are visible but no self-service "Join"
   control is offered.
3. **Given** a squad name that already exists, **When** a user tries to create another squad with
   the same name, **Then** the creation is rejected with a message that the name is taken.
4. **Given** a user creates a squad without explicitly selecting any allowed activity types, **When**
   the squad is created, **Then** it defaults to allowing all four activity types.

---

### User Story 4 - Group-Scoped Roles and Invitations (Priority: P2)

A squad's creator needs to control exactly who is allowed to join their squad, since squads are
strictly invite-only. The creator is automatically the squad's "Manager" and can
invite specific employees into the squad. An invited employee sees the pending invite and must
explicitly accept it before becoming a Member — declining leaves them uninvited rather than a
member. Regular members of that same squad cannot send invites. A Manager can also promote another
Member of that same squad to also be a Manager, so a squad can have more than one Manager and is
not left without one if a Manager departs. Because roles are scoped per squad, the same employee
can be a Manager of one squad they started while simply being a Member of another squad they
joined.

**Why this priority**: Invitations are the only on-ramp into squad membership now that self-service
joining has been removed, and establishing who may extend that on-ramp (the Manager) protects squad
composition. It depends on squads already existing (User Story 3) but is not required for the core
submit/approve/points loop, so it ranks alongside squad creation rather than above the P1 stories.

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

### User Story 7 - Search Users and View Public Profiles (Priority: P2)

An employee wants to find a specific colleague — most often a Squad Manager looking for someone to
invite — or simply wants to see how a colleague they know is doing. They search the global employee
directory by name and open a result to view that person's public profile: their photo, a short
personal quote, and their Global Average. If the viewer shares at least one Squad with that person,
the profile also surfaces that shared Squad's activity for them; if they share no Squad, only the
public fields are shown.

**Why this priority**: Directory search already underpins Manager-driven invitations (User Story 4);
promoting it to a first-class, globally usable search-and-profile feature increases visibility and
social engagement without being required for the core submit/approve/points loop, so it ranks
alongside squad creation.

**Independent Test**: Can be fully tested by having User A, who shares no squad with User B, search
the directory for User B and open B's profile, confirming only photo/quote/Global Average are shown
with no Squad-specific detail; then having A and B share a common Squad and confirming A's view of
B's profile now also surfaces that shared Squad's activity.

**Acceptance Scenarios**:

1. **Given** any two employees, **When** one searches the global directory by the other's name,
   **Then** the other appears in the results regardless of whether they share a Squad.
2. **Given** User A and User B share no Squad, **When** A opens B's public profile, **Then** A sees
   B's photo, quote, and Global Average only, with no Squad-specific activity shown.
3. **Given** User A and User B share at least one Squad, **When** A opens B's profile, **Then** A
   additionally sees B's activity/standing within that shared Squad.
4. **Given** a Squad Manager searching the directory to invite someone, **When** they select a
   result, **Then** they can proceed directly to sending that person an invite from there.
5. **Given** a user who has not set a photo or quote, **When** another user views their profile,
   **Then** the profile still renders using a placeholder rather than erroring.

---

### User Story 8 - Manage Account Settings (Priority: P2)

A signed-in employee wants to personalize their profile and keep their account secure. They open a
single Account Settings page where they can upload a new profile photo, update their personal
quote, and change their password by entering their current password once and a new password.

**Why this priority**: builds on identity established during registration (User Story 6) and shown
on the public profile (User Story 7), but is not required for the core submit/approve/points loop,
so it ranks alongside other supporting account features.

**Independent Test**: Can be fully tested by uploading a new photo and confirming it appears on the
user's own public profile; updating the quote and confirming the same; and changing the password
with the correct current password, confirming a login with the old password fails and the new one
succeeds. Separately, confirm a password-change attempt with an incorrect current password is
rejected without changing the password.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they upload a new profile photo on Account Settings,
   **Then** their public profile (User Story 7) reflects the new photo.
2. **Given** a signed-in user, **When** they update their personal quote on Account Settings,
   **Then** their public profile reflects the new quote.
3. **Given** a signed-in user, **When** they submit a password change with the correct current
   password and a new password of at least 8 characters, **Then** the password is updated and they
   can log in with the new password (and no longer with the old one).
4. **Given** a signed-in user, **When** they submit a password change with an incorrect current
   password, **Then** the change is rejected with an authentication error and the password remains
   unchanged.
5. **Given** a signed-in user, **When** they submit a new password shorter than 8 characters,
   **Then** the change is rejected with a validation message and the password remains unchanged.
6. **Given** a signed-in user, **When** they open Account Settings, **Then** display name and
   email are not editable there (out of scope for this feature).

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
- What happens when a user with no Squad memberships tries to open the activity submission form?
  They MUST be blocked from submitting and prompted to get invited into a Squad first, since
  submission is strictly Squad-scoped.
- What happens when a user changes the selected target Squad on the submission form after already
  choosing an Activity Type the newly selected Squad does not allow? The Activity Type selection
  MUST be cleared/reset so an invalid Squad/Activity Type combination can never be submitted.
- What happens when a squad's creator selects zero allowed activity types while creating it? The
  squad MUST default to allowing all four activity types rather than allowing none.
- What happens when a user tries to self-join a squad directly from search/browse results? No such
  action MUST be offered; the only path to membership is accepting a Manager's invitation.
- What happens when a user searches the global directory for a colleague who does not exist or does
  not match any name? The system MUST return an empty result set rather than an error.
- What happens when a user attempts to view Squad-specific detail on another user's profile without
  sharing a Squad with them (e.g., via a direct link)? That detail MUST remain hidden; only the
  public fields (photo, quote, Global Average) are ever returned to a non-shared-Squad viewer.
- What happens when a user uploads a non-image file as their profile photo? The upload MUST be
  rejected at entry as invalid, the same as an activity submission's screenshot validation.
- What happens when a user submits a password change with an incorrect current password? The
  change MUST be rejected with an authentication error and the stored password MUST NOT change.
- What happens when a user submits a new password shorter than the minimum length? The change
  MUST be rejected with a validation message and the stored password MUST NOT change.
- What happens when the submitting user or an admin tries to view the screenshot of a submission
  that has already been Approved or Rejected? The request MUST be rejected as not found, since the
  screenshot was deleted the moment the decision was recorded.

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

- **FR-001**: The system MUST allow an authenticated user who belongs to at least one Squad to
  submit an activity specifying: the target Squad (selected from the Squads they are currently a
  Member of), an activity type from the subset that Squad allows (Running, Cycling, Swimming, or
  Yoga), a numeric distance (km) for Running/Cycling/Swimming or a numeric duration (minutes) for
  Yoga, and one screenshot as evidence.
- **FR-002**: The system MUST reject a submission at entry if it is missing a screenshot, has a
  zero/negative distance or duration, specifies an activity type outside the supported four, is
  attempted by a user with no Squad membership, does not specify a target Squad, or specifies an
  activity type that the selected target Squad does not allow.
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
- **FR-010**: The system MUST let a user search/browse existing squads by name for informational
  purposes; browsing MUST NOT offer any self-service way to join a squad directly.
- **FR-011**: The system MUST let a user create a new squad with a name that is unique
  (case-insensitive) among existing squads, and MUST let the creator select which of the four
  activity types the squad allows for submissions, defaulting to all four when none are explicitly
  selected.
- **FR-012**: The system MUST let a user belong to any number of squads simultaneously — membership
  arising only from an accepted invitation (see FR-022–FR-030), never from self-service joining —
  and MUST let a user leave any squad they belong to.
- **FR-013**: The system MUST display a global leaderboard ranking all users by their total
  Approved points, descending.
- **FR-014**: The system MUST display a group leaderboard ranking squads, with the user able to
  switch between sorting by each squad's total combined member points and sorting by each squad's
  average points per member, both descending.
- **FR-015**: The system MUST compute a squad's total points as the sum of the Approved points of
  submissions tagged to that squad (submitted by users who were Members of that squad at approval
  time), and its average points as that total divided by its current member count.
- **FR-016**: The system MUST update leaderboards to reflect a submission's points as soon as that
  submission is approved, without requiring any action beyond the admin's approval.
- **FR-017**: The system MUST apply a deterministic, stable tie-breaking rule when two users or two
  squads have equal points, so leaderboard ordering is consistent across views.
- **FR-018**: The system MUST restrict access to a submission's screenshot to the submitting user
  and admins only, and only while the submission remains Pending — see FR-056 for what happens once
  it is decided.
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
  creating it, which can only happen by accepting a Pending invite (self-service joining is not
  offered).
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
- **FR-043**: The system MUST provide a global employee/user directory search, accessible to every
  authenticated user (not only Squad Managers), that matches by name.
- **FR-044**: The system MUST let any authenticated user open any other user's public profile,
  showing at minimum that user's photo, a short personal quote, and their Global Average.
- **FR-045**: The system MUST hide Squad-specific activity/detail on a viewed profile unless the
  viewer shares at least one Squad with the profile's owner; when no Squad is shared, only the
  public fields (photo, quote, Global Average) MUST be shown.
- **FR-046**: The system MUST let each squad define an allowed subset of the four activity types
  (Running, Cycling, Swimming, Yoga); a squad with no explicit selection MUST default to allowing
  all four.
- **FR-047**: The system MUST require every activity submission to specify exactly one target Squad
  from among the Squads the submitting user currently belongs to.
- **FR-048**: The system MUST restrict the Activity Type options presented on the submission form to
  only the types allowed by the currently selected target Squad, and MUST update those options
  immediately when the selected Squad changes.
- **FR-049**: The system MUST allow a user to set or update their own profile photo and personal
  quote.
- **FR-050**: The system MUST provide a single authenticated "Account Settings" page where a
  signed-in user manages their own profile photo, personal quote, and password.
- **FR-051**: Setting a profile photo MUST be done by uploading an image file (not a pasted URL),
  using the same storage mechanism already used for activity-submission screenshots.
- **FR-052**: The system MUST let a signed-in user change their own password by submitting their
  current password together with a new password.
- **FR-053**: The system MUST reject a password-change attempt whose current password does not
  match the account's stored password, with an authentication error, and MUST NOT change the
  stored password.
- **FR-054**: The system MUST reject a password-change attempt whose new password is shorter than
  the minimum length required at registration (8 characters), with a validation message, and MUST
  NOT change the stored password.
- **FR-055**: Account Settings MUST NOT allow changing the user's display name or email address —
  those remain out of scope for this feature.
- **FR-056**: Upon a submission being Approved or Rejected, the system MUST delete its stored
  screenshot, since it is no longer needed once the review decision is recorded.
- **FR-057**: The system MUST reject a request for a decided submission's screenshot as not found,
  rather than erroring or exposing stale data, since the file no longer exists (FR-056).

### Key Entities

- **User**: An employee account. Attributes: email (unique, case-insensitive, used to sign in),
  display name, password (stored only as a secure hash, never as plaintext; the user may change it
  from Account Settings by re-authenticating with the current one, FR-052–FR-054), company-wide
  role ("employee" or "Admin"), list of squads they belong to, total Approved points across all
  submissions (their Global Average, derived; shown on their public profile and the Global
  leaderboard), a public profile photo (optional, placeholder if unset; set via file upload from
  Account Settings, FR-051), a short public personal quote (optional, placeholder if unset; set
  from Account Settings).
- **Activity Submission**: A single logged workout awaiting or having received review. Attributes:
  submitting user, target Squad (the Squad this submission's points count toward, selected at
  submission time from the submitter's current Squads), activity type (Running/Cycling/Swimming/
  Yoga, constrained to the target Squad's allowed types), distance or duration value, screenshot
  (visible only to the submitting user and admins, and only while Pending — deleted upon Approval
  or Rejection, FR-056), status (Pending/Approved/Rejected), points awarded (once Approved; a
  fractional/decimal value, not rounded), submitted timestamp, reviewing admin and decision
  timestamp (once decided).
- **Squad**: A named team that users can be invited into. Attributes: name (unique), allowed
  activity types (a subset of Running/Cycling/Swimming/Yoga; defaults to all four), member list,
  total points (derived, sum of the Approved points of submissions tagged to this squad), average
  points (derived, total ÷ member count).
- **Squad Membership**: The relationship between one user and one squad. Attributes: user, squad,
  role ("Manager" or "Member", scoped to this squad only), joined timestamp. A user has one
  independent Squad Membership record — and therefore one independent role — per squad they belong
  to. Created only when a Squad Invitation is Accepted (or automatically, with role "Manager", when
  the squad is created). A squad MAY have more than one Membership with role "Manager", since a
  Manager can promote another Member to also be a Manager.
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
- **SC-004**: A user can find an existing squad by name, including its allowed activity types, in
  under 1 minute of browsing/searching.
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
- **SC-014**: 100% of squad "join" attempts from search/browse are blocked with no self-service join
  path offered; membership only ever results from an accepted invitation.
- **SC-015**: A user can search the global directory and open any colleague's public profile in
  under 2 actions (search, then select).
- **SC-016**: 100% of profile views by a user who shares no Squad with the profile's owner show only
  the public fields (photo, quote, Global Average), with zero Squad-specific data ever exposed.
- **SC-017**: 100% of submission attempts are rejected at entry when made by a user with no Squad
  membership, with no target Squad selected, or with an Activity Type outside the selected Squad's
  allowed set.
- **SC-018**: A user can update their profile photo or quote from Account Settings, with the
  change reflected on their own public profile, in under 1 minute.
- **SC-019**: 100% of password-change attempts with an incorrect current password are rejected
  without changing the stored password.
- **SC-020**: 100% of Approved or Rejected submissions have no screenshot data retained in storage
  immediately after the decision is recorded.

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
- "Global Average" on a public profile refers to the same overall Approved-points standing already
  used for the Global leaderboard (User Story 5) — no new, separately-averaged statistic is
  introduced by this feature.
- A squad's list of allowed activity types can be changed later by its Manager(s); this feature does
  not specify a restriction preventing a Manager from editing that set after creation, and any
  pre-existing squads from before this feature was added are assumed to default to allowing all four
  activity types.
- A profile photo and personal quote are optional per user; a user who has not set either sees/shows
  a placeholder rather than an error.
- Account Settings' profile-photo upload reuses the same underlying file-storage mechanism as
  activity-submission screenshots, rather than introducing new storage infrastructure.
- Changing a password does not force any other active session to sign out; no session-invalidation
  behavior is specified, consistent with this being an internal tool rather than a high-security
  public-facing product.
- Screenshot images are retained only long enough to support the admin review itself; there is no
  requirement to keep them afterward for audit or dispute purposes in this feature.
