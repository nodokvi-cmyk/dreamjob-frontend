import type { Metadata } from "next";

export const SITE_NAME = "GetDreamJob";

const DEFAULT_SITE_URL = "https://getdreamjob.vercel.app";

function resolveSiteUrl(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export const SITE_URL = resolveSiteUrl();

type OpenGraph = NonNullable<Metadata["openGraph"]>;

export function canonicalFor(path: string): NonNullable<Metadata["alternates"]> {
  return { canonical: path };
}

export function openGraphFor(path: string, extra: OpenGraph = {}): OpenGraph {
  return {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GB",
    url: path,
    ...extra,
    images: extra.images ?? [{ url: "/og/site", width: 1200, height: 630, alt: SITE_NAME }],
  };
}
