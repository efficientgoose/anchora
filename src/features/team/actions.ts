"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { StaffRole } from "@/domain/models";
import { getAuthConfirmationUrl } from "@/lib/site-url";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ErrorLike {
  code?: string;
  message?: string;
  status?: number;
}

interface PreparedInvitation {
  invitation_id: string;
  delivery_id: string;
  organization_id: string;
  organization_name: string;
  inviter_name: string;
  recipient_name: string;
  recipient_email: string;
  recipient_role: StaffRole;
}

export interface InviteMemberState {
  status: "idle" | "error" | "success";
  message?: string;
  fullName?: string;
  email?: string;
  fieldErrors?: { fullName?: string; email?: string; role?: string };
}

export interface ResendMemberInvitationState {
  status: "idle" | "error" | "success";
  message?: string;
  invitationId?: string;
}

const invitationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the member's full name.").max(100, "Keep the name under 100 characters."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  role: z.enum(["owner", "admin", "member"], { message: "Choose a valid access level." }),
});

const invitationIdSchema = z.string().uuid();

function firstFieldError(error: z.ZodError, field: "fullName" | "email" | "role") {
  return error.issues.find((issue) => issue.path[0] === field)?.message;
}

function isRateLimited(error: ErrorLike) {
  return error.status === 429 || error.code === "over_request_rate_limit" || error.code === "over_email_send_rate_limit";
}

function rpcMessage(error: ErrorLike) {
  switch (error.message) {
    case "already_team_member":
      return "This person is already an active member of your team.";
    case "existing_account":
    case "email_unavailable":
      return "This email already belongs to an Anchora account. Existing-account invitations are not supported yet.";
    case "invitation_pending":
      return "An invitation is already pending for this email. Use Resend in the invitation list.";
    case "invitation_processing":
      return "This invitation is already being sent. Wait a moment and refresh the page.";
    case "daily_invitation_limit":
      return "This workspace has reached its limit of 5 invitation emails in 24 hours.";
    case "resend_cooldown":
      return "Wait 60 seconds after the previous email before resending.";
    case "invitation_not_found":
      return "This invitation is no longer available.";
    case "invalid_role":
      return "Choose a valid access level.";
    default:
      return "We could not prepare this invitation. Try again shortly.";
  }
}

function providerMessage(error: ErrorLike) {
  if (error.code === "email_exists" || error.code === "user_already_exists" || /already (been )?registered/i.test(error.message ?? "")) {
    return "This email already belongs to an Anchora account. Existing-account invitations are not supported yet.";
  }
  if (isRateLimited(error)) return "Anchora's email limit was reached. Wait a while before sending another invitation.";
  return "We could not send the invitation email right now. Try again shortly.";
}

function preparedRow(data: unknown): PreparedInvitation | null {
  if (!Array.isArray(data) || data.length !== 1) return null;
  const row = data[0] as Omit<Partial<PreparedInvitation>, "recipient_role"> & { recipient_role?: string };
  const values = [row.invitation_id, row.delivery_id, row.organization_id, row.organization_name, row.inviter_name, row.recipient_name, row.recipient_email];
  const recipientRole = row.recipient_role === "consultant" ? "member" : row.recipient_role;
  const validRole = recipientRole === "owner" || recipientRole === "admin" || recipientRole === "member";
  return values.every((value) => typeof value === "string" && value.length > 0) && validRole ? { ...row, recipient_role: recipientRole } as PreparedInvitation : null;
}

async function failDelivery(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, invitation: PreparedInvitation) {
  const { error } = await supabase.rpc("fail_member_invitation_delivery", {
    p_delivery_id: invitation.delivery_id,
    p_invitation_id: invitation.invitation_id,
  });
  if (error) console.error("[team:invite-fail-delivery]", { code: error.code ?? "unknown", invitationId: invitation.invitation_id });
}

