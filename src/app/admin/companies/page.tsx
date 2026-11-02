import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { AdminCompaniesScreen } from "./AdminCompaniesScreen";

export const metadata: Metadata = { title: "Companies", robots: { index: false } };

export default function AdminCompaniesPage() {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner label="Loading companies" />}>
        <AdminCompaniesScreen />
      </Suspense>
    </FreshOnReturn>
  );
}
