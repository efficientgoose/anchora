import { Suspense } from "react";
import type { Metadata } from "next";
import { StudentListPage } from "@/features/students/student-list-page";

export const metadata: Metadata = { title: "Students" };

export default function Page() {
  return <Suspense fallback={<div role="status" className="p-8 text-sm text-text-muted">Loading students…</div>}><StudentListPage /></Suspense>;
}
