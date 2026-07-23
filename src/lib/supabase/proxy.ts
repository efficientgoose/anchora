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
const REQUEST_PATH_HEADER = "x-anchora-request-path";

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function finalizeResponse(destination: URL | null, pendingCookies: PendingCookie[], pendingHeaders: Record<string, string>, requestHeaders: Headers) {
  const response = destination ? NextResponse.redirect(destination) : NextResponse.next({ request: { headers: requestHeaders } });
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  Object.entries(pendingHeaders).forEach(([name, value]) => response.headers.set(name, value));
  return response;
}

export async function refreshAuthSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_PATH_HEADER, requestedPath(pathname, search));
  const protectedPath = isProtectedPath(pathname);
  const homePath = pathname === "/";
  const loginPath = pathname === "/login";
  const config = getSupabasePublicConfig();

  if (!config) {
    if (!protectedPath) return NextResponse.next({ request: { headers: requestHeaders } });
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
    return finalizeResponse(loginUrl, pendingCookies, pendingHeaders, requestHeaders);
  }

  if (homePath && authenticated) {
    return finalizeResponse(new URL("/students", request.url), pendingCookies, pendingHeaders, requestHeaders);
  }

  if (loginPath && authenticated) {
    const destination = new URL(safeInternalPath(request.nextUrl.searchParams.get("next")), request.url);
    return finalizeResponse(destination, pendingCookies, pendingHeaders, requestHeaders);
  }

  return finalizeResponse(null, pendingCookies, pendingHeaders, requestHeaders);
}
