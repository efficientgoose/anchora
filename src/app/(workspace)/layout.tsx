import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?configuration=missing");

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");

  const metadata = data.user.user_metadata as { full_name?: unknown; name?: unknown; title?: unknown };
  const email = data.user.email ?? "Workspace member";
  const name = typeof metadata.full_name === "string" ? metadata.full_name : typeof metadata.name === "string" ? metadata.name : email.split("@")[0];
  const title = typeof metadata.title === "string" ? metadata.title : "Workspace member";

  return <AppShell actor={{ name, email, title }}>{children}</AppShell>;
}
