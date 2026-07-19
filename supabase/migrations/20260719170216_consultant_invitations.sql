create type public.organization_invitation_status as enum ('preparing', 'pending', 'accepted');
create type public.invitation_delivery_status as enum ('reserved', 'sent', 'failed');

create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text not null
    check (full_name = btrim(full_name))
    check (char_length(full_name) between 2 and 100),
  email text not null
    check (email = lower(btrim(email)))
    check (char_length(email) between 3 and 320),
  role public.staff_role not null default 'consultant'
    check (role = 'consultant'),
  invited_by uuid not null references public.profiles (user_id) on delete restrict,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  status public.organization_invitation_status not null default 'preparing',
  created_at timestamptz not null default now(),
  last_sent_at timestamptz,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  accepted_at timestamptz,
  check ((status = 'accepted') = (accepted_at is not null))
);

create unique index organization_invitations_active_email_idx
  on public.organization_invitations (email)
  where status in ('preparing', 'pending');

create index organization_invitations_organization_status_idx
  on public.organization_invitations (organization_id, status, created_at desc);

create table public.organization_invitation_deliveries (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references public.organization_invitations (id) on delete set null,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  requested_by uuid not null references public.profiles (user_id) on delete restrict,
  delivery_kind text not null check (delivery_kind in ('initial', 'resend')),
  status public.invitation_delivery_status not null default 'reserved',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index organization_invitation_deliveries_one_reserved_idx
  on public.organization_invitation_deliveries (invitation_id)
  where status = 'reserved' and invitation_id is not null;

create index organization_invitation_deliveries_rate_limit_idx
  on public.organization_invitation_deliveries (organization_id, status, created_at desc);

alter table public.organization_invitations enable row level security;
alter table public.organization_invitation_deliveries enable row level security;

revoke all on table public.organization_invitations from public, anon, authenticated;
revoke all on table public.organization_invitation_deliveries from public, anon, authenticated;
revoke usage on type public.organization_invitation_status from public, anon, authenticated;
revoke usage on type public.invitation_delivery_status from public, anon, authenticated;

create or replace function private.prepare_consultant_invitation(p_full_name text, p_email text)
returns table (
  invitation_id uuid,
  delivery_id uuid,
  organization_id uuid,
  organization_name text,
  inviter_name text,
  recipient_name text,
  recipient_email text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_organization_id uuid;
  v_organization_name text;
  v_inviter_name text;
  v_full_name text := regexp_replace(btrim(coalesce(p_full_name, '')), '\s+', ' ', 'g');
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_existing_organization_id uuid;
  v_invitation public.organization_invitations%rowtype;
  v_delivery_id uuid;
  v_delivery_count integer;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select membership.organization_id, organization.name, profile.full_name
    into v_organization_id, v_organization_name, v_inviter_name
  from public.organization_memberships membership
  join public.organizations organization on organization.id = membership.organization_id
  join public.profiles profile on profile.user_id = membership.user_id
  where membership.user_id = v_user_id
    and membership.role = 'owner';

  if not found then
    raise exception 'owner_required' using errcode = '42501';
  end if;

  if char_length(v_full_name) < 2 or char_length(v_full_name) > 100 then
    raise exception 'invalid_full_name' using errcode = '22023';
  end if;

  if char_length(v_email) < 3
    or char_length(v_email) > 320
    or position('@' in v_email) <= 1
    or position('.' in split_part(v_email, '@', 2)) <= 1 then
    raise exception 'invalid_email' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_email, 7001));
  perform pg_advisory_xact_lock(hashtextextended(v_organization_id::text, 7002));

  update public.organization_invitation_deliveries
  set status = 'failed', completed_at = now()
  where organization_id = v_organization_id
    and status = 'reserved'
    and created_at <= now() - interval '10 minutes';

  select membership.organization_id
    into v_existing_organization_id
  from public.profiles profile
  join public.organization_memberships membership on membership.user_id = profile.user_id
  where profile.email = v_email
  order by membership.joined_at
  limit 1;

  if found then
    if v_existing_organization_id = v_organization_id then
      raise exception 'already_team_member' using errcode = 'P0001';
    end if;
    raise exception 'existing_account' using errcode = 'P0001';
  end if;

  select invitation.*
    into v_invitation
  from public.organization_invitations invitation
  where invitation.email = v_email
    and invitation.status in ('preparing', 'pending')
  for update;

  if found then
    if v_invitation.organization_id <> v_organization_id then
      raise exception 'email_unavailable' using errcode = 'P0001';
    end if;

    if v_invitation.status = 'pending' then
      raise exception 'invitation_pending' using errcode = 'P0001';
    end if;

    if exists (
      select 1
      from public.organization_invitation_deliveries delivery
      where delivery.invitation_id = v_invitation.id
        and delivery.status = 'reserved'
        and delivery.created_at > now() - interval '10 minutes'
    ) then
      raise exception 'invitation_processing' using errcode = 'P0001';
    end if;

    update public.organization_invitations
    set full_name = v_full_name,
        invited_by = v_user_id,
        expires_at = now() + interval '24 hours'
    where id = v_invitation.id;
  else
    insert into public.organization_invitations (
      organization_id,
      full_name,
      email,
      invited_by
    ) values (
      v_organization_id,
      v_full_name,
      v_email,
      v_user_id
    )
    returning * into v_invitation;
  end if;

  select count(*)::integer
    into v_delivery_count
  from public.organization_invitation_deliveries delivery
  where delivery.organization_id = v_organization_id
    and (
      (delivery.status = 'sent' and delivery.completed_at > now() - interval '24 hours')
      or (delivery.status = 'reserved' and delivery.created_at > now() - interval '10 minutes')
    );

  if v_delivery_count >= 5 then
    raise exception 'daily_invitation_limit' using errcode = 'P0001';
  end if;

  insert into public.organization_invitation_deliveries (
    invitation_id,
    organization_id,
    requested_by,
    delivery_kind
  ) values (
    v_invitation.id,
    v_organization_id,
    v_user_id,
    'initial'
  )
  returning id into v_delivery_id;

  return query select
    v_invitation.id,
    v_delivery_id,
    v_organization_id,
    v_organization_name,
    v_inviter_name,
    v_full_name,
    v_email;
