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
  redirectOtherRoles?: boolean;
}

export function ProtectedRoute({
  children,
  roles,
  allowPasswordSetup = false,
  redirectOtherRoles = false,
}: ProtectedRouteProps) {
  const { status, session, error, retry } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const needsPassword =
    session !== null && session.account.passwordSetupRequired && !allowPasswordSetup;
  const roleAllowed =
    session !== null && (roles === undefined || roles.includes(session.accountRole));

  const sendHome = session !== null && !needsPassword && !roleAllowed && redirectOtherRoles;

  useEffect(() => {
    if (status === "anonymous") router.replace(signInWithNext(pathname));
    else if (needsPassword) router.replace(routes.setPassword);
    else if (sendHome) router.replace(routes.home);
  }, [status, needsPassword, sendHome, pathname, router]);

  if (status === "error") {
    return (
      <GateMessage
        title="We couldn't load your account"
        body={error ?? "Check your connection and try again."}
        action={{ label: "Try again", onClick: retry }}
      />
    );
  }

  if (status !== "authenticated" || needsPassword || sendHome) return <GateSpinner />;

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
