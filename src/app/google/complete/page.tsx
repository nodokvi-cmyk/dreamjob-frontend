import type { Metadata } from "next";
import { GoogleCompleteScreen } from "./GoogleCompleteScreen";

export const metadata: Metadata = { title: "Signing in", robots: { index: false } };

export default function GoogleCompletePage() {
  return <GoogleCompleteScreen />;
}
