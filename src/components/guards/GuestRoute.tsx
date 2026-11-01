"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { useAuth } from "@/context/AuthContext";
import { afterAuthPath } from "@/lib/account";
import { safeNext } from "@/lib/routes";

export function GuestRoute({ children }: { children: ReactNode }) {
  const { status, session } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const target = session ? afterAuthPath(session, safeNext(params.get("next"))) : null;

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (status === "authenticated") return <GateSpinner label="Taking you in" />;
  if (status === "loading") return <GateSpinner label="Loading" />;
  return children;
}
