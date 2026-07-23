import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  SOCIAL_DESCRIPTION,
  SOCIAL_IMAGE_ALT,
  SOCIAL_IMAGE_PATH,
  SOCIAL_IMAGE_SIZE,
  SOCIAL_IMAGE_TYPE,
  SOCIAL_TITLE,
} from "@/lib/social-metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tryanchora.com"),
  title: { default: "Anchora", template: "%s · Anchora" },
  description: "Study-abroad operations, kept on track.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tryanchora.com",
    siteName: "Anchora",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [
      {
        url: SOCIAL_IMAGE_PATH,
        width: SOCIAL_IMAGE_SIZE.width,
        height: SOCIAL_IMAGE_SIZE.height,
        alt: SOCIAL_IMAGE_ALT,
        type: SOCIAL_IMAGE_TYPE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [
      {
        url: SOCIAL_IMAGE_PATH,
        width: SOCIAL_IMAGE_SIZE.width,
        height: SOCIAL_IMAGE_SIZE.height,
        alt: SOCIAL_IMAGE_ALT,
      },
    ],
  },
  icons: {
    icon: [{ url: "/anchora-logo.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
