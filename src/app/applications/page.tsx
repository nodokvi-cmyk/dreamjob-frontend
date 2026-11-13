import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { MyApplicationsScreen } from "./MyApplicationsScreen";

export const metadata: Metadata = { title: "My applications", robots: { index: false } };

export default function MyApplicationsPage() {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner label="Loading your applications" />}>
        <MyApplicationsScreen />
      </Suspense>
    </FreshOnReturn>
  );
}
