# Contract: Employee Directory, Public Profiles & Account Settings

Covers User Story 4, User Story 7, and User Story 8. Implements FR-023 (Manager invite picker),
FR-043 (2026-09-04 addendum: this same search is a first-class, globally-usable directory for any
authenticated user, not only Managers), FR-044, FR-045, and FR-049 through FR-055 (2026-09-04
addendum: Account Settings — profile photo is now set via file upload, not this contract's
`photoUrl` field, which was removed from the request; a password-change endpoint was added).

## GET /api/users?search={query}&limit={n}&offset={n} (any authenticated user)

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

## GET /api/users/{id}/profile (any authenticated user)

Implements FR-044, FR-045. `photoUrl`, `quote`, and `globalAverage` are always populated (the
latter defaulting to `0` and the former two to `null` when unset, FR-049); `sharedSquads` lists a
`{squadId, squadName, pointsInSquad}` entry for every Squad the caller and `{id}` currently both
belong to, and is an **empty array** when they share no Squad — the frontend MUST treat an empty
`sharedSquads` as "no Squad-specific detail available," never as an error.

**Response 200** (`PublicProfileResponse`):

```json
{
  "userId": "uuid",
  "displayName": "string",
  "photoUrl": null,
  "quote": "string or null",
  "globalAverage": 130.0,
  "sharedSquads": [
    { "squadId": "uuid", "squadName": "string", "pointsInSquad": 80.0 }
  ]
}
```

`photoUrl` is `/api/users/{id}/photo` when a photo has been uploaded, else `null`.

**Response 404**: unknown `{id}`.

## GET /api/users/{id}/photo (any authenticated user)

Streams the user's uploaded profile photo (research.md #2's storage adapter, reused per FR-051).
**Response 200**: image bytes with the appropriate `Content-Type`. **Response 404**: unknown `{id}`
or no photo has been uploaded.

## PUT /api/users/me/profile (authenticated user)

Implements FR-049, FR-055. Sets the caller's own personal quote; `null` clears it. The profile
photo is **not** settable here — see `POST /api/users/me/photo` (FR-051).

**Request body**:

```json
{ "quote": "string, max 280 chars, or null" }
```

**Response 200**: same shape as login's 200 response (`UserResponse`) for the caller.

**Response 400**: `VALIDATION_ERROR` if `quote` exceeds 280 characters.

## POST /api/users/me/photo (authenticated user)

Implements FR-050, FR-051. Sets/replaces the caller's own profile photo via file upload — a pasted
URL is not accepted.

**Request** (`multipart/form-data`): `{ "photo": "file" }`

**Response 200**: same shape as login's 200 response (`UserResponse`) for the caller.

**Response 400**: `VALIDATION_ERROR` if the file is missing.

## POST /api/users/me/password (authenticated user)

Implements FR-050, FR-052, FR-053, FR-054. Changes the caller's own password; re-authenticates
with the current one first.

**Request body**:

```json
{ "currentPassword": "string", "newPassword": "string, min 8 chars" }
```

**Response 204**: password changed, no body.

**Response 400**: `VALIDATION_ERROR` if `newPassword` is missing or under 8 characters.

**Response 401**: `UNAUTHENTICATED` if `currentPassword` does not match the account's stored
password (FR-053) — the password is left unchanged.