end;
$$;

create or replace function private.prepare_consultant_invitation_resend(p_invitation_id uuid)
returns table (
  invitation_id uuid,
  delivery_id uuid,
  organization_id uuid,
  organization_name text,
  inviter_name text,
  recipient_name text,
  recipient_email text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_organization_id uuid;
  v_organization_name text;
  v_inviter_name text;
  v_invitation public.organization_invitations%rowtype;
  v_delivery_id uuid;
  v_delivery_count integer;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select membership.organization_id, organization.name, profile.full_name
    into v_organization_id, v_organization_name, v_inviter_name
  from public.organization_memberships membership
  join public.organizations organization on organization.id = membership.organization_id
  join public.profiles profile on profile.user_id = membership.user_id
  where membership.user_id = v_user_id
    and membership.role = 'owner';

  if not found then
    raise exception 'owner_required' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_organization_id::text, 7002));

  update public.organization_invitation_deliveries
  set status = 'failed', completed_at = now()
  where organization_id = v_organization_id
    and status = 'reserved'
    and created_at <= now() - interval '10 minutes';

  select invitation.*
    into v_invitation
  from public.organization_invitations invitation
  where invitation.id = p_invitation_id
    and invitation.organization_id = v_organization_id
    and invitation.status = 'pending'
  for update;

  if not found then
    raise exception 'invitation_not_found' using errcode = 'P0001';
  end if;

  if v_invitation.last_sent_at is not null
    and v_invitation.last_sent_at > now() - interval '60 seconds' then
    raise exception 'resend_cooldown' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.organization_invitation_deliveries delivery
    where delivery.invitation_id = v_invitation.id
      and delivery.status = 'reserved'
      and delivery.created_at > now() - interval '10 minutes'
  ) then
    raise exception 'invitation_processing' using errcode = 'P0001';
  end if;

  select count(*)::integer
    into v_delivery_count
  from public.organization_invitation_deliveries delivery
  where delivery.organization_id = v_organization_id
    and (
      (delivery.status = 'sent' and delivery.completed_at > now() - interval '24 hours')
      or (delivery.status = 'reserved' and delivery.created_at > now() - interval '10 minutes')
    );

  if v_delivery_count >= 5 then
    raise exception 'daily_invitation_limit' using errcode = 'P0001';
  end if;

  insert into public.organization_invitation_deliveries (
    invitation_id,
    organization_id,
    requested_by,
    delivery_kind
  ) values (
    v_invitation.id,
    v_organization_id,
    v_user_id,
    'resend'
  )
  returning id into v_delivery_id;

  return query select
    v_invitation.id,
    v_delivery_id,
    v_organization_id,
    v_organization_name,
    v_inviter_name,
    v_invitation.full_name,
    v_invitation.email;
