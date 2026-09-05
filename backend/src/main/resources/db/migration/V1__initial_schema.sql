create table organizations (
    id uuid primary key,
    organization_id uuid,
    name varchar(160) not null,
    slug varchar(80) not null unique,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamptz
);

create index idx_organizations_deleted_at on organizations (deleted_at);

create table athlete_profiles (
    id uuid primary key,
    organization_id uuid not null,
    user_id uuid not null,
    display_name varchar(140) not null,
    date_of_birth date,
    primary_discipline varchar(80),
    coach_id uuid,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamptz
);

create index idx_athlete_profiles_org_deleted on athlete_profiles (organization_id, deleted_at);
create index idx_athlete_profiles_coach on athlete_profiles (organization_id, coach_id);

create table practice_sessions (
    id uuid primary key,
    organization_id uuid not null,
    athlete_id uuid not null,
    practice_date date not null,
    duration_minutes integer not null,
    discipline_score integer not null,
    coach_feedback varchar(1000),
    created_at timestamptz not null,
    updated_at timestamptz not null,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamptz
);

create index idx_practice_sessions_athlete_date on practice_sessions (organization_id, athlete_id, practice_date desc);
create index idx_practice_sessions_deleted_at on practice_sessions (deleted_at);

