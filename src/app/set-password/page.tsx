import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { SetPasswordScreen } from "./SetPasswordScreen";

export const metadata: Metadata = { title: "Choose a password" };

export default function SetPasswordPage() {
  return (
    <ProtectedRoute allowPasswordSetup>
      <Suspense fallback={<GateSpinner />}>
        <FreshOnReturn>
          <SetPasswordScreen />
        </FreshOnReturn>
      </Suspense>
    </ProtectedRoute>
  );
}
