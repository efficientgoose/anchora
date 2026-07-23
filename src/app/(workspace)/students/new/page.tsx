import type { Metadata } from "next";
import { AddStudentPage } from "@/features/students/add-student-page";
import { getStudentDataLaunchStatus } from "@/features/students/server-data";

export const metadata: Metadata = { title: "Add Student" };

export default function Page() {
  return <AddStudentPage launchEnabled={getStudentDataLaunchStatus().enabled} />;
}
