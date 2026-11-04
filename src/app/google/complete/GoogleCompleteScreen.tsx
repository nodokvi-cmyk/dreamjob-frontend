"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { GateSpinner } from "@/components/guards/GateStates";
import { useAuth } from "@/context/AuthContext";
import { afterAuthPath } from "@/lib/account";
import { clearAuthDrafts, googleReturn } from "@/lib/authDraft";
import { GOOGLE_ERROR_PARAM, tokenFromFragment, type GoogleErrorCode } from "@/lib/googleRedirect";
import { routes, withQuery } from "@/lib/routes";

export function GoogleCompleteScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = tokenFromFragment(window.location.hash);
    window.history.replaceState(null, "", window.location.pathname);
    const saved = googleReturn.read();

    function fail(code: GoogleErrorCode) {
      router.replace(withQuery(routes.signIn, { [GOOGLE_ERROR_PARAM]: code }));
    }

    if (token === null) {
      fail("missing");
      return;
    }
    signIn(token).then(
      (session) => {
        clearAuthDrafts();
        router.replace(afterAuthPath(session, saved?.next ?? null));
      },
      () => fail("failed"),
    );
  }, [router, signIn]);

  return <GateSpinner label="Signing you in with Google" />;
}
