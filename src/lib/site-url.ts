const PRODUCTION_SITE_URL = "https://tryanchora.com";
const DEVELOPMENT_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fallbackUrl = process.env.NODE_ENV === "production" ? PRODUCTION_SITE_URL : DEVELOPMENT_SITE_URL;

  if (!configuredUrl) return fallbackUrl;

  try {
    const parsedUrl = new URL(configuredUrl);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") return fallbackUrl;
    return parsedUrl.origin;
  } catch {
    return fallbackUrl;
  }
}

export function getAuthConfirmationUrl() {
  return new URL("/auth/confirm", getSiteUrl()).toString();
}

export function getAuthCallbackUrl(nextPath: string) {
  const callbackUrl = new URL("/auth/callback", getSiteUrl());
  callbackUrl.searchParams.set("next", nextPath);
  return callbackUrl.toString();
}
