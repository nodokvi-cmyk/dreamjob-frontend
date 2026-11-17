import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { MyPublicationsScreen } from "./MyPublicationsScreen";

export const metadata: Metadata = { title: "My publications", robots: { index: false } };

export default function MyPublicationsPage() {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner label="Loading your publications" />}>
        <MyPublicationsScreen />
      </Suspense>
    </FreshOnReturn>
  );
}
