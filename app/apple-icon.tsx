import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0a0f1c 0%, #1a2541 50%, #fa4616 130%)",
          color: "#ffffff",
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          fontFamily: "system-ui, -apple-system, sans-serif",
          borderRadius: 36,
        }}
      >
        RM
      </div>
    ),
    { ...size }
  );
}
