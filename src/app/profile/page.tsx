import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { ProfileScreen } from "./ProfileScreen";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <Suspense fallback={<GateSpinner />}>
      <ProtectedRoute>
        <FreshOnReturn>
          <ProfileScreen />
        </FreshOnReturn>
      </ProtectedRoute>
    </Suspense>
  );
}
