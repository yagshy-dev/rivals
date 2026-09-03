# Contract: Activity Submissions

Covers User Story 1 (submit) and User Story 2 (admin review/approve/reject). DTOs are explicit
records on the Java side (Constitution Principle II) — never the `ActivitySubmission` entity
itself.

## POST /api/activities (authenticated user)

Implements FR-001, FR-002, FR-003.

**Request** (`multipart/form-data`):

```json
{
  "activityType": "RUNNING | CYCLING | SWIMMING | YOGA",
  "metricValue": "number, > 0",
  "screenshot": "file"
}
```

**Response 201** (`ActivitySubmissionResponse`):

```json
{
  "id": "uuid",
  "activityType": "RUNNING",
  "metricValue": 5.0,
  "status": "PENDING",
  "pointsAwarded": null,
  "submittedAt": "2026-09-02T10:00:00Z"
}
```

**Response 400**: `VALIDATION_ERROR` per FR-002 (missing screenshot, `metricValue <= 0`,
unsupported `activityType`).

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

## GET /api/activities/{id}/screenshot (admin, or the submitting user)

Streams the stored screenshot file (research.md #2). **Response 200**: image bytes with the
appropriate `Content-Type`. **Response 404**: unknown id.

## POST /api/activities/{id}/approve (admin only)

Implements FR-005, FR-006, FR-008. Transitions `PENDING → APPROVED` and invokes the points
engine (research.md #4) — this is the *only* code path that ever sets `pointsAwarded`.

**Request body**: none.

**Response 200** (`ActivitySubmissionResponse`, `status: "APPROVED"`, `pointsAwarded` populated
per the rate table in `data-model.md`).

**Response 409**: `CONFLICT` if the submission is not currently `PENDING`.

## POST /api/activities/{id}/reject (admin only)

Implements FR-005, FR-007, FR-008. Transitions `PENDING → REJECTED`; `pointsAwarded` stays null.

**Request body**: none.

**Response 200** (`ActivitySubmissionResponse`, `status: "REJECTED"`, `pointsAwarded: null`).

**Response 409**: `CONFLICT` if the submission is not currently `PENDING`.
