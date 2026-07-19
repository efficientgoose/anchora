import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SOCIAL_IMAGE_SIZE } from "@/lib/social-metadata";

const forwardLines = Array.from({ length: 12 }, (_, index) => ({
  left: 680 + index * 62,
  top: -250,
}));

const backwardLines = Array.from({ length: 12 }, (_, index) => ({
  left: 660 + index * 62,
  top: -250,
}));

export async function createSocialImage() {
  const [regularFont, semiBoldFont, boldFont, logo] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/Inter-Regular.ttf")),
    readFile(join(process.cwd(), "public/fonts/Inter-SemiBold.ttf")),
    readFile(join(process.cwd(), "public/fonts/Inter-Bold.ttf")),
    readFile(join(process.cwd(), "public/anchora-logo.png"), "base64"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#f8f7f2",
          color: "#18181b",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Anchora Inter",
          height: "100%",
          overflow: "hidden",
          padding: "64px 72px 62px",
          position: "relative",
          width: "100%",
        }}
      >
        {forwardLines.map(({ left, top }, index) => (
          <div
            key={`forward-${index}`}
            style={{
              background: "#18181b",
              height: 1,
              left,
              opacity: 0.055,
              position: "absolute",
              top,
              transform: "rotate(45deg)",
              transformOrigin: "left center",
              width: 760,
            }}
          />
        ))}
        {backwardLines.map(({ left, top }, index) => (
          <div
            key={`backward-${index}`}
            style={{
              background: "#a16207",
              height: 1,
              left,
              opacity: 0.07,
              position: "absolute",
              top,
              transform: "rotate(135deg)",
              transformOrigin: "left center",
              width: 760,
            }}
          />
        ))}

        <div style={{ alignItems: "center", display: "flex", gap: 14, position: "relative" }}>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              height: 58,
              justifyContent: "center",
              overflow: "hidden",
              width: 58,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              height="58"
              src={`data:image/png;base64,${logo}`}
              style={{ height: 58, transform: "scale(1.55)", width: 58 }}
              width="58"
            />
          </div>
          <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-1.2px" }}>Anchora</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 56,
            maxWidth: 970,
            position: "relative",
          }}
        >
          <span
            style={{
              color: "#a16207",
              fontSize: 19,
              fontWeight: 600,
              letterSpacing: "2.8px",
              textTransform: "uppercase",
            }}
          >
            Built for study-abroad consultancies
          </span>
          <span
            style={{
              fontSize: 80,
              fontWeight: 700,
              letterSpacing: "-4.8px",
              lineHeight: 0.98,
              marginTop: 18,
            }}
          >
            Manage every application. Never miss a deadline.
          </span>
          <span
            style={{
              color: "#52525b",
              fontSize: 29,
              lineHeight: 1.45,
              marginTop: 40,
              maxWidth: 900,
            }}
          >
            Everything your consultancy needs to manage student applications.
          </span>
        </div>

        <div
          style={{
            background: "#eab308",
            bottom: 62,
            height: 8,
            left: 72,
            position: "absolute",
            width: 96,
          }}
        />
      </div>
    ),
    {
      ...SOCIAL_IMAGE_SIZE,
      fonts: [
        { name: "Anchora Inter", data: Uint8Array.from(regularFont).buffer, style: "normal", weight: 400 },
        { name: "Anchora Inter", data: Uint8Array.from(semiBoldFont).buffer, style: "normal", weight: 600 },
        { name: "Anchora Inter", data: Uint8Array.from(boldFont).buffer, style: "normal", weight: 700 },
      ],
    },
  );
}
