import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginPage } from "@/features/auth/login-page";
import { safeInternalPath } from "@/lib/auth/redirects";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const params = await searchParams;
  const nextPath = safeInternalPath(Array.isArray(params.next) ? params.next[0] : params.next);
  const configured = Boolean(getSupabasePublicConfig());

  if (configured) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase!.auth.getClaims();
    if (data?.claims?.sub) redirect(nextPath);
  }

  return <LoginPage nextPath={nextPath} configurationMissing={!configured} />;
}
