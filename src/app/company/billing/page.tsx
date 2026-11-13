import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { BillingScreen } from "./BillingScreen";

export const metadata: Metadata = { title: "Billing", robots: { index: false } };

export default function BillingPage() {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner label="Loading billing" />}>
        <BillingScreen />
      </Suspense>
    </FreshOnReturn>
  );
}
