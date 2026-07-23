-- Adult India-to-Germany student onboarding foundation.
-- All public writes are intentionally routed through authenticated RPCs below.

create type public.intake_season as enum ('summer', 'winter');
create type public.student_lifecycle_status as enum ('active', 'archived');
create type public.journey_task_status as enum ('not_started', 'in_progress', 'blocked', 'completed');
create type public.journey_stage_key as enum (
  'onboarded',
  'prepared_eligibility_aps',
  'prepared_tests_documents',
  'applied',
  'cleared',
  'enrolled'
);
create type public.legal_document_kind as enum ('terms', 'privacy');

create table public.students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text not null check (full_name = btrim(full_name)) check (char_length(full_name) between 2 and 160),
  email text not null check (email = lower(btrim(email))) check (char_length(email) between 3 and 320),
  phone text check (phone is null or (phone = btrim(phone) and char_length(phone) between 7 and 32)),
  intake_season public.intake_season not null,
  intake_year integer not null check (intake_year between 2020 and 2100),
  residence_country_code text not null default 'IN' check (residence_country_code = 'IN'),
  destination_country_code text not null default 'DE' check (destination_country_code = 'DE'),
  adult_confirmed boolean not null check (adult_confirmed),
  permission_confirmed boolean not null check (permission_confirmed),
  journey_template_version smallint not null default 1 check (journey_template_version > 0),
  assigned_consultant_id uuid not null references public.profiles (user_id) on delete restrict,
  lifecycle_status public.student_lifecycle_status not null default 'active',
  created_by uuid not null references public.profiles (user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  archived_by uuid references public.profiles (user_id) on delete set null,
  check ((lifecycle_status = 'archived') = (archived_at is not null))
);

create unique index students_organization_email_unique_idx
  on public.students (organization_id, lower(email));
create index students_organization_lifecycle_created_idx
  on public.students (organization_id, lifecycle_status, created_at desc);
create index students_organization_assigned_consultant_idx
  on public.students (organization_id, assigned_consultant_id);
create index students_assigned_consultant_id_idx on public.students (assigned_consultant_id);
create index students_created_by_idx on public.students (created_by);
create index students_archived_by_idx on public.students (archived_by) where archived_by is not null;

create table public.journey_stages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  stage_key public.journey_stage_key not null,
  title text not null check (title = btrim(title)) check (char_length(title) between 2 and 100),
  display_order smallint not null check (display_order between 1 and 6),
  created_at timestamptz not null default now(),
  unique (student_id, stage_key),
  unique (student_id, display_order)
);

create index journey_stages_student_order_idx on public.journey_stages (student_id, display_order);

create table public.journey_tasks (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.journey_stages (id) on delete cascade,
  task_key text not null check (task_key ~ '^[a-z][a-z0-9_]{2,80}$'),
  title text not null check (title = btrim(title)) check (char_length(title) between 2 and 140),
  display_order smallint not null check (display_order between 1 and 20),
  status public.journey_task_status not null default 'not_started',
  planning_target_date date not null,
  template_target_date date not null,
  target_is_template boolean not null default true,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  check (completed_at is null or started_at is not null),
  unique (stage_id, task_key),
  unique (stage_id, display_order)
);

create index journey_tasks_stage_order_idx on public.journey_tasks (stage_id, display_order);
create index journey_tasks_target_idx on public.journey_tasks (planning_target_date) where status <> 'completed';

create table public.student_audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  student_id uuid references public.students (id) on delete set null,
  actor_user_id uuid references public.profiles (user_id) on delete set null,
  event_type text not null check (event_type ~ '^[a-z][a-z0-9_]{2,80}$'),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default now()
);

create index student_audit_events_organization_occurred_idx
  on public.student_audit_events (organization_id, occurred_at desc);
create index student_audit_events_student_occurred_idx
  on public.student_audit_events (student_id, occurred_at desc) where student_id is not null;
create index student_audit_events_actor_user_id_idx
  on public.student_audit_events (actor_user_id) where actor_user_id is not null;

create table public.legal_acceptances (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  document_kind public.legal_document_kind not null,
  document_version text not null check (document_version = btrim(document_version)) check (char_length(document_version) between 1 and 100),
  accepted_at timestamptz not null default now(),
  unique (user_id, document_kind, document_version)
);

create index legal_acceptances_user_version_idx on public.legal_acceptances (user_id, document_version);

create table public.organization_dpa_acceptances (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  document_version text not null check (document_version = btrim(document_version)) check (char_length(document_version) between 1 and 100),
  accepted_by uuid not null references public.profiles (user_id) on delete restrict,
  accepted_at timestamptz not null default now(),
  unique (organization_id, document_version)
);

