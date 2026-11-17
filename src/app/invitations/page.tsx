import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { InboxScreen } from "./InboxScreen";

export const metadata: Metadata = { title: "Invitations", robots: { index: false } };

export default function InvitationsPage() {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner label="Loading your invitations" />}>
        <InboxScreen />
      </Suspense>
    </FreshOnReturn>
  );
}
