import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingPage } from "@/features/onboarding/onboarding-page";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveWorkspaceContext } from "@/lib/workspace/context";

export const metadata: Metadata = { title: "Set up your consultancy" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?configuration=missing&next=%2Fonboarding");

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login?next=%2Fonboarding");

  const workspace = await resolveWorkspaceContext(supabase, data.user);
  if (workspace.status === "ready") redirect("/students");
  if (workspace.status === "error") {
    console.error("[workspace:resolve-onboarding]", { code: workspace.code });
    return <OnboardingPage workspaceUnavailable />;
  }

  return <OnboardingPage />;
}
