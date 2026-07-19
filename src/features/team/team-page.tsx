"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { CalendarDays, MailPlus, RefreshCw, ShieldCheck, UserRoundCheck, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/patterns/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { initials } from "@/domain/student-calculations";
import { inviteConsultantAction, resendConsultantInvitationAction, type InviteConsultantState, type ResendInvitationState } from "./actions";
import type { TeamDirectory, TeamInvitation, TeamMember } from "./types";

const initialInviteState: InviteConsultantState = { status: "idle" };
const initialResendState: ResendInvitationState = { status: "idle" };

const roleLabels = { owner: "Owner", admin: "Admin", consultant: "Consultant" } as const;

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

function InviteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" size="lg" disabled={pending}>
      {pending ? "Sending invitation…" : <><MailPlus /> Send invitation</>}
    </Button>
  );
}

function ResendSubmitButton({ availableAt }: { availableAt: string }) {
  const { pending } = useFormStatus();
  const [secondsRemaining, setSecondsRemaining] = React.useState<number | null>(null);

  React.useEffect(() => {
    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((new Date(availableAt).getTime() - Date.now()) / 1000));
      setSecondsRemaining(remaining);
    };
    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [availableAt]);

  const coolingDown = secondsRemaining === null || secondsRemaining > 0;
  return (
    <Button type="submit" variant="ghost" size="sm" disabled={pending || coolingDown} className="justify-self-start px-2 sm:justify-self-end">
      <RefreshCw className={pending ? "animate-spin" : undefined} />
      {pending ? "Sending…" : secondsRemaining && secondsRemaining > 0 ? `Resend in ${secondsRemaining}s` : "Resend"}
    </Button>
  );
}

function InviteConsultantCard() {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [state, formAction] = React.useActionState(inviteConsultantAction, initialInviteState);

  React.useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <Card className="overflow-hidden border-brand-ink shadow-popover">
      <div className="h-1 bg-brand-gold" />
      <CardHeader className="bg-surface-inverse text-text-inverse">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.08em] text-brand-gold">
              <ShieldCheck aria-hidden="true" className="size-3.5" /> Owner control
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-[-.02em]">Invite a consultant</h2>
            <p className="mt-1 text-xs leading-5 text-slate-300">Give a teammate access to this consultancy.</p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-brand-gold">
            <MailPlus aria-hidden="true" className="size-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {state.message && (
          <Notice tone={state.status === "success" ? "success" : "danger"} className="mb-5" role={state.status === "error" ? "alert" : "status"}>
            {state.message}
          </Notice>
        )}

        <form ref={formRef} action={formAction} className="space-y-5">
          <FormField label="Full name" required error={state.fieldErrors?.fullName}>
            <Input name="fullName" autoComplete="name" placeholder="e.g. Maya Patel" defaultValue={state.status === "error" ? state.fullName : undefined} required />
          </FormField>
          <FormField label="Work email" required error={state.fieldErrors?.email}>
            <Input name="email" type="email" autoComplete="email" placeholder="maya@consultancy.com" defaultValue={state.status === "error" ? state.email : undefined} required />
          </FormField>
          <FormField label="Workspace role" hint="Role changes will be added in a later checkpoint.">
            <Input value="Consultant" readOnly aria-readonly="true" className="bg-surface-muted font-medium text-text-secondary" />
          </FormField>
          <InviteSubmitButton />
        </form>

        <div className="mt-5 border-t border-border-subtle pt-4 text-xs leading-5 text-text-muted">
          <div className="flex gap-2"><CalendarDays aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-gold-strong" /><span>Secure links remain valid for 24 hours.</span></div>
          <div className="mt-2 flex gap-2"><ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-gold-strong" /><span>Up to 5 invitation emails per consultancy in 24 hours.</span></div>
        </div>
      </CardContent>
    </Card>
  );
}

