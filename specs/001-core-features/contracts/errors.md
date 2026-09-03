# Contract: Error Envelope

Every non-2xx response across all endpoints in this feature uses the same shape, so the frontend
can handle errors with one strict TypeScript type:

```json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "metricValue must be greater than 0",
  "fieldErrors": [
    { "field": "metricValue", "message": "must be greater than 0" }
  ]
}
```

`fieldErrors` is present only for `VALIDATION_ERROR` (400) responses; omitted otherwise.

| HTTP status | `error` code | Used for |
|---|---|---|
| 400 | `VALIDATION_ERROR` | FR-002 entry validation (bad metric value, missing screenshot, unsupported activity type); FR-011 duplicate squad name; FR-023 missing/blank employee search query |
| 401 | `UNAUTHENTICATED` | No/invalid session |
| 403 | `FORBIDDEN` | Non-admin calling an admin-only endpoint (FR-005); non-Manager calling invite/promote (FR-024, FR-032); a leaderboard `squadId` the caller isn't a member of (FR-035); a user acting on another user's invitation (FR-027, FR-028) |
| 404 | `NOT_FOUND` | Referencing a submission/squad/invitation/user id that doesn't exist |
| 409 | `CONFLICT` | Acting on a submission that is no longer `PENDING` (FR-005's "removed from queue once decided"); inviting a user who is already a member (FR-030) or already has a `PENDING` invitation (FR-029) for that squad; acting on an invitation that is no longer `PENDING` (FR-027, FR-028) |
