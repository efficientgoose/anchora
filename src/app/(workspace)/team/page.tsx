import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loadTeamDirectory } from "@/features/team/data";
import { TeamPage } from "@/features/team/team-page";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Team" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?configuration=missing&next=%2Fteam");

  const [{ data, error }, directoryResult] = await Promise.all([
    supabase.auth.getUser(),
    loadTeamDirectory(supabase),
  ]);
  if (error || !data.user) redirect("/login?next=%2Fteam");
  if (directoryResult.status === "forbidden") redirect("/students");

  return <TeamPage directory={directoryResult.status === "ready" ? directoryResult.directory : null} />;
}
