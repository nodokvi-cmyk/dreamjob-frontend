import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { PaymentReturnScreen } from "./PaymentReturnScreen";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<GateSpinner label="Checking your payment" />}>
      <PaymentReturnScreen />
    </Suspense>
  );
}
