"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { CalendarDays, MailPlus, RefreshCw, ShieldCheck, UserRoundCheck, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/patterns/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { StaffRole } from "@/domain/models";
import { initials } from "@/domain/student-calculations";
import { cn } from "@/lib/cn";
import { inviteMemberAction, resendMemberInvitationAction, type InviteMemberState, type ResendMemberInvitationState } from "./actions";
import type { TeamDirectory, TeamInvitation, TeamMember } from "./types";

const initialInviteState: InviteMemberState = { status: "idle" };
const initialResendState: ResendMemberInvitationState = { status: "idle" };

const roleLabels: Record<StaffRole, string> = { owner: "Owner", admin: "Admin", member: "Member" };
const accessLevels: Array<{ value: StaffRole; label: string; description: string }> = [
  { value: "member", label: "Member", description: "Standard access for day-to-day student work." },
  { value: "admin", label: "Admin", description: "Workspace access without owner controls." },
  { value: "owner", label: "Owner", description: "Full access, including member invitations." },
];

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
      {pending ? "Sending invitation…" : <><MailPlus aria-hidden="true" /> Send invitation</>}
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
    <Button type="submit" variant="secondary" size="sm" disabled={pending || coolingDown} className="min-w-[104px] shadow-none">
      <RefreshCw aria-hidden="true" className={pending ? "animate-spin" : undefined} />
      {pending ? "Sending…" : secondsRemaining && secondsRemaining > 0 ? `Resend in ${secondsRemaining}s` : "Resend"}
    </Button>
  );
}

function InviteMemberDrawer() {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [state, formAction] = React.useActionState(inviteMemberAction, initialInviteState);

  React.useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      return;
    }
    if (state.status === "error") {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true'], [data-invalid='true']")?.focus();
    }
  }, [state]);

  return (
    <SheetContent side="right" closeLabel="Close invitation panel" className="flex flex-col overflow-y-auto">
      <div className="h-1 shrink-0 bg-brand-gold" />
      <header className="border-b border-border-subtle px-5 pb-5 pt-6 pr-16 sm:px-7 sm:pb-6 sm:pt-7 sm:pr-16">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.08em] text-brand-gold-strong">
          <ShieldCheck aria-hidden="true" className="size-3.5" /> Owner control
        </div>
        <SheetTitle className="mt-2 text-2xl font-bold tracking-[-.025em] text-text-primary">Invite a team member</SheetTitle>
        <SheetDescription className="mt-2 text-sm leading-[22px] text-text-muted">Give a teammate secure access to this workspace.</SheetDescription>
      </header>

      <div className="flex-1 px-5 py-6 sm:px-7">
        {state.message && (
          <Notice tone={state.status === "success" ? "success" : "danger"} className="mb-6" role={state.status === "error" ? "alert" : "status"}>
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

          <fieldset aria-describedby={state.fieldErrors?.role ? "member-role-error" : "member-role-hint"}>
            <legend className="text-[13px] font-semibold leading-5 text-text-secondary">Access level <span aria-hidden="true" className="ml-1 text-status-danger">*</span><span className="sr-only"> (required)</span></legend>
            <div className="mt-2 space-y-2">
              {accessLevels.map((level) => (
                <label key={level.value} className={cn("flex min-h-14 items-start gap-3 rounded-control border bg-surface px-3.5 py-3 transition-colors hover:border-border-strong hover:bg-surface-muted/50 has-[:checked]:border-brand-ink has-[:checked]:bg-accent-soft/45", state.fieldErrors?.role ? "border-danger-border" : "border-border-default")}>
                  <input type="radio" name="role" value={level.value} defaultChecked={level.value === "member"} data-invalid={state.fieldErrors?.role ? "true" : undefined} className="mt-0.5 size-4 shrink-0 accent-brand-ink" />
                  <span className="min-w-0"><span className="block text-sm font-semibold text-text-primary">{level.label}</span><span className="mt-0.5 block text-xs leading-4 text-text-muted">{level.description}</span></span>
                </label>
              ))}
            </div>
            {state.fieldErrors?.role ? <p id="member-role-error" role="alert" className="mt-1.5 text-xs font-medium leading-4 text-status-danger">{state.fieldErrors.role}</p> : <p id="member-role-hint" className="mt-1.5 text-xs leading-4 text-text-muted">The selected access level is assigned when the invitation is accepted.</p>}
          </fieldset>

          <InviteSubmitButton />
        </form>
      </div>

      <div className="shrink-0 border-t border-border-default bg-surface-muted/70 px-5 py-4 text-xs leading-5 text-text-muted sm:px-7">
        <div className="flex gap-2"><CalendarDays aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-gold-strong" /><span>Secure links remain valid for 24 hours.</span></div>
        <div className="mt-2 flex gap-2"><ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-gold-strong" /><span>Up to 5 invitation emails per workspace in 24 hours.</span></div>
      </div>
    </SheetContent>
  );
}

