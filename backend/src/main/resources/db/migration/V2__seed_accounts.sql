-- Seeded accounts (spec.md Assumptions: role provisioning is pre-seeded, not self-service).
-- Passwords: admin@rivals.local / AdminPass123!  |  user@rivals.local / UserPass123!
INSERT INTO users (id, display_name, email, password_hash, role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Alex Admin', 'admin@rivals.local',
     '$2a$10$mw7EDRi/w09Uf3iulCMzs.8hHtpWqDymi0QrSeK4RNXZqnXAlhuru', 'ADMIN'),
    ('00000000-0000-0000-0000-000000000002', 'Uma User', 'user@rivals.local',
     '$2a$10$V0NJ5SClLLyWl4eBVIml/ey0JHhg2555JliPwskhQ2Jbcq2ywN7kG', 'USER');
