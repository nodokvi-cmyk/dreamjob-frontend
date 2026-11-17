import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { SentInvitationsScreen } from "./SentInvitationsScreen";

export const metadata: Metadata = { title: "Sent invitations", robots: { index: false } };

export default function SentInvitationsPage() {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner label="Loading invitations" />}>
        <SentInvitationsScreen />
      </Suspense>
    </FreshOnReturn>
  );
}
