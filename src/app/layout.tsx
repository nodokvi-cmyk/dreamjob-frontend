import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Noto_Sans_Georgian } from "next/font/google";
import Script from "next/script";
import { CompanyNotice } from "@/components/layout/CompanyNotice";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthProvider } from "@/context/AuthContext";
import { SITE_URL } from "@/lib/site";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const lari = Noto_Sans_Georgian({
  subsets: ["latin-ext"],
  axes: ["wdth"],
  preload: false,
  adjustFontFallback: false,
});

function familyParts(family: string): string[] {
  return family.split(",").map((part) => part.trim());
}

function withLari(family: string): string {
  const [primary, ...fallbacks] = familyParts(family);
  const [lariFamily] = familyParts(lari.style.fontFamily);
  return [primary, lariFamily, ...fallbacks, "sans-serif"].join(", ");
}

const fontStacks = {
  "--font-stack-sans": withLari(barlow.style.fontFamily),
  "--font-stack-display": withLari(barlowCondensed.style.fontFamily),
};

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: "GetDreamJob · Jobs from verified employers in Georgia",
    template: "%s · GetDreamJob",
  },
  description:
    "Search vacancies across Georgia from employers our team has approved, with salary ranges right on the listing.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b1230" },
    { media: "(prefers-color-scheme: dark)", color: "#070c22" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
      style={fontStacks}
    >
      <body className="flex min-h-full flex-col">
        <Script id="theme" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
        <AuthProvider>
          <SiteHeader />
          <CompanyNotice />
          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
