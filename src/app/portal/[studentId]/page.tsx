import type { Metadata } from "next";
import { StudentPortalPage } from "@/features/portal/student-portal-page";

export const metadata: Metadata = { title: "Student Portal" };

export default async function Page({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  return <StudentPortalPage studentId={studentId} />;
}