create index organization_dpa_acceptances_organization_version_idx
  on public.organization_dpa_acceptances (organization_id, document_version);
create index organization_dpa_acceptances_accepted_by_idx
  on public.organization_dpa_acceptances (accepted_by);

create table private.journey_templates (
  id uuid primary key default gen_random_uuid(),
  version smallint not null,
  destination_country_code text not null check (destination_country_code = 'DE'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (destination_country_code, version)
);

create unique index journey_templates_one_active_country_idx
  on private.journey_templates (destination_country_code)
  where active;

revoke all on table private.journey_templates from public, anon, authenticated;

create table private.journey_template_stages (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references private.journey_templates (id) on delete cascade,
  stage_key public.journey_stage_key not null,
  title text not null,
  display_order smallint not null check (display_order between 1 and 6),
  unique (template_id, stage_key),
  unique (template_id, display_order)
);

revoke all on table private.journey_template_stages from public, anon, authenticated;

create table private.journey_template_tasks (
  id uuid primary key default gen_random_uuid(),
  template_stage_id uuid not null references private.journey_template_stages (id) on delete cascade,
  task_key text not null check (task_key ~ '^[a-z][a-z0-9_]{2,80}$'),
  title text not null,
  display_order smallint not null check (display_order between 1 and 20),
  target_rule text not null check (target_rule in ('after_creation', 'intake_anchor', 'earlier_of_creation_or_anchor')),
  creation_offset_days integer,
  intake_anchor_offset_days integer,
  check (
    (target_rule = 'after_creation' and creation_offset_days is not null and intake_anchor_offset_days is null)
    or (target_rule = 'intake_anchor' and creation_offset_days is null and intake_anchor_offset_days is not null)
    or (target_rule = 'earlier_of_creation_or_anchor' and creation_offset_days is not null and intake_anchor_offset_days is not null)
  ),
  unique (template_stage_id, task_key),
  unique (template_stage_id, display_order)
);

revoke all on table private.journey_template_tasks from public, anon, authenticated;

insert into private.journey_templates (id, version, destination_country_code)
values ('5d25d87d-9e51-4d07-bb7b-7f2f2e992701', 1, 'DE');

insert into private.journey_template_stages (id, template_id, stage_key, title, display_order)
values
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979701', '5d25d87d-9e51-4d07-bb7b-7f2f2e992701', 'onboarded', 'Profile', 1),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979702', '5d25d87d-9e51-4d07-bb7b-7f2f2e992701', 'prepared_eligibility_aps', 'Eligibility and APS', 2),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979703', '5d25d87d-9e51-4d07-bb7b-7f2f2e992701', 'prepared_tests_documents', 'Tests and documents', 3),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979704', '5d25d87d-9e51-4d07-bb7b-7f2f2e992701', 'applied', 'University applications', 4),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979705', '5d25d87d-9e51-4d07-bb7b-7f2f2e992701', 'cleared', 'Offer, finance and visa', 5),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979706', '5d25d87d-9e51-4d07-bb7b-7f2f2e992701', 'enrolled', 'Arrival', 6);

insert into private.journey_template_tasks (
  template_stage_id, task_key, title, display_order, target_rule, creation_offset_days, intake_anchor_offset_days
) values
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979701', 'confirm_profile_and_intake', 'Confirm profile and intake', 1, 'after_creation', 7, null),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979702', 'review_academic_eligibility', 'Review academic eligibility', 1, 'after_creation', 14, null),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979702', 'prepare_aps_documents', 'Prepare APS documents', 2, 'after_creation', 21, null),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979702', 'submit_aps_application', 'Submit APS application', 3, 'after_creation', 30, null),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979703', 'plan_language_test', 'Plan language test', 1, 'earlier_of_creation_or_anchor', 30, -240),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979703', 'prepare_academic_documents', 'Prepare academic documents', 2, 'earlier_of_creation_or_anchor', 45, -225),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979703', 'complete_sop_and_references', 'Complete SOP and references', 3, 'earlier_of_creation_or_anchor', 60, -210),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979704', 'build_program_shortlist', 'Build program shortlist', 1, 'earlier_of_creation_or_anchor', 60, -210),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979705', 'review_admission_offer', 'Review admission offer', 1, 'intake_anchor', null, -120),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979705', 'arrange_proof_of_finance', 'Arrange proof of finance', 2, 'intake_anchor', null, -90),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979705', 'secure_health_insurance', 'Secure health insurance', 3, 'intake_anchor', null, -75),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979705', 'submit_visa_application', 'Submit visa application', 4, 'intake_anchor', null, -60),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979706', 'plan_travel_and_arrival', 'Plan travel and arrival', 1, 'intake_anchor', null, -30),
  ('19ae44e9-5e84-4cc4-b5ce-9c1b34979706', 'confirm_university_enrollment', 'Confirm university enrollment', 2, 'intake_anchor', null, 14);

