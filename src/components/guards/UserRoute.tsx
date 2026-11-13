"use client";

import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import type { AuthRole } from "@/types";

const USER_ONLY: readonly AuthRole[] = ["user"];

export function UserRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute roles={USER_ONLY} redirectOtherRoles>
      {children}
    </ProtectedRoute>
  );
}
