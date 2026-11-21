import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import type { AuthRole } from "@/types";

const BOARD_ROLES: readonly AuthRole[] = ["company", "admin"];

export default function BoardLayout({ children }: LayoutProps<"/board">) {
  return (
    <Suspense fallback={<GateSpinner />}>
      <ProtectedRoute roles={BOARD_ROLES} redirectOtherRoles signInAccount="company">
        {children}
      </ProtectedRoute>
    </Suspense>
  );
}