function MemberRow({ member }: { member: TeamMember }) {
  return (
    <div role="row" className="grid grid-cols-[minmax(220px,1.6fr)_130px_130px_92px] items-center gap-4 border-b border-border-subtle px-5 py-3.5 last:border-b-0">
      <div role="cell" className="flex min-w-0 items-center gap-3">
        <Avatar initials={initials(member.fullName)} className="size-8 text-[11px]" />
        <div className="min-w-0"><div className="truncate text-[13px] font-semibold text-text-primary">{member.fullName}</div><div className="truncate text-xs text-text-muted">{member.email}</div></div>
      </div>
      <div role="cell" className="text-[13px] font-medium text-text-secondary">{roleLabels[member.role]}</div>
      <div role="cell" className="tabular-nums text-xs text-text-muted">{displayDate(member.joinedAt)}</div>
      <div role="cell"><Badge tone="success">Active</Badge></div>
    </div>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="rounded-card border border-border-default bg-surface p-4 shadow-subtle">
      <div className="flex items-start gap-3">
        <Avatar initials={initials(member.fullName)} className="size-9" />
        <div className="min-w-0 flex-1"><div className="truncate font-semibold text-text-primary">{member.fullName}</div><div className="truncate text-xs text-text-muted">{member.email}</div></div>
        <Badge tone="success">Active</Badge>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-xs"><span className="font-medium text-text-secondary">{roleLabels[member.role]}</span><span className="tabular-nums text-text-muted">Joined {displayDate(member.joinedAt)}</span></div>
    </div>
  );
}

function InvitationRow({ invitation, state, formAction }: { invitation: TeamInvitation; state: ResendInvitationState; formAction: (payload: FormData) => void }) {
  const currentMessage = state.invitationId === invitation.id ? state : null;
  const expired = invitation.status === "expired";
  return (
    <div role="row" className="border-b border-border-subtle px-5 py-3.5 last:border-b-0">
      <div className="grid grid-cols-[minmax(220px,1.6fr)_130px_130px_92px] items-center gap-4">
        <div role="cell" className="flex min-w-0 items-center gap-3">
          <Avatar initials={initials(invitation.fullName)} className="size-8 bg-surface-muted text-[11px] text-text-secondary" />
          <div className="min-w-0"><div className="truncate text-[13px] font-semibold text-text-primary">{invitation.fullName}</div><div className="truncate text-xs text-text-muted">{invitation.email}</div></div>
        </div>
        <div role="cell" className="text-[13px] font-medium text-text-secondary">Consultant</div>
        <div role="cell" className="tabular-nums text-xs text-text-muted">{displayDate(invitation.sentAt)}</div>
        <div role="cell"><Badge tone={expired ? "danger" : "warning"}>{expired ? "Expired" : "Pending"}</Badge></div>
      </div>
      <div className="mt-2 grid items-start gap-2 pl-11 sm:grid-cols-[1fr_auto]">
        <div aria-live="polite" className={currentMessage ? `text-xs leading-5 ${currentMessage.status === "error" ? "text-status-danger" : "text-status-success"}` : "text-xs leading-5 text-text-muted"}>
          {currentMessage?.message ?? (expired ? "The secure link expired. Send a fresh invitation when they are ready." : `Link expires ${displayDate(invitation.expiresAt)}.`)}
        </div>
        <form action={formAction}>
          <input type="hidden" name="invitationId" value={invitation.id} />
          <ResendSubmitButton availableAt={invitation.resendAvailableAt} />
        </form>
      </div>
    </div>
  );
}

function InvitationCard({ invitation, state, formAction }: { invitation: TeamInvitation; state: ResendInvitationState; formAction: (payload: FormData) => void }) {
  const currentMessage = state.invitationId === invitation.id ? state : null;
  const expired = invitation.status === "expired";
  return (
    <div className="rounded-card border border-border-default bg-surface p-4 shadow-subtle">
      <div className="flex items-start gap-3">
        <Avatar initials={initials(invitation.fullName)} className="size-9 bg-surface-muted text-text-secondary" />
        <div className="min-w-0 flex-1"><div className="truncate font-semibold text-text-primary">{invitation.fullName}</div><div className="truncate text-xs text-text-muted">{invitation.email}</div></div>
        <Badge tone={expired ? "danger" : "warning"}>{expired ? "Expired" : "Pending"}</Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border-subtle pt-3 text-xs"><div><div className="text-text-muted">Role</div><div className="mt-1 font-medium text-text-secondary">Consultant</div></div><div><div className="text-text-muted">Sent</div><div className="tabular-nums mt-1 font-medium text-text-secondary">{displayDate(invitation.sentAt)}</div></div></div>
      <div aria-live="polite" className={currentMessage ? `mt-3 text-xs leading-5 ${currentMessage.status === "error" ? "text-status-danger" : "text-status-success"}` : "mt-3 text-xs leading-5 text-text-muted"}>
        {currentMessage?.message ?? (expired ? "This secure link has expired." : `Link expires ${displayDate(invitation.expiresAt)}.`)}
      </div>
      <form action={formAction} className="mt-2">
        <input type="hidden" name="invitationId" value={invitation.id} />
        <ResendSubmitButton availableAt={invitation.resendAvailableAt} />
      </form>
    </div>
  );
}

