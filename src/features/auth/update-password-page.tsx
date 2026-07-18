"use client";

import * as React from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import type { PasswordSetupFlow } from "@/lib/auth/flow";
import { AuthShell } from "./auth-shell";
import { updatePasswordAction, type UpdatePasswordState } from "./actions";

const initialState: UpdatePasswordState = { status: "idle" };

export function UpdatePasswordPage({ flow }: { flow: PasswordSetupFlow }) {
  const [state, formAction, pending] = React.useActionState(updatePasswordAction, initialState);
  const invited = flow === "invite";

  return (
    <AuthShell eyebrow={invited ? "Anchora invitation" : "Password recovery"} title={invited ? "Secure your account" : "Choose a new password"} description={invited ? "Your invitation is verified. Create a password to finish setting up your Anchora workspace." : "Your recovery link is verified. Choose a new password for your Anchora account."}>
      <div className="mb-5 flex items-start gap-3 rounded-card border border-accent-border bg-accent-soft/55 p-4 text-sm leading-[22px] text-brand-gold-strong">
        <KeyRound aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>This secure setup window stays open for 30 minutes.</span>
      </div>
      {state.status === "error" && state.message && <Notice tone="danger" className="mb-5" role="alert">{state.message}</Notice>}
      <form action={formAction}>
        <div className="space-y-5">
          <FormField label="New password" required hint="Use at least 8 characters." error={state.fieldErrors?.password}><Input name="password" type="password" placeholder="Create a new password" required minLength={8} autoComplete="new-password" disabled={pending} /></FormField>
          <FormField label="Confirm new password" required error={state.fieldErrors?.confirmPassword}><Input name="confirmPassword" type="password" placeholder="Repeat your new password" required minLength={8} autoComplete="new-password" disabled={pending} /></FormField>
        </div>
        <Button className="mt-6 w-full" size="lg" disabled={pending}>{pending ? "Saving password…" : <>Save password <ArrowRight /></>}</Button>
      </form>
    </AuthShell>
  );
}
