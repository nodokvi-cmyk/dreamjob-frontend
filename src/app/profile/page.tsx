import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { ProfileScreen } from "./ProfileScreen";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <FreshOnReturn>
        <ProfileScreen />
      </FreshOnReturn>
    </ProtectedRoute>
  );
}
