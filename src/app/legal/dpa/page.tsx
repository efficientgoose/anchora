import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DpaAcceptancePage, LegalAccessUnavailablePage } from "@/features/legal/legal-acceptance-page";
import { getStudentDataLaunchStatus, loadLegalAccess } from "@/features/students/server-data";
import { safeInternalPath } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Accept Data Processing Agreement" };
export const dynamic = "force-dynamic";

function destinationFrom(value: string | string[] | undefined) {
  const nextPath = safeInternalPath(Array.isArray(value) ? value[0] : value);
  const pathname = new URL(nextPath, "https://anchora.internal").pathname;
  return pathname === "/legal/accept" || pathname === "/legal/dpa" ? "/students" : nextPath;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const params = await searchParams;
  const nextPath = destinationFrom(params.next);
  if (!getStudentDataLaunchStatus().enabled) redirect(nextPath);

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(`/login?configuration=missing&next=${encodeURIComponent(`/legal/dpa?next=${encodeURIComponent(nextPath)}`)}`);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect(`/login?next=${encodeURIComponent(`/legal/dpa?next=${encodeURIComponent(nextPath)}`)}`);

  const access = await loadLegalAccess();
  if (access.status === "unassigned") redirect("/onboarding");
  if (access.status === "ready") {
    if (!access.data.terms.accepted || !access.data.privacy.accepted) redirect(`/legal/accept?next=${encodeURIComponent(nextPath)}`);
    if (access.data.organizationDpaAccepted) redirect(nextPath);
    return <DpaAcceptancePage documentVersion={access.data.documentVersion} nextPath={nextPath} ownerActionRequired={access.data.ownerActionRequired} />;
  }

  return <LegalAccessUnavailablePage nextPath={nextPath} stage="dpa" />;
}
