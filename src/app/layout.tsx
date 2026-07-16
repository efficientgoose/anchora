import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Anchora", template: "%s · Anchora" },
  description: "Study-abroad operations, kept on track.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
