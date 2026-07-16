import type { Metadata } from "next";
import { StudentDetailPage } from "@/features/students/student-detail-page";

export const metadata: Metadata = { title: "Student Details" };

export default async function Page({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  return <StudentDetailPage studentId={studentId} />;
}
