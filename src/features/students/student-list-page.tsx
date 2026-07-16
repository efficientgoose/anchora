"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Plus, Search, SlidersHorizontal, UserRound } from "lucide-react";
import { PageHeader } from "@/components/patterns/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState, Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { StatusBadge, riskVisuals } from "@/components/ui/status-badge";
import { DEMO_STAFF, INTAKES } from "@/domain/constants";
import type { RiskLevel, Student, StudentQuery, StudentSortField } from "@/domain/models";
import { formatDate, initials, nextTask, progressFor, relativeDateLabel, studentRisk } from "@/domain/student-calculations";
import { demoClock } from "@/domain/clock";
import { cn } from "@/lib/cn";
import { useStudentOverview, useStudents } from "./data";

const columnHelper = createColumnHelper<Student>();

function parseQuery(params: URLSearchParams): StudentQuery {
  const risk = params.get("risk");
  const sortBy = params.get("sort") as StudentSortField | null;
  const direction = params.get("direction");
  return {
    page: Math.max(1, Number(params.get("page")) || 1),
    pageSize: 8,
    search: params.get("search") ?? "",
    risk: risk === "overdue" || risk === "at_risk" || risk === "on_track" ? risk : "all",
    consultantId: params.get("consultant") ?? "all",
    intake: params.get("intake") ?? "all",
    sortBy: sortBy && ["risk", "name", "intake", "consultant"].includes(sortBy) ? sortBy : "risk",
    sortDirection: direction === "asc" ? "asc" : "desc",
  };
}

function RiskTile({ risk, value, active, onClick }: { risk: RiskLevel; value: number; active: boolean; onClick: () => void }) {
  const visual = riskVisuals[risk];
  const Icon = visual.icon;
  const copy = risk === "overdue" ? "A task is past due — act today" : risk === "at_risk" ? "A task is due within seven days" : "No urgent deadline right now";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("editorial-rule min-h-[132px] rounded-card border bg-surface px-[18px] py-4 text-left shadow-subtle outline-none transition [transition-duration:var(--motion-fast)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-popover focus-visible:ring-[3px] focus-visible:ring-brand-gold/30", active ? `${visual.softClass} ${visual.borderClass}` : "border-border-default")}
    >
      <span className="flex items-center justify-between gap-3 text-[13px] font-semibold leading-5 text-text-secondary"><span>{visual.label}</span><Icon aria-hidden="true" className={cn("size-4", visual.textClass)} /></span>
      <span className={cn("tabular-nums mt-2 block text-[34px] font-bold leading-none tracking-[-.03em]", visual.textClass)}>{value}</span>
      <span className="mt-1.5 block text-xs leading-4 text-text-muted">{copy}</span>
    </button>
  );
}

function StudentCard({ student }: { student: Student }) {
  const risk = studentRisk(student, demoClock);
  const progress = progressFor(student);
  const upcoming = nextTask(student);
  const consultant = DEMO_STAFF.find((member) => member.id === student.assignedConsultantId);
  return (
    <Link href={`/students/${student.id}`} className="block min-w-0 overflow-hidden rounded-card border border-border-default bg-surface p-4 shadow-subtle outline-none transition [transition-duration:var(--motion-fast)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-popover focus-visible:ring-[3px] focus-visible:ring-brand-gold/30">
      <div className="flex min-w-0 items-start gap-3"><Avatar initials={initials(student.name)} /><div className="min-w-0 flex-1"><div className="font-semibold text-text-primary">{student.name}</div><div className="truncate text-xs leading-4 text-text-muted">{student.email}</div></div><StatusBadge risk={risk} className="shrink-0" /></div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs leading-4"><div><dt className="text-text-muted">Intake</dt><dd className="mt-1 font-medium text-text-secondary">{student.targetIntake}</dd></div><div><dt className="text-text-muted">Consultant</dt><dd className="mt-1 font-medium text-text-secondary">{consultant?.name}</dd></div></dl>
      <div className="mt-4 flex items-center gap-3"><Progress value={progress.percent} tone={progress.percent === 100 ? "success" : "neutral"} label={`${student.name} checklist progress`} className="flex-1" /><span className="tabular-nums text-xs text-text-muted">{progress.done} / {progress.total}</span></div>
      {upcoming && <div className="mt-3 border-t border-border-subtle pt-3 text-xs leading-4 text-text-muted"><span className="font-medium text-text-secondary">{upcoming.name}</span><span aria-hidden="true"> · </span><time dateTime={upcoming.dueDate}>{formatDate(upcoming.dueDate)}</time><span aria-hidden="true"> · </span>{relativeDateLabel(upcoming.dueDate, demoClock)}</div>}
    </Link>
  );
}

