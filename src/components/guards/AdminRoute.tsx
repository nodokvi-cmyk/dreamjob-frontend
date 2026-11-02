"use client";

import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import type { AuthRole } from "@/types";

const ADMIN_ONLY: readonly AuthRole[] = ["admin"];

export function AdminRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute roles={ADMIN_ONLY} redirectOtherRoles>
      {children}
    </ProtectedRoute>;
}