create or replace function private.calculate_planning_target(
  p_intake_season public.intake_season,
  p_intake_year integer,
  p_created_at timestamptz,
  p_target_rule text,
  p_creation_offset_days integer,
  p_intake_anchor_offset_days integer
)
returns date
language plpgsql
immutable
security definer
set search_path = ''
as $$
declare
  v_intake_anchor date := make_date(p_intake_year, case when p_intake_season = 'summer' then 4 else 10 end, 1);
begin
  if p_target_rule = 'after_creation' then
    return p_created_at::date + p_creation_offset_days;
  end if;
  if p_target_rule = 'intake_anchor' then
    return v_intake_anchor + p_intake_anchor_offset_days;
  end if;
  if p_target_rule = 'earlier_of_creation_or_anchor' then
    return least(p_created_at::date + p_creation_offset_days, v_intake_anchor + p_intake_anchor_offset_days);
  end if;
  raise exception 'invalid_target_rule' using errcode = '22023';
end;
$$;

create or replace function private.require_student_legal_access(
  p_organization_id uuid,
  p_allowed_roles text[],
  p_require_legal boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = p_organization_id
      and membership.user_id = v_user_id
      and membership.role::text = any (p_allowed_roles)
  ) then
    raise exception 'organization_access_denied' using errcode = '42501';
  end if;

  if p_require_legal and (
    not exists (
      select 1 from public.legal_acceptances acceptance
      where acceptance.user_id = v_user_id
        and acceptance.document_kind = 'terms'
        and acceptance.document_version = '2026-07-student-data-v1'
    )
    or not exists (
      select 1 from public.legal_acceptances acceptance
      where acceptance.user_id = v_user_id
        and acceptance.document_kind = 'privacy'
        and acceptance.document_version = '2026-07-student-data-v1'
    )
    or not exists (
      select 1 from public.organization_dpa_acceptances acceptance
      where acceptance.organization_id = p_organization_id
        and acceptance.document_version = '2026-07-student-data-v1'
    )
  ) then
    raise exception 'legal_acceptance_required' using errcode = '42501';
  end if;

  return v_user_id;
end;
$$;

