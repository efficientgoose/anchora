"use client";

import Link from "next/link";
import { ArrowLeft, Check, CircleCheck, GraduationCap } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { Progress } from "@/components/ui/progress";
import { LoadingState, Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, riskVisuals, taskStatusVisuals } from "@/components/ui/status-badge";
import { DEMO_STAFF } from "@/domain/constants";
import { demoClock } from "@/domain/clock";
import type { ApplicationTask } from "@/domain/models";
import { formatDate, nextTask, progressFor, relativeDateLabel, studentRisk, taskRisk } from "@/domain/student-calculations";
import { cn } from "@/lib/cn";
import { useStudent } from "@/features/students/data";

function PortalTask({ task }: { task: ApplicationTask }) {
  const done = task.status === "done";
  const risk = taskRisk(task, demoClock);
  const visual = done ? taskStatusVisuals.done : riskVisuals[risk as Exclude<typeof risk, "done">];
  return (
    <li className="flex items-center gap-3.5 border-b border-border-subtle px-5 py-4 last:border-b-0">
      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border-2", done ? "border-status-success bg-status-success text-text-inverse" : `${visual.borderClass} bg-surface ${visual.textClass}`)}>{done ? <Check aria-hidden="true" className="size-3.5" /> : <visual.icon aria-hidden="true" className="size-3.5" />}</span>
      <div className="min-w-0 flex-1"><div className={cn("text-sm font-medium leading-[22px]", done ? "text-text-muted line-through" : "text-text-primary")}>{task.name}</div><div className="tabular-nums text-xs leading-4 text-text-muted"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time>{!done && <> · {relativeDateLabel(task.dueDate, demoClock)}</>}</div></div>
      <StatusBadge status={task.status} />
    </li>
  );
}

function PortalTaskGroup({ title, tasks }: { title: string; tasks: ApplicationTask[] }) {
  return <Card className="overflow-hidden"><CardHeader><h2 className="type-component-title">{title}</h2></CardHeader><ol>{tasks.map((task) => <PortalTask task={task} key={task.id} />)}</ol></Card>;
}

export function StudentPortalPage({ studentId }: { studentId: string }) {
  const query = useStudent(studentId);
  if (query.isLoading) return <LoadingState label="Loading student portal" className="mx-auto max-w-[720px] space-y-5 p-6 pt-24"><Skeleton className="h-52 rounded-card" /><Skeleton className="h-64 rounded-card" /></LoadingState>;
  if (!query.data) return <EmptyState icon={GraduationCap} title="Portal not found" description="This student portal link is unavailable." className="min-h-screen" action={<Button asChild variant="secondary"><Link href="/students">Back to consultant view</Link></Button>} />;

  const student = query.data;
  const progress = progressFor(student);
  const risk = studentRisk(student, demoClock);
  const upcoming = nextTask(student);
  const consultant = DEMO_STAFF.find((member) => member.id === student.assignedConsultantId);
  const attention = student.tasks.filter((task) => task.status !== "done" && ["overdue", "at_risk"].includes(taskRisk(task, demoClock))).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const globalTasks = student.tasks.filter((task) => !task.university);
  const universityGroups = student.targetUniversities.map((university) => ({ university, tasks: student.tasks.filter((task) => task.university === university) })).filter((group) => group.tasks.length);
  const encouragement = progress.percent === 100 ? "You have completed every step." : risk === "overdue" ? "A few deadlines have passed. Your consultant can help you catch up." : risk === "at_risk" ? "You are making progress. A couple of deadlines are coming up soon." : "You are on track. Keep moving at a steady pace.";

  return (
    <div className="min-h-screen bg-canvas">
      <a href="#portal-content" className="skip-link">Skip to main content</a>
      <header className="flex h-16 items-center border-b border-border-default bg-surface px-4 sm:px-6">
        <BrandMark compact />
        <span className="ml-5 hidden border-l border-border-default pl-5 text-xs font-medium text-text-muted sm:block">Student view</span>
        <div className="flex-1" />
        <Button asChild variant="ghost" size="sm"><Link href={`/students/${student.id}`}><ArrowLeft /> <span className="hidden sm:inline">Back to consultant view</span><span className="sm:hidden">Consultant view</span></Link></Button>
      </header>

      <main id="portal-content" tabIndex={-1} className="mx-auto max-w-[720px] space-y-5 px-4 py-9 outline-none sm:px-6 sm:py-10 page-enter">
        <Card className="editorial-rule overflow-hidden" padding="lg">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="type-micro text-brand-gold-strong">Application journey</div><h1 className="mt-2 text-[26px] font-semibold leading-8 tracking-[-.025em]">Hi {student.name.split(" ")[0]}, welcome back</h1></div><StatusBadge risk={risk} /></div>
          <p className="mt-2 text-sm leading-[22px] text-text-muted">Here is where you stand on your application to study in Germany — {student.targetIntake} intake.</p>
          <div className="mt-6 flex items-center gap-4"><Progress value={progress.percent} tone={progress.percent === 100 ? "success" : "accent"} label="Application journey progress" className="h-2 flex-1" /><span className="tabular-nums whitespace-nowrap text-sm font-semibold">{progress.done} of {progress.total} steps done</span></div>
          <p className="mt-3 text-[13px] leading-5 text-text-muted">{encouragement}</p>
        </Card>

        {attention.length > 0 && (
          <Notice tone="warning" title="A few things need your attention">
            <p>Message your consultant if you are stuck on any of these items.</p>
            <ul className="mt-3 space-y-2 text-text-primary">{attention.slice(0, 4).map((task) => {
              const taskRiskLevel = taskRisk(task, demoClock) as "overdue" | "at_risk";
              const visual = riskVisuals[taskRiskLevel];
              const Icon = visual.icon;
              return <li key={task.id} className="flex items-center gap-3 rounded-control border border-warning-border bg-surface px-4 py-3"><Icon aria-hidden="true" className={cn("size-4 shrink-0", visual.textClass)} /><div className="min-w-0 flex-1"><div className="text-sm font-medium leading-[22px]">{task.name}</div><div className="tabular-nums text-xs leading-4 text-text-muted">{task.university ? `${task.university} · ` : ""}<time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></div></div><span className={cn("tabular-nums whitespace-nowrap text-xs font-semibold", visual.textClass)}>{relativeDateLabel(task.dueDate, demoClock)}</span></li>;
            })}</ul>
          </Notice>
        )}

        {upcoming && <Card className="flex items-center gap-4" padding="md"><span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft text-brand-gold-strong"><CircleCheck aria-hidden="true" className="size-5" /></span><div className="min-w-0 flex-1"><div className="type-micro text-text-muted">Your next step</div><div className="mt-1 font-semibold leading-6">{upcoming.name}{upcoming.university ? ` · ${upcoming.university}` : ""}</div><div className="tabular-nums text-xs leading-4 text-text-muted"><time dateTime={upcoming.dueDate}>{formatDate(upcoming.dueDate)}</time> · {relativeDateLabel(upcoming.dueDate, demoClock)}</div></div></Card>}
        <PortalTaskGroup title="Global requirements" tasks={globalTasks} />
        {universityGroups.map((group) => <PortalTaskGroup title={group.university} tasks={group.tasks} key={group.university} />)}
        <p className="pb-5 text-center text-xs leading-4 text-text-muted">Questions? Contact {consultant?.name}, your assigned consultant.</p>
      </main>
    </div>
  );
}
