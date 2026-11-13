import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { BookmarksScreen } from "./BookmarksScreen";

export const metadata: Metadata = { title: "Bookmarks", robots: { index: false } };

export default function BookmarksPage() {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner label="Loading your bookmarks" />}>
        <BookmarksScreen />
      </Suspense>
    </FreshOnReturn>
  );
}
