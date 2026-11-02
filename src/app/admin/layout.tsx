import { Suspense } from "react";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { AdminRoute } from "@/components/guards/AdminRoute";
import { GateSpinner } from "@/components/guards/GateStates";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<GateSpinner />}>
      <AdminRoute>
        <AdminTabs />
        {children}
      </AdminRoute>
    </Suspense>
  );
}
