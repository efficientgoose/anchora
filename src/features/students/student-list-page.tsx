import Link from "next/link";
import { ArrowUpRight, Plus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/patterns/page-header";
import type { StudentSummary } from "@/domain/models";
import type { StudentDataLoadResult } from "./server-data";

function intakeLabel(student: StudentSummary) {
  return `${student.intakeSeason === "summer" ? "Summer" : "Winter"} ${student.intakeYear}`;
}

function StudentTable({ students }: { students: StudentSummary[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="hidden grid-cols-[minmax(230px,1.5fr)_minmax(140px,.7fr)_120px_130px] items-center gap-5 border-b border-border-default bg-surface-muted/45 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[.065em] text-text-muted md:grid">
        <span>Student</span>
        <span>Intake</span>
        <span>State</span>
        <span className="text-right">Workspace</span>
      </div>
      <ul className="divide-y divide-border-subtle" aria-label="Students">
        {students.map((student) => (
          <li key={student.id} className="grid gap-3 px-4 py-4 sm:px-5 md:grid-cols-[minmax(230px,1.5fr)_minmax(140px,.7fr)_120px_130px] md:items-center md:gap-5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-5 text-text-primary">{student.fullName}</p>
              <p className="mt-0.5 truncate text-[13px] leading-5 text-text-muted">{student.email}</p>
            </div>
            <div>
              <span className="type-micro text-text-muted md:hidden">Intake</span>
              <p className="mt-0.5 text-[13px] leading-5 text-text-secondary md:mt-0">{intakeLabel(student)}</p>
            </div>
            <div>
              <span className="type-micro text-text-muted md:hidden">State</span>
              <p className="mt-0.5 text-[13px] font-medium leading-5 text-text-secondary md:mt-0">{student.lifecycleStatus === "active" ? "Active" : "Archived"}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="justify-self-start px-0 text-text-secondary hover:bg-transparent hover:text-brand-ink md:justify-self-end">
              <Link href={`/students/${student.id}`}>Open <ArrowUpRight aria-hidden="true" /></Link>
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function UnavailableState({ status }: { status: Exclude<StudentDataLoadResult<StudentSummary[]>["status"], "ready"> }) {
  const copy = status === "disabled"
    ? { title: "Student records are not enabled", description: "This workspace is not currently accepting student records." }
    : status === "legal_required"
      ? { title: "Student records need an agreement", description: "Complete the workspace requirements before student records can be shown." }
      : { title: "Students are unavailable", description: "The student list cannot be shown for this workspace right now." };

  return <Card><EmptyState icon={UsersRound} title={copy.title} description={copy.description} /></Card>;
}

export function StudentListPage({ result }: { result: StudentDataLoadResult<StudentSummary[]> }) {
  if (result.status !== "ready") {
    return (
      <div className="page-container page-enter">
        <PageHeader title="Students" description="Student records for this workspace." />
        <div className="mt-8"><UnavailableState status={result.status} /></div>
      </div>
    );
  }

  const hasStudents = result.data.length > 0;

  return (
    <div className="page-container page-enter">
      <PageHeader
        title="Students"
        description={hasStudents ? `${result.data.length} ${result.data.length === 1 ? "student" : "students"} in this workspace.` : "Keep every Germany journey in one calm, shared place."}
        action={<Button asChild><Link href="/students/new"><Plus aria-hidden="true" />Add student</Link></Button>}
      />
      <div className="mt-8">
        {hasStudents ? <StudentTable students={result.data} /> : (
          <Card className="editorial-rule">
            <EmptyState
              className="py-20 sm:py-24"
              icon={UsersRound}
              title="Begin with a student"
              description="Add the essentials, then Anchora will prepare their Germany journey for your team."
              action={<Button asChild><Link href="/students/new"><Plus aria-hidden="true" />Add student</Link></Button>}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
