"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AUTH_FLOW_COOKIE } from "@/lib/auth/flow";
import { safeInternalPath } from "@/lib/auth/redirects";
import { getAuthCallbackUrl, getAuthConfirmationUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface AuthErrorLike {
  status?: number;
  code?: string;
}

type FieldErrors = Record<string, string | undefined>;

export interface SignInState {
  status: "idle" | "error" | "unconfirmed";
  message?: string;
  email?: string;
  fieldErrors?: { email?: string; password?: string };
}

export interface SignUpState {
  status: "idle" | "error" | "success";
  message?: string;
  email?: string;
  fullName?: string;
  fieldErrors?: { fullName?: string; email?: string; password?: string; confirmPassword?: string };
}

export interface EmailActionState {
  status: "idle" | "error" | "success";
  message?: string;
  email?: string;
  fieldErrors?: { email?: string };
}

export interface UpdatePasswordState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: { password?: string; confirmPassword?: string };
}

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(100, "Keep your name under 100 characters."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match." });
    }
  });

const emailSchema = z.object({ email: z.string().trim().email("Enter a valid email address.") });

const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match." });
    }
  });

function firstErrors(error: z.ZodError): FieldErrors {
  const errors = z.flattenError(error).fieldErrors;
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [field, Array.isArray(messages) && typeof messages[0] === "string" ? messages[0] : undefined]),
  );
}

function configurationError() {
  return "Authentication is not configured for this environment.";
}

function isRateLimited(error: AuthErrorLike) {
  return error.status === 429 || error.code === "over_request_rate_limit" || error.code === "over_email_send_rate_limit";
}

function isEmailDeliveryError(error: AuthErrorLike) {
  return error.code === "hook_timeout" || error.code === "hook_timeout_after_retry" || error.code === "unexpected_failure" || (error.status ?? 0) >= 500;
}

function logAuthFailure(operation: string, error: AuthErrorLike) {
  console.error(`[auth:${operation}]`, { code: error.code ?? "unknown", status: error.status ?? "unknown" });
}

function signInMessage(error: AuthErrorLike) {
  if (isRateLimited(error)) return "Too many sign-in attempts. Wait a few minutes and try again.";
  if (isEmailDeliveryError(error)) return "Sign-in is temporarily unavailable. Try again shortly.";
  return "Email or password is incorrect.";
}

function emailSendMessage(error: AuthErrorLike) {
  if (isRateLimited(error)) return "Please wait a minute before requesting another email.";
  return "We could not send that email right now. Try again shortly.";
}

export async function signInAction(_previousState: SignInState, formData: FormData): Promise<SignInState> {
  const requestedDestination = formData.get("next");
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: typeof requestedDestination === "string" ? requestedDestination : undefined,
  });

  if (!parsed.success) {
    const errors = firstErrors(parsed.error);
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      email: typeof formData.get("email") === "string" ? String(formData.get("email")) : undefined,
      fieldErrors: { email: errors.email, password: errors.password },
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: configurationError(), email: parsed.data.email };

  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error?.code === "email_not_confirmed") {
    return {
      status: "unconfirmed",
      message: "Confirm your email before signing in. We can send you a fresh link below.",
      email: parsed.data.email,
    };
  }
  if (error) {
    if (isEmailDeliveryError(error)) logAuthFailure("sign-in", error);
    return { status: "error", message: signInMessage(error), email: parsed.data.email };
  }

  redirect(safeInternalPath(parsed.data.next));
}

export async function signInWithGoogleAction(formData: FormData) {
  const requestedDestination = formData.get("next");
  const nextPath = safeInternalPath(typeof requestedDestination === "string" ? requestedDestination : undefined);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(`/login?error=configuration&next=${encodeURIComponent(nextPath)}`);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthCallbackUrl(nextPath),
      scopes: "openid",
    },
  });

  if (error || !data.url) {
    if (error) logAuthFailure("google-sign-in", error);
    redirect(`/login?error=google_oauth&next=${encodeURIComponent(nextPath)}`);
  }

  redirect(data.url);
}

