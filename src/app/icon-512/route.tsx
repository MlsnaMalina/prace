import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1f2937",
        }}
      >
        <span style={{ fontSize: 260, fontWeight: 700, color: "#ffffff" }}>N</span>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
