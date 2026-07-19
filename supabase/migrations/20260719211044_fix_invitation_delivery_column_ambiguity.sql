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
    v_invitation.email;
end;
$$;
