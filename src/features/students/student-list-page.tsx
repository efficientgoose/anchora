"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Plus, Search, SlidersHorizontal, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { DEMO_STAFF, INTAKES } from "@/domain/constants";
import type { RiskLevel, Student, StudentQuery, StudentSortField } from "@/domain/models";
import { initials, nextTask, progressFor, relativeDateLabel, studentRisk } from "@/domain/student-calculations";
import { demoClock } from "@/domain/clock";
import { cn } from "@/lib/cn";
import { RiskBadge, riskMeta } from "./risk-ui";
import { useStudentOverview, useStudents } from "./data";

const columnHelper = createColumnHelper<Student>();

function parseQuery(params: URLSearchParams): StudentQuery {
  const risk = params.get("risk");
  const sortBy = params.get("sort") as StudentSortField | null;
  const direction = params.get("direction");
  return {
    page: Math.max(1, Number(params.get("page")) || 1), pageSize: 8,
    search: params.get("search") ?? "", risk: risk === "overdue" || risk === "at_risk" || risk === "on_track" ? risk : "all",
    consultantId: params.get("consultant") ?? "all", intake: params.get("intake") ?? "all",
    sortBy: sortBy && ["risk", "name", "intake", "consultant"].includes(sortBy) ? sortBy : "risk",
    sortDirection: direction === "asc" ? "asc" : "desc",
  };
}

function RiskTile({ risk, value, active, onClick }: { risk: RiskLevel; value: number; active: boolean; onClick: () => void }) {
  const meta = riskMeta[risk];
  const copy = risk === "overdue" ? "A task is past due — act today" : risk === "at_risk" ? "A task is due within 7 days" : "Nothing urgent right now";
  return (
    <button onClick={onClick} aria-pressed={active} className={cn("rounded-xl border bg-white px-[18px] py-4 text-left shadow-[0_1px_2px_rgba(15,23,42,.04)] transition hover:border-slate-300", active ? `${meta.bg} ${meta.border}` : "border-slate-200")}>
      <span className="flex items-center justify-between text-[13px] font-medium text-slate-500"><span>{meta.label}</span><span className={cn("size-[9px] rounded-full", meta.dot)} /></span>
      <span className={cn("mt-2 block text-[34px] font-bold leading-none tracking-[-.03em]", meta.text)}>{value}</span>
      <span className="mt-1 block text-xs text-slate-400">{copy}</span>
    </button>
  );
}