create or replace function private.write_student_audit_event(
  p_organization_id uuid,
  p_student_id uuid,
  p_actor_user_id uuid,
  p_event_type text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_metadata ?| array['full_name', 'email', 'phone', 'field_value'] then
    raise exception 'pii_audit_metadata_forbidden' using errcode = '22023';
  end if;

  insert into public.student_audit_events (organization_id, student_id, actor_user_id, event_type, metadata)
  values (p_organization_id, p_student_id, p_actor_user_id, p_event_type, p_metadata);
end;
$$;

create or replace function private.create_student_with_journey(
  p_organization_id uuid,
  p_full_name text,
  p_email text,
  p_phone text,
  p_intake_season public.intake_season,
  p_intake_year integer,
  p_adult_confirmed boolean,
  p_permission_confirmed boolean
)
returns table (student_id uuid, created boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_full_name text := regexp_replace(btrim(coalesce(p_full_name, '')), '\s+', ' ', 'g');
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_phone text := nullif(btrim(coalesce(p_phone, '')), '');
  v_student_id uuid;
  v_created_at timestamptz := now();
  v_stage record;
  v_template_task record;
  v_stage_id uuid;
  v_target date;
  v_template private.journey_templates%rowtype;
  v_template_stage_count integer;
  v_template_task_count integer;
begin
  v_user_id := private.require_student_legal_access(
    p_organization_id,
    array['owner', 'admin', 'consultant', 'member']::text[]
  );
  if char_length(v_full_name) < 2 or char_length(v_full_name) > 160 then
    raise exception 'invalid_full_name' using errcode = '22023';
  end if;
  if char_length(v_email) < 3 or char_length(v_email) > 320
    or position('@' in v_email) <= 1 or position('.' in split_part(v_email, '@', 2)) <= 1 then
    raise exception 'invalid_email' using errcode = '22023';
  end if;
  if v_phone is not null and char_length(v_phone) not between 7 and 32 then
    raise exception 'invalid_phone' using errcode = '22023';
  end if;
  if p_intake_year not between 2020 and 2100 then
    raise exception 'invalid_intake_year' using errcode = '22023';
  end if;
  if not coalesce(p_adult_confirmed, false) or not coalesce(p_permission_confirmed, false) then
    raise exception 'adult_and_permission_required' using errcode = '22023';
  end if;

  select * into v_template
  from private.journey_templates template
  where template.destination_country_code = 'DE' and template.active
  for update;
  if not found then
    raise exception 'active_germany_journey_template_not_found' using errcode = 'P0002';
  end if;
  select count(*)::integer into v_template_stage_count
  from private.journey_template_stages stage
  where stage.template_id = v_template.id;
  select count(*)::integer into v_template_task_count
  from private.journey_template_tasks task
  join private.journey_template_stages stage on stage.id = task.template_stage_id
  where stage.template_id = v_template.id;
  if v_template_stage_count <> 6 or v_template_task_count <> 14 then
    raise exception 'active_germany_journey_template_incomplete' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_organization_id::text || ':' || v_email, 7101));
  select student.id into v_student_id
  from public.students student
  where student.organization_id = p_organization_id and lower(student.email) = v_email;
  if found then
    return query select v_student_id, false;
    return;
  end if;

  insert into public.students (
    organization_id, full_name, email, phone, intake_season, intake_year, journey_template_version,
    adult_confirmed, permission_confirmed, assigned_consultant_id, created_by, created_at, updated_at
  ) values (
    p_organization_id, v_full_name, v_email, v_phone, p_intake_season, p_intake_year, v_template.version,
    true, true, v_user_id, v_user_id, v_created_at, v_created_at
  ) returning id into v_student_id;

  for v_stage in
    select stage.* from private.journey_template_stages stage
    where stage.template_id = v_template.id
    order by stage.display_order
  loop
    insert into public.journey_stages (student_id, stage_key, title, display_order)
    values (v_student_id, v_stage.stage_key, v_stage.title, v_stage.display_order)
    returning id into v_stage_id;

    for v_template_task in
      select task.* from private.journey_template_tasks task
      where task.template_stage_id = v_stage.id
      order by task.display_order
    loop
      v_target := private.calculate_planning_target(
        p_intake_season, p_intake_year, v_created_at, v_template_task.target_rule,
        v_template_task.creation_offset_days, v_template_task.intake_anchor_offset_days
      );
      insert into public.journey_tasks (
        stage_id, task_key, title, display_order, planning_target_date, template_target_date
      ) values (
        v_stage_id, v_template_task.task_key, v_template_task.title, v_template_task.display_order,
        v_target, v_target
      );
    end loop;
  end loop;

  perform private.write_student_audit_event(p_organization_id, v_student_id, v_user_id, 'student_created');
  return query select v_student_id, true;
end;
$$;