export function StudentListPage() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const paramsKey = params.toString();
  const query = React.useMemo(() => parseQuery(new URLSearchParams(paramsKey)), [paramsKey]);
  const [search, setSearch] = React.useState(query.search);
  const studentsQuery = useStudents(query);
  const overviewQuery = useStudentOverview();
  const totalStudents = overviewQuery.data?.total ?? 0;
  const counts = overviewQuery.data?.counts ?? { overdue: 0, atRisk: 0, onTrack: 0 };

  const update = React.useCallback((changes: Record<string, string | null>) => {
    const next = new URLSearchParams(paramsKey);
    Object.entries(changes).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "page" && value === "1")) next.delete(key);
      else next.set(key, value);
    });
    if (!("page" in changes)) next.delete("page");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }, [paramsKey, pathname, router]);

  React.useEffect(() => setSearch(query.search), [query.search]);
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== query.search) update({ search: search || null });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search, query.search, update]);

  const sort = React.useCallback((field: StudentSortField) => update({ sort: field, direction: query.sortBy === field && query.sortDirection === "desc" ? "asc" : "desc" }), [query.sortBy, query.sortDirection, update]);
  const indicator = React.useCallback((field: StudentSortField) => query.sortBy === field ? (query.sortDirection === "desc" ? <ArrowDown aria-hidden="true" className="size-3" /> : <ArrowUp aria-hidden="true" className="size-3" />) : null, [query.sortBy, query.sortDirection]);
  const columns = React.useMemo(() => [
    columnHelper.display({ id: "risk", header: () => <button type="button" onClick={() => sort("risk")} className="flex min-h-6 items-center gap-1 rounded-sm">RISK {indicator("risk")}</button>, cell: ({ row }) => <StatusBadge risk={studentRisk(row.original, demoClock)} /> }),
    columnHelper.accessor("name", { header: () => <button type="button" onClick={() => sort("name")} className="flex min-h-6 items-center gap-1 rounded-sm">STUDENT {indicator("name")}</button>, cell: ({ row }) => <div className="flex min-w-0 items-center gap-2.5"><Avatar initials={initials(row.original.name)} className="size-7 text-[10.5px]" /><div className="min-w-0"><div className="truncate text-[13px] font-semibold leading-5 text-text-primary">{row.original.name}</div><div className="truncate text-[11.5px] leading-4 text-text-muted">{row.original.email}</div></div></div> }),
    columnHelper.accessor("targetIntake", { header: () => <button type="button" onClick={() => sort("intake")} className="flex min-h-6 items-center gap-1 rounded-sm">INTAKE {indicator("intake")}</button>, cell: ({ getValue }) => <span className="text-[13px] leading-5 text-text-secondary">{getValue()}</span> }),
    columnHelper.display({ id: "next", header: "NEXT DEADLINE", cell: ({ row }) => { const task = nextTask(row.original); const risk = studentRisk(row.original, demoClock); return task ? <div><div className="max-w-[180px] truncate text-[13px] font-medium leading-5 text-text-secondary">{task.name}{task.university ? ` · ${task.university}` : ""}</div><div className={cn("tabular-nums text-xs leading-4", risk === "overdue" ? "font-semibold text-status-danger" : risk === "at_risk" ? "text-status-warning" : "text-text-muted")}><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time> · {relativeDateLabel(task.dueDate, demoClock)}</div></div> : <span className="text-xs font-medium text-status-success">All complete</span>; } }),
    columnHelper.display({ id: "consultant", header: () => <button type="button" onClick={() => sort("consultant")} className="flex min-h-6 items-center gap-1 rounded-sm">CONSULTANT {indicator("consultant")}</button>, cell: ({ row }) => <span className="text-[13px] leading-5 text-text-secondary">{DEMO_STAFF.find((member) => member.id === row.original.assignedConsultantId)?.name}</span> }),
    columnHelper.display({ id: "progress", header: "PROGRESS", cell: ({ row }) => { const progress = progressFor(row.original); return <div className="flex min-w-[108px] items-center gap-2"><span className="tabular-nums w-9 text-xs text-text-muted">{progress.done} / {progress.total}</span><Progress value={progress.percent} tone={progress.percent === 100 ? "success" : "neutral"} label={`${row.original.name} checklist progress`} className="w-16" /></div>; } }),
  ], [indicator, sort]);
  const table = useReactTable({ data: studentsQuery.data?.items ?? [], columns, getCoreRowModel: getCoreRowModel(), manualPagination: true, manualSorting: true, rowCount: studentsQuery.data?.total ?? 0 });
  const hasFilters = Boolean(query.search || query.risk !== "all" || query.consultantId !== "all" || query.intake !== "all");

  return (
    <div className="page-container page-enter overflow-x-hidden">
      <PageHeader
        className="mb-6"
        title="Students"
        description={<><span className="tabular-nums">{totalStudents}</span> active students · <span className="tabular-nums">{counts.overdue + counts.atRisk}</span> need attention</>}
        action={<Button asChild className="px-3 sm:px-4"><Link href="/students/new" aria-label="Add student"><Plus /><span className="hidden sm:inline">Add student</span></Link></Button>}
      />

      <section className="mb-5 grid gap-3 sm:grid-cols-3 sm:gap-4" aria-labelledby="risk-summary-title">
        <h2 id="risk-summary-title" className="sr-only">Risk summary</h2>
        <RiskTile risk="overdue" value={counts.overdue} active={query.risk === "overdue"} onClick={() => update({ risk: query.risk === "overdue" ? null : "overdue" })} />
        <RiskTile risk="at_risk" value={counts.atRisk} active={query.risk === "at_risk"} onClick={() => update({ risk: query.risk === "at_risk" ? null : "at_risk" })} />
        <RiskTile risk="on_track" value={counts.onTrack} active={query.risk === "on_track"} onClick={() => update({ risk: query.risk === "on_track" ? null : "on_track" })} />
      </section>

      <Card className="overflow-hidden">
        <div className="grid min-w-0 grid-cols-1 items-center gap-2 border-b border-border-subtle p-3 sm:flex sm:flex-wrap sm:px-4" aria-label="Student filters">
          <div className="relative w-full sm:max-w-[240px] sm:flex-1"><Search aria-hidden="true" className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" /><Input size="sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students…" className="pl-8" aria-label="Search students" /></div>
          <Select size="sm" ariaLabel="Filter by risk" value={query.risk} onValueChange={(value) => update({ risk: value })} className="w-full sm:w-[120px]" options={[{value:"all",label:"All risk"},{value:"overdue",label:"Overdue"},{value:"at_risk",label:"At risk"},{value:"on_track",label:"On track"}]} />
          <Select size="sm" ariaLabel="Filter by consultant" value={query.consultantId} onValueChange={(value) => update({ consultant: value })} className="w-full sm:w-[156px]" options={[{value:"all",label:"All consultants",shortLabel:"Consultants"},...DEMO_STAFF.map((member) => ({value:member.id,label:member.name}))]} />
          <Select size="sm" ariaLabel="Filter by intake" value={query.intake} onValueChange={(value) => update({ intake: value })} className="w-full sm:w-[136px]" options={[{value:"all",label:"All intakes"},...INTAKES.map((intake) => ({value:intake,label:intake}))]} />
          {hasFilters && <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(""); router.replace(pathname); }}>Clear filters</Button>}
          <span aria-live="polite" className="ml-auto text-right text-xs text-text-muted"><span className="tabular-nums">{studentsQuery.data?.total ?? 0}</span> students</span>
        </div>

        {studentsQuery.isLoading ? (
          <LoadingState label="Loading students" className="space-y-px bg-border-subtle p-px">{Array.from({length:6}).map((_, index) => <Skeleton key={index} className="h-16 rounded-none bg-surface" />)}</LoadingState>
        ) : studentsQuery.isError ? (
          <EmptyState icon={SlidersHorizontal} title="Students could not be loaded" description="The workspace could not retrieve the student list." action={<Button variant="secondary" size="sm" onClick={() => studentsQuery.refetch()}>Try again</Button>} />
        ) : !studentsQuery.data?.items.length ? (
          <EmptyState icon={UserRound} title="No students match these filters" description="Clear a filter or try a different search." action={hasFilters ? <Button variant="secondary" size="sm" onClick={() => { setSearch(""); router.replace(pathname); }}>Clear filters</Button> : undefined} />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block" role="table" aria-label="Students">
              <div className="min-w-[980px]">
                <div role="row" className="grid grid-cols-[116px_minmax(190px,1.5fr)_116px_minmax(230px,1.5fr)_minmax(150px,1fr)_136px] items-center gap-4 border-b border-border-default bg-surface-muted/50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[.065em] text-text-muted">{table.getHeaderGroups()[0].headers.map((header) => <div role="columnheader" key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</div>)}</div>
                <div role="rowgroup">{table.getRowModel().rows.map((row) => { const risk = studentRisk(row.original, demoClock); return <Link role="row" href={`/students/${row.original.id}`} key={row.id} className={cn("relative grid grid-cols-[116px_minmax(190px,1.5fr)_116px_minmax(230px,1.5fr)_minmax(150px,1fr)_136px] items-center gap-4 border-b border-border-subtle px-5 py-3 outline-none transition-colors [transition-duration:var(--motion-fast)] last:border-b-0 hover:bg-surface-muted focus-visible:bg-accent-soft focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gold-strong", "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-['']", risk === "overdue" ? "before:bg-status-danger" : risk === "at_risk" ? "before:bg-status-warning" : "before:bg-status-success")}>{row.getVisibleCells().map((cell) => <div role="cell" key={cell.id} className="min-w-0">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>)}</Link>; })}</div>
              </div>
            </div>
            <div className="space-y-4 p-4 md:hidden">{studentsQuery.data.items.map((student) => <StudentCard student={student} key={student.id} />)}</div>
          </>
        )}

        {(studentsQuery.data?.pageCount ?? 1) > 1 && <div className="flex items-center justify-between border-t border-border-subtle px-4 py-3"><span className="tabular-nums text-xs text-text-muted">Page {studentsQuery.data?.page} of {studentsQuery.data?.pageCount}</span><div className="flex gap-1"><Button variant="ghost" size="sm" disabled={query.page <= 1} onClick={() => update({ page: String(query.page - 1) })}><ChevronLeft /> Previous</Button><Button variant="ghost" size="sm" disabled={query.page >= (studentsQuery.data?.pageCount ?? 1)} onClick={() => update({ page: String(query.page + 1) })}>Next <ChevronRight /></Button></div></div>}
      </Card>
    </div>
  );
}
