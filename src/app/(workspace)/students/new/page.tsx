import type { Metadata } from "next";
import { AddStudentPage } from "@/features/students/add-student-page";

export const metadata: Metadata = { title: "Add Student" };

export default function Page() { return <AddStudentPage />; }
