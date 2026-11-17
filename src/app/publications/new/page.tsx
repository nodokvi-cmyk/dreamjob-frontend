import type { Metadata } from "next";
import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { UserRoute } from "@/components/guards/UserRoute";
import { FreshOnReturn } from "@/components/layout/FreshOnReturn";
import { NewPublicationScreen } from "./NewPublicationScreen";

export const metadata: Metadata = { title: "New publication", robots: { index: false } };

export default function NewPublicationPage() {
  return (
    <FreshOnReturn>
      <Suspense fallback={<GateSpinner />}>
        <UserRoute>
          <NewPublicationScreen />
        </UserRoute>
      </Suspense>
    </FreshOnReturn>
  );
}
