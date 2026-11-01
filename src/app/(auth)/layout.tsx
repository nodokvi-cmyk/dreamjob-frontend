import { Suspense, type ReactNode } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { GuestRoute } from "@/components/guards/GuestRoute";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<GateSpinner label="Loading" />}>
      <GuestRoute>{children}</GuestRoute>
    </Suspense>
  );
}