async function sendPreparedInvitation(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  invitation: PreparedInvitation,
) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    await failDelivery(supabase, invitation);
    return { ok: false as const, message: "Member invitations are not configured for this environment." };
  }

  const { data, error } = await admin.auth.admin.inviteUserByEmail(invitation.recipient_email, {
    data: {
      anchora_invitation_id: invitation.invitation_id,
      full_name: invitation.recipient_name,
      invited_by_name: invitation.inviter_name,
      organization_name: invitation.organization_name,
      workspace_role: invitation.recipient_role,
    },
    redirectTo: getAuthConfirmationUrl(),
  });

  if (error || !data.user?.id) {
    await failDelivery(supabase, invitation);
    if (error) console.error("[team:invite-provider]", { code: error.code ?? "unknown", status: error.status ?? "unknown", invitationId: invitation.invitation_id });
    return { ok: false as const, message: providerMessage(error ?? {}) };
  }

  const completionArgs = {
    p_auth_user_id: data.user.id,
    p_delivery_id: invitation.delivery_id,
    p_invitation_id: invitation.invitation_id,
  };
  let completion = await supabase.rpc("complete_member_invitation_delivery", completionArgs);
  if (completion.error) completion = await supabase.rpc("complete_member_invitation_delivery", completionArgs);

  if (completion.error) {
    console.error("[team:invite-complete]", { code: completion.error.code ?? "unknown", invitationId: invitation.invitation_id });
    return { ok: false as const, message: "The email was sent, but the Team page could not refresh. Reload the page before trying again." };
  }

  return { ok: true as const };
}

async function authenticatedClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login?next=%2Fteam");
  return supabase;
}

export async function inviteMemberAction(
  _previousState: InviteMemberState,
  formData: FormData,
): Promise<InviteMemberState> {
  const fullName = typeof formData.get("fullName") === "string" ? String(formData.get("fullName")) : "";
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")) : "";
  const role = typeof formData.get("role") === "string" ? String(formData.get("role")) : "";
  const parsed = invitationSchema.safeParse({ fullName, email, role });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fullName,
      email,
      fieldErrors: {
        fullName: firstFieldError(parsed.error, "fullName"),
        email: firstFieldError(parsed.error, "email"),
        role: firstFieldError(parsed.error, "role"),
      },
    };
  }

  const supabase = await authenticatedClient();
  if (!supabase) return { status: "error", message: "Member invitations are not configured for this environment.", fullName, email };

  const { data, error } = await supabase.rpc("prepare_member_invitation", {
    p_email: parsed.data.email,
    p_full_name: parsed.data.fullName,
    p_role: parsed.data.role,
  });
  if (error) return { status: "error", message: rpcMessage(error), fullName, email };

  const invitation = preparedRow(data);
  if (!invitation) return { status: "error", message: "We could not prepare this invitation. Try again shortly.", fullName, email };

  const delivery = await sendPreparedInvitation(supabase, invitation);
  if (!delivery.ok) return { status: "error", message: delivery.message, fullName, email };

  revalidatePath("/team");
  return { status: "success", message: `Invitation sent to ${invitation.recipient_email}.` };
}

export async function resendMemberInvitationAction(
  _previousState: ResendMemberInvitationState,
  formData: FormData,
): Promise<ResendMemberInvitationState> {
  const parsedId = invitationIdSchema.safeParse(formData.get("invitationId"));
  if (!parsedId.success) return { status: "error", message: "This invitation is no longer available." };

  const supabase = await authenticatedClient();
  if (!supabase) return { status: "error", message: "Member invitations are not configured for this environment.", invitationId: parsedId.data };

  const { data, error } = await supabase.rpc("prepare_member_invitation_resend", {
    p_invitation_id: parsedId.data,
  });
  if (error) return { status: "error", message: rpcMessage(error), invitationId: parsedId.data };

  const invitation = preparedRow(data);
  if (!invitation) return { status: "error", message: "We could not prepare this invitation. Try again shortly.", invitationId: parsedId.data };

  const delivery = await sendPreparedInvitation(supabase, invitation);
  if (!delivery.ok) return { status: "error", message: delivery.message, invitationId: parsedId.data };

  revalidatePath("/team");
  return { status: "success", message: `A fresh invitation was sent to ${invitation.recipient_email}.`, invitationId: parsedId.data };
}