create or replace function private.update_student_profile(
  p_student_id uuid,
  p_full_name text,
  p_email text,
  p_phone text,
  p_intake_season public.intake_season,
  p_intake_year integer,
  p_assigned_consultant_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student public.students%rowtype;
  v_user_id uuid;
  v_full_name text := regexp_replace(btrim(coalesce(p_full_name, '')), '\s+', ' ', 'g');
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_phone text := nullif(btrim(coalesce(p_phone, '')), '');
  v_intake_changed boolean;
  v_task record;
  v_target date;
begin
  select * into v_student from public.students where id = p_student_id for update;
  if not found then raise exception 'student_not_found' using errcode = 'P0002'; end if;
  v_user_id := private.require_student_legal_access(v_student.organization_id, array['owner', 'admin', 'consultant', 'member']::text[]);
  if char_length(v_full_name) < 2 or char_length(v_full_name) > 160 then raise exception 'invalid_full_name' using errcode = '22023'; end if;
  if char_length(v_email) < 3 or char_length(v_email) > 320 or position('@' in v_email) <= 1 or position('.' in split_part(v_email, '@', 2)) <= 1 then raise exception 'invalid_email' using errcode = '22023'; end if;
  if v_phone is not null and char_length(v_phone) not between 7 and 32 then raise exception 'invalid_phone' using errcode = '22023'; end if;
  if p_intake_year not between 2020 and 2100 then raise exception 'invalid_intake_year' using errcode = '22023'; end if;
  if v_student.lifecycle_status = 'archived' then raise exception 'student_archived' using errcode = 'P0001'; end if;
  if not exists (
    select 1 from public.organization_memberships membership
    where membership.organization_id = v_student.organization_id and membership.user_id = p_assigned_consultant_id
  ) then raise exception 'invalid_assigned_consultant' using errcode = '22023'; end if;

  perform pg_advisory_xact_lock(hashtextextended(v_student.organization_id::text || ':' || v_email, 7101));
  if exists (select 1 from public.students student where student.organization_id = v_student.organization_id and lower(student.email) = v_email and student.id <> p_student_id) then
    raise exception 'duplicate_student_email' using errcode = '23505';
  end if;
  v_intake_changed := v_student.intake_season <> p_intake_season or v_student.intake_year <> p_intake_year;
  update public.students student set full_name = v_full_name, email = v_email, phone = v_phone,
    intake_season = p_intake_season, intake_year = p_intake_year, assigned_consultant_id = p_assigned_consultant_id, updated_at = now()
  where student.id = p_student_id;

  if v_intake_changed then
    for v_task in
      select task.id, template_task.target_rule, template_task.creation_offset_days, template_task.intake_anchor_offset_days
      from public.journey_tasks task
      join public.journey_stages stage on stage.id = task.stage_id
      join private.journey_template_stages template_stage on template_stage.stage_key = stage.stage_key
      join private.journey_templates template on template.id = template_stage.template_id
      join private.journey_template_tasks template_task on template_task.template_stage_id = template_stage.id and template_task.task_key = task.task_key
      where stage.student_id = p_student_id and task.status = 'not_started' and task.target_is_template
        and template.destination_country_code = v_student.destination_country_code
        and template.version = v_student.journey_template_version
    loop
      v_target := private.calculate_planning_target(p_intake_season, p_intake_year, v_student.created_at, v_task.target_rule, v_task.creation_offset_days, v_task.intake_anchor_offset_days);
      update public.journey_tasks task set planning_target_date = v_target, template_target_date = v_target, updated_at = now() where task.id = v_task.id;
    end loop;
  end if;
  perform private.write_student_audit_event(v_student.organization_id, p_student_id, v_user_id, 'student_profile_updated', jsonb_build_object('intake_changed', v_intake_changed));
  return p_student_id;
end;
$$;

create or replace function private.update_journey_task(
  p_task_id uuid,
  p_status public.journey_task_status,
  p_planning_target_date date default null
)
returns table (task_id uuid, student_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_organization_id uuid;
  v_student_id uuid;
  v_user_id uuid;
  v_lifecycle_status public.student_lifecycle_status;
begin
  select stage.student_id, student.organization_id, student.lifecycle_status
    into v_student_id, v_organization_id, v_lifecycle_status
  from public.journey_tasks task
  join public.journey_stages stage on stage.id = task.stage_id
  join public.students student on student.id = stage.student_id
  where task.id = p_task_id for update of task;
  if not found then raise exception 'journey_task_not_found' using errcode = 'P0002'; end if;
  if v_lifecycle_status = 'archived' then raise exception 'student_archived' using errcode = 'P0001'; end if;
  v_user_id := private.require_student_legal_access(v_organization_id, array['owner', 'admin', 'consultant', 'member']::text[]);
  update public.journey_tasks task
  set status = p_status,
      planning_target_date = coalesce(p_planning_target_date, task.planning_target_date),
      target_is_template = case when p_planning_target_date is null or p_planning_target_date = task.planning_target_date then task.target_is_template else false end,
      started_at = case when p_status = 'not_started' then null when task.started_at is null then now() else task.started_at end,
      completed_at = case when p_status = 'completed' then coalesce(task.completed_at, now()) else null end,
      updated_at = now()
  where task.id = p_task_id;
  perform private.write_student_audit_event(v_organization_id, v_student_id, v_user_id, 'journey_task_updated');
  return query select p_task_id, v_student_id;
end;
$$;

create or replace function private.set_student_archive_state(p_student_id uuid, p_archive boolean)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_student public.students%rowtype; v_user_id uuid;
begin
  select * into v_student from public.students where id = p_student_id for update;
  if not found then raise exception 'student_not_found' using errcode = 'P0002'; end if;
  v_user_id := private.require_student_legal_access(v_student.organization_id, array['owner', 'admin', 'consultant', 'member']::text[]);
  update public.students student set lifecycle_status = case when p_archive then 'archived' else 'active' end,
    archived_at = case when p_archive then coalesce(student.archived_at, now()) else null end,
    archived_by = case when p_archive then v_user_id else null end, updated_at = now()
  where student.id = p_student_id;
  perform private.write_student_audit_event(v_student.organization_id, p_student_id, v_user_id, case when p_archive then 'student_archived' else 'student_restored' end);
  return p_student_id;
end;
$$;

create or replace function private.erase_student(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_student public.students%rowtype; v_user_id uuid;
begin
  select * into v_student from public.students where id = p_student_id for update;
  if not found then raise exception 'student_not_found' using errcode = 'P0002'; end if;
  v_user_id := private.require_student_legal_access(v_student.organization_id, array['owner', 'admin']::text[]);
  perform private.write_student_audit_event(v_student.organization_id, p_student_id, v_user_id, 'student_erased');
  delete from public.students student where student.id = p_student_id;
end;
$$;

create or replace function private.export_student_record(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_student public.students%rowtype; v_user_id uuid; v_export jsonb;
begin
  select * into v_student from public.students where id = p_student_id;
  if not found then raise exception 'student_not_found' using errcode = 'P0002'; end if;
  v_user_id := private.require_student_legal_access(v_student.organization_id, array['owner', 'admin']::text[]);
  select jsonb_build_object(
    'student', jsonb_build_object('id', v_student.id, 'fullName', v_student.full_name, 'email', v_student.email, 'phone', v_student.phone, 'intakeSeason', v_student.intake_season, 'intakeYear', v_student.intake_year, 'lifecycleStatus', v_student.lifecycle_status, 'createdAt', v_student.created_at),
    'journey', coalesce(jsonb_agg(jsonb_build_object('stageKey', stage.stage_key, 'title', stage.title, 'displayOrder', stage.display_order, 'tasks', tasks.items) order by stage.display_order), '[]'::jsonb)
  ) into v_export
  from public.journey_stages stage
  left join lateral (
    select coalesce(jsonb_agg(jsonb_build_object('taskKey', task.task_key, 'title', task.title, 'displayOrder', task.display_order, 'status', task.status, 'planningTargetDate', task.planning_target_date) order by task.display_order), '[]'::jsonb) as items
    from public.journey_tasks task where task.stage_id = stage.id
  ) tasks on true
  where stage.student_id = p_student_id;
  perform private.write_student_audit_event(v_student.organization_id, p_student_id, v_user_id, 'student_exported');
  return v_export;
end;
$$;

create or replace function private.get_student_assignees()
returns table (
  user_id uuid,
  full_name text,
  role text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_organization_id uuid;
begin
  select membership.organization_id
    into v_organization_id
  from public.organization_memberships membership
  where membership.user_id = v_user_id;

  if not found then
    raise exception 'organization_access_denied' using errcode = '42501';
  end if;

  perform private.require_student_legal_access(
    v_organization_id,
    array['owner', 'admin', 'consultant', 'member']::text[]
  );

  return query
    select
      membership.user_id,
      profile.full_name,
      membership.role::text
    from public.organization_memberships membership
    join public.profiles profile on profile.user_id = membership.user_id
    where membership.organization_id = v_organization_id
    order by lower(profile.full_name), membership.user_id;
end;
$$;

create or replace function private.accept_legal_documents(p_organization_id uuid, p_document_version text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare v_user_id uuid := private.require_student_legal_access(p_organization_id, array['owner', 'admin', 'consultant', 'member']::text[], false); v_accepted_at timestamptz := now();
begin
  if p_document_version <> '2026-07-student-data-v1' then raise exception 'unsupported_legal_version' using errcode = '22023'; end if;
  insert into public.legal_acceptances (user_id, document_kind, document_version, accepted_at)
  values (v_user_id, 'terms', p_document_version, v_accepted_at), (v_user_id, 'privacy', p_document_version, v_accepted_at)
  on conflict (user_id, document_kind, document_version) do nothing;
  perform private.write_student_audit_event(p_organization_id, null, v_user_id, 'legal_documents_accepted');
  return v_accepted_at;
end;
$$;

create or replace function private.accept_organization_dpa(p_organization_id uuid, p_document_version text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare v_user_id uuid := private.require_student_legal_access(p_organization_id, array['owner']::text[], false); v_accepted_at timestamptz := now();
begin
  if p_document_version <> '2026-07-student-data-v1' then raise exception 'unsupported_legal_version' using errcode = '22023'; end if;
  insert into public.organization_dpa_acceptances (organization_id, document_version, accepted_by, accepted_at)
  values (p_organization_id, p_document_version, v_user_id, v_accepted_at)
  on conflict (organization_id, document_version) do nothing;
  perform private.write_student_audit_event(p_organization_id, null, v_user_id, 'organization_dpa_accepted');
  return v_accepted_at;
end;
$$;

create or replace function private.cleanup_student_retention()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.students student where student.lifecycle_status = 'archived' and student.archived_at < now() - interval '90 days';
  delete from public.student_audit_events event where event.occurred_at < now() - interval '12 months';
end;
$$;

alter table public.students enable row level security;
alter table public.journey_stages enable row level security;
alter table public.journey_tasks enable row level security;
alter table public.student_audit_events enable row level security;
alter table public.legal_acceptances enable row level security;
alter table public.organization_dpa_acceptances enable row level security;

revoke all on table public.students, public.journey_stages, public.journey_tasks, public.student_audit_events, public.legal_acceptances, public.organization_dpa_acceptances from public, anon, authenticated;
grant select on table public.students, public.journey_stages, public.journey_tasks, public.student_audit_events, public.legal_acceptances, public.organization_dpa_acceptances to authenticated;
grant usage on type public.intake_season, public.student_lifecycle_status, public.journey_task_status, public.journey_stage_key, public.legal_document_kind to authenticated;

create policy "Members can read organization students" on public.students for select to authenticated using (
  exists (select 1 from public.organization_memberships membership where membership.organization_id = students.organization_id and membership.user_id = (select auth.uid()))
  and exists (select 1 from public.legal_acceptances acceptance where acceptance.user_id = (select auth.uid()) and acceptance.document_kind = 'terms' and acceptance.document_version = '2026-07-student-data-v1')
  and exists (select 1 from public.legal_acceptances acceptance where acceptance.user_id = (select auth.uid()) and acceptance.document_kind = 'privacy' and acceptance.document_version = '2026-07-student-data-v1')
  and exists (select 1 from public.organization_dpa_acceptances acceptance where acceptance.organization_id = students.organization_id and acceptance.document_version = '2026-07-student-data-v1')
);
create policy "Members can read organization journey stages" on public.journey_stages for select to authenticated using (
  exists (select 1 from public.students student join public.organization_memberships membership on membership.organization_id = student.organization_id where student.id = journey_stages.student_id and membership.user_id = (select auth.uid()))
  and exists (select 1 from public.students student join public.legal_acceptances acceptance on acceptance.user_id = (select auth.uid()) where student.id = journey_stages.student_id and acceptance.document_kind = 'terms' and acceptance.document_version = '2026-07-student-data-v1')
  and exists (select 1 from public.students student join public.legal_acceptances acceptance on acceptance.user_id = (select auth.uid()) where student.id = journey_stages.student_id and acceptance.document_kind = 'privacy' and acceptance.document_version = '2026-07-student-data-v1')
  and exists (select 1 from public.students student join public.organization_dpa_acceptances acceptance on acceptance.organization_id = student.organization_id where student.id = journey_stages.student_id and acceptance.document_version = '2026-07-student-data-v1')
);
create policy "Members can read organization journey tasks" on public.journey_tasks for select to authenticated using (
  exists (select 1 from public.journey_stages stage join public.students student on student.id = stage.student_id join public.organization_memberships membership on membership.organization_id = student.organization_id where stage.id = journey_tasks.stage_id and membership.user_id = (select auth.uid()))
  and exists (select 1 from public.journey_stages stage join public.legal_acceptances acceptance on acceptance.user_id = (select auth.uid()) where stage.id = journey_tasks.stage_id and acceptance.document_kind = 'terms' and acceptance.document_version = '2026-07-student-data-v1')
  and exists (select 1 from public.journey_stages stage join public.legal_acceptances acceptance on acceptance.user_id = (select auth.uid()) where stage.id = journey_tasks.stage_id and acceptance.document_kind = 'privacy' and acceptance.document_version = '2026-07-student-data-v1')
  and exists (select 1 from public.journey_stages stage join public.students student on student.id = stage.student_id join public.organization_dpa_acceptances acceptance on acceptance.organization_id = student.organization_id where stage.id = journey_tasks.stage_id and acceptance.document_version = '2026-07-student-data-v1')
);
create policy "Members can read organization student audit events" on public.student_audit_events for select to authenticated using (
  exists (select 1 from public.organization_memberships membership where membership.organization_id = student_audit_events.organization_id and membership.user_id = (select auth.uid()))
  and exists (select 1 from public.legal_acceptances acceptance where acceptance.user_id = (select auth.uid()) and acceptance.document_kind = 'terms' and acceptance.document_version = '2026-07-student-data-v1')
  and exists (select 1 from public.legal_acceptances acceptance where acceptance.user_id = (select auth.uid()) and acceptance.document_kind = 'privacy' and acceptance.document_version = '2026-07-student-data-v1')
  and exists (select 1 from public.organization_dpa_acceptances acceptance where acceptance.organization_id = student_audit_events.organization_id and acceptance.document_version = '2026-07-student-data-v1')
);
create policy "Users can read their legal acceptances" on public.legal_acceptances for select to authenticated using (user_id = (select auth.uid()));
create policy "Members can read organization DPA acceptances" on public.organization_dpa_acceptances for select to authenticated using (
  exists (select 1 from public.organization_memberships membership where membership.organization_id = organization_dpa_acceptances.organization_id and membership.user_id = (select auth.uid()))
);

create or replace function public.create_student_with_journey(p_organization_id uuid, p_full_name text, p_email text, p_phone text, p_intake_season public.intake_season, p_intake_year integer, p_adult_confirmed boolean, p_permission_confirmed boolean)
returns table (student_id uuid, created boolean) language sql security definer set search_path = '' as $$ select * from private.create_student_with_journey(p_organization_id, p_full_name, p_email, p_phone, p_intake_season, p_intake_year, p_adult_confirmed, p_permission_confirmed); $$;
create or replace function public.update_student_profile(p_student_id uuid, p_full_name text, p_email text, p_phone text, p_intake_season public.intake_season, p_intake_year integer, p_assigned_consultant_id uuid)
returns uuid language sql security definer set search_path = '' as $$ select private.update_student_profile(p_student_id, p_full_name, p_email, p_phone, p_intake_season, p_intake_year, p_assigned_consultant_id); $$;
create or replace function public.update_journey_task(p_task_id uuid, p_status public.journey_task_status, p_planning_target_date date default null)
returns table (task_id uuid, student_id uuid) language sql security definer set search_path = '' as $$ select * from private.update_journey_task(p_task_id, p_status, p_planning_target_date); $$;
create or replace function public.archive_student(p_student_id uuid)
returns uuid language sql security definer set search_path = '' as $$ select private.set_student_archive_state(p_student_id, true); $$;
create or replace function public.restore_student(p_student_id uuid)
returns uuid language sql security definer set search_path = '' as $$ select private.set_student_archive_state(p_student_id, false); $$;
create or replace function public.erase_student(p_student_id uuid)
returns void language sql security definer set search_path = '' as $$ select private.erase_student(p_student_id); $$;
create or replace function public.export_student_record(p_student_id uuid)
returns jsonb language sql security definer set search_path = '' as $$ select private.export_student_record(p_student_id); $$;
create or replace function public.get_student_assignees()
returns table (user_id uuid, full_name text, role text) language sql security definer set search_path = '' as $$ select * from private.get_student_assignees(); $$;
create or replace function public.accept_legal_documents(p_organization_id uuid, p_document_version text)
returns timestamptz language sql security definer set search_path = '' as $$ select private.accept_legal_documents(p_organization_id, p_document_version); $$;
create or replace function public.accept_organization_dpa(p_organization_id uuid, p_document_version text)
returns timestamptz language sql security definer set search_path = '' as $$ select private.accept_organization_dpa(p_organization_id, p_document_version); $$;

revoke all on function private.calculate_planning_target(public.intake_season, integer, timestamptz, text, integer, integer), private.require_student_legal_access(uuid, text[], boolean), private.write_student_audit_event(uuid, uuid, uuid, text, jsonb), private.create_student_with_journey(uuid, text, text, text, public.intake_season, integer, boolean, boolean), private.update_student_profile(uuid, text, text, text, public.intake_season, integer, uuid), private.update_journey_task(uuid, public.journey_task_status, date), private.set_student_archive_state(uuid, boolean), private.erase_student(uuid), private.export_student_record(uuid), private.get_student_assignees(), private.accept_legal_documents(uuid, text), private.accept_organization_dpa(uuid, text), private.cleanup_student_retention() from public, anon, authenticated;
revoke all on function public.create_student_with_journey(uuid, text, text, text, public.intake_season, integer, boolean, boolean), public.update_student_profile(uuid, text, text, text, public.intake_season, integer, uuid), public.update_journey_task(uuid, public.journey_task_status, date), public.archive_student(uuid), public.restore_student(uuid), public.erase_student(uuid), public.export_student_record(uuid), public.get_student_assignees(), public.accept_legal_documents(uuid, text), public.accept_organization_dpa(uuid, text) from public, anon;
grant execute on function public.create_student_with_journey(uuid, text, text, text, public.intake_season, integer, boolean, boolean), public.update_student_profile(uuid, text, text, text, public.intake_season, integer, uuid), public.update_journey_task(uuid, public.journey_task_status, date), public.archive_student(uuid), public.restore_student(uuid), public.erase_student(uuid), public.export_student_record(uuid), public.get_student_assignees(), public.accept_legal_documents(uuid, text), public.accept_organization_dpa(uuid, text) to authenticated;

-- pg_cron owns its scheduler objects and makes this retention policy enforceable.
create extension if not exists pg_cron with schema pg_catalog;

do $$
begin
  perform cron.unschedule(jobid) from cron.job where jobname = 'student_data_retention_cleanup';
  perform cron.schedule('student_data_retention_cleanup', '17 3 * * *', 'select private.cleanup_student_retention()');
end;
$$;
