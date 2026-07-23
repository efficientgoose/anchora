import type { Metadata } from "next";
import { StudentDetailPage } from "@/features/students/student-detail-page";
import { loadStudentWorkspace } from "@/features/students/server-data";

export const metadata: Metadata = { title: "Student Details" };

export default async function Page({ params, searchParams }: { params: Promise<{ studentId: string }>; searchParams: Promise<{ created?: string }> }) {
  const { studentId } = await params;
  const { created } = await searchParams;
  const result = await loadStudentWorkspace(studentId);
  return <StudentDetailPage result={result} created={created === "1"} />;
}
