import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_FLOW_COOKIE, AUTH_FLOW_COOKIE_MAX_AGE, isPasswordSetupFlow } from "@/lib/auth/flow";
import { safeInternalPath } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const supportedEmailTypes = ["signup", "invite", "magiclink", "recovery", "email_change", "email", "reauthentication"] as const;
type SupportedEmailType = (typeof supportedEmailTypes)[number];

function isSupportedEmailType(value: string | null): value is SupportedEmailType {
  return Boolean(value && supportedEmailTypes.includes(value as SupportedEmailType));
}

function errorDestination(request: NextRequest, type: string | null) {
  if (type === "recovery") return new URL("/forgot-password?error=invalid_link", request.url);
  if (type === "signup") return new URL("/signup?error=invalid_link", request.url);
  if (type === "invite") return new URL("/login?error=invalid_invitation", request.url);
  return new URL("/login?error=invalid_link", request.url);
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const nextPath = safeInternalPath(request.nextUrl.searchParams.get("next"));

  if (!tokenHash || !isSupportedEmailType(type)) return NextResponse.redirect(errorDestination(request, type));

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.redirect(new URL("/login?configuration=missing", request.url));

  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) return NextResponse.redirect(errorDestination(request, type));

  if (type === "invite") {
    const { data: acceptance, error: acceptanceError } = await supabase.rpc("accept_consultant_invitation");
    if (acceptanceError || !Array.isArray(acceptance) || acceptance.length !== 1) {
      console.error("[auth:accept-invitation]", { code: acceptanceError?.code ?? "unexpected_result" });
      await supabase.auth.signOut({ scope: "local" });
      return NextResponse.redirect(errorDestination(request, type));
    }
  }

  if (isPasswordSetupFlow(type)) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_FLOW_COOKIE, type, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: AUTH_FLOW_COOKIE_MAX_AGE,
    });
    return NextResponse.redirect(new URL("/update-password", request.url));
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
