"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, GraduationCap, Mail, Phone } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DEMO_STAFF } from "@/domain/constants";
import { demoClock } from "@/domain/clock";
import type { ApplicationTask, TaskStatus } from "@/domain/models";
import { formatDate, initials, progressFor, relativeDateLabel, studentRisk, taskRisk } from "@/domain/student-calculations";
import { cn } from "@/lib/cn";
import { useStudent, useUpdateTaskStatus } from "./data";
import { RiskBadge, riskMeta } from "./risk-ui";
import { TaskStatusMenu } from "./task-status-menu";

function TaskRow({ task, onStatus, pending }: { task: ApplicationTask; onStatus: (status: TaskStatus) => void; pending: boolean }) {
  const risk = taskRisk(task, demoClock); const complete = task.status === "done"; const riskStyle = risk === "done" ? riskMeta.on_track : riskMeta[risk];
  return (
    <div className="grid gap-3 border-b border-slate-100 px-5 py-3.5 last:border-b-0 sm:grid-cols-[18px_minmax(130px,1fr)_160px_150px] sm:items-center sm:gap-4 sm:px-6">
      <span className={cn("hidden size-[9px] rounded-full sm:block", complete ? "bg-green-600" : riskStyle.dot)} />
      <div className="flex min-w-0 items-center gap-2 sm:block"><span className={cn("size-2 rounded-full sm:hidden", complete ? "bg-green-600" : riskStyle.dot)} /><span className={cn("text-sm font-medium", complete ? "text-slate-400 line-through" : "text-brand-charcoal")}>{task.name}</span></div>
      <div><div className={cn("text-[13px] font-medium", complete ? "text-slate-400" : "text-slate-700")}>{formatDate(task.dueDate)}</div><div className={cn("text-xs", complete ? "text-slate-400" : risk === "overdue" ? "font-semibold text-red-700" : risk === "at_risk" ? "text-amber-700" : "text-slate-400")}>{complete ? "Completed" : relativeDateLabel(task.dueDate, demoClock)}</div></div>
      <div className="sm:text-right"><TaskStatusMenu value={task.status} onChange={onStatus} disabled={pending} /></div>
    </div>
  );
}

function TaskGroup({ title, subtitle, tasks, update, pendingTask }: { title: string; subtitle?: string; tasks: ApplicationTask[]; update: (taskId: string, status: TaskStatus) => void; pendingTask: string | null }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h2 className="text-base font-semibold">{title} {subtitle && <span className="font-normal text-slate-400">· {subtitle}</span>}</h2></div>
      {tasks.map((task) => <TaskRow key={task.id} task={task} pending={pendingTask === task.id} onStatus={(status) => update(task.id, status)} />)}
    </Card>
  );
}

export function StudentDetailPage({ studentId }: { studentId: string }) {
  const query = useStudent(studentId); const mutation = useUpdateTaskStatus(studentId);
  if (query.isLoading) return <div className="mx-auto max-w-[1100px] animate-pulse space-y-5 p-6 lg:p-8"><div className="h-6 w-40 rounded bg-slate-200" /><div className="h-64 rounded-xl bg-slate-200" /><div className="h-80 rounded-xl bg-slate-200" /></div>;
  if (!query.data) return <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center"><GraduationCap className="size-10 text-slate-300" /><h1 className="mt-4 text-lg font-semibold">Student not found</h1><Button asChild variant="secondary" className="mt-4"><Link href="/students"><ArrowLeft /> Back to Students</Link></Button></div>;
  const student = query.data; const risk = studentRisk(student, demoClock); const progress = progressFor(student); const consultant = DEMO_STAFF.find((member) => member.id === student.assignedConsultantId);
  const globalTasks = student.tasks.filter((task) => !task.university); const universityGroups = student.targetUniversities.map((university) => ({ university, tasks: student.tasks.filter((task) => task.university === university) })).filter((group) => group.tasks.length);
  const update = (taskId: string, status: TaskStatus) => mutation.mutate({ taskId, status });
  return (
    <div className="mx-auto max-w-[1100px] space-y-5 p-4 sm:p-6 lg:p-8 page-enter">
      <nav className="flex items-center gap-2 text-[13px] text-slate-400" aria-label="Breadcrumb"><Link href="/students" className="text-slate-500 hover:text-brand-charcoal">Students</Link><span>/</span><span className="font-medium text-slate-700">{student.name}</span></nav>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-start gap-4 px-5 py-5 sm:px-6">
          <Avatar initials={initials(student.name)} className="size-[52px] text-lg" />
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h1 className="text-[22px] font-semibold tracking-[-.02em]">{student.name}</h1><RiskBadge risk={risk} /></div><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-400"><span className="flex items-center gap-1.5"><Mail className="size-3.5" />{student.email}</span><span className="flex items-center gap-1.5"><Phone className="size-3.5" />{student.phone}</span></div></div>
          <Button asChild variant="secondary"><Link href={`/portal/${student.id}`}>View Student Portal <ArrowUpRight /></Link></Button>
        </div>
        <div className="grid gap-5 border-t border-slate-100 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1fr_1.2fr_1fr_1.2fr]">
          <div><div className="text-xs text-slate-400">Target Intake</div><div className="mt-1 text-sm font-medium">{student.targetIntake}</div></div>
          <div><div className="text-xs text-slate-400">Target Universities</div><div className="mt-1 flex flex-wrap gap-1">{student.targetUniversities.map((university) => <span key={university} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">{university}</span>)}</div></div>
          <div><div className="text-xs text-slate-400">Assigned Consultant</div><div className="mt-1 text-sm font-medium">{consultant?.name}</div></div>
          <div><div className="text-xs text-slate-400">Checklist Progress</div><div className="mt-2 flex items-center gap-3"><Progress value={progress.percent} className="w-full max-w-[150px]" /><span className="whitespace-nowrap text-sm font-medium">{progress.done} / {progress.total}</span></div></div>
        </div>
      </Card>
      <TaskGroup title="Global Requirements" subtitle="one-time tasks" tasks={globalTasks} update={update} pendingTask={mutation.isPending ? mutation.variables?.taskId ?? null : null} />
      {universityGroups.map((group) => <TaskGroup key={group.university} title={group.university} subtitle="university application" tasks={group.tasks} update={update} pendingTask={mutation.isPending ? mutation.variables?.taskId ?? null : null} />)}
      {mutation.isError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">That status could not be saved. Please try again.</div>}
    </div>
  );
}