function MemberRow({ member }: { member: TeamMember }) {
  return (
    <tr className="border-b border-border-subtle transition-colors last:border-b-0 hover:bg-surface-muted/55">
      <td className="px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar initials={initials(member.fullName)} className="size-8 text-[11px]" />
          <div className="min-w-0"><div className="truncate text-[13px] font-semibold text-text-primary">{member.fullName}</div><div className="truncate text-xs text-text-muted">{member.email}</div></div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-[13px] font-medium text-text-secondary">{roleLabels[member.role]}</td>
      <td className="tabular-nums px-4 py-3.5 text-xs text-text-muted"><time dateTime={member.joinedAt}>{displayDate(member.joinedAt)}</time></td>
      <td className="px-5 py-3.5"><Badge tone="success">Active</Badge></td>
    </tr>
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
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border-subtle pt-3 text-xs"><span className="font-medium text-text-secondary">{roleLabels[member.role]}</span><span className="tabular-nums text-right text-text-muted">Joined <time dateTime={member.joinedAt}>{displayDate(member.joinedAt)}</time></span></div>
    </div>
  );
}

function InvitationRow({ invitation, state, formAction }: { invitation: TeamInvitation; state: ResendMemberInvitationState; formAction: (payload: FormData) => void }) {
  const currentMessage = state.invitationId === invitation.id ? state : null;
  const expired = invitation.status === "expired";
  return (
    <tr className="border-b border-border-subtle transition-colors last:border-b-0 hover:bg-surface-muted/55">
      <td className="px-5 py-3.5 align-top">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar initials={initials(invitation.fullName)} className="size-8 bg-surface-muted text-[11px] text-text-secondary" />
          <div className="min-w-0"><div className="truncate text-[13px] font-semibold text-text-primary">{invitation.fullName}</div><div className="truncate text-xs text-text-muted">{invitation.email}</div></div>
        </div>
      </td>
      <td className="px-4 py-3.5 align-top text-[13px] font-medium text-text-secondary">{roleLabels[invitation.role]}</td>
      <td className="tabular-nums px-4 py-3.5 align-top text-xs text-text-muted"><time dateTime={invitation.sentAt}>{displayDate(invitation.sentAt)}</time></td>
      <td className="px-4 py-3.5 align-top">
        <Badge tone={expired ? "danger" : "warning"}>{expired ? "Expired" : "Pending"}</Badge>
        <div className="tabular-nums mt-1.5 text-[11px] leading-4 text-text-muted">{expired ? "Expired" : "Expires"} <time dateTime={invitation.expiresAt}>{displayDate(invitation.expiresAt)}</time></div>
      </td>
      <td className="px-5 py-3.5 align-top">
        <form action={formAction}>
          <input type="hidden" name="invitationId" value={invitation.id} />
          <ResendSubmitButton availableAt={invitation.resendAvailableAt} />
        </form>
        <div aria-live="polite" className={currentMessage ? `mt-2 max-w-[220px] text-xs leading-4 ${currentMessage.status === "error" ? "text-status-danger" : "text-status-success"}` : "sr-only"}>
          {currentMessage?.message}
        </div>
      </td>
    </tr>
  );
}

function InvitationCard({ invitation, state, formAction }: { invitation: TeamInvitation; state: ResendMemberInvitationState; formAction: (payload: FormData) => void }) {
  const currentMessage = state.invitationId === invitation.id ? state : null;
  const expired = invitation.status === "expired";
  return (
    <div className="rounded-card border border-border-default bg-surface p-4 shadow-subtle">
      <div className="flex items-start gap-3">
        <Avatar initials={initials(invitation.fullName)} className="size-9 bg-surface-muted text-text-secondary" />
        <div className="min-w-0 flex-1"><div className="truncate font-semibold text-text-primary">{invitation.fullName}</div><div className="truncate text-xs text-text-muted">{invitation.email}</div></div>
        <Badge tone={expired ? "danger" : "warning"}>{expired ? "Expired" : "Pending"}</Badge>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border-subtle pt-3 text-xs"><div><div className="text-text-muted">Access</div><div className="mt-1 font-medium text-text-secondary">{roleLabels[invitation.role]}</div></div><div><div className="text-text-muted">Sent</div><div className="tabular-nums mt-1 font-medium text-text-secondary"><time dateTime={invitation.sentAt}>{displayDate(invitation.sentAt)}</time></div></div><div><div className="text-text-muted">{expired ? "Expired" : "Expires"}</div><div className="tabular-nums mt-1 font-medium text-text-secondary"><time dateTime={invitation.expiresAt}>{displayDate(invitation.expiresAt)}</time></div></div></div>
      <div aria-live="polite" className={currentMessage ? `mt-3 text-xs leading-5 ${currentMessage.status === "error" ? "text-status-danger" : "text-status-success"}` : "sr-only"}>{currentMessage?.message}</div>
      <form action={formAction} className="mt-3">
        <input type="hidden" name="invitationId" value={invitation.id} />
        <ResendSubmitButton availableAt={invitation.resendAvailableAt} />
      </form>
    </div>
  );
}

function CompactEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof UsersRound;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-muted text-text-muted"><Icon aria-hidden="true" className="size-[18px]" /></span>
      <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold text-text-primary">{title}</h3><p className="mt-0.5 text-xs leading-5 text-text-muted">{description}</p></div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function TeamPage({ directory }: { directory: TeamDirectory | null }) {
  const [resendState, resendAction] = React.useActionState(resendMemberInvitationAction, initialResendState);
  const activeCount = directory?.members.length ?? 0;
  const pendingCount = directory?.invitations.length ?? 0;

  return (
    <Sheet>
      <div className="page-container page-enter overflow-x-hidden">
        <PageHeader
          className="mb-5 border-b border-border-default pb-5"
          actionClassName="ml-0 w-full shrink sm:ml-auto sm:w-auto sm:shrink-0"
          eyebrow="People & access"
          title="Team"
          description={directory ? <><span>Manage access to {directory.organizationName}.</span> <span className="whitespace-nowrap"><span className="tabular-nums font-medium text-text-secondary">{activeCount}</span> active · <span className="tabular-nums font-medium text-text-secondary">{pendingCount}</span> open invitations</span></> : "Workspace access information is temporarily unavailable."}
          action={
            <SheetTrigger asChild>
              <Button><MailPlus aria-hidden="true" /> Invite member</Button>
            </SheetTrigger>
          }
        />

        {!directory ? (
          <Notice tone="danger" title="Team could not be loaded">Refresh the page. If the problem continues, check the workspace configuration.</Notice>
        ) : (
          <div className="space-y-5">
            <Card className="overflow-hidden border-t-[3px] border-t-brand-gold">
              <CardHeader className="flex flex-row items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-4">
                <div className="min-w-0 flex-1"><h2 className="text-base font-bold tracking-[-.01em] text-text-primary">Active members</h2><p className="mt-0.5 text-xs leading-5 text-text-muted">People with access to this workspace.</p></div>
                <Badge tone="success"><UserRoundCheck aria-hidden="true" className="size-3.5" /> {activeCount} active</Badge>
              </CardHeader>
              {directory.members.length ? (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[680px] border-collapse text-left" aria-label="Active team members">
                      <thead className="bg-surface-muted/65 text-[11px] font-semibold uppercase tracking-[.065em] text-text-muted"><tr><th scope="col" className="w-[46%] px-5 py-2.5">Member</th><th scope="col" className="w-[18%] px-4 py-2.5">Role</th><th scope="col" className="w-[20%] px-4 py-2.5">Joined</th><th scope="col" className="w-[16%] px-5 py-2.5">Status</th></tr></thead>
                      <tbody>{directory.members.map((member) => <MemberRow key={member.id} member={member} />)}</tbody>
                    </table>
                  </div>
                  <div className="space-y-3 p-4 md:hidden">{directory.members.map((member) => <MemberCard key={member.id} member={member} />)}</div>
                </>
              ) : <CompactEmptyState icon={UsersRound} title="No active members" description="Active workspace members will appear here." />}
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-4">
                <div className="min-w-0 flex-1"><h2 className="text-base font-bold tracking-[-.01em] text-text-primary">Open invitations</h2><p className="mt-0.5 text-xs leading-5 text-text-muted">Pending access links and invitations that may need attention.</p></div>
                <Badge tone={pendingCount ? "warning" : "neutral"}>{pendingCount} open</Badge>
              </CardHeader>
              {directory.invitations.length ? (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[820px] border-collapse text-left" aria-label="Open member invitations">
                      <thead className="bg-surface-muted/65 text-[11px] font-semibold uppercase tracking-[.065em] text-text-muted"><tr><th scope="col" className="w-[34%] px-5 py-2.5">Invitee</th><th scope="col" className="w-[14%] px-4 py-2.5">Access</th><th scope="col" className="w-[16%] px-4 py-2.5">Sent</th><th scope="col" className="w-[18%] px-4 py-2.5">Link status</th><th scope="col" className="w-[18%] px-5 py-2.5"><span className="sr-only">Actions</span></th></tr></thead>
                      <tbody>{directory.invitations.map((invitation) => <InvitationRow key={invitation.id} invitation={invitation} state={resendState} formAction={resendAction} />)}</tbody>
                    </table>
                  </div>
                  <div className="space-y-3 p-4 md:hidden">{directory.invitations.map((invitation) => <InvitationCard key={invitation.id} invitation={invitation} state={resendState} formAction={resendAction} />)}</div>
                </>
              ) : (
                <CompactEmptyState
                  icon={MailPlus}
                  title="No open invitations"
                  description="Everyone invited to this workspace has joined."
                  action={<SheetTrigger asChild><Button variant="secondary"><MailPlus aria-hidden="true" /> Invite member</Button></SheetTrigger>}
                />
              )}
            </Card>
          </div>
        )}
      </div>

      <InviteMemberDrawer />
    </Sheet>
  );
}
