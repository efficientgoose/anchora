"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, CircleCheck, GraduationCap } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DEMO_STAFF } from "@/domain/constants";
import { demoClock } from "@/domain/clock";
import type { ApplicationTask } from "@/domain/models";
import { formatDate, nextTask, progressFor, relativeDateLabel, studentRisk, taskRisk } from "@/domain/student-calculations";
import { cn } from "@/lib/cn";
import { statusMeta } from "@/features/students/risk-ui";
import { useStudent } from "@/features/students/data";

function PortalTask({ task }: { task: ApplicationTask }) {
  const done = task.status === "done"; const risk = taskRisk(task, demoClock); const status = statusMeta[task.status];
  return (
    <div className="flex items-center gap-3.5 border-b border-slate-100 px-5 py-3.5 last:border-b-0">
      <span className={cn("flex size-[22px] shrink-0 items-center justify-center rounded-full", done ? "bg-green-600 text-white" : risk === "overdue" ? "border-2 border-red-200 bg-white" : risk === "at_risk" ? "border-2 border-amber-200 bg-white" : "border-2 border-slate-200 bg-white")}>{done && <Check className="size-3" />}</span>
      <div className="min-w-0 flex-1"><div className={cn("text-sm font-medium", done ? "text-slate-400 line-through" : "text-slate-900")}>{task.name}</div><div className="text-xs text-slate-400">{done ? `Completed ${formatDate(task.dueDate)}` : formatDate(task.dueDate)}</div></div><span className={cn("text-xs font-semibold", status.text)}>{status.label}</span>
    </div>
  );
}

function PortalTaskGroup({ title, tasks }: { title: string; tasks: ApplicationTask[] }) {
  return <Card className="overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><h2 className="text-base font-semibold">{title}</h2></div>{tasks.map((task) => <PortalTask task={task} key={task.id} />)}</Card>;
}

export function StudentPortalPage({ studentId }: { studentId: string }) {
  const query = useStudent(studentId);
  if (query.isLoading) return <div className="mx-auto max-w-[720px] animate-pulse space-y-5 p-6 pt-24"><div className="h-52 rounded-xl bg-slate-200" /><div className="h-64 rounded-xl bg-slate-200" /></div>;
  if (!query.data) return <div className="flex min-h-screen flex-col items-center justify-center"><GraduationCap className="size-10 text-slate-300" /><h1 className="mt-4 text-lg font-semibold">Portal not found</h1><Link href="/students" className="mt-3 text-sm text-indigo-600">Back to consultant view</Link></div>;
  const student = query.data; const progress = progressFor(student); const risk = studentRisk(student, demoClock); const upcoming = nextTask(student); const consultant = DEMO_STAFF.find((member) => member.id === student.assignedConsultantId);
  const attention = student.tasks.filter((task) => task.status !== "done" && ["overdue", "at_risk"].includes(taskRisk(task, demoClock))).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const globalTasks = student.tasks.filter((task) => !task.university); const universityGroups = student.targetUniversities.map((university) => ({ university, tasks: student.tasks.filter((task) => task.university === university) })).filter((group) => group.tasks.length);
  const encouragement = progress.percent === 100 ? "Amazing — you have completed every step!" : risk === "overdue" ? "A few deadlines have already passed. Let’s catch up together." : risk === "at_risk" ? "You’re making good progress — a couple of deadlines are coming up soon." : "You’re on track. Keep going at a steady pace.";
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex h-14 items-center border-b border-slate-200 bg-white px-4 sm:px-6"><BrandMark compact /><span className="ml-5 hidden border-l border-slate-200 pl-5 text-xs text-slate-400 sm:block">Student view</span><div className="flex-1" /><Link href={`/students/${student.id}`} className="flex items-center gap-1.5 text-[13px] font-medium text-indigo-600 hover:text-indigo-700"><ArrowLeft className="size-3.5" /> Back to consultant view</Link></header>
      <main className="mx-auto max-w-[720px] space-y-5 px-4 py-9 sm:px-6 sm:py-10 page-enter">
        <Card className="p-6 sm:p-8"><h1 className="text-[26px] font-semibold tracking-[-.025em]">Hi {student.name.split(" ")[0]}, welcome back</h1><p className="mt-1 text-sm leading-5 text-slate-500">Here&apos;s where you stand on your application to study in Germany — {student.targetIntake} intake.</p><div className="mt-6 flex items-center gap-4"><Progress value={progress.percent} className="h-2 flex-1" /><span className="whitespace-nowrap text-sm font-semibold">{progress.done} of {progress.total} steps done</span></div><p className="mt-3 text-[13px] text-slate-500">{encouragement}</p></Card>
        {attention.length > 0 && <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5"><div className="mb-3"><h2 className="flex items-center gap-2 text-sm font-semibold text-amber-800"><AlertTriangle className="size-4" />A few things need your attention</h2><p className="mt-1 text-xs text-amber-700">Let&apos;s get these moving — message your counsellor if you&apos;re stuck on any of them.</p></div><div className="space-y-2">{attention.slice(0, 4).map((task) => { const over = taskRisk(task, demoClock) === "overdue"; return <div key={task.id} className="flex items-center gap-3 rounded-lg border border-amber-100 bg-white px-4 py-3"><span className={cn("size-2 rounded-full", over ? "bg-red-600" : "bg-amber-500")} /><div className="min-w-0 flex-1"><div className="text-sm font-medium">{task.name}</div><div className="text-xs text-slate-400">{task.university ? `${task.university} · ` : ""}{formatDate(task.dueDate)}</div></div><span className={cn("whitespace-nowrap text-xs font-semibold", over ? "text-red-700" : "text-amber-700")}>{relativeDateLabel(task.dueDate, demoClock)}</span></div>; })}</div></section>}
        {upcoming && <Card className="flex items-center gap-4 p-5"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"><CircleCheck className="size-5" /></span><div className="min-w-0 flex-1"><div className="text-xs font-medium uppercase tracking-[.05em] text-slate-400">Your next step</div><div className="mt-1 font-semibold">{upcoming.name}{upcoming.university ? ` · ${upcoming.university}` : ""}</div><div className="text-xs text-slate-500">{formatDate(upcoming.dueDate)} · {relativeDateLabel(upcoming.dueDate, demoClock)}</div></div></Card>}
        <PortalTaskGroup title="Global Requirements" tasks={globalTasks} />
        {universityGroups.map((group) => <PortalTaskGroup title={group.university} tasks={group.tasks} key={group.university} />)}
        <p className="pb-5 text-center text-xs text-slate-400">Questions? Contact {consultant?.name}, your assigned consultant.</p>
      </main>
    </div>
  );
}
