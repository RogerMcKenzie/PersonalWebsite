import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/data";

export const dynamic = "force-static";
export const alt = `${siteConfig.name} — Software Developer & Content Creator`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0a0f1c 0%, #1a2541 45%, #fa4616 130%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "24px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#fa4616",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "9999px",
              background: "#fa4616",
            }}
          />
          rogermckenzie.dev
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "120px",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: "44px",
              fontWeight: 500,
              color: "#e2e8f0",
              lineHeight: 1.2,
              maxWidth: "900px",
            }}
          >
            Software Developer & Content Creator
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#94a3b8",
              maxWidth: "900px",
            }}
          >
            Computer Science · University of Florida
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: "22px",
            color: "#cbd5e1",
          }}
        >
          <div style={{ display: "flex", gap: "32px" }}>
            <span>github.com/RogerMcKenzie</span>
            <span>youtube.com/@RogerMcKenzie1</span>
          </div>
          <div style={{ color: "#fa4616", fontWeight: 600 }}>
            Building & Sharing
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
