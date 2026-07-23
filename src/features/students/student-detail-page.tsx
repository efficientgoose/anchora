"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ArrowLeft, ArrowUpRight, Download, Eraser, Mail, Phone, RotateCcw, Save, UserRoundCog } from "lucide-react";
import { Breadcrumbs } from "@/components/patterns/breadcrumbs";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import type { JourneyTask, JourneyTaskStatus, StudentWorkspace } from "@/domain/models";
import type { StudentActionState } from "./actions";
import { archiveStudentAction, eraseStudentAction, exportStudentAction, restoreStudentAction, updateJourneyTaskAction, updateStudentAction } from "./actions";
import type { StudentDataLoadResult } from "./server-data";
import { TaskStatusMenu } from "./task-status-menu";

const initialActionState: StudentActionState = { status: "idle" };

function intakeLabel(season: "summer" | "winter", year: number) {
  return `${season === "summer" ? "Summer" : "Winter"} ${year}`;
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function actionNotice(state: StudentActionState, success: string) {
  if (state.status === "idle") return null;
  if (state.status === "success") return <Notice tone="success" title="Saved">{success}</Notice>;
  if (state.status === "validation_error") return <Notice tone="danger" title="Check the details">Some values need attention before they can be saved.</Notice>;
  if (state.status === "student_archived") return <Notice tone="warning" title="Student is archived">Restore this student before changing their journey or profile.</Notice>;
  if (state.status === "legal_required") return <Notice tone="warning" title="Agreement required">Complete the required workspace agreements before making changes.</Notice>;
  if (state.status === "access_denied") return <Notice tone="danger" title="Access denied">Your current access does not allow this action.</Notice>;
  if (state.status === "not_found") return <Notice tone="danger" title="Not available">This student record or task is no longer available.</Notice>;
  if (state.status === "disabled") return <Notice tone="warning" title="Student data is unavailable">This workspace is not accepting student-record changes right now.</Notice>;
  return <Notice tone="danger" title="Could not save">The change was not saved. Try again.</Notice>;
}

function TaskControls({ task, archived }: { task: JourneyTask; archived: boolean }) {
  const router = useRouter();
  const [state, formAction, pending] = React.useActionState(updateJourneyTaskAction, initialActionState);
  const refreshAfterSuccess = React.useRef(false);
  const [planningTargetDate, setPlanningTargetDate] = React.useState(task.planningTargetDate);

  React.useEffect(() => {
    if (state.status === "success" && refreshAfterSuccess.current) {
      refreshAfterSuccess.current = false;
      router.refresh();
    }
  }, [router, state]);

  function updateStatus(status: JourneyTaskStatus) {
    const formData = new FormData();
    formData.set("taskId", task.id);
    formData.set("status", status);
    formData.set("planningTargetDate", "");
    refreshAfterSuccess.current = true;
    React.startTransition(() => formAction(formData));
  }

  function updateTarget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("taskId", task.id);
    formData.set("status", task.status);
    refreshAfterSuccess.current = true;
    React.startTransition(() => formAction(formData));
  }

  const targetChanged = planningTargetDate !== task.planningTargetDate;

  return (
    <div className="space-y-2 sm:text-right">
      <TaskStatusMenu value={task.status} taskTitle={task.title} onChange={updateStatus} disabled={archived || pending} />
      <form onSubmit={updateTarget} className="flex items-end gap-2 sm:justify-end">
        <label className="min-w-0 text-left text-xs leading-4 text-text-muted">
          <span className="sr-only">Planning target for {task.title}</span>
          <Input name="planningTargetDate" type="date" size="sm" value={planningTargetDate} onChange={(event) => setPlanningTargetDate(event.target.value)} required disabled={archived || pending} />
        </label>
        <Button type="submit" size="sm" variant="secondary" aria-label={`Save planning target for ${task.title}`} disabled={archived || pending || !planningTargetDate || !targetChanged}><Save aria-hidden="true" />{pending ? "Saving…" : "Target"}</Button>
      </form>
      {actionNotice(state, "The journey task was updated.")}
    </div>
  );
}