export function TeamPage({ directory }: { directory: TeamDirectory | null }) {
  const [resendState, resendAction] = React.useActionState(resendConsultantInvitationAction, initialResendState);
  const activeCount = directory?.members.length ?? 0;
  const pendingCount = directory?.invitations.length ?? 0;

  return (
    <div className="page-container page-enter overflow-x-hidden">
      <PageHeader
        className="mb-6"
        eyebrow="People & access"
        title="Team"
        description={<><span className="tabular-nums">{activeCount}</span> active members · <span className="tabular-nums">{pendingCount}</span> open invitations</>}
      />

      {!directory && <Notice tone="danger" className="mb-6" title="Team could not be loaded">Refresh the page. If the problem continues, check the workspace configuration.</Notice>}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-2 min-w-0 space-y-5 xl:order-1">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div><h2 className="text-base font-bold tracking-[-.01em] text-text-primary">Active members</h2><p className="mt-1 text-xs leading-5 text-text-muted">People with access to {directory?.organizationName ?? "this consultancy"}.</p></div>
              <div className="flex size-9 items-center justify-center rounded-full bg-success-soft text-status-success"><UserRoundCheck aria-hidden="true" className="size-[18px]" /></div>
            </CardHeader>
            {directory?.members.length ? (
              <>
                <div className="hidden overflow-x-auto md:block" role="table" aria-label="Active team members">
                  <div className="min-w-[720px]">
                    <div role="row" className="grid grid-cols-[minmax(220px,1.6fr)_130px_130px_92px] items-center gap-4 border-b border-border-default bg-surface-muted/50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[.065em] text-text-muted"><div role="columnheader">MEMBER</div><div role="columnheader">ROLE</div><div role="columnheader">JOINED</div><div role="columnheader">STATUS</div></div>
                    <div role="rowgroup">{directory.members.map((member) => <MemberRow key={member.id} member={member} />)}</div>
                  </div>
                </div>
                <div className="space-y-3 p-4 md:hidden">{directory.members.map((member) => <MemberCard key={member.id} member={member} />)}</div>
              </>
            ) : <EmptyState icon={UsersRound} title="No active members" description="Active consultancy members will appear here." />}
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div><h2 className="text-base font-bold tracking-[-.01em] text-text-primary">Open invitations</h2><p className="mt-1 text-xs leading-5 text-text-muted">Pending access requests and links that need to be refreshed.</p></div>
              <Badge tone={pendingCount ? "warning" : "neutral"}>{pendingCount} open</Badge>
            </CardHeader>
            {directory?.invitations.length ? (
              <>
                <div className="hidden overflow-x-auto md:block" role="table" aria-label="Open consultant invitations">
                  <div className="min-w-[720px]">
                    <div role="row" className="grid grid-cols-[minmax(220px,1.6fr)_130px_130px_92px] items-center gap-4 border-b border-border-default bg-surface-muted/50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[.065em] text-text-muted"><div role="columnheader">CONSULTANT</div><div role="columnheader">ROLE</div><div role="columnheader">SENT</div><div role="columnheader">STATUS</div></div>
                    <div role="rowgroup">{directory.invitations.map((invitation) => <InvitationRow key={invitation.id} invitation={invitation} state={resendState} formAction={resendAction} />)}</div>
                  </div>
                </div>
                <div className="space-y-3 p-4 md:hidden">{directory.invitations.map((invitation) => <InvitationCard key={invitation.id} invitation={invitation} state={resendState} formAction={resendAction} />)}</div>
              </>
            ) : <EmptyState icon={MailPlus} title="No open invitations" description="New consultant invitations will stay visible here until they are accepted." />}
          </Card>
        </div>

        <aside className="order-1 xl:order-2" aria-label="Invite consultant">
          <InviteConsultantCard />
        </aside>
      </div>
    </div>
  );
}
