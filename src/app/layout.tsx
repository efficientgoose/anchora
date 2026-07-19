import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const socialTitle = "Anchora — Manage every application. Never miss a deadline.";
const socialDescription = "Everything your consultancy needs to manage student applications.";

export const metadata: Metadata = {
  metadataBase: new URL("https://tryanchora.com"),
  title: { default: "Anchora", template: "%s · Anchora" },
  description: "Study-abroad operations, kept on track.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tryanchora.com",
    siteName: "Anchora",
    title: socialTitle,
    description: socialDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: socialDescription,
  },
  icons: {
    icon: [{ url: "/anchora-logo.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AppProviders>{children}</AppProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