function JourneyStageCard({ stage, archived }: { stage: StudentWorkspace["stages"][number]; archived: boolean }) {
  const completed = stage.tasks.filter((task) => task.status === "completed").length;
  const total = stage.tasks.length;
  return (
    <li className="relative pl-10 last:pb-0 sm:pl-12">
      <span aria-hidden="true" className="absolute left-[11px] top-0 h-full w-px bg-border-default last:hidden sm:left-[15px]" />
      <span aria-hidden="true" className={`absolute left-0 top-5 flex size-[23px] items-center justify-center rounded-full border text-[10px] font-semibold sm:size-[31px] ${total > 0 && completed === total ? "border-status-success bg-success-soft text-status-success" : "border-brand-gold bg-surface text-brand-gold-strong"}`}>{String(stage.displayOrder).padStart(2, "0")}</span>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-surface-muted/35">
          <h2 className="type-component-title text-text-primary">{stage.title}</h2>
          <span className="text-xs leading-4 text-text-muted"><span className="font-semibold text-text-secondary">{completed}</span> / {total} completed</span>
        </CardHeader>
        <ol>
          {stage.tasks.map((task) => (
            <li key={task.id} className="grid gap-3 border-b border-border-subtle px-5 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_260px] sm:items-center sm:px-6">
              <div className="min-w-0">
                <h3 className={task.status === "completed" ? "text-sm font-medium leading-[22px] text-text-muted line-through" : "text-sm font-medium leading-[22px] text-text-primary"}>{task.title}</h3>
                <p className="mt-1 text-xs leading-4 text-text-muted">Planning target <time dateTime={task.planningTargetDate}>{task.planningTargetDate}</time>{task.targetIsTemplate ? " · generated from the Germany journey" : " · edited manually"}</p>
              </div>
              <TaskControls key={`${task.id}:${task.status}:${task.planningTargetDate}`} task={task} archived={archived} />
            </li>
          ))}
        </ol>
      </Card>
    </li>
  );
}

function ProfileEditor({ workspace }: { workspace: StudentWorkspace }) {
  const router = useRouter();
  const [state, formAction, pending] = React.useActionState(updateStudentAction, initialActionState);
  const refreshAfterSuccess = React.useRef(false);
  const student = workspace.student;

  React.useEffect(() => {
    if (state.status === "success" && refreshAfterSuccess.current) {
      refreshAfterSuccess.current = false;
      router.refresh();
    }
  }, [router, state]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    refreshAfterSuccess.current = true;
    React.startTransition(() => formAction(new FormData(event.currentTarget)));
  }

  if (student.lifecycleStatus === "archived") {
    return <Card padding="md"><h2 className="type-component-title">Profile</h2><p className="mt-2 text-sm leading-[22px] text-text-muted">This profile is read-only while the student is archived.</p></Card>;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader><div className="flex items-center gap-2"><UserRoundCog aria-hidden="true" className="size-4 text-brand-gold-strong" /><h2 className="type-component-title">Correct profile details</h2></div></CardHeader>
      <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
        <input type="hidden" name="studentId" value={student.id} />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Full name" required error={state.fieldErrors?.fullName}><Input name="fullName" defaultValue={student.fullName} autoComplete="name" disabled={pending} /></FormField>
          <FormField label="Email" required error={state.fieldErrors?.email}><Input name="email" type="email" defaultValue={student.email} autoComplete="email" disabled={pending} /></FormField>
          <FormField label="Phone" hint="Optional" error={state.fieldErrors?.phone}><Input name="phone" type="tel" defaultValue={student.phone ?? ""} autoComplete="tel" disabled={pending} /></FormField>
          <FormField label="Assignee" required error={state.fieldErrors?.assignedConsultantId}><select name="assignedConsultantId" defaultValue={student.assignedConsultantId} disabled={pending} className="h-10 w-full rounded-control border border-border-default bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand-ink focus:ring-[3px] focus:ring-brand-gold/25 disabled:cursor-not-allowed disabled:bg-surface-muted"><option value="" disabled>Choose a workspace member</option>{workspace.assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.fullName} · {assignee.role}</option>)}</select></FormField>
          <FormField label="Intake season" required error={state.fieldErrors?.intakeSeason}><select name="intakeSeason" defaultValue={student.intakeSeason} disabled={pending} className="h-10 w-full rounded-control border border-border-default bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand-ink focus:ring-[3px] focus:ring-brand-gold/25 disabled:cursor-not-allowed disabled:bg-surface-muted"><option value="summer">Summer</option><option value="winter">Winter</option></select></FormField>
          <FormField label="Intake year" required error={state.fieldErrors?.intakeYear}><Input name="intakeYear" type="number" min="2020" max="2100" defaultValue={student.intakeYear} disabled={pending} /></FormField>
        </div>
        <p className="border-t border-border-subtle pt-4 text-xs leading-5 text-text-muted">Changing the intake recalculates only untouched, not-started template planning targets. Manual targets and started work stay as they are.</p>
        {actionNotice(state, "Profile details were updated.")}
        <div className="flex justify-end"><Button type="submit" disabled={pending}><Save aria-hidden="true" />{pending ? "Saving…" : "Save profile"}</Button></div>
      </form>
    </Card>
  );
}