end;
$$;

create or replace function private.complete_consultant_invitation_delivery(
  p_invitation_id uuid,
  p_delivery_id uuid,
  p_auth_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_organization_id uuid;
  v_invitation_email text;
  v_invitation_auth_user_id uuid;
  v_invitation_status public.organization_invitation_status;
  v_auth_email text;
  v_delivery_status public.invitation_delivery_status;
begin
  select membership.organization_id
    into v_organization_id
  from public.organization_memberships membership
  where membership.user_id = v_user_id
    and membership.role = 'owner';

  if v_organization_id is null then
    raise exception 'owner_required' using errcode = '42501';
  end if;

  select invitation.email, invitation.auth_user_id, invitation.status
    into v_invitation_email, v_invitation_auth_user_id, v_invitation_status
  from public.organization_invitations invitation
  where invitation.id = p_invitation_id
    and invitation.organization_id = v_organization_id
  for update;

  if not found then
    raise exception 'invitation_not_found' using errcode = 'P0001';
  end if;

  select delivery.status
    into v_delivery_status
  from public.organization_invitation_deliveries delivery
  where delivery.id = p_delivery_id
    and delivery.invitation_id = p_invitation_id
    and delivery.organization_id = v_organization_id
  for update;

  if not found then
    raise exception 'delivery_not_found' using errcode = 'P0001';
  end if;

  if v_delivery_status = 'sent' then
    return true;
  end if;

  if v_delivery_status <> 'reserved' then
    raise exception 'delivery_not_reserved' using errcode = 'P0001';
  end if;

  select lower(btrim(coalesce(auth_user.email, '')))
    into v_auth_email
  from auth.users auth_user
  where auth_user.id = p_auth_user_id;

  if v_auth_email is null or v_auth_email <> v_invitation_email then
    raise exception 'auth_user_mismatch' using errcode = 'P0001';
  end if;

  if v_invitation_auth_user_id is not null and v_invitation_auth_user_id <> p_auth_user_id then
    raise exception 'auth_user_mismatch' using errcode = 'P0001';
  end if;

  if v_invitation_status = 'accepted' then
    update public.organization_invitation_deliveries
    set status = 'sent', completed_at = now()
    where id = p_delivery_id;
    return true;
  end if;

  update public.organization_invitations
  set auth_user_id = p_auth_user_id,
      status = 'pending',
      last_sent_at = now(),
      expires_at = now() + interval '24 hours'
  where id = p_invitation_id;

  update public.organization_invitation_deliveries
  set status = 'sent', completed_at = now()
  where id = p_delivery_id;

  return true;
end;
$$;

create or replace function private.fail_consultant_invitation_delivery(
  p_invitation_id uuid,
  p_delivery_id uuid
)
returns boolean
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
  where membership.user_id = v_user_id
    and membership.role = 'owner';

  if v_organization_id is null then
    raise exception 'owner_required' using errcode = '42501';
  end if;

  update public.organization_invitation_deliveries
  set status = 'failed', completed_at = now()
  where id = p_delivery_id
    and invitation_id = p_invitation_id
    and organization_id = v_organization_id
    and status = 'reserved';

  return found;
end;
$$;

create or replace function private.get_team_directory()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_organization_id uuid;
  v_organization_name text;
  v_members jsonb;
  v_invitations jsonb;
begin
  select membership.organization_id, organization.name
    into v_organization_id, v_organization_name
  from public.organization_memberships membership
  join public.organizations organization on organization.id = membership.organization_id
  where membership.user_id = v_user_id
    and membership.role = 'owner';

  if v_organization_id is null then
    raise exception 'owner_required' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(member_row.payload order by member_row.role_order, member_row.sort_name), '[]'::jsonb)
    into v_members
  from (
    select
      case membership.role when 'owner' then 0 when 'admin' then 1 else 2 end as role_order,
      lower(profile.full_name) as sort_name,
      jsonb_build_object(
        'id', membership.user_id,
        'fullName', profile.full_name,
        'email', profile.email,
        'role', membership.role::text,
        'joinedAt', membership.joined_at
      ) as payload
    from public.organization_memberships membership
    join public.profiles profile on profile.user_id = membership.user_id
    where membership.organization_id = v_organization_id
  ) member_row;

  select coalesce(jsonb_agg(invitation_row.payload order by invitation_row.sent_at desc), '[]'::jsonb)
    into v_invitations
  from (
    select
      invitation.last_sent_at as sent_at,
      jsonb_build_object(
        'id', invitation.id,
        'fullName', invitation.full_name,
        'email', invitation.email,
        'role', invitation.role::text,
        'status', case when invitation.expires_at <= now() then 'expired' else 'pending' end,
        'sentAt', invitation.last_sent_at,
        'expiresAt', invitation.expires_at,
        'resendAvailableAt', invitation.last_sent_at + interval '60 seconds'
      ) as payload
    from public.organization_invitations invitation
    where invitation.organization_id = v_organization_id
      and invitation.status = 'pending'
  ) invitation_row;

  return jsonb_build_object(
    'organizationId', v_organization_id,
    'organizationName', v_organization_name,
    'members', v_members,
    'invitations', v_invitations
  );
