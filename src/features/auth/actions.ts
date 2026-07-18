"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { safeInternalPath } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid work email."),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

export interface SignInState {
  status: "idle" | "error";
  message?: string;
  email?: string;
  fieldErrors?: { email?: string; password?: string };
}

function messageForAuthError(error: { status?: number; code?: string }) {
  if (error.status === 429 || error.code === "over_request_rate_limit") return "Too many sign-in attempts. Wait a few minutes and try again.";
  if ((error.status ?? 0) >= 500 || error.code === "unexpected_failure") return "Sign-in is temporarily unavailable. Try again shortly.";
  return "Email or password is incorrect.";
}

export async function signInAction(_previousState: SignInState, formData: FormData): Promise<SignInState> {
  const requestedDestination = formData.get("next");
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: typeof requestedDestination === "string" ? requestedDestination : undefined,
  });

  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors;
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      email: typeof formData.get("email") === "string" ? String(formData.get("email")) : undefined,
      fieldErrors: { email: errors.email?.[0], password: errors.password?.[0] },
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Sign-in is not configured for this environment.", email: parsed.data.email };

  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) return { status: "error", message: messageForAuthError(error), email: parsed.data.email };

  redirect(safeInternalPath(parsed.data.next));
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
