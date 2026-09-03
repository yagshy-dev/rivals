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
| 400 | `VALIDATION_ERROR` | FR-002 entry validation (bad metric value, missing screenshot, unsupported activity type); FR-011 duplicate squad name |
| 401 | `UNAUTHENTICATED` | No/invalid session |
| 403 | `FORBIDDEN` | Non-admin calling an admin-only endpoint (FR-005) |
| 404 | `NOT_FOUND` | Referencing a submission/squad id that doesn't exist |
| 409 | `CONFLICT` | Acting on a submission that is no longer `PENDING` (FR-005's "removed from queue once decided") |
