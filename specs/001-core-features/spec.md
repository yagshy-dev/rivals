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
   name, **Then** the squad exists with that user as its first member.
2. **Given** an existing squad, **When** a different user searches for it by name, **Then** it
   appears in the search results and they can join it.
3. **Given** a user who already belongs to one squad, **When** they join a second squad, **Then**
   they remain a member of both.
4. **Given** a squad name that already exists, **When** a user tries to create another squad with
   the same name, **Then** the creation is rejected with a message that the name is taken.

---

### User Story 4 - View Individual and Group Leaderboards (Priority: P3)

Any employee wants to see how they and their squads compare to others. They open a global
leaderboard ranking all individual users by total approved points, and a group leaderboard ranking
squads — which they can sort either by each squad's total combined points or by each squad's
average points per member.

**Why this priority**: Leaderboards are the payoff feature that makes the points and squads
meaningful, but they are read-only views that depend on data produced by the first three stories,
so they are built last.

**Independent Test**: Can be fully tested by approving submissions for several users across two
squads with different member counts, then confirming the individual leaderboard orders users by
total approved points, and the group leaderboard produces a different order when sorted by total
versus by average.

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

### Key Entities

- **User**: An employee account. Attributes: display name, list of squads they belong to, total
  Approved points (derived from their own approved submissions).
- **Activity Submission**: A single logged workout awaiting or having received review. Attributes:
  submitting user, activity type (Running/Cycling/Swimming/Yoga), distance or duration value,
  screenshot (visible only to the submitting user and admins), status (Pending/Approved/Rejected),
  points awarded (once Approved; a fractional/decimal value, not rounded), submitted timestamp,
  reviewing admin and decision timestamp (once decided).
- **Squad**: A named team that users can join. Attributes: name (unique), member list, total points
  (derived, sum of members' approved points), average points (derived, total ÷ member count).
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

## Assumptions

- Two account roles exist: regular employee and admin; role assignment itself (who becomes an
  admin) is outside this feature's scope and is assumed to be pre-provisioned.
- Each activity submission carries exactly one screenshot as evidence.
- A user may belong to an unlimited number of squads, and a squad has no maximum member count.
- A Rejected submission is terminal (not editable); a user wanting credit for that workout submits
  a new entry.
- A squad's total and average points always reflect its *current* membership — points travel with
  the user, not with a snapshot of past membership.
- The four supported activity types and their point rates (Running, Cycling, Swimming, Yoga) are
  fixed for this feature; adding new activity types is out of scope.
