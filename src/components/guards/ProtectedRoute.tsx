"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { GateMessage, GateSpinner } from "@/components/guards/GateStates";
import { useAuth } from "@/context/AuthContext";
import { routes, signInWithNext } from "@/lib/routes";
import type { AuthRole } from "@/types";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: readonly AuthRole[];
  allowPasswordSetup?: boolean;
}

export function ProtectedRoute({
  children,
  roles,
  allowPasswordSetup = false,
}: ProtectedRouteProps) {
  const { status, session, error, retry } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const needsPassword =
    session !== null && session.account.passwordSetupRequired && !allowPasswordSetup;
  const roleAllowed =
    session !== null && (roles === undefined || roles.includes(session.accountRole));

  useEffect(() => {
    if (status === "anonymous") router.replace(signInWithNext(pathname));
    else if (needsPassword) router.replace(routes.setPassword);
  }, [status, needsPassword, pathname, router]);

  if (status === "error") {
    return (
      <GateMessage
        title="We couldn't load your account"
        body={error ?? "Check your connection and try again."}
        action={{ label: "Try again", onClick: retry }}
      />
    );
  }

  if (status !== "authenticated" || needsPassword) return <GateSpinner />;

  if (!roleAllowed) {
    return (
      <GateMessage
        title="This page isn't for your account"
        body="You're signed in, but this area belongs to a different account type."
        action={{ label: "Back to vacancies", href: routes.vacancies }}
      />
    );
  }

  return children;
}
