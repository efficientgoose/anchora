import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveWorkspaceContext } from "@/lib/workspace/context";
import { getStudentDataLaunchStatus, loadLegalAccess } from "@/features/students/server-data";
import { safeInternalPath } from "@/lib/auth/redirects";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const requestedDestination = safeInternalPath(requestHeaders.get("x-anchora-request-path"), "/students");
  const legalNext = encodeURIComponent(requestedDestination);
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

  if (getStudentDataLaunchStatus().enabled) {
    const legalAccess = await loadLegalAccess();
    if (legalAccess.status !== "ready") {
      if (legalAccess.status === "error") console.error("[workspace:legal-layout]", { code: legalAccess.code });
      redirect(`/legal/accept?next=${legalNext}`);
    }
    if (!legalAccess.data.terms.accepted || !legalAccess.data.privacy.accepted) redirect(`/legal/accept?next=${legalNext}`);
    if (!legalAccess.data.organizationDpaAccepted) redirect(`/legal/dpa?next=${legalNext}`);
  }

  return (
    <AppShell
      actor={{
        name: workspace.context.profile.fullName,
        email: workspace.context.profile.email,
        role: workspace.context.membership.role,
        organizationName: workspace.context.organization.name,
      }}
    >
      {children}
    </AppShell>
  );
}
