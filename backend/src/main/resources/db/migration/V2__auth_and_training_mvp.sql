create table app_users (
    id uuid primary key,
    organization_id uuid not null,
    email varchar(180) not null unique,
    password_hash varchar(255) not null,
    display_name varchar(140) not null,
    role varchar(40) not null,
    enabled boolean not null,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamptz
);

create index idx_app_users_org_role on app_users (organization_id, role);
create index idx_app_users_deleted_at on app_users (deleted_at);

create table refresh_tokens (
    id uuid primary key,
    organization_id uuid not null,
    user_id uuid not null,
    token_hash varchar(128) not null unique,
    expires_at timestamptz not null,
    revoked_at timestamptz,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamptz
);

create index idx_refresh_tokens_user_active on refresh_tokens (user_id, revoked_at, expires_at);

alter table athlete_profiles alter column user_id drop not null;
alter table athlete_profiles add column guardian_email varchar(180);
alter table athlete_profiles add column skill_level varchar(80);
alter table athlete_profiles add column season_goal varchar(500);
alter table athlete_profiles add column active boolean not null default true;

alter table practice_sessions add column focus_area varchar(120);
alter table practice_sessions add column athlete_reflection varchar(1000);
create index idx_practice_sessions_org_date on practice_sessions (organization_id, practice_date desc);
