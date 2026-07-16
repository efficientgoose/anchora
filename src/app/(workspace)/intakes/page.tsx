import type { Metadata } from "next";
import { IntakesPage } from "@/features/intakes/intakes-page";

export const metadata: Metadata = { title: "Intakes" };

export default function Page() { return <IntakesPage />; }
