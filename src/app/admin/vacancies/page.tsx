import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { AdminVacanciesScreen } from "./AdminVacanciesScreen";

export const metadata: Metadata = { title: "Review vacancies", robots: { index: false } };

export default function AdminVacanciesPage() {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner label="Loading vacancies" />}>
        <AdminVacanciesScreen />
      </Suspense>
    </FreshOnReturn>
  );
}
