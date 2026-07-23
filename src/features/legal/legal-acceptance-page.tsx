"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileCheck2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { AuthShell } from "@/features/auth/auth-shell";
import {
  acceptLegalDocumentsAction,
  acceptOrganizationDpaAction,
  type LegalActionState,
} from "./actions";

const initialState: LegalActionState = { status: "idle" };

function CheckboxRow({ children, disabled, id, name }: { children: React.ReactNode; disabled: boolean; id: string; name: string }) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-border-default bg-surface px-3.5 py-3">
      <input id={id} name={name} type="checkbox" required disabled={disabled} className="mt-0.5 size-4 shrink-0 rounded border-border-strong accent-brand-ink" />
      <label htmlFor={id} className="text-[13px] leading-5 text-text-secondary">{children}</label>
    </div>
  );
}

function FormStatus({ status }: { status: LegalActionState["status"] }) {
  if (status === "validation_error") return <Notice tone="danger" className="mb-5" role="alert">Select every required checkbox before continuing.</Notice>;
  if (status === "access_denied") return <Notice tone="danger" className="mb-5" role="alert">We could not verify your workspace access. Sign in again and try once more.</Notice>;
  if (status === "error") return <Notice tone="danger" className="mb-5" role="alert">We could not save your acceptance. Please try again.</Notice>;
  if (status === "disabled") return <Notice tone="info" className="mb-5">Student data is not enabled in this environment.</Notice>;
  return null;
}

function useCompletionRedirect(status: LegalActionState["status"], destination: string) {
  const router = useRouter();
  React.useEffect(() => {
    if (status === "success" || status === "disabled") router.replace(destination);
  }, [destination, router, status]);
}

export function IndividualLegalAcceptancePage({ documentVersion, nextPath }: { documentVersion: string; nextPath: string }) {
  const [state, formAction, pending] = React.useActionState(acceptLegalDocumentsAction, initialState);
  useCompletionRedirect(state.status, nextPath);

  return (
    <AuthShell
      eyebrow="Required before student data"
      title="Review the operating terms"
      description="Every workspace user accepts the Terms of Use and acknowledges the Privacy Policy before working with limited student information."
      footer={<span>Need the organization agreement? The workspace owner completes the <Link href={`/legal/dpa?next=${encodeURIComponent(nextPath)}`} className="link-hover-gold font-semibold text-text-primary underline decoration-border-strong underline-offset-4">DPA acceptance</Link>.</span>}
    >
      <div className="mb-5 flex items-start gap-3 rounded-card border border-accent-border bg-accent-soft/55 p-4 text-sm leading-[22px] text-brand-gold-strong">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>Student data is limited to adult India-to-Germany applicant planning. Do not enter documents or unrelated sensitive information.</span>
      </div>
      <FormStatus status={state.status} />
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="documentVersion" value={documentVersion} />
        <CheckboxRow id="accept-terms" name="acceptTerms" disabled={pending}>
          I have read and accept the <Link href="/terms" target="_blank" className="link-hover-gold font-semibold text-text-primary underline decoration-border-strong underline-offset-4">Terms of Use</Link>.
        </CheckboxRow>
        <CheckboxRow id="acknowledge-privacy" name="acknowledgePrivacy" disabled={pending}>
          I have read and acknowledge the <Link href="/privacy" target="_blank" className="link-hover-gold font-semibold text-text-primary underline decoration-border-strong underline-offset-4">Privacy Policy</Link>.
        </CheckboxRow>
        <Button className="mt-3 w-full" size="lg" disabled={pending}>{pending ? "Saving acceptance…" : <>Continue <ArrowRight /></>}</Button>
      </form>
    </AuthShell>
  );
}

export function DpaAcceptancePage({ documentVersion, nextPath, ownerActionRequired }: { documentVersion: string; nextPath: string; ownerActionRequired: boolean }) {
  const [state, formAction, pending] = React.useActionState(acceptOrganizationDpaAction, initialState);
  useCompletionRedirect(state.status, nextPath);

  return (
    <AuthShell
      eyebrow="Organization agreement"
      title={ownerActionRequired ? "Owner action required" : "Accept the DPA for your consultancy"}
      description={ownerActionRequired ? "The workspace owner must accept the Data Processing Agreement before anyone can access student content." : "As the workspace owner, confirm that you can bind your consultancy to the Data Processing Agreement."}
      footer={<span>Read the full <Link href="/dpa" target="_blank" className="link-hover-gold font-semibold text-text-primary underline decoration-border-strong underline-offset-4">Data Processing Agreement</Link>.</span>}
    >
      {ownerActionRequired ? (
        <Notice tone="warning" title="Student content remains unavailable">
          Ask the workspace owner to sign in and accept the DPA. You can return to your work after the owner completes this step.
        </Notice>
      ) : (
        <>
          <div className="mb-5 flex items-start gap-3 rounded-card border border-accent-border bg-accent-soft/55 p-4 text-sm leading-[22px] text-brand-gold-strong">
            <FileCheck2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>The consultancy remains responsible for its authority, notices, and instructions for every student record it asks Anchora to process.</span>
          </div>
          <FormStatus status={state.status} />
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="documentVersion" value={documentVersion} />
            <CheckboxRow id="accept-dpa-authority" name="acceptDpaAuthority" disabled={pending}>
              I have read and accept the <Link href="/dpa" target="_blank" className="link-hover-gold font-semibold text-text-primary underline decoration-border-strong underline-offset-4">Data Processing Agreement</Link>, and I am authorized to bind this consultancy to it.
            </CheckboxRow>
            <Button className="mt-3 w-full" size="lg" disabled={pending}>{pending ? "Saving agreement…" : <>Accept DPA and continue <ArrowRight /></>}</Button>
          </form>
        </>
      )}
      {ownerActionRequired && <div className="mt-5 flex items-start gap-3 rounded-card border border-border-default bg-surface-muted/50 p-4 text-sm leading-6 text-text-secondary"><ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-text-muted" />No student profiles, names, or journey details are shown until this agreement is complete.</div>}
    </AuthShell>
  );
}

export function LegalAccessUnavailablePage({ nextPath, stage }: { nextPath: string; stage: "individual" | "dpa" }) {
  const retryPath = stage === "individual" ? `/legal/accept?next=${encodeURIComponent(nextPath)}` : `/legal/dpa?next=${encodeURIComponent(nextPath)}`;

  return (
    <AuthShell
      eyebrow="Student data remains protected"
      title="We can’t verify the legal access status"
      description="No student content is available until Anchora can confirm the required legal agreements for this workspace."
      footer={<span>You can review the <Link href={stage === "individual" ? "/terms" : "/dpa"} className="link-hover-gold font-semibold text-text-primary underline decoration-border-strong underline-offset-4">{stage === "individual" ? "Terms of Use" : "Data Processing Agreement"}</Link> while this is resolved.</span>}
    >
      <Notice tone="warning" title="Acceptance is unavailable">
        Please try again. If this continues, contact hello@tryanchora.com. No acceptance was recorded.
      </Notice>
      <Link href={retryPath} className="link-hover-gold mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-text-primary underline decoration-border-strong underline-offset-4">
        Try again <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </AuthShell>
  );
}
