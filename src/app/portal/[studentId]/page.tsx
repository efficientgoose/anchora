import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Student Portal" };

export default async function Page({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  redirect(`/students/${studentId}/preview`);
}
