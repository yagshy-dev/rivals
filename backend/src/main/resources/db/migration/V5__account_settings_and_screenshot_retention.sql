-- Account Settings & Screenshot Retention (spec.md 2026-09-04 addendum).

-- FR-051: the profile photo is now set via file upload (reusing the activity-screenshot storage
-- adapter), not a pasted URL, so this column stores a storage reference (filename), not a URL.
ALTER TABLE users RENAME COLUMN photo_url TO photo_ref;

-- FR-056: a submission's screenshot is deleted once an admin decision is recorded, so the
-- reference must become nullable (it stays NOT NULL only implicitly, while Pending).
ALTER TABLE activity_submissions ALTER COLUMN screenshot_ref DROP NOT NULL;