function LifecycleActions({ workspace, role }: { workspace: StudentWorkspace; role: "owner" | "admin" | "member" }) {
  const router = useRouter();
  const student = workspace.student;
  const [archiveState, archiveAction, archivePending] = React.useActionState(archiveStudentAction, initialActionState);
  const [restoreState, restoreAction, restorePending] = React.useActionState(restoreStudentAction, initialActionState);
  const [exportState, exportAction, exportPending] = React.useActionState(exportStudentAction, initialActionState);
  const [eraseState, eraseAction, erasePending] = React.useActionState(eraseStudentAction, initialActionState);
  const canManageData = role === "owner" || role === "admin";
  const archiveSubmitted = React.useRef(false);
  const restoreSubmitted = React.useRef(false);
  const exportSubmitted = React.useRef(false);
  const eraseSubmitted = React.useRef(false);

  React.useEffect(() => {
    if (archiveState.status === "success" && archiveSubmitted.current) {
      archiveSubmitted.current = false;
      router.refresh();
    }
  }, [archiveState, router]);

  React.useEffect(() => {
    if (restoreState.status === "success" && restoreSubmitted.current) {
      restoreSubmitted.current = false;
      router.refresh();
    }
  }, [restoreState, router]);

  React.useEffect(() => {
    if (eraseState.status === "success" && eraseSubmitted.current) {
      eraseSubmitted.current = false;
      router.replace("/students");
    }
  }, [eraseState, router]);

  React.useEffect(() => {
    if (exportState.status !== "success" || !exportState.exportData || !exportSubmitted.current) return;
    exportSubmitted.current = false;
    const blob = new Blob([JSON.stringify(exportState.exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-record-export.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [exportState]);

  function submitArchive(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm("Confirm archive for this student record.")) return;
    archiveSubmitted.current = true;
    React.startTransition(() => archiveAction(new FormData(event.currentTarget)));
  }

  function submitRestore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm("Confirm restore for this student record.")) return;
    restoreSubmitted.current = true;
    React.startTransition(() => restoreAction(new FormData(event.currentTarget)));
  }

  function submitErase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm("Permanently erase this student record? This cannot be undone.")) return;
    eraseSubmitted.current = true;
    React.startTransition(() => eraseAction(new FormData(event.currentTarget)));
  }

  function submitExport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    exportSubmitted.current = true;
    React.startTransition(() => exportAction(new FormData(event.currentTarget)));
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader><h2 className="type-component-title">Lifecycle and data</h2></CardHeader>
      <div className="space-y-4 p-5 sm:p-6">
        <p className="text-sm leading-[22px] text-text-muted">{student.lifecycleStatus === "archived" ? "Archived records remain read-only until restored." : "Archive a record when active work should pause. Members can restore it later."}</p>
        <div className="flex flex-wrap gap-3">
          {student.lifecycleStatus === "archived" ? <form onSubmit={submitRestore}><input type="hidden" name="studentId" value={student.id} /><Button type="submit" variant="secondary" disabled={restorePending}><RotateCcw aria-hidden="true" />{restorePending ? "Restoring…" : "Restore student"}</Button></form> : <form onSubmit={submitArchive}><input type="hidden" name="studentId" value={student.id} /><Button type="submit" variant="secondary" disabled={archivePending}><Archive aria-hidden="true" />{archivePending ? "Archiving…" : "Archive student"}</Button></form>}
          {canManageData && <form onSubmit={submitExport}><input type="hidden" name="studentId" value={student.id} /><Button type="submit" variant="secondary" disabled={exportPending}><Download aria-hidden="true" />{exportPending ? "Preparing…" : "Export JSON"}</Button></form>}
          {canManageData && <form onSubmit={submitErase}><input type="hidden" name="studentId" value={student.id} /><Button type="submit" variant="destructive" disabled={erasePending}><Eraser aria-hidden="true" />{erasePending ? "Erasing…" : "Permanently erase"}</Button></form>}
        </div>
        {actionNotice(archiveState, "Student archived.")}
        {actionNotice(restoreState, "Student restored.")}
        {canManageData && actionNotice(exportState, "Your JSON export was downloaded.")}
        {canManageData && actionNotice(eraseState, "The student was erased.")}
      </div>
    </Card>
  );
}

