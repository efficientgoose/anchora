import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotPasswordPage } from "@/features/auth/forgot-password-page";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Reset password" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const configured = Boolean(getSupabasePublicConfig());

  if (configured) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase!.auth.getClaims();
    if (data?.claims?.sub) redirect("/students");
  }

  return <ForgotPasswordPage configurationMissing={!configured} invalidLink={error === "invalid_link"} />;
}
