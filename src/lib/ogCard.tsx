import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";

type ImageResponseOptions = NonNullable<ConstructorParameters<typeof ImageResponse>[1]>;

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

type OgFonts = NonNullable<ImageResponseOptions["fonts"]>;

let fontsPromise: Promise<OgFonts> | null = null;

function loadFonts(): Promise<OgFonts> {
  fontsPromise ??= Promise.all([
    readFile(new URL("../assets/fonts/NotoSansGeorgian-Regular.ttf", import.meta.url)),
    readFile(new URL("../assets/fonts/NotoSansGeorgian-ExtraBold.ttf", import.meta.url)),
  ]).then(([regular, bold]): OgFonts => [
    { name: "Noto Sans Georgian", data: regular, weight: 400, style: "normal" },
    { name: "Noto Sans Georgian", data: bold, weight: 800, style: "normal" },
  ]);
  return fontsPromise.catch((): OgFonts => {
    fontsPromise = null;
    return [];
  });
}

export async function brandCard({ eyebrow, title, lines = [] }: BrandCardProps): Promise<ImageResponse> {
  const text = clamp(title, 90);
  const weight = /[Ⴀ-ჿ]/.test(text) ? text.length * 1.5 : text.length;
  const size = weight > 100 ? 52 : weight > 60 ? 64 : weight > 36 ? 78 : 96;
  const fonts = await loadFonts();
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
          ...(fonts.length > 0 ? { fontFamily: "Noto Sans Georgian" } : {}),
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
    { ...OG_SIZE, headers: CACHE_HEADERS, ...(fonts.length > 0 ? { fonts } : {}) },
  );
}
