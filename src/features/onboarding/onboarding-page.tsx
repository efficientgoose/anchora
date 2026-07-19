"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { AuthShell } from "@/features/auth/auth-shell";
import { signOutAction } from "@/features/auth/actions";
import { createOrganizationAction, type CreateOrganizationState } from "./actions";

const initialState: CreateOrganizationState = { status: "idle" };

export function OnboardingPage({ workspaceUnavailable = false }: { workspaceUnavailable?: boolean }) {
  const [state, formAction, pending] = React.useActionState(createOrganizationAction, initialState);

  return (
    <AuthShell
      eyebrow="Consultancy setup"
      title="Name your workspace"
      description="Create the secure home for your consultancy’s students, deadlines, and team."
      footer={
        <form action={signOutAction}>
          <span>Using the wrong account? </span>
          <button type="submit" className="font-semibold text-text-primary underline decoration-border-strong underline-offset-4 hover:decoration-brand-gold">
            Sign out
          </button>
        </form>
      }
    >
      <div className="mb-5 flex items-start gap-3 rounded-card border border-accent-border bg-accent-soft/55 p-4 text-sm leading-[22px] text-brand-gold-strong">
        <Building2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>You will be the owner of this consultancy workspace.</span>
      </div>

      {workspaceUnavailable ? (
        <Notice tone="danger" title="Workspace setup is temporarily unavailable">
          <span>We could not check your consultancy membership. </span>
          <Link href="/onboarding" className="link-hover-gold font-semibold underline underline-offset-4">Try again</Link>
        </Notice>
      ) : (
        <>
          {state.status === "error" && state.message && <Notice tone="danger" className="mb-5" role="alert">{state.message}</Notice>}
          <form action={formAction}>
            <FormField label="Consultancy name" required error={state.fieldErrors?.consultancyName}>
              <Input
                name="consultancyName"
                type="text"
                placeholder="e.g. Northstar Education"
                required
                minLength={2}
                maxLength={100}
                autoComplete="organization"
                disabled={pending}
              />
            </FormField>
            <Button className="mt-6 w-full" size="lg" disabled={pending}>
              {pending ? "Creating workspace…" : <>Create workspace <ArrowRight /></>}
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
