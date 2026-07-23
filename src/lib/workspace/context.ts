import type { SupabaseClient, User } from "@supabase/supabase-js";
import { z } from "zod";
import type { StaffRole } from "@/domain/models";

export interface WorkspaceContext {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  profile: {
    userId: string;
    fullName: string;
    email: string;
  };
  membership: {
    role: StaffRole;
  };
}

export type WorkspaceContextResult =
  | { status: "ready"; context: WorkspaceContext }
  | { status: "unassigned" }
  | { status: "error"; code: string };

function staffRole(value: unknown): StaffRole | null {
  if (value === "consultant") return "member";
  if (value === "owner" || value === "admin" || value === "member") return value;
  return null;
}

function errorCode(error: { code?: string } | null, fallback: string) {
  return error?.code ?? fallback;
}

const membershipRowSchema = z.object({
  organization_id: z.string().uuid(),
  role: z.enum(["owner", "admin", "member", "consultant"]),
});

const organizationRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
});

const profileRowSchema = z.object({
  user_id: z.string().uuid(),
  full_name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
});

export async function resolveWorkspaceContext(supabase: SupabaseClient, user: User): Promise<WorkspaceContextResult> {
  const membershipResult = await supabase
    .from("organization_memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipResult.error) {
    return { status: "error", code: errorCode(membershipResult.error, "membership_lookup_failed") };
  }

  if (!membershipResult.data) return { status: "unassigned" };
  const membership = membershipRowSchema.safeParse(membershipResult.data);
  if (!membership.success) return { status: "error", code: "invalid_membership" };

  const role = staffRole(membership.data.role);
  if (!role) {
    return { status: "error", code: "invalid_membership" };
  }

  const [organizationResult, profileResult] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("id", membership.data.organization_id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (organizationResult.error || profileResult.error) {
    return {
      status: "error",
      code: errorCode(organizationResult.error, errorCode(profileResult.error, "workspace_lookup_failed")),
    };
  }

  if (!organizationResult.data || !profileResult.data) return { status: "error", code: "incomplete_workspace" };
  const organization = organizationRowSchema.safeParse(organizationResult.data);
  const profile = profileRowSchema.safeParse(profileResult.data);
  if (!organization.success || !profile.success || profile.data.user_id !== user.id) {
    return { status: "error", code: "incomplete_workspace" };
  }

  return {
    status: "ready",
    context: {
      organization: {
        id: organization.data.id,
        name: organization.data.name,
        slug: organization.data.slug,
      },
      profile: {
        userId: profile.data.user_id,
        fullName: profile.data.full_name,
        email: profile.data.email,
      },
      membership: { role },
    },
  };
}
