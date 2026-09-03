# Contract: Squad Invitations

Covers User Story 4. Implements FR-026 through FR-028 (list, accept, decline). FR-029 (no
duplicate Pending invitations) and FR-030 (reject inviting an existing member) are enforced at
invitation-creation time by `POST /api/squads/{id}/invitations` — see `contracts/squads.md`. All
endpoints below require an authenticated session; a user may only view/act on invitations
addressed to them.

## GET /api/invitations?status={status}&limit={n}&offset={n}

Implements FR-026. `status` is optional and defaults to `PENDING` (the common case — "my pending
invites"); pass `status=ACCEPTED` or `status=DECLINED` to see past decisions. `limit` defaults to
50 (max 200); `offset` defaults to 0.

**Response 200** (`SquadInvitationResponse[]`, at most `limit` items, newest first):

```json
[
  {
    "id": "uuid",
    "squadId": "uuid",
    "squadName": "string",
    "invitedUserId": "uuid",
    "invitedByUserId": "uuid",
    "invitedByDisplayName": "string",
    "status": "PENDING",
    "createdAt": "2026-09-03T00:00:00Z",
    "decidedAt": null
  }
]
```

## POST /api/invitations/{id}/accept (invited user only)

Implements FR-027. Creates a `SquadMembership` for the caller with role `MEMBER` (FR-025) and
marks the invitation `ACCEPTED`.

**Response 200**: `SquadInvitationResponse` (`status: "ACCEPTED"`, `decidedAt` set).

**Response 403**: caller is not the invited user.

**Response 409**: `CONFLICT` — invitation is not `PENDING` (already decided).

**Response 404**: unknown invitation id.

## POST /api/invitations/{id}/decline (invited user only)

Implements FR-028. No membership is created; marks the invitation `DECLINED`. Does not prevent a
future invitation to the same user for the same squad (FR-028, spec Assumptions).

**Response 200**: `SquadInvitationResponse` (`status: "DECLINED"`, `decidedAt` set).

**Response 403**: caller is not the invited user.

**Response 409**: `CONFLICT` — invitation is not `PENDING` (already decided).

**Response 404**: unknown invitation id.
