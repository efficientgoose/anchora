import { Suspense } from "react";
import type { Metadata } from "next";
import { StudentListPage } from "@/features/students/student-list-page";

export const metadata: Metadata = { title: "Students" };

export default function Page() {
  return <Suspense fallback={<div className="p-8 text-sm text-slate-400">Loading students…</div>}><StudentListPage /></Suspense>;
}
