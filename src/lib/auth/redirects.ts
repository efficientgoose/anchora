const DEFAULT_AUTHENTICATED_PATH = "/students";
const PUBLIC_AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/update-password", "/auth/confirm", "/auth/callback"];

function isPublicAuthPath(pathname: string) {
  return PUBLIC_AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function safeInternalPath(value: unknown, fallback = DEFAULT_AUTHENTICATED_PATH) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;

  try {
    const base = new URL("https://anchora.internal");
    const destination = new URL(value, base);
    if (destination.origin !== base.origin || isPublicAuthPath(destination.pathname)) return fallback;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}

export function requestedPath(pathname: string, search: string) {
  return `${pathname}${search}`;
}
