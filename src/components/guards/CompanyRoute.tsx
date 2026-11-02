"use client";

import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import type { AuthRole } from "@/types";

const COMPANY_ONLY: readonly AuthRole[] = ["company"];

export function CompanyRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute roles={COMPANY_ONLY} redirectOtherRoles>
      {children}
    </ProtectedRoute>
  );
}
