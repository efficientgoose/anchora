import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UpdatePasswordPage } from "@/features/auth/update-password-page";
import { AUTH_FLOW_COOKIE, isPasswordSetupFlow } from "@/lib/auth/flow";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Choose a password" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const cookieStore = await cookies();
  const flow = cookieStore.get(AUTH_FLOW_COOKIE)?.value;
  if (!isPasswordSetupFlow(flow)) redirect("/forgot-password?error=invalid_link");

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?configuration=missing");

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect(flow === "recovery" ? "/forgot-password?error=invalid_link" : "/login?error=invalid_link");

  return <UpdatePasswordPage flow={flow} />;
}
