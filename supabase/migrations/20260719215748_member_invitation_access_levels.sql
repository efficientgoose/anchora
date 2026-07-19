alter table public.organization_invitations
  drop constraint if exists organization_invitations_role_check;

alter table public.organization_invitations
  add constraint organization_invitations_role_check
  check (role in ('owner', 'admin', 'member', 'consultant'));

create or replace function private.prepare_member_invitation(
  p_full_name text,
  p_email text,
  p_role text
)
returns table (
  invitation_id uuid,
  delivery_id uuid,
  organization_id uuid,
  organization_name text,
  inviter_name text,
  recipient_name text,
  recipient_email text,
  recipient_role text
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
  v_role public.staff_role;
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

  begin
    v_role := lower(btrim(coalesce(p_role, '')))::public.staff_role;
  exception
    when invalid_text_representation then
      raise exception 'invalid_role' using errcode = '22023';
  end;

  if v_role = 'consultant' then
    raise exception 'invalid_role' using errcode = '22023';
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

  update public.organization_invitation_deliveries delivery
  set status = 'failed', completed_at = now()
  where delivery.organization_id = v_organization_id
    and delivery.status = 'reserved'
    and delivery.created_at <= now() - interval '10 minutes';

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

    update public.organization_invitations invitation
    set full_name = v_full_name,
        role = v_role,
        invited_by = v_user_id,
        expires_at = now() + interval '24 hours'
    where invitation.id = v_invitation.id
    returning invitation.* into v_invitation;
  else
    insert into public.organization_invitations (
      organization_id,
      full_name,
      email,
      role,
      invited_by
    ) values (
      v_organization_id,
      v_full_name,
      v_email,
      v_role,
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
    v_invitation.full_name,
    v_invitation.email,
    v_invitation.role::text;
end;
$$;

create or replace function private.prepare_member_invitation_resend(p_invitation_id uuid)
returns table (
  invitation_id uuid,
  delivery_id uuid,
  organization_id uuid,
  organization_name text,
  inviter_name text,
  recipient_name text,
  recipient_email text,
  recipient_role text
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

  update public.organization_invitation_deliveries delivery
  set status = 'failed', completed_at = now()
  where delivery.organization_id = v_organization_id
    and delivery.status = 'reserved'
    and delivery.created_at <= now() - interval '10 minutes';

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
    v_invitation.email,
    v_invitation.role::text;
end;
$$;

create or replace function private.accept_member_invitation()
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
      return query select v_invitation.organization_id, v_invitation.role::text;
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
  values (v_user_id, v_invitation.organization_id, v_invitation.role)
  on conflict on constraint organization_memberships_pkey do nothing;

  update public.organization_invitations invitation
  set auth_user_id = v_user_id,
      status = 'accepted',
      accepted_at = now()
  where invitation.id = v_invitation.id;

  return query select v_invitation.organization_id, v_invitation.role::text;
end;
$$;

create or replace function private.complete_member_invitation_delivery(
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

create or replace function private.fail_member_invitation_delivery(
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

create or replace function public.prepare_member_invitation(
  p_full_name text,
  p_email text,
  p_role text
)
returns table (
  invitation_id uuid,
  delivery_id uuid,
  organization_id uuid,
  organization_name text,
  inviter_name text,
  recipient_name text,
  recipient_email text,
  recipient_role text
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.prepare_member_invitation(p_full_name, p_email, p_role);
$$;

create or replace function public.prepare_member_invitation_resend(p_invitation_id uuid)
returns table (
  invitation_id uuid,
  delivery_id uuid,
  organization_id uuid,
  organization_name text,
  inviter_name text,
  recipient_name text,
  recipient_email text,
  recipient_role text
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.prepare_member_invitation_resend(p_invitation_id);
$$;

create or replace function public.complete_member_invitation_delivery(
  p_invitation_id uuid,
  p_delivery_id uuid,
  p_auth_user_id uuid
)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.complete_member_invitation_delivery(p_invitation_id, p_delivery_id, p_auth_user_id);
$$;

create or replace function public.fail_member_invitation_delivery(
  p_invitation_id uuid,
  p_delivery_id uuid
)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.fail_member_invitation_delivery(p_invitation_id, p_delivery_id);
$$;

create or replace function public.accept_member_invitation()
returns table (
  organization_id uuid,
  membership_role text
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.accept_member_invitation();
$$;

create or replace function private.accept_consultant_invitation()
returns table (
  organization_id uuid,
  membership_role text
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.accept_member_invitation();
$$;

revoke all on function private.prepare_member_invitation(text, text, text) from public;
revoke all on function private.prepare_member_invitation_resend(uuid) from public;
revoke all on function private.complete_member_invitation_delivery(uuid, uuid, uuid) from public;
revoke all on function private.fail_member_invitation_delivery(uuid, uuid) from public;
revoke all on function private.accept_member_invitation() from public;

grant execute on function private.prepare_member_invitation(text, text, text) to authenticated;
grant execute on function private.prepare_member_invitation_resend(uuid) to authenticated;
grant execute on function private.complete_member_invitation_delivery(uuid, uuid, uuid) to authenticated;
grant execute on function private.fail_member_invitation_delivery(uuid, uuid) to authenticated;
grant execute on function private.accept_member_invitation() to authenticated;

revoke all on function public.prepare_member_invitation(text, text, text) from public, anon;
revoke all on function public.prepare_member_invitation_resend(uuid) from public, anon;
revoke all on function public.complete_member_invitation_delivery(uuid, uuid, uuid) from public, anon;
revoke all on function public.fail_member_invitation_delivery(uuid, uuid) from public, anon;
revoke all on function public.accept_member_invitation() from public, anon;

grant execute on function public.prepare_member_invitation(text, text, text) to authenticated;
grant execute on function public.prepare_member_invitation_resend(uuid) to authenticated;
grant execute on function public.complete_member_invitation_delivery(uuid, uuid, uuid) to authenticated;
grant execute on function public.fail_member_invitation_delivery(uuid, uuid) to authenticated;
grant execute on function public.accept_member_invitation() to authenticated;

comment on table public.organization_invitations is
  'Owner-created member invitations. Direct client access is denied; authenticated RPCs enforce tenancy and roles.';

comment on function public.accept_member_invitation() is
  'Accepts a current member invitation using the authenticated user id and verified Auth email. The protected invitation row determines the membership role.';
