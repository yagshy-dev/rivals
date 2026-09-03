CREATE TABLE users (
    id UUID PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_users_email ON users (lower(email));

CREATE TABLE activity_submissions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id),
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('RUNNING', 'CYCLING', 'SWIMMING', 'YOGA')),
    metric_value NUMERIC(10, 2) NOT NULL CHECK (metric_value > 0),
    screenshot_ref VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    points_awarded NUMERIC(10, 2) NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_by_user_id UUID NULL REFERENCES users (id),
    reviewed_at TIMESTAMPTZ NULL
);

-- Required indexes (SC-007, research.md #5 update): admin pending queue, and a user's own
-- approved-points total, must stay fast at ~5,000-employee scale.
CREATE INDEX ix_activity_submissions_status ON activity_submissions (status);
CREATE INDEX ix_activity_submissions_user_status ON activity_submissions (user_id, status);

CREATE TABLE squads (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_by_user_id UUID NOT NULL REFERENCES users (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive uniqueness (FR-011).
CREATE UNIQUE INDEX ux_squads_name ON squads (lower(name));

CREATE TABLE squad_memberships (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id),
    squad_id UUID NOT NULL REFERENCES squads (id),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ux_squad_memberships_user_squad UNIQUE (user_id, squad_id)
);

-- Required index (SC-007, research.md #5 update): squad total/average computation.
CREATE INDEX ix_squad_memberships_squad ON squad_memberships (squad_id);
