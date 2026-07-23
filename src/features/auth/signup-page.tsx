"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { AuthShell } from "./auth-shell";
import { signUpAction, type SignUpState } from "./actions";
import { ConfirmationPending } from "./confirmation-pending";
import { GoogleAuthButton } from "./google-auth-button";
import { PasswordFields } from "./password-fields";

const initialState: SignUpState = { status: "idle" };

export function SignupPage({ configurationMissing = false, invalidLink = false }: { configurationMissing?: boolean; invalidLink?: boolean }) {
  const [state, formAction, pending] = React.useActionState(signUpAction, initialState);
  const [passwordsValid, setPasswordsValid] = React.useState(false);

  if (state.status === "success" && state.email) {
    return (
      <AuthShell eyebrow="Secure your workspace" title="One more step" description="Confirm your email before Anchora opens the student workspace." footer={<>Need to use a different address? <a href="/signup" className="link-hover-gold font-semibold text-text-primary underline decoration-border-strong underline-offset-4">Start again</a></>}>
        <ConfirmationPending email={state.email} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Start with Anchora"
      title="Create your workspace"
      description="Start with a blank consultancy workspace, then add each student through the protected onboarding flow."
      footer={<>Already have an account? <Link href="/login" className="link-hover-gold font-semibold text-text-primary underline decoration-border-strong underline-offset-4">Sign in</Link></>}
    >
      {configurationMissing && <Notice tone="warning" className="mb-5" title="Signup is not configured">Add the Supabase environment settings before creating an account.</Notice>}
      {invalidLink && <Notice tone="warning" className="mb-5" title="That confirmation link has expired">Enter your details again or resend confirmation from the sign-in page.</Notice>}
      {state.status === "error" && state.message && <Notice tone="danger" className="mb-5" role="alert">{state.message}</Notice>}

      <GoogleAuthButton disabled={configurationMissing} />

      <form action={formAction}>
        <div className="space-y-4">
          <FormField label="Full name" required error={state.fieldErrors?.fullName}><Input name="fullName" type="text" placeholder="Your full name" required autoComplete="name" defaultValue={state.fullName} disabled={pending || configurationMissing} /></FormField>
          <FormField label="Email address" required error={state.fieldErrors?.email}><Input name="email" type="email" placeholder="you@consultancy.com" required autoComplete="email" defaultValue={state.email} disabled={pending || configurationMissing} /></FormField>
          <PasswordFields
            passwordError={state.fieldErrors?.password}
            confirmPasswordError={state.fieldErrors?.confirmPassword}
            disabled={pending || configurationMissing}
            onValidityChange={setPasswordsValid}
          />
        </div>
        <Button className="mt-6 w-full" size="lg" disabled={pending || configurationMissing || !passwordsValid}>{pending ? "Creating account…" : <>Create account <ArrowRight /></>}</Button>
        <p className="mt-4 text-center text-xs leading-5 text-text-muted">We will email you a secure confirmation link before your blank workspace opens.</p>
      </form>
    </AuthShell>
  );
}