export async function signUpAction(_previousState: SignUpState, formData: FormData): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const errors = firstErrors(parsed.error);
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fullName: typeof formData.get("fullName") === "string" ? String(formData.get("fullName")) : undefined,
      email: typeof formData.get("email") === "string" ? String(formData.get("email")) : undefined,
      fieldErrors: {
        fullName: errors.fullName,
        email: errors.email,
        password: errors.password,
        confirmPassword: errors.confirmPassword,
      },
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: configurationError(), email: parsed.data.email, fullName: parsed.data.fullName };

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: getAuthConfirmationUrl(),
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { status: "success", email: parsed.data.email, fullName: parsed.data.fullName };
    }
    if (isEmailDeliveryError(error)) logAuthFailure("sign-up", error);
    const message = error.code === "signup_disabled" ? "New accounts are temporarily unavailable." : error.code === "weak_password" ? "Choose a stronger password with at least 8 characters." : emailSendMessage(error);
    return { status: "error", message, email: parsed.data.email, fullName: parsed.data.fullName };
  }

  if (data.session) {
    await supabase.auth.signOut({ scope: "local" });
    logAuthFailure("sign-up-confirmation-disabled", { code: "confirmation_disabled" });
    return {
      status: "error",
      message: "New accounts are temporarily unavailable while email confirmation is being configured.",
      email: parsed.data.email,
      fullName: parsed.data.fullName,
    };
  }

  return { status: "success", email: parsed.data.email, fullName: parsed.data.fullName };
}

export async function resendConfirmationAction(_previousState: EmailActionState, formData: FormData): Promise<EmailActionState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    const errors = firstErrors(parsed.error);
    return { status: "error", message: "Enter the email address you signed up with.", fieldErrors: { email: errors.email } };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: configurationError(), email: parsed.data.email };

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: getAuthConfirmationUrl() },
  });

  if (error && isRateLimited(error)) return { status: "error", message: emailSendMessage(error), email: parsed.data.email };
  if (error && isEmailDeliveryError(error)) {
    logAuthFailure("resend-confirmation", error);
    return { status: "error", message: emailSendMessage(error), email: parsed.data.email };
  }

  return {
    status: "success",
    message: "If that address has a pending Anchora account, a fresh confirmation link is on its way.",
    email: parsed.data.email,
  };
}

export async function requestPasswordResetAction(_previousState: EmailActionState, formData: FormData): Promise<EmailActionState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    const errors = firstErrors(parsed.error);
    return {
      status: "error",
      message: "Check the highlighted field and try again.",
      email: typeof formData.get("email") === "string" ? String(formData.get("email")) : undefined,
      fieldErrors: { email: errors.email },
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: configurationError(), email: parsed.data.email };

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: getAuthConfirmationUrl() });
  if (error && isRateLimited(error)) return { status: "error", message: emailSendMessage(error), email: parsed.data.email };
  if (error && isEmailDeliveryError(error)) {
    logAuthFailure("password-recovery", error);
    return { status: "error", message: emailSendMessage(error), email: parsed.data.email };
  }

  return {
    status: "success",
    message: "If an Anchora account exists for that address, a password reset link is on its way.",
    email: parsed.data.email,
  };
}

export async function updatePasswordAction(_previousState: UpdatePasswordState, formData: FormData): Promise<UpdatePasswordState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const errors = firstErrors(parsed.error);
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: { password: errors.password, confirmPassword: errors.confirmPassword },
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: configurationError() };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { status: "error", message: "This password link is no longer valid. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    const message = error.code === "same_password" ? "Choose a password you have not used for this account." : error.code === "weak_password" ? "Choose a stronger password with at least 8 characters." : "We could not update your password. Request a new link and try again.";
    if (isEmailDeliveryError(error)) logAuthFailure("update-password", error);
    return { status: "error", message };
  }

  const cookieStore = await cookies();
  cookieStore.delete(AUTH_FLOW_COOKIE);
  redirect("/students");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut({ scope: "local" });
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_FLOW_COOKIE);
  redirect("/login");
}
