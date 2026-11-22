import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;

const CACHE_HEADERS = { "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" };

interface BrandCardProps {
  eyebrow?: string;
  title: string;
  lines?: string[];
}

function clamp(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function brandCard({ eyebrow, title, lines = [] }: BrandCardProps): ImageResponse {
  const text = clamp(title, 90);
  const size = text.length > 60 ? 64 : text.length > 36 ? 78 : 96;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b1230",
          color: "#f4f6fb",
          padding: "64px 72px",
          borderTop: "14px solid #e21d2d",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 44, fontWeight: 800 }}>
          <span style={{ color: "#e21d2d" }}>Get</span>
          <span>DreamJob</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {eyebrow ? (
            <div style={{ display: "flex", fontSize: 30, color: "#b3bddc", letterSpacing: 4, textTransform: "uppercase" }}>
              {eyebrow}
            </div>
          ) : null}
          <div style={{ display: "flex", fontSize: size, fontWeight: 800, lineHeight: 1.05 }}>{text}</div>
          {lines.map((line) => (
            <div key={line} style={{ display: "flex", fontSize: 38, color: "#b3bddc" }}>
              {clamp(line, 80)}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", width: 120, height: 10, background: "#e21d2d", borderRadius: 5 }} />
          <div
            style={{
              display: "flex",
              width: 36,
              height: 36,
              border: "9px solid #f4f6fb",
              background: "#0b1230",
              borderRadius: 18,
            }}
          />
          <div style={{ display: "flex", width: 240, height: 10, background: "#26346a", borderRadius: 5 }} />
        </div>
      </div>
    ),
    { ...OG_SIZE, headers: CACHE_HEADERS },
  );
}
