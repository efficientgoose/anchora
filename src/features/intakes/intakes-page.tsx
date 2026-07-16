"use client";

import Link from "next/link";
import { AlertCircle, CalendarRange, CheckCircle2, ChevronRight, Timer } from "lucide-react";
import { PageHeader } from "@/components/patterns/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { LoadingState, Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { DEMO_STAFF } from "@/domain/constants";
import { demoClock } from "@/domain/clock";
import { formatDate, nextTask, progressFor, relativeDateLabel, studentRisk } from "@/domain/student-calculations";
import { cn } from "@/lib/cn";
import { useIntakeSummaries } from "./data";

export function IntakesPage() {
  const query = useIntakeSummaries();
  return (
    <div className="mx-auto max-w-[1100px] p-4 sm:p-6 lg:p-8 page-enter">
      <PageHeader className="mb-6" title="Intakes" description="Students grouped by target intake season, with the highest-risk journey at the top of each cohort." />

      {query.isLoading ? (
        <LoadingState label="Loading intake summaries" className="space-y-5">{Array.from({length:3}).map((_, index) => <Skeleton key={index} className="h-56 rounded-card" />)}</LoadingState>
      ) : query.isError ? (
        <Card><EmptyState icon={CalendarRange} title="Intake summaries could not be loaded" description="The workspace could not retrieve cohort data." action={<Button variant="secondary" size="sm" onClick={() => query.refetch()}>Try again</Button>} /></Card>
      ) : (
        <div className="space-y-5">
          {query.data?.map((group) => (
            <Card key={group.intake} className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-border-subtle px-5 py-4 sm:px-[22px]">
                <h2 className="type-section-title">{group.intake}</h2>
                <span className="text-[13px] leading-5 text-text-muted"><span className="tabular-nums">{group.students.length}</span> {group.students.length === 1 ? "student" : "students"}</span>
                <div className="flex-1" />
                {group.counts.overdue > 0 && <Badge tone="danger"><AlertCircle aria-hidden="true" className="size-3.5" /><span className="tabular-nums">{group.counts.overdue}</span> overdue</Badge>}
                {group.counts.atRisk > 0 && <Badge tone="warning"><Timer aria-hidden="true" className="size-3.5" /><span className="tabular-nums">{group.counts.atRisk}</span> at risk</Badge>}
                <Badge tone="success"><CheckCircle2 aria-hidden="true" className="size-3.5" /><span className="tabular-nums">{group.counts.onTrack}</span> on track</Badge>
              </div>

              <div role="row" className="hidden grid-cols-[116px_minmax(150px,1.3fr)_minmax(220px,1.5fr)_minmax(150px,1fr)_20px] gap-4 border-b border-border-subtle bg-surface-muted/50 px-[22px] py-2.5 text-[11px] font-semibold uppercase tracking-[.065em] text-text-muted md:grid"><span>RISK</span><span>STUDENT</span><span>NEXT DEADLINE</span><span>PROGRESS</span><span /></div>
              <div>
                {group.students.map((student) => {
                  const risk = studentRisk(student, demoClock);
                  const task = nextTask(student);
                  const progress = progressFor(student);
                  const consultant = DEMO_STAFF.find((member) => member.id === student.assignedConsultantId);
                  return (
                    <Link key={student.id} href={`/students/${student.id}`} className={cn("relative grid gap-3 border-b border-border-subtle px-5 py-4 outline-none transition-colors [transition-duration:var(--motion-fast)] last:border-b-0 hover:bg-surface-muted focus-visible:bg-accent-soft focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gold-strong md:grid-cols-[116px_minmax(150px,1.3fr)_minmax(220px,1.5fr)_minmax(150px,1fr)_20px] md:items-center md:gap-4 md:px-[22px]", "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-['']", risk === "overdue" ? "before:bg-status-danger" : risk === "at_risk" ? "before:bg-status-warning" : "before:bg-status-success")}>
                      <StatusBadge risk={risk} className="w-fit" />
                      <div><div className="text-sm font-semibold leading-[22px] text-text-primary">{student.name}</div><div className="text-xs leading-4 text-text-muted">{consultant?.name}</div></div>
                      <div>{task ? <><div className="truncate text-[13px] font-medium leading-5 text-text-secondary">{task.name}{task.university ? ` · ${task.university}` : ""}</div><div className={cn("tabular-nums text-xs leading-4", risk === "overdue" ? "font-semibold text-status-danger" : risk === "at_risk" ? "text-status-warning" : "text-text-muted")}><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time> · {relativeDateLabel(task.dueDate, demoClock)}</div></> : <span className="text-xs font-medium text-status-success">All complete</span>}</div>
                      <div className="flex items-center gap-3"><Progress value={progress.percent} tone={progress.percent === 100 ? "success" : "neutral"} label={`${student.name} checklist progress`} className="w-full max-w-[110px]" /><span className="tabular-nums whitespace-nowrap text-xs text-text-muted">{progress.done} / {progress.total}</span></div>
                      <ChevronRight aria-hidden="true" className="hidden size-4 text-text-muted md:block" />
                    </Link>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
