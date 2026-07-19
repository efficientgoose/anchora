import type { SupabaseClient, User } from "@supabase/supabase-js";
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
  const role = staffRole(membershipResult.data.role);
  if (!role || typeof membershipResult.data.organization_id !== "string") {
    return { status: "error", code: "invalid_membership" };
  }

  const [organizationResult, profileResult] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("id", membershipResult.data.organization_id)
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

  const organization = organizationResult.data;
  const profile = profileResult.data;
  if (!organization || !profile) return { status: "error", code: "incomplete_workspace" };

  return {
    status: "ready",
    context: {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      profile: {
        userId: profile.user_id,
        fullName: profile.full_name,
        email: profile.email,
      },
      membership: { role },
    },
  };
}
