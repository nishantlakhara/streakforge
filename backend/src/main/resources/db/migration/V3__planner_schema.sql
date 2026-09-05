-- V3: StreakForge Personal Planner Schema
-- Using text for JSON columns to keep JPA mapping simple (no jsonb type complications).
-- Future: can migrate text → jsonb via V4 if JSON querying is needed.

CREATE TABLE planner_profiles (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    name       VARCHAR(140) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_planner_profiles_user ON planner_profiles (user_id);

CREATE TABLE planner_templates (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id       UUID         NOT NULL REFERENCES planner_profiles(id) ON DELETE CASCADE,
    name             VARCHAR(140) NOT NULL,
    type             VARCHAR(40)  NOT NULL DEFAULT 'training',
    hydration_target INT          NOT NULL DEFAULT 8,
    tasks            TEXT         NOT NULL DEFAULT '[]',
    nutrition        TEXT         NOT NULL DEFAULT '[]',
    drills           TEXT         NOT NULL DEFAULT '[]',
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_planner_templates_profile ON planner_templates (profile_id);

CREATE TABLE planner_schedule (
    profile_id  UUID NOT NULL REFERENCES planner_profiles(id) ON DELETE CASCADE,
    date        DATE NOT NULL,
    template_id UUID REFERENCES planner_templates(id) ON DELETE SET NULL,
    PRIMARY KEY (profile_id, date)
);

CREATE TABLE planner_daily_records (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id        UUID         NOT NULL REFERENCES planner_profiles(id) ON DELETE CASCADE,
    date              DATE         NOT NULL,
    type              VARCHAR(40)  NOT NULL DEFAULT 'training',
    template_id       UUID,
    tasks             TEXT         NOT NULL DEFAULT '[]',
    nutrition         TEXT         NOT NULL DEFAULT '[]',
    drills            TEXT         NOT NULL DEFAULT '[]',
    hydration_glasses INT          NOT NULL DEFAULT 0,
    sleep_bed_time    VARCHAR(20),
    sleep_wake_time   VARCHAR(20),
    sleep_hours       NUMERIC(4,2),
    sleep_score       VARCHAR(40),
    notes             TEXT,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (profile_id, date)
);

CREATE INDEX idx_planner_records_profile_date ON planner_daily_records (profile_id, date DESC);

CREATE TABLE planner_library_snippets (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID         NOT NULL REFERENCES planner_profiles(id) ON DELETE CASCADE,
    type       VARCHAR(40)  NOT NULL,
    name       VARCHAR(140) NOT NULL,
    data       TEXT         NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_planner_library_profile_type ON planner_library_snippets (profile_id, type);
