import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { CompanyRoute } from "@/components/guards/CompanyRoute";

export default function CompanyLayout({ children }: LayoutProps<"/company">) {
  return (
    <Suspense fallback={<GateSpinner />}>
      <CompanyRoute>{children}</CompanyRoute>
    </Suspense>
  );
}
