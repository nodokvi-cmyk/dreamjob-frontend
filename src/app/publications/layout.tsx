import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import type { AuthRole } from "@/types";

const PUBLICATION_ROLES: readonly AuthRole[] = ["user", "company"];

export default function Layout({ children }: LayoutProps<"/publications">) {
  return (
    <Suspense fallback={<GateSpinner />}>
      <ProtectedRoute roles={PUBLICATION_ROLES} redirectOtherRoles>
        {children}
      </ProtectedRoute>
    </Suspense>
  );
}
