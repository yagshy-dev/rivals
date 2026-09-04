# Contract: Activity Submissions

Covers User Story 1 (submit) and User Story 2 (admin review/approve/reject). DTOs are explicit
records on the Java side (Constitution Principle II) — never the `ActivitySubmission` entity
itself. 2026-09-04 addendum (Squad-Strict Submission Rules): submission is now Squad-scoped —
FR-047, FR-048.

## POST /api/activities (authenticated user, must belong to at least one Squad)

Implements FR-001, FR-002, FR-003, FR-047, FR-048.

**Request** (`multipart/form-data`):

```json
{
  "targetSquadId": "uuid, a Squad the caller currently belongs to",
  "activityType": "RUNNING | CYCLING | SWIMMING | YOGA, must be allowed by targetSquadId",
  "metricValue": "number, > 0",
  "screenshot": "file"
}
```

**Response 201** (`ActivitySubmissionResponse`):

```json
{
  "id": "uuid",
  "targetSquadId": "uuid",
  "activityType": "RUNNING",
  "metricValue": 5.0,
  "status": "PENDING",
  "pointsAwarded": null,
  "submittedAt": "2026-09-02T10:00:00Z"
}
```

**Response 400**: `VALIDATION_ERROR` per FR-002 (missing screenshot, `metricValue <= 0`, unsupported
`activityType`, missing `targetSquadId`, caller not a member of `targetSquadId`, or `activityType`
not allowed by `targetSquadId`, FR-048).

**Response 404**: unknown `targetSquadId`.

## GET /api/activities/mine (authenticated user)

Implements FR-009. Returns the caller's own submissions, newest first.

**Response 200**: `ActivitySubmissionResponse[]` (same shape as POST's 201, all statuses
included).

## GET /api/activities/pending (admin only)

Implements FR-004. Returns the current review queue.

**Response 200** (`PendingSubmissionResponse[]`):

```json
[
  {
    "id": "uuid",
    "submitterDisplayName": "string",
    "activityType": "CYCLING",
    "metricValue": 20.0,
    "screenshotUrl": "/api/activities/{id}/screenshot",
    "submittedAt": "2026-09-02T10:00:00Z"
  }
]
```

**Response 403**: `FORBIDDEN` if caller is not `ADMIN`.

## GET /api/activities/{id}/screenshot (admin, or the submitting user, Pending only)

Streams the stored screenshot file (research.md #2). **Response 200**: image bytes with the
appropriate `Content-Type`. **Response 404**: unknown id, **or the submission has already been
Approved or Rejected** — its screenshot is deleted the moment a decision is recorded (FR-056,
FR-057, 2026-09-04 addendum) and is never retrievable afterward, even by the submitter or an admin.

## POST /api/activities/{id}/approve (admin only)

Implements FR-005, FR-006, FR-008, FR-056. Transitions `PENDING → APPROVED`, invokes the points
engine (research.md #4) — this is the *only* code path that ever sets `pointsAwarded` — and then
deletes the submission's screenshot file (FR-056).

**Request body**: none.

**Response 200** (`ActivitySubmissionResponse`, `status: "APPROVED"`, `pointsAwarded` populated
per the rate table in `data-model.md`).

**Response 409**: `CONFLICT` if the submission is not currently `PENDING`.

## POST /api/activities/{id}/reject (admin only)

Implements FR-005, FR-007, FR-008, FR-056. Transitions `PENDING → REJECTED`; `pointsAwarded` stays
null; the submission's screenshot file is deleted (FR-056).

**Request body**: none.

**Response 200** (`ActivitySubmissionResponse`, `status: "REJECTED"`, `pointsAwarded: null`).

**Response 409**: `CONFLICT` if the submission is not currently `PENDING`.
