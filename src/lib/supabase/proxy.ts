import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { requestedPath, safeInternalPath } from "@/lib/auth/redirects";
import { getSupabasePublicConfig } from "./config";

interface PendingCookie {
  name: string;
  value: string;
  options: CookieOptions;
}

const protectedPrefixes = ["/students", "/intakes", "/team", "/onboarding"];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function finalizeResponse(request: NextRequest, destination: URL | null, pendingCookies: PendingCookie[], pendingHeaders: Record<string, string>) {
  const response = destination ? NextResponse.redirect(destination) : NextResponse.next({ request });
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  Object.entries(pendingHeaders).forEach(([name, value]) => response.headers.set(name, value));
  return response;
}

export async function refreshAuthSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const protectedPath = isProtectedPath(pathname);
  const loginPath = pathname === "/login";
  const config = getSupabasePublicConfig();

  if (!config) {
    if (!protectedPath) return NextResponse.next({ request });
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("configuration", "missing");
    loginUrl.searchParams.set("next", requestedPath(pathname, search));
    return NextResponse.redirect(loginUrl);
  }

  let pendingCookies: PendingCookie[] = [];
  let pendingHeaders: Record<string, string> = {};
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        pendingCookies = cookiesToSet;
        pendingHeaders = headers;
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const authenticated = !error && Boolean(data?.claims?.sub);

  if (protectedPath && !authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", requestedPath(pathname, search));
    return finalizeResponse(request, loginUrl, pendingCookies, pendingHeaders);
  }

  if (loginPath && authenticated) {
    const destination = new URL(safeInternalPath(request.nextUrl.searchParams.get("next")), request.url);
    return finalizeResponse(request, destination, pendingCookies, pendingHeaders);
  }

  return finalizeResponse(request, null, pendingCookies, pendingHeaders);
}