end;
$$;

create or replace function private.accept_consultant_invitation()
returns table (
  organization_id uuid,
  membership_role text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_email text;
  v_email_confirmed_at timestamptz;
  v_invitation public.organization_invitations%rowtype;
  v_existing_organization_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select lower(btrim(coalesce(auth_user.email, ''))), auth_user.email_confirmed_at
    into v_email, v_email_confirmed_at
  from auth.users auth_user
  where auth_user.id = v_user_id;

  if v_email = '' or v_email_confirmed_at is null then
    raise exception 'verified_email_required' using errcode = '42501';
  end if;

  select invitation.*
    into v_invitation
  from public.organization_invitations invitation
  where invitation.email = v_email
    and invitation.status in ('preparing', 'pending')
    and (invitation.auth_user_id is null or invitation.auth_user_id = v_user_id)
  order by invitation.created_at desc
  limit 1
  for update;

  if not found then
    select invitation.*
      into v_invitation
    from public.organization_invitations invitation
    join public.organization_memberships membership
      on membership.user_id = v_user_id
      and membership.organization_id = invitation.organization_id
    where invitation.email = v_email
      and invitation.auth_user_id = v_user_id
      and invitation.status = 'accepted'
    order by invitation.accepted_at desc
    limit 1;

    if found then
      return query select v_invitation.organization_id, 'consultant'::text;
      return;
    end if;

    raise exception 'invitation_not_found' using errcode = 'P0001';
  end if;

  if v_invitation.expires_at <= now()
    and not exists (
      select 1
      from public.organization_invitation_deliveries delivery
      where delivery.invitation_id = v_invitation.id
        and delivery.status = 'reserved'
        and delivery.created_at > now() - interval '10 minutes'
    ) then
    raise exception 'invitation_expired' using errcode = 'P0001';
  end if;

  select membership.organization_id
    into v_existing_organization_id
  from public.organization_memberships membership
  where membership.user_id = v_user_id;

  if found and v_existing_organization_id <> v_invitation.organization_id then
    raise exception 'existing_membership' using errcode = 'P0001';
  end if;

  insert into public.profiles (user_id, full_name, email)
  values (v_user_id, v_invitation.full_name, v_email)
  on conflict on constraint profiles_pkey do update
    set full_name = excluded.full_name,
        email = excluded.email,
        updated_at = now();

  insert into public.organization_memberships (user_id, organization_id, role)
  values (v_user_id, v_invitation.organization_id, 'consultant')
  on conflict on constraint organization_memberships_pkey do nothing;

  update public.organization_invitations
  set auth_user_id = v_user_id,
      status = 'accepted',
      accepted_at = now()
  where id = v_invitation.id;

  return query select v_invitation.organization_id, 'consultant'::text;
end;
$$;

revoke all on function private.prepare_consultant_invitation(text, text) from public;
revoke all on function private.prepare_consultant_invitation_resend(uuid) from public;
revoke all on function private.complete_consultant_invitation_delivery(uuid, uuid, uuid) from public;
revoke all on function private.fail_consultant_invitation_delivery(uuid, uuid) from public;
revoke all on function private.get_team_directory() from public;
revoke all on function private.accept_consultant_invitation() from public;

grant usage on schema private to authenticated;
grant execute on function private.prepare_consultant_invitation(text, text) to authenticated;
grant execute on function private.prepare_consultant_invitation_resend(uuid) to authenticated;
grant execute on function private.complete_consultant_invitation_delivery(uuid, uuid, uuid) to authenticated;
grant execute on function private.fail_consultant_invitation_delivery(uuid, uuid) to authenticated;
grant execute on function private.get_team_directory() to authenticated;
grant execute on function private.accept_consultant_invitation() to authenticated;

create or replace function public.prepare_consultant_invitation(p_full_name text, p_email text)
returns table (
  invitation_id uuid,
  delivery_id uuid,
  organization_id uuid,
  organization_name text,
  inviter_name text,
  recipient_name text,
  recipient_email text
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.prepare_consultant_invitation(p_full_name, p_email);
$$;

create or replace function public.prepare_consultant_invitation_resend(p_invitation_id uuid)
returns table (
  invitation_id uuid,
  delivery_id uuid,
  organization_id uuid,
  organization_name text,
  inviter_name text,
  recipient_name text,
  recipient_email text
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.prepare_consultant_invitation_resend(p_invitation_id);
$$;

create or replace function public.complete_consultant_invitation_delivery(
  p_invitation_id uuid,
  p_delivery_id uuid,
  p_auth_user_id uuid
)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.complete_consultant_invitation_delivery(p_invitation_id, p_delivery_id, p_auth_user_id);
$$;

create or replace function public.fail_consultant_invitation_delivery(
  p_invitation_id uuid,
  p_delivery_id uuid
)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.fail_consultant_invitation_delivery(p_invitation_id, p_delivery_id);
$$;

create or replace function public.get_team_directory()
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.get_team_directory();
$$;

create or replace function public.accept_consultant_invitation()
returns table (
  organization_id uuid,
  membership_role text
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.accept_consultant_invitation();
$$;

revoke all on function public.prepare_consultant_invitation(text, text) from public, anon;
revoke all on function public.prepare_consultant_invitation_resend(uuid) from public, anon;
revoke all on function public.complete_consultant_invitation_delivery(uuid, uuid, uuid) from public, anon;
revoke all on function public.fail_consultant_invitation_delivery(uuid, uuid) from public, anon;
revoke all on function public.get_team_directory() from public, anon;
revoke all on function public.accept_consultant_invitation() from public, anon;

grant execute on function public.prepare_consultant_invitation(text, text) to authenticated;
grant execute on function public.prepare_consultant_invitation_resend(uuid) to authenticated;
grant execute on function public.complete_consultant_invitation_delivery(uuid, uuid, uuid) to authenticated;
grant execute on function public.fail_consultant_invitation_delivery(uuid, uuid) to authenticated;
grant execute on function public.get_team_directory() to authenticated;
grant execute on function public.accept_consultant_invitation() to authenticated;

comment on table public.organization_invitations is
  'Owner-created consultant invitations. Direct client access is denied; authenticated RPCs enforce tenancy and roles.';

comment on table public.organization_invitation_deliveries is
  'Invitation delivery ledger used for cooldowns, rolling organization quotas, and failed-send recovery.';

comment on function public.accept_consultant_invitation() is
  'Accepts a current invitation using the authenticated user id and verified Auth email, never user metadata.';
