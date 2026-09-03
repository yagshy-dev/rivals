-- Group-Scoped Roles (spec.md Clarifications 2026-09-03): a squad's creator is its Manager;
-- roles are scoped per (user, squad) and a squad MAY have more than one Manager (FR-020, FR-021).
ALTER TABLE squad_memberships
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('MANAGER', 'MEMBER'));

-- Backfill: each existing squad's creator becomes its Manager (FR-020).
UPDATE squad_memberships sm
SET role = 'MANAGER'
FROM squads sq
WHERE sm.squad_id = sq.id AND sm.user_id = sq.created_by_user_id;

-- Squad Invitations (FR-022 through FR-030): a Manager-issued offer that requires the invited
-- user's explicit accept/decline before any membership is created.
CREATE TABLE squad_invitations (
    id UUID PRIMARY KEY,
    squad_id UUID NOT NULL REFERENCES squads (id),
    invited_user_id UUID NOT NULL REFERENCES users (id),
    invited_by_user_id UUID NOT NULL REFERENCES users (id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    decided_at TIMESTAMPTZ NULL
);

-- FR-029: at most one PENDING invitation per (invited user, squad) pair at a time.
CREATE UNIQUE INDEX ux_squad_invitations_pending ON squad_invitations (invited_user_id, squad_id)
    WHERE status = 'PENDING';

-- FR-026: fast lookup of "my pending invites".
CREATE INDEX ix_squad_invitations_invited_user_status ON squad_invitations (invited_user_id, status);
