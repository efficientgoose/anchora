create type public.staff_role as enum ('owner', 'admin', 'consultant');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null
    check (name = btrim(name))
    check (char_length(name) between 2 and 100),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null
    check (full_name = btrim(full_name))
    check (char_length(full_name) between 1 and 100),
  email text not null
    check (email = lower(btrim(email)))
    check (char_length(email) between 3 and 320),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  user_id uuid primary key references public.profiles (user_id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role public.staff_role not null,
  joined_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index organization_memberships_organization_id_idx
  on public.organization_memberships (organization_id);

create unique index organization_memberships_one_owner_idx
  on public.organization_memberships (organization_id)
  where role = 'owner';

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;

revoke all on table public.organizations from anon, authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.organization_memberships from anon, authenticated;

grant select on table public.organizations to authenticated;
grant select on table public.profiles to authenticated;
grant select on table public.organization_memberships to authenticated;
grant usage on type public.staff_role to authenticated;

create policy "Members can read their organization"
  on public.organizations
  for select
  to authenticated
  using (
    created_by = (select auth.uid())
    or exists (
      select 1
      from public.organization_memberships membership
      where membership.organization_id = organizations.id
        and membership.user_id = (select auth.uid())
    )
  );

create policy "Users can read their profile"
  on public.profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can read their membership"
  on public.organization_memberships
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.create_owner_organization(p_name text)
returns table (
  organization_id uuid,
  organization_name text,
  organization_slug text,
  user_id uuid,
  membership_role public.staff_role
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_name text := btrim(coalesce(p_name, ''));
  v_email text := lower(btrim(coalesce((select auth.jwt() ->> 'email'), '')));
  v_full_name text := coalesce(
    nullif(btrim((select auth.jwt() -> 'user_metadata' ->> 'full_name')), ''),
    nullif(btrim((select auth.jwt() -> 'user_metadata' ->> 'name')), ''),
    nullif(btrim(split_part(v_email, '@', 1)), ''),
    'Member'
  );
  v_organization_id uuid;
  v_slug_base text;
  v_slug text;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 100 then
    raise exception 'Consultancy name must be between 2 and 100 characters.' using errcode = '22023';
  end if;

  if v_email = '' then
    raise exception 'The authenticated account does not have an email address.' using errcode = '22023';
  end if;

  return query
    select
      organization.id,
      organization.name,
      organization.slug,
      membership.user_id,
      membership.role
    from public.organization_memberships membership
    join public.organizations organization on organization.id = membership.organization_id
    where membership.user_id = v_user_id;

  if found then
    return;
  end if;

  v_organization_id := gen_random_uuid();
  v_slug_base := trim(both '-' from regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g'));
  if v_slug_base = '' then
    v_slug_base := 'consultancy';
  end if;
  v_slug := left(v_slug_base, 80) || '-' || left(replace(v_organization_id::text, '-', ''), 8);

  insert into public.profiles (user_id, full_name, email)
  values (v_user_id, left(v_full_name, 100), v_email)
  on conflict on constraint profiles_pkey do update
    set full_name = excluded.full_name,
        email = excluded.email,
        updated_at = now();

  insert into public.organizations (id, name, slug, created_by)
  values (v_organization_id, v_name, v_slug, v_user_id);

  insert into public.organization_memberships (user_id, organization_id, role)
  values (v_user_id, v_organization_id, 'owner');

  return query
    select v_organization_id, v_name, v_slug, v_user_id, 'owner'::public.staff_role;
exception
  when unique_violation then
    return query
      select
        organization.id,
        organization.name,
        organization.slug,
        membership.user_id,
        membership.role
      from public.organization_memberships membership
      join public.organizations organization on organization.id = membership.organization_id
      where membership.user_id = v_user_id;

    if not found then
      raise;
    end if;
end;
$$;

revoke all on function private.create_owner_organization(text) from public;
grant execute on function private.create_owner_organization(text) to authenticated;

create or replace function public.create_owner_organization(p_name text)
returns table (
  organization_id uuid,
  organization_name text,
  organization_slug text,
  user_id uuid,
  membership_role public.staff_role
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.create_owner_organization(p_name);
$$;

revoke all on function public.create_owner_organization(text) from public, anon;
grant execute on function public.create_owner_organization(text) to authenticated;

comment on function public.create_owner_organization(text) is
  'Creates exactly one consultancy and owner membership for the authenticated user.';
