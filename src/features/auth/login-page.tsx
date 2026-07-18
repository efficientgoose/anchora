"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { AuthShell } from "./auth-shell";
import { signInAction, type SignInState } from "./actions";
import { GoogleAuthButton } from "./google-auth-button";
import { ResendConfirmationForm } from "./resend-confirmation-form";

const initialSignInState: SignInState = { status: "idle" };

export function LoginPage({ nextPath, configurationMissing = false, invalidLink = false, googleAuthError = false }: { nextPath: string; configurationMissing?: boolean; invalidLink?: boolean; googleAuthError?: boolean }) {
  const [state, formAction, pending] = React.useActionState(signInAction, initialSignInState);

  return (
    <AuthShell
      eyebrow="Consultant workspace"
      title="Welcome back"
      description="Sign in to see every active student journey and the work that needs attention next."
      footer={<>New to Anchora? <Link href="/signup" className="font-semibold text-text-primary underline decoration-border-strong underline-offset-4 hover:decoration-brand-gold">Create an account</Link></>}
    >
      {configurationMissing && <Notice tone="warning" className="mb-5" title="Sign-in is not configured">Add the Supabase environment settings before using this workspace.</Notice>}
      {invalidLink && <Notice tone="warning" className="mb-5" title="That link has expired">Sign in if your account is ready, or ask for a fresh invitation.</Notice>}
      {googleAuthError && <Notice tone="warning" className="mb-5" title="Google sign-in did not finish">Try again, or continue with your email and password.</Notice>}
      {state.status === "error" && state.message && <Notice key={state.message} tone="danger" className="mb-5" role="alert">{state.message}</Notice>}
      {state.status === "unconfirmed" && state.message && (
        <div className="mb-5 space-y-4">
          <Notice tone="warning" title="Email confirmation needed">{state.message}</Notice>
          {state.email && <ResendConfirmationForm email={state.email} disabled={configurationMissing} />}
        </div>
      )}

      <GoogleAuthButton nextPath={nextPath} disabled={configurationMissing} />

      <form action={formAction}>
        <input type="hidden" name="next" value={nextPath} />
        <div className="space-y-5">
          <FormField label="Email address" required error={state.fieldErrors?.email}>
            <Input name="email" type="email" placeholder="you@consultancy.com" required autoComplete="username" defaultValue={state.email} disabled={pending || configurationMissing} />
          </FormField>
          <div>
            <FormField label="Password" required error={state.fieldErrors?.password}>
              <Input name="password" type="password" placeholder="••••••••" required autoComplete="current-password" disabled={pending || configurationMissing} />
            </FormField>
            <div className="mt-2 text-right"><Link href="/forgot-password" className="text-xs font-semibold text-text-secondary underline decoration-border-strong underline-offset-4 hover:text-text-primary hover:decoration-brand-gold">Forgot password?</Link></div>
          </div>
        </div>
        <Button className="mt-6 w-full" size="lg" disabled={pending || configurationMissing}>{pending ? "Signing in…" : <>Sign in <ArrowRight /></>}</Button>
      </form>
    </AuthShell>
  );
}
