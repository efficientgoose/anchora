import type { Metadata } from "next";
import { DesignSystemPage } from "@/features/design-system/design-system-page";

export const metadata: Metadata = {
  title: { absolute: "Anchora Design System 1.0" },
  description: "Anchora Design System 1.0 — foundations, components, patterns, content, and accessibility guidance.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DesignSystemPage />;
}
