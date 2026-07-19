create or replace function public.prepare_consultant_invitation(
  p_full_name text,
  p_email text
)
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
  select
    invitation.invitation_id,
    invitation.delivery_id,
    invitation.organization_id,
    invitation.organization_name,
    invitation.inviter_name,
    invitation.recipient_name,
    invitation.recipient_email
  from private.prepare_member_invitation(p_full_name, p_email, 'member') invitation;
$$;

revoke all on function public.prepare_consultant_invitation(text, text) from public, anon;
grant execute on function public.prepare_consultant_invitation(text, text) to authenticated;

revoke execute on function private.prepare_consultant_invitation(text, text) from authenticated;

comment on function public.prepare_consultant_invitation(text, text) is
  'Backward-compatible alias. Creates Member invitations through the role-aware invitation path.';
