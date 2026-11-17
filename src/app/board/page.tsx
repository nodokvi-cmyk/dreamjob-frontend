import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { BoardScreen } from "./BoardScreen";

export const metadata: Metadata = { title: "Job seekers", robots: { index: false } };

export default function BoardPage() {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner label="Loading publications" />}>
        <BoardScreen />
      </Suspense>
    </FreshOnReturn>
  );
}
