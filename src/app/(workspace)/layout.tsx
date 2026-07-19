import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveWorkspaceContext } from "@/lib/workspace/context";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?configuration=missing");

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");

  const workspace = await resolveWorkspaceContext(supabase, data.user);
  if (workspace.status === "unassigned") redirect("/onboarding");
  if (workspace.status === "error") {
    console.error("[workspace:resolve-layout]", { code: workspace.code });
    redirect("/onboarding");
  }

  return (
    <AppShell
      actor={{
        name: workspace.context.profile.fullName,
        email: workspace.context.profile.email,
        role: workspace.context.membership.role,
        organizationName: workspace.context.organization.name,
      }}
      demoData
    >
      {children}
    </AppShell>
  );
}
