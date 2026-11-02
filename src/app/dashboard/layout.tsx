import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { CompanyRoute } from "@/components/guards/CompanyRoute";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <Suspense fallback={<GateSpinner />}>
      <CompanyRoute>{children}</CompanyRoute>
    </Suspense>
  );
}
