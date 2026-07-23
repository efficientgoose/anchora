import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, GraduationCap } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import type { JourneyTaskStatus, StudentWorkspace } from "@/domain/models";
import type { StudentDataLoadResult } from "@/features/students/server-data";

const statusLabel: Record<JourneyTaskStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  completed: "Completed",
};

function intakeLabel(season: "summer" | "winter", year: number) {
  return `${season === "summer" ? "Summer" : "Winter"} ${year}`;
}

function PreviewUnavailable({ result }: { result: Exclude<StudentDataLoadResult<StudentWorkspace>, { status: "ready" }> }) {
  const title = result.status === "not_found" ? "Preview not found" : "Preview unavailable";
  return <EmptyState icon={GraduationCap} title={title} description="This consultant preview cannot be shown right now." className="min-h-screen" action={<Button asChild variant="secondary"><Link href="/students">Back to students</Link></Button>} />;
}

export function StudentPortalPage({ result }: { result: StudentDataLoadResult<StudentWorkspace> }) {
  if (result.status !== "ready") return <PreviewUnavailable result={result} />;
  const { student, stages } = result.data;
  const completed = stages.flatMap((stage) => stage.tasks).filter((task) => task.status === "completed").length;
  const total = stages.reduce((count, stage) => count + stage.tasks.length, 0);

  return (
    <div className="min-h-full bg-canvas">
      <a href="#preview-content" className="skip-link">Skip to main content</a>
      <header className="flex h-16 items-center border-b border-border-default bg-surface px-4 sm:px-6"><BrandMark compact /><span className="ml-5 hidden border-l border-border-default pl-5 text-xs font-medium text-text-muted sm:block">Consultant preview</span><div className="flex-1" /><Button asChild variant="ghost" size="sm"><Link href={`/students/${student.id}`}><ArrowLeft /> <span className="hidden sm:inline">Back to student</span><span className="sm:hidden">Back</span></Link></Button></header>
      <main id="preview-content" tabIndex={-1} className="mx-auto max-w-[760px] space-y-5 px-4 py-9 outline-none sm:px-6 sm:py-10 page-enter">
        <Notice tone="info" title="Consultant preview"><span>This is an internal, read-only preview. It is not a student login or public portal.</span></Notice>
        <Card className="editorial-rule overflow-hidden" padding="lg"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="type-micro text-brand-gold-strong">Germany application journey</div><h1 className="mt-2 text-[26px] font-semibold leading-8 tracking-[-.025em]">Journey overview</h1><p className="mt-2 text-sm leading-[22px] text-text-muted">{intakeLabel(student.intakeSeason, student.intakeYear)} intake · {completed} of {total} tasks completed</p></div><Eye aria-hidden="true" className="size-5 text-brand-gold-strong" /></div><p className="mt-5 text-[13px] leading-5 text-text-muted">All displayed dates are planning targets and not official deadlines.</p></Card>
        <ol className="space-y-4">{stages.map((stage) => { const stageCompleted = stage.tasks.filter((task) => task.status === "completed").length; return <li key={stage.id}><Card className="overflow-hidden"><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="type-component-title">{stage.displayOrder}. {stage.title}</h2><span className="text-xs text-text-muted">{stageCompleted} / {stage.tasks.length} completed</span></div></CardHeader><ol>{stage.tasks.map((task) => <li key={task.id} className="flex gap-3 border-b border-border-subtle px-5 py-4 last:border-b-0"><CheckCircle2 aria-hidden="true" className={task.status === "completed" ? "mt-0.5 size-4 shrink-0 text-status-success" : "mt-0.5 size-4 shrink-0 text-text-muted"} /><div className="min-w-0 flex-1"><h3 className={task.status === "completed" ? "text-sm font-medium leading-[22px] text-text-muted line-through" : "text-sm font-medium leading-[22px] text-text-primary"}>{task.title}</h3><p className="mt-1 text-xs leading-4 text-text-muted">{statusLabel[task.status]} · Planning target <time dateTime={task.planningTargetDate}>{task.planningTargetDate}</time></p></div></li>)}</ol></Card></li>; })}</ol>
      </main>
    </div>
  );
}
