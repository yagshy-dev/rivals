-- Squad-Strict Submission Rules & System-Wide User Search (spec.md 2026-09-04 addendum).

-- FR-046: each squad defines an allowed subset of the four activity types; a squad with no
-- explicit selection defaults to allowing all four. Modeled as a join table (same pattern as
-- squad_memberships/squad_invitations) rather than a Postgres array, for a plain FK + CHECK.
CREATE TABLE squad_allowed_activity_types (
    squad_id UUID NOT NULL REFERENCES squads (id),
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('RUNNING', 'CYCLING', 'SWIMMING', 'YOGA')),
    PRIMARY KEY (squad_id, activity_type)
);

-- Existing squads (created before this feature) default to allowing all four types.
INSERT INTO squad_allowed_activity_types (squad_id, activity_type)
SELECT sq.id, t.activity_type
FROM squads sq
CROSS JOIN (VALUES ('RUNNING'), ('CYCLING'), ('SWIMMING'), ('YOGA')) AS t (activity_type);

-- FR-047: every submission must specify exactly one target Squad the submitter belongs to. Added
-- nullable first so it can be backfilled, then constrained NOT NULL (dev/demo data only — every
-- pre-existing submission's user is assumed to already have a squad membership to backfill from).
ALTER TABLE activity_submissions ADD COLUMN target_squad_id UUID REFERENCES squads (id);

UPDATE activity_submissions a
SET target_squad_id = sm.squad_id
FROM (
    SELECT DISTINCT ON (user_id) user_id, squad_id
    FROM squad_memberships
    ORDER BY user_id, joined_at ASC
) sm
WHERE a.user_id = sm.user_id AND a.target_squad_id IS NULL;

ALTER TABLE activity_submissions ALTER COLUMN target_squad_id SET NOT NULL;

-- FR-015: squad point totals are now computed from submissions tagged to that squad.
CREATE INDEX ix_activity_submissions_target_squad ON activity_submissions (target_squad_id, status);

-- FR-049: optional public profile fields.
ALTER TABLE users ADD COLUMN photo_url VARCHAR(500) NULL;
ALTER TABLE users ADD COLUMN quote VARCHAR(280) NULL;
