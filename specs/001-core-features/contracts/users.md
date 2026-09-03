# Contract: Employee Directory

Covers User Story 4. Implements FR-023 — lets a Manager search for and select an employee to
invite by name, rather than typing a raw email address (research.md #11).

## GET /api/users?search={query}&limit={n}&offset={n}

`search` is required and matches `displayName` case-insensitively (same pattern as squad search,
FR-010); a blank/missing query returns `VALIDATION_ERROR` rather than the full ~5,000-employee
list. `limit` defaults to 20 (max 50) — this endpoint backs an autocomplete-style picker, not a
paginated browse view; `offset` defaults to 0.

**Response 200** (`UserSummaryResponse[]`, at most `limit` items):

```json
[
  { "id": "uuid", "displayName": "string" }
]
```

**Response 400**: `VALIDATION_ERROR` if `search` is missing or blank.
