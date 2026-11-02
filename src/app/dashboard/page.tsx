import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { DashboardScreen } from "./DashboardScreen";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default function DashboardPage() {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner label="Loading your vacancies" />}>
        <DashboardScreen />
      </Suspense>
    </FreshOnReturn>
  );
}
