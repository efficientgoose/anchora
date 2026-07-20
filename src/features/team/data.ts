import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { StaffRole } from "@/domain/models";
import type { TeamDirectory } from "./types";

const staffRoleSchema = z.enum(["owner", "admin", "member", "consultant"]).transform<StaffRole>((role) => role === "consultant" ? "member" : role);

const teamDirectorySchema = z.object({
  organizationId: z.string().uuid(),
  organizationName: z.string().min(1),
  members: z.array(z.object({
    id: z.string().uuid(),
    fullName: z.string().min(1),
    email: z.string().email(),
    role: staffRoleSchema,
    joinedAt: z.string(),
  })),
  invitations: z.array(z.object({
    id: z.string().uuid(),
    fullName: z.string().min(1),
    email: z.string().email(),
    role: staffRoleSchema,
    status: z.enum(["pending", "expired"]),
    sentAt: z.string(),
    expiresAt: z.string(),
    resendAvailableAt: z.string(),
  })),
});

export type TeamDirectoryLoadResult =
  | { status: "ready"; directory: TeamDirectory }
  | { status: "forbidden" }
  | { status: "error" };

export async function loadTeamDirectory(supabase: SupabaseClient): Promise<TeamDirectoryLoadResult> {
  const { data, error } = await supabase.rpc("get_team_directory");
  if (error) {
    if (error.code === "42501" && error.message.includes("owner_required")) {
      return { status: "forbidden" };
    }
    console.error("[team:directory]", { code: error.code ?? "unknown" });
    return { status: "error" };
  }

  const parsed = teamDirectorySchema.safeParse(data);
  if (!parsed.success) {
    console.error("[team:directory]", { code: "invalid_directory_payload" });
    return { status: "error" };
  }

  return { status: "ready", directory: parsed.data };
}
