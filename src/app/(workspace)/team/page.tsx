import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loadTeamDirectory } from "@/features/team/data";
import { TeamPage } from "@/features/team/team-page";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveWorkspaceContext } from "@/lib/workspace/context";

export const metadata: Metadata = { title: "Team" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?configuration=missing&next=%2Fteam");

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login?next=%2Fteam");

  const workspace = await resolveWorkspaceContext(supabase, data.user);
  if (workspace.status === "unassigned") redirect("/onboarding");
  if (workspace.status !== "ready" || workspace.context.membership.role !== "owner") redirect("/students");

  const directory = await loadTeamDirectory(supabase);
  return <TeamPage directory={directory} />;
}
