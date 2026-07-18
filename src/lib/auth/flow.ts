export const AUTH_FLOW_COOKIE = "anchora-auth-flow";
export const AUTH_FLOW_COOKIE_MAX_AGE = 30 * 60;

export type PasswordSetupFlow = "invite" | "recovery";

export function isPasswordSetupFlow(value: unknown): value is PasswordSetupFlow {
  return value === "invite" || value === "recovery";
}
