import { Suspense } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { UserRoute } from "@/components/guards/UserRoute";

export default function Layout({ children }: LayoutProps<"/bookmarks">) {
  return (
    <Suspense fallback={<GateSpinner />}>
      <UserRoute>{children}</UserRoute>
    </Suspense>
  );
}
