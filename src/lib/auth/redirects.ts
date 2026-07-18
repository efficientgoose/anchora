const DEFAULT_AUTHENTICATED_PATH = "/students";

export function safeInternalPath(value: unknown, fallback = DEFAULT_AUTHENTICATED_PATH) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;

  try {
    const base = new URL("https://anchora.internal");
    const destination = new URL(value, base);
    if (destination.origin !== base.origin || destination.pathname === "/login" || destination.pathname.startsWith("/login/")) return fallback;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}

export function requestedPath(pathname: string, search: string) {
  return `${pathname}${search}`;
}
