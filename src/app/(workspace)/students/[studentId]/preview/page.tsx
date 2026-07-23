import type { Metadata } from "next";
import { StudentPortalPage } from "@/features/portal/student-portal-page";
import { loadStudentWorkspace } from "@/features/students/server-data";

export const metadata: Metadata = { title: "Consultant Preview" };

export default async function Page({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const result = await loadStudentWorkspace(studentId);
  return <StudentPortalPage result={result} />;
}
