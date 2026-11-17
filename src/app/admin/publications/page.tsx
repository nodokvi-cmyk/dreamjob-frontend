import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { AdminPublicationsScreen } from "./AdminPublicationsScreen";

export const metadata: Metadata = { title: "Review publications", robots: { index: false } };

export default function AdminPublicationsPage() {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner label="Loading publications" />}>
        <AdminPublicationsScreen />
      </Suspense>
    </FreshOnReturn>
  );
}