function UnavailableStudent({ result }: { result: Exclude<StudentDataLoadResult<StudentWorkspace>, { status: "ready" }> }) {
  const unavailable = result.status === "disabled" ? ["Student data is not enabled", "This workspace is not accepting student records yet."] : result.status === "legal_required" ? ["Agreement required", "Complete the required workspace agreements before viewing student records."] : result.status === "not_found" ? ["Student not found", "This student may have been removed or the link may be incorrect."] : ["Student unavailable", "The workspace could not retrieve this student record."];
  return <EmptyState icon={UserRoundCog} title={unavailable[0]} description={unavailable[1]} className="min-h-[60vh]" action={<Button asChild variant="secondary"><Link href="/students"><ArrowLeft /> Back to students</Link></Button>} />;
}

export function StudentDetailPage({ result, created = false }: { result: StudentDataLoadResult<StudentWorkspace>; created?: boolean }) {
  if (result.status !== "ready") return <UnavailableStudent result={result} />;
  const workspace = result.data;
  const student = workspace.student;
  const archived = student.lifecycleStatus === "archived";
  const completed = workspace.stages.flatMap((stage) => stage.tasks).filter((task) => task.status === "completed").length;
  const total = workspace.stages.reduce((count, stage) => count + stage.tasks.length, 0);

  return (
    <div className="mx-auto max-w-[1100px] space-y-5 p-4 sm:p-6 lg:p-8 page-enter">
      <Breadcrumbs items={[{ label: "Students", href: "/students" }, { label: student.fullName }]} />
      {created && <Notice tone="success" title="Germany journey generated">The initial six-stage Germany journey is ready to plan. All dates below are planning targets.</Notice>}
      {archived && <Notice tone="warning" title="Student archived">This record is read-only. Restore it to edit the profile or journey.</Notice>}
      <Card className="overflow-hidden border-t-[3px] border-t-brand-gold">
        <div className="flex flex-wrap items-start gap-4 px-5 py-5 sm:px-6">
          <Avatar initials={initials(student.fullName)} className="size-[52px] text-lg" />
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h1 className="text-[22px] font-semibold leading-7 tracking-[-.02em] text-text-primary">{student.fullName}</h1>{archived && <span className="rounded-full border border-warning-border bg-warning-soft px-2 py-0.5 text-xs font-semibold text-status-warning">Archived</span>}</div><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] leading-5 text-text-muted"><a href={`mailto:${student.email}`} className="link-hover-gold flex items-center gap-1.5 rounded-sm hover:underline"><Mail aria-hidden="true" className="size-3.5" />{student.email}</a>{student.phone && <a href={`tel:${student.phone}`} className="link-hover-gold flex items-center gap-1.5 rounded-sm hover:underline"><Phone aria-hidden="true" className="size-3.5" />{student.phone}</a>}</div></div>
          <Button asChild variant="secondary"><Link href={`/students/${student.id}/preview`}>Consultant preview <ArrowUpRight /></Link></Button>
        </div>
        <dl className="grid gap-5 border-t border-border-subtle bg-surface-muted/35 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3"><div><dt className="text-xs leading-4 text-text-muted">Target intake</dt><dd className="mt-1 text-sm font-medium leading-[22px] text-text-primary">{intakeLabel(student.intakeSeason, student.intakeYear)}</dd></div><div><dt className="text-xs leading-4 text-text-muted">Journey progress</dt><dd className="mt-1 text-sm font-medium leading-[22px] text-text-primary">{completed} / {total} tasks completed</dd></div><div><dt className="text-xs leading-4 text-text-muted">Destination</dt><dd className="mt-1 text-sm font-medium leading-[22px] text-text-primary">Germany</dd></div></dl>
      </Card>
      <section aria-labelledby="journey-title"><div className="mb-4"><p className="type-micro text-brand-gold-strong">Living journey</p><h2 id="journey-title" className="mt-1 text-[22px] font-semibold leading-7 tracking-[-.02em] text-text-primary">Germany planning map</h2><p className="mt-1 text-sm leading-[22px] text-text-muted">Six stages in journey order. Every displayed date is a planning target, not an official deadline.</p></div><ol className="space-y-4">{workspace.stages.map((stage) => <JourneyStageCard key={stage.id} stage={stage} archived={archived} />)}</ol></section>
      <ProfileEditor workspace={workspace} />
      <LifecycleActions key={student.lifecycleStatus} workspace={workspace} role={result.context.membership.role} />
    </div>
  );
}