function StudentCard({ student }: { student: Student }) {
  const risk = studentRisk(student, demoClock); const progress = progressFor(student); const upcoming = nextTask(student); const consultant = DEMO_STAFF.find((member) => member.id === student.assignedConsultantId);
  return (
    <Link href={`/students/${student.id}`} className="block min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,.04)] transition hover:border-slate-300">
      <div className="flex items-start gap-3"><Avatar initials={initials(student.name)} /><div className="min-w-0 flex-1"><div className="font-semibold">{student.name}</div><div className="truncate text-xs text-slate-400">{student.email}</div></div><RiskBadge risk={risk} /></div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><span className="block text-slate-400">Intake</span><span className="mt-1 block font-medium text-slate-700">{student.targetIntake}</span></div><div><span className="block text-slate-400">Consultant</span><span className="mt-1 block font-medium text-slate-700">{consultant?.name}</span></div></div>
      <div className="mt-4 flex items-center gap-3"><Progress value={progress.percent} className="flex-1" /><span className="text-xs text-slate-500">{progress.done} / {progress.total}</span></div>
      {upcoming && <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500"><span className="font-medium text-slate-700">{upcoming.name}</span> · {relativeDateLabel(upcoming.dueDate, demoClock)}</div>}
    </Link>
  );
}

export function StudentListPage() {
  const params = useSearchParams(); const router = useRouter(); const pathname = usePathname();
  const paramsKey = params.toString();
  const query = React.useMemo(() => parseQuery(new URLSearchParams(paramsKey)), [paramsKey]);
  const [search, setSearch] = React.useState(query.search);
  const studentsQuery = useStudents(query); const overviewQuery = useStudentOverview();
  const totalStudents = overviewQuery.data?.total ?? 0;
  const counts = overviewQuery.data?.counts ?? { overdue: 0, atRisk: 0, onTrack: 0 };

  const update = React.useCallback((changes: Record<string, string | null>) => {
    const next = new URLSearchParams(paramsKey);
    Object.entries(changes).forEach(([key, value]) => { if (!value || value === "all" || (key === "page" && value === "1")) next.delete(key); else next.set(key, value); });
    if (!("page" in changes)) next.delete("page");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }, [paramsKey, pathname, router]);

  React.useEffect(() => { setSearch(query.search); }, [query.search]);
  React.useEffect(() => { const timer = window.setTimeout(() => { if (search !== query.search) update({ search: search || null }); }, 250); return () => window.clearTimeout(timer); }, [search, query.search, update]);

  const sort = React.useCallback((field: StudentSortField) => { update({ sort: field, direction: query.sortBy === field && query.sortDirection === "desc" ? "asc" : "desc" }); }, [query.sortBy, query.sortDirection, update]);
  const indicator = React.useCallback((field: StudentSortField) => query.sortBy === field ? (query.sortDirection === "desc" ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />) : null, [query.sortBy, query.sortDirection]);
  const columns = React.useMemo(() => [
    columnHelper.display({ id: "risk", header: () => <button onClick={() => sort("risk")} className="flex items-center gap-1">Risk {indicator("risk")}</button>, cell: ({ row }) => <RiskBadge risk={studentRisk(row.original, demoClock)} /> }),
    columnHelper.accessor("name", { header: () => <button onClick={() => sort("name")} className="flex items-center gap-1">Student {indicator("name")}</button>, cell: ({ row }) => <div className="flex min-w-0 items-center gap-2.5"><Avatar initials={initials(row.original.name)} className="size-[26px] text-[10.5px]" /><div className="min-w-0"><div className="truncate text-[13px] font-semibold text-slate-900">{row.original.name}</div><div className="truncate text-[11.5px] text-slate-400">{row.original.email}</div></div></div> }),
    columnHelper.accessor("targetIntake", { header: () => <button onClick={() => sort("intake")} className="flex items-center gap-1">Intake {indicator("intake")}</button>, cell: ({ getValue }) => <span className="text-[13px] text-slate-600">{getValue()}</span> }),
    columnHelper.display({ id: "universities", header: "Universities", cell: ({ row }) => <div className="flex max-w-[190px] gap-1 overflow-hidden">{row.original.targetUniversities.slice(0, 2).map((university) => <span key={university} className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">{university}</span>)}{row.original.targetUniversities.length > 2 && <span className="text-xs text-slate-400">+{row.original.targetUniversities.length - 2}</span>}</div> }),
    columnHelper.display({ id: "next", header: "Next Deadline", cell: ({ row }) => { const task = nextTask(row.original); return task ? <div><div className="max-w-[170px] truncate text-[13px] font-medium text-slate-700">{task.name}{task.university ? ` · ${task.university}` : ""}</div><div className={cn("text-xs", studentRisk(row.original, demoClock) === "overdue" ? "font-semibold text-red-700" : "text-slate-400")}>{relativeDateLabel(task.dueDate, demoClock)}</div></div> : <span className="text-xs text-green-700">All complete</span>; } }),
    columnHelper.display({ id: "consultant", header: () => <button onClick={() => sort("consultant")} className="flex items-center gap-1">Consultant {indicator("consultant")}</button>, cell: ({ row }) => <span className="text-[13px] text-slate-600">{DEMO_STAFF.find((member) => member.id === row.original.assignedConsultantId)?.name}</span> }),
    columnHelper.display({ id: "progress", header: "Progress", cell: ({ row }) => { const progress = progressFor(row.original); return <div className="flex min-w-[104px] items-center gap-2"><span className="w-9 text-xs text-slate-500">{progress.done} / {progress.total}</span><Progress value={progress.percent} className="w-16" /></div>; } }),
  ], [indicator, sort]);
  const table = useReactTable({ data: studentsQuery.data?.items ?? [], columns, getCoreRowModel: getCoreRowModel(), manualPagination: true, manualSorting: true, rowCount: studentsQuery.data?.total ?? 0 });
  const hasFilters = Boolean(query.search || query.risk !== "all" || query.consultantId !== "all" || query.intake !== "all");

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1340px] overflow-x-hidden p-4 sm:p-6 lg:px-8 lg:py-7 page-enter">
      <header className="mb-[22px] flex items-start justify-between gap-3"><div className="min-w-0"><h1 className="text-2xl font-semibold tracking-[-.025em]">Students</h1><p className="mt-1 truncate text-sm text-slate-500">{totalStudents} active students · {counts.overdue + counts.atRisk} need attention</p></div><Button asChild className="px-3 sm:px-4"><Link href="/students/new" aria-label="Add Student"><Plus /><span className="hidden sm:inline">Add Student</span></Link></Button></header>
      <section className="mb-5 grid gap-3 sm:grid-cols-3 sm:gap-4" aria-label="Risk summary">
        <RiskTile risk="overdue" value={counts.overdue} active={query.risk === "overdue"} onClick={() => update({ risk: query.risk === "overdue" ? null : "overdue" })} />
        <RiskTile risk="at_risk" value={counts.atRisk} active={query.risk === "at_risk"} onClick={() => update({ risk: query.risk === "at_risk" ? null : "at_risk" })} />
        <RiskTile risk="on_track" value={counts.onTrack} active={query.risk === "on_track"} onClick={() => update({ risk: query.risk === "on_track" ? null : "on_track" })} />
      </section>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-2 items-center gap-2.5 border-b border-slate-100 p-3.5 sm:flex sm:flex-wrap sm:px-4">
          <div className="relative col-span-2 w-full sm:max-w-[236px] sm:flex-1"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students…" className="h-[34px] pl-9 text-[13px]" aria-label="Search students" /></div>
          <Select ariaLabel="Filter by risk" value={query.risk} onValueChange={(value) => update({ risk: value })} className="h-[34px] w-full text-[13px] sm:w-[120px]" options={[{value:"all",label:"All Risk"},{value:"overdue",label:"Overdue"},{value:"at_risk",label:"At Risk"},{value:"on_track",label:"On Track"}]} />
          <Select ariaLabel="Filter by consultant" value={query.consultantId} onValueChange={(value) => update({ consultant: value })} className="h-[34px] w-full text-[13px] sm:w-[160px]" options={[{value:"all",label:"All Consultants",shortLabel:"Consultants"},...DEMO_STAFF.map((member) => ({value:member.id,label:member.name}))]} />
          <Select ariaLabel="Filter by intake" value={query.intake} onValueChange={(value) => update({ intake: value })} className="h-[34px] w-full text-[13px] sm:w-[140px]" options={[{value:"all",label:"All Intakes"},...INTAKES.map((intake) => ({value:intake,label:intake}))]} />
          {hasFilters && <button onClick={() => { setSearch(""); router.replace(pathname); }} className="px-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">Clear filters</button>}
          <span className="ml-auto text-right text-xs text-slate-400">{studentsQuery.data?.total ?? 0} students</span>
        </div>
        {studentsQuery.isLoading ? <div className="space-y-px bg-slate-100 p-px">{Array.from({length:6}).map((_, index) => <div key={index} className="h-[58px] animate-pulse bg-white" />)}</div> : studentsQuery.isError ? <div className="p-12 text-center"><SlidersHorizontal className="mx-auto size-8 text-slate-300" /><p className="mt-3 text-sm font-medium">Students could not be loaded</p><button onClick={() => studentsQuery.refetch()} className="mt-2 text-sm text-indigo-600">Try again</button></div> : !studentsQuery.data?.items.length ? <div className="p-12 text-center"><UserRound className="mx-auto size-9 text-slate-300" /><p className="mt-3 text-sm font-medium">No students match these filters</p><p className="mt-1 text-xs text-slate-400">Clear a filter or try a different search.</p></div> : <>
          <div className="hidden overflow-x-auto md:block"><div className="min-w-[1000px]"><div className="grid grid-cols-[104px_minmax(150px,1.5fr)_96px_minmax(170px,1.4fr)_150px_170px_116px] items-center gap-4 border-b border-slate-200 px-5 py-[11px] text-[11.5px] font-semibold uppercase tracking-[.04em] text-slate-500">{table.getHeaderGroups()[0].headers.map((header) => <div key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</div>)}</div>{table.getRowModel().rows.map((row) => { const risk = studentRisk(row.original, demoClock); return <Link href={`/students/${row.original.id}`} key={row.id} className={cn("grid grid-cols-[104px_minmax(150px,1.5fr)_96px_minmax(170px,1.4fr)_150px_170px_116px] items-center gap-4 border-b border-l-[3px] border-b-slate-100 px-5 py-[9px] transition hover:bg-slate-50", risk === "overdue" ? "border-l-red-600" : risk === "at_risk" ? "border-l-amber-500" : "border-l-green-600")}>{row.getVisibleCells().map((cell) => <div key={cell.id} className="min-w-0">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>)}</Link>; })}</div></div>
          <div className="space-y-3 p-3 md:hidden">{studentsQuery.data.items.map((student) => <StudentCard student={student} key={student.id} />)}</div>
        </>}
        {(studentsQuery.data?.pageCount ?? 1) > 1 && <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3"><span className="text-xs text-slate-400">Page {studentsQuery.data?.page} of {studentsQuery.data?.pageCount}</span><div className="flex gap-1"><Button variant="ghost" size="sm" disabled={query.page <= 1} onClick={() => update({ page: String(query.page - 1) })}><ChevronLeft /> Previous</Button><Button variant="ghost" size="sm" disabled={query.page >= (studentsQuery.data?.pageCount ?? 1)} onClick={() => update({ page: String(query.page + 1) })}>Next <ChevronRight /></Button></div></div>}
      </Card>
    </div>
  );
}
