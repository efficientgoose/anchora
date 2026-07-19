"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { AuthShell } from "./auth-shell";
import { requestPasswordResetAction, type EmailActionState } from "./actions";

const initialState: EmailActionState = { status: "idle" };

export function ForgotPasswordPage({ configurationMissing = false, invalidLink = false }: { configurationMissing?: boolean; invalidLink?: boolean }) {
  const [state, formAction, pending] = React.useActionState(requestPasswordResetAction, initialState);

  if (state.status === "success") {
    return (
      <AuthShell eyebrow="Password recovery" title="Check your inbox" description="For your privacy, Anchora shows the same response whether or not an account exists." footer={<Link href="/login" className="link-hover-gold inline-flex items-center gap-1.5 font-semibold text-text-primary underline decoration-border-strong underline-offset-4"><ArrowLeft aria-hidden="true" className="size-3.5" /> Back to sign in</Link>}>
        <div className="rounded-panel border border-success-border bg-success-soft p-5">
          <span className="flex size-11 items-center justify-center rounded-full bg-status-success text-white"><MailCheck aria-hidden="true" className="size-5" /></span>
          <h2 className="mt-4 text-base font-semibold text-status-success">Recovery request received</h2>
          <p className="mt-1.5 text-sm leading-[22px] text-text-secondary">{state.message}</p>
        </div>
        <Button asChild variant="secondary" className="mt-5 w-full"><a href="/forgot-password">Try another email</a></Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="Password recovery" title="Reset your password" description="Enter your account email and we will send you a secure link to choose a new password." footer={<Link href="/login" className="link-hover-gold inline-flex items-center gap-1.5 font-semibold text-text-primary underline decoration-border-strong underline-offset-4"><ArrowLeft aria-hidden="true" className="size-3.5" /> Back to sign in</Link>}>
      {configurationMissing && <Notice tone="warning" className="mb-5">Password recovery is not configured for this environment.</Notice>}
      {invalidLink && <Notice tone="warning" className="mb-5" title="That recovery link has expired">Request a fresh link below.</Notice>}
      {state.status === "error" && state.message && <Notice tone="danger" className="mb-5" role="alert">{state.message}</Notice>}
      <form action={formAction}>
        <FormField label="Email address" required error={state.fieldErrors?.email}><Input name="email" type="email" placeholder="you@consultancy.com" required autoComplete="email" defaultValue={state.email} disabled={pending || configurationMissing} /></FormField>
        <Button className="mt-6 w-full" size="lg" disabled={pending || configurationMissing}>{pending ? "Sending link…" : <>Send reset link <ArrowRight /></>}</Button>
      </form>
    </AuthShell>
  );
}
