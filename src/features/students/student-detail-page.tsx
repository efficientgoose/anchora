"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, GraduationCap, Mail, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/patterns/breadcrumbs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { Progress } from "@/components/ui/progress";
import { LoadingState, Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, riskVisuals, taskStatusVisuals } from "@/components/ui/status-badge";
import { DEMO_STAFF } from "@/domain/constants";
import { demoClock } from "@/domain/clock";
import type { ApplicationTask, TaskStatus } from "@/domain/models";
import { formatDate, initials, progressFor, relativeDateLabel, studentRisk, taskRisk } from "@/domain/student-calculations";
import { cn } from "@/lib/cn";
import { useStudent, useUpdateTaskStatus } from "./data";
import { TaskStatusMenu } from "./task-status-menu";

function TaskRow({ task, onStatus, pending }: { task: ApplicationTask; onStatus: (status: TaskStatus) => void; pending: boolean }) {
  const risk = taskRisk(task, demoClock);
  const complete = task.status === "done";
  const visual = complete ? taskStatusVisuals.done : riskVisuals[risk as Exclude<typeof risk, "done">];
  const RiskIcon = visual.icon;
  return (
    <li className="grid gap-3 border-b border-border-subtle px-5 py-4 last:border-b-0 sm:grid-cols-[22px_minmax(130px,1fr)_190px_160px] sm:items-center sm:gap-4 sm:px-6">
      <RiskIcon aria-label={complete ? "Done" : visual.label} className={cn("hidden size-4 sm:block", visual.textClass)} />
      <div className="flex min-w-0 items-center gap-2 sm:block"><RiskIcon aria-hidden="true" className={cn("size-4 shrink-0 sm:hidden", visual.textClass)} /><span className={cn("text-sm font-medium leading-[22px]", complete ? "text-text-muted line-through" : "text-text-primary")}>{task.name}</span></div>
      <div className="tabular-nums"><time dateTime={task.dueDate} className={cn("text-[13px] font-medium leading-5", complete ? "text-text-muted" : "text-text-secondary")}>{formatDate(task.dueDate)}</time><div className={cn("text-xs leading-4", visual.textClass)}>{complete ? "Completed" : relativeDateLabel(task.dueDate, demoClock)}</div></div>
      <div className="sm:text-right"><TaskStatusMenu value={task.status} onChange={onStatus} disabled={pending} /></div>
    </li>
  );
}

function TaskGroup({ title, subtitle, tasks, update, pendingTask }: { title: string; subtitle?: string; tasks: ApplicationTask[]; update: (taskId: string, status: TaskStatus) => void; pendingTask: string | null }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader><h2 className="type-component-title text-text-primary">{title} {subtitle && <span className="font-normal text-text-muted">· {subtitle}</span>}</h2></CardHeader>
      <ul>{tasks.map((task) => <TaskRow key={task.id} task={task} pending={pendingTask === task.id} onStatus={(status) => update(task.id, status)} />)}</ul>
    </Card>
  );
}

function StudentDetailLoading() {
  return (
    <LoadingState label="Loading student" className="mx-auto max-w-[1100px] space-y-5 p-6 lg:p-8">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-64 rounded-card" />
      <Skeleton className="h-80 rounded-card" />
    </LoadingState>
  );
}

export function StudentDetailPage({ studentId }: { studentId: string }) {
  const query = useStudent(studentId);
  const mutation = useUpdateTaskStatus(studentId);
  if (query.isLoading) return <StudentDetailLoading />;
  if (!query.data) return <EmptyState icon={GraduationCap} title="Student not found" description="This student may have been removed or the link may be incorrect." className="min-h-[60vh]" action={<Button asChild variant="secondary"><Link href="/students"><ArrowLeft /> Back to students</Link></Button>} />;

  const student = query.data;
  const risk = studentRisk(student, demoClock);
  const progress = progressFor(student);
  const consultant = DEMO_STAFF.find((member) => member.id === student.assignedConsultantId);
  const globalTasks = student.tasks.filter((task) => !task.university);
  const universityGroups = student.targetUniversities.map((university) => ({ university, tasks: student.tasks.filter((task) => task.university === university) })).filter((group) => group.tasks.length);
  const update = (taskId: string, status: TaskStatus) => mutation.mutate({ taskId, status });

  return (
    <div className="mx-auto max-w-[1100px] space-y-5 p-4 sm:p-6 lg:p-8 page-enter">
      <Breadcrumbs items={[{ label: "Students", href: "/students" }, { label: student.name }]} />

      <Card className="overflow-hidden border-t-[3px] border-t-brand-gold">
        <div className="flex flex-wrap items-start gap-4 px-5 py-5 sm:px-6">
          <Avatar initials={initials(student.name)} className="size-[52px] text-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3"><h1 className="text-[22px] font-semibold leading-7 tracking-[-.02em] text-text-primary">{student.name}</h1><StatusBadge risk={risk} /></div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] leading-5 text-text-muted">
              <a href={`mailto:${student.email}`} className="link-hover-gold flex items-center gap-1.5 rounded-sm hover:underline"><Mail aria-hidden="true" className="size-3.5" />{student.email}</a>
              <a href={`tel:${student.phone}`} className="link-hover-gold flex items-center gap-1.5 rounded-sm hover:underline"><Phone aria-hidden="true" className="size-3.5" />{student.phone}</a>
            </div>
          </div>
          <Button asChild variant="secondary"><Link href={`/portal/${student.id}`}>View student portal <ArrowUpRight /></Link></Button>
        </div>

        <dl className="grid gap-5 border-t border-border-subtle bg-surface-muted/35 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1fr_1.2fr_1fr_1.2fr]">
          <div><dt className="text-xs leading-4 text-text-muted">Target intake</dt><dd className="mt-1 text-sm font-medium leading-[22px] text-text-primary">{student.targetIntake}</dd></div>
          <div><dt className="text-xs leading-4 text-text-muted">Target universities</dt><dd className="mt-1 flex flex-wrap gap-1">{student.targetUniversities.map((university) => <Badge key={university} tone="neutral" appearance="outline" className="rounded-sm font-medium">{university}</Badge>)}</dd></div>
          <div><dt className="text-xs leading-4 text-text-muted">Assigned consultant</dt><dd className="mt-1 text-sm font-medium leading-[22px] text-text-primary">{consultant?.name}</dd></div>
          <div><dt className="text-xs leading-4 text-text-muted">Checklist progress</dt><dd className="mt-2 flex items-center gap-3"><Progress value={progress.percent} tone={progress.percent === 100 ? "success" : "neutral"} label={`${student.name} checklist progress`} className="w-full max-w-[150px]" /><span className="tabular-nums whitespace-nowrap text-sm font-medium">{progress.done} / {progress.total}</span></dd></div>
        </dl>
      </Card>

      <TaskGroup title="Global requirements" subtitle="one-time tasks" tasks={globalTasks} update={update} pendingTask={mutation.isPending ? mutation.variables?.taskId ?? null : null} />
      {universityGroups.map((group) => <TaskGroup key={group.university} title={group.university} subtitle="university application" tasks={group.tasks} update={update} pendingTask={mutation.isPending ? mutation.variables?.taskId ?? null : null} />)}
      {mutation.isError && <Notice tone="danger" title="Status not saved">That status could not be saved. Try again.</Notice>}
    </div>
  );
}
