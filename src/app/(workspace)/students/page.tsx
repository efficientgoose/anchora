import type { Metadata } from "next";
import { StudentListPage } from "@/features/students/student-list-page";
import { loadStudents } from "@/features/students/server-data";

export const metadata: Metadata = { title: "Students" };

export default async function Page() {
  const result = await loadStudents();

  return <StudentListPage result={result} />;
}
