import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { AdminUsersScreen } from "./AdminUsersScreen";

export const metadata: Metadata = { title: "Users", robots: { index: false } };

export default function AdminUsersPage() {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner label="Loading users" />}>
        <AdminUsersScreen />
      </Suspense>
    </FreshOnReturn>
  );
}
