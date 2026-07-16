"use client";

import Link from "next/link";
import { CalendarRange, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DEMO_STAFF } from "@/domain/constants";
import { demoClock } from "@/domain/clock";
import { nextTask, progressFor, relativeDateLabel, studentRisk } from "@/domain/student-calculations";
import { RiskBadge } from "@/features/students/risk-ui";
import { useIntakeSummaries } from "./data";

export function IntakesPage() {
  const query = useIntakeSummaries();
  return (
    <div className="mx-auto max-w-[1100px] p-4 sm:p-6 lg:p-8 page-enter">
      <header className="mb-5"><h1 className="text-2xl font-semibold tracking-[-.025em]">Intakes</h1><p className="mt-1 text-sm text-slate-500">Students grouped by target intake season, sorted by how soon each cohort starts.</p></header>
      {query.isLoading ? <div className="space-y-5">{Array.from({length:3}).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-xl bg-slate-200" />)}</div> : query.isError ? <div className="rounded-xl border border-slate-200 bg-white p-12 text-center"><CalendarRange className="mx-auto size-9 text-slate-300" /><p className="mt-3 text-sm font-medium">Intake summaries could not be loaded</p><button onClick={() => query.refetch()} className="mt-2 text-sm text-indigo-600">Try again</button></div> : <div className="space-y-5">
        {query.data?.map((group) => (
          <Card key={group.intake} className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-[22px]"><h2 className="text-lg font-semibold">{group.intake}</h2><span className="text-[13px] text-slate-400">{group.students.length} {group.students.length === 1 ? "student" : "students"}</span><div className="flex-1" />{group.counts.overdue > 0 && <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">● {group.counts.overdue} overdue</span>}{group.counts.atRisk > 0 && <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">● {group.counts.atRisk} at risk</span>}<span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">● {group.counts.onTrack} on track</span></div>
            <div className="hidden grid-cols-[104px_minmax(150px,1.3fr)_minmax(150px,1.4fr)_minmax(150px,1fr)_20px] gap-4 border-b border-slate-100 bg-slate-50/40 px-[22px] py-2.5 text-[11px] font-semibold uppercase tracking-[.04em] text-slate-400 md:grid"><span>Risk</span><span>Student</span><span>Next Deadline</span><span>Progress</span><span /></div>
            {group.students.map((student) => { const risk = studentRisk(student, demoClock); const task = nextTask(student); const progress = progressFor(student); const consultant = DEMO_STAFF.find((member) => member.id === student.assignedConsultantId); return (
              <Link key={student.id} href={`/students/${student.id}`} className="grid gap-3 border-b border-slate-100 px-5 py-3.5 transition last:border-b-0 hover:bg-slate-50 md:grid-cols-[104px_minmax(150px,1.3fr)_minmax(150px,1.4fr)_minmax(150px,1fr)_20px] md:items-center md:gap-4 md:px-[22px]">
                <RiskBadge risk={risk} className="w-fit" /><div><div className="text-sm font-semibold">{student.name}</div><div className="text-xs text-slate-400">{consultant?.name}</div></div><div>{task ? <><div className="truncate text-[13px] font-medium text-slate-700">{task.name}{task.university ? ` · ${task.university}` : ""}</div><div className={`text-xs ${risk === "overdue" ? "font-semibold text-red-700" : risk === "at_risk" ? "text-amber-700" : "text-slate-400"}`}>{relativeDateLabel(task.dueDate, demoClock)}</div></> : <span className="text-xs text-green-700">All complete</span>}</div><div className="flex items-center gap-3"><Progress value={progress.percent} className="w-full max-w-[110px]" /><span className="whitespace-nowrap text-xs text-slate-500">{progress.done} / {progress.total}</span></div><ChevronRight className="hidden size-4 text-slate-300 md:block" />
              </Link>
            ); })}
          </Card>
        ))}
      </div>}
    </div>
  );
}
