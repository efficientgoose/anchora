import Link from "next/link";
import { CalendarRange, ChevronRight, Users } from "lucide-react";
import { PageHeader } from "@/components/patterns/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { StudentIntakeGroup } from "@/domain/models";
import type { StudentDataLoadResult } from "@/features/students/server-data";

function groupLabel(group: StudentIntakeGroup) {
  return `${group.intakeSeason === "summer" ? "Summer" : "Winter"} ${group.intakeYear}`;
}

function UnavailableIntakes({ result }: { result: Exclude<StudentDataLoadResult<StudentIntakeGroup[]>, { status: "ready" }> }) {
  const title = result.status === "disabled" ? "Intakes are not enabled" : result.status === "legal_required" ? "Agreement required" : "Intakes are unavailable";
  const description = result.status === "disabled" ? "This workspace is not accepting student records yet." : result.status === "legal_required" ? "Complete the required workspace agreements before viewing intake summaries." : "The workspace could not retrieve intake groups.";
  return <div className="mx-auto max-w-[1100px] p-4 sm:p-6 lg:p-8"><Card><EmptyState icon={CalendarRange} title={title} description={description} action={<Button asChild variant="secondary"><Link href="/students">Back to students</Link></Button>} /></Card></div>;
}

export function IntakesPage({ result }: { result: StudentDataLoadResult<StudentIntakeGroup[]> }) {
  if (result.status !== "ready") return <UnavailableIntakes result={result} />;
  const groups = result.data;
  return (
    <div className="mx-auto max-w-[1100px] p-4 sm:p-6 lg:p-8 page-enter">
      <PageHeader className="mb-6" title="Intakes" description="Students grouped by their selected intake season and year." />
      {groups.length === 0 ? <Card><EmptyState icon={Users} title="No intake groups yet" description="Student groups will appear here after a Germany journey is created." action={<Button asChild><Link href="/students/new">Add student</Link></Button>} /></Card> : <div className="space-y-5">{groups.map((group) => <Card key={`${group.intakeSeason}-${group.intakeYear}`} className="overflow-hidden"><div className="flex flex-wrap items-center gap-3 border-b border-border-subtle px-5 py-4 sm:px-6"><h2 className="type-section-title">{groupLabel(group)}</h2><Badge tone="neutral"><span className="tabular-nums">{group.students.length}</span> {group.students.length === 1 ? "student" : "students"}</Badge></div><ul>{group.students.map((student) => <li key={student.id}><Link href={`/students/${student.id}`} className="flex items-center gap-4 border-b border-border-subtle px-5 py-4 outline-none transition-colors [transition-duration:var(--motion-fast)] last:border-b-0 hover:bg-surface-muted focus-visible:bg-accent-soft focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gold-strong sm:px-6"><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold leading-[22px] text-text-primary">{student.fullName}</div><div className="truncate text-xs leading-4 text-text-muted">{student.email}</div></div><span className={student.lifecycleStatus === "archived" ? "rounded-full border border-warning-border bg-warning-soft px-2 py-0.5 text-xs font-semibold text-status-warning" : "rounded-full border border-success-border bg-success-soft px-2 py-0.5 text-xs font-semibold text-status-success"}>{student.lifecycleStatus === "archived" ? "Archived" : "Active"}</span><ChevronRight aria-hidden="true" className="size-4 shrink-0 text-text-muted" /></Link></li>)}</ul></Card>)}</div>}
    </div>
  );
}
