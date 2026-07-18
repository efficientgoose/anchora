import { NextResponse, type NextRequest } from "next/server";
import { safeInternalPath } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function loginErrorUrl(request: NextRequest, nextPath: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", "google_oauth");
  url.searchParams.set("next", nextPath);
  return url;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const providerError = request.nextUrl.searchParams.get("error");
  const nextPath = safeInternalPath(request.nextUrl.searchParams.get("next"));

  if (!code || providerError) {
    return NextResponse.redirect(loginErrorUrl(request, nextPath));
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(loginErrorUrl(request, nextPath));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth:google-callback]", { code: error.code ?? "unknown", status: error.status ?? "unknown" });
    return NextResponse.redirect(loginErrorUrl(request, nextPath));
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
