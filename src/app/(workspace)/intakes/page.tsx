import type { Metadata } from "next";
import { IntakesPage } from "@/features/intakes/intakes-page";
import { loadIntakeGroups } from "@/features/students/server-data";

export const metadata: Metadata = { title: "Intakes" };

export default async function Page() {
  const result = await loadIntakeGroups();
  return <IntakesPage result={result} />;
}
