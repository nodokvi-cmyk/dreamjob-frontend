"use client";

import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useGoogleReturn } from "@/components/auth/useGoogleReturn";
import { FormAlert } from "@/components/form/FormAlert";
import { googleReturn } from "@/lib/authDraft";
import { googleCallbackPath } from "@/lib/googleRedirect";
import { safeNext } from "@/lib/routes";
import type { AccountType } from "@/types";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function isDarkTheme(): boolean {
  return document.documentElement.classList.contains("dark");
}

function isDarkOnServer(): boolean {
  return false;
}

interface GoogleButtonProps {
  accountType: AccountType;
  intent: "signin" | "signup";
}

export function GoogleButton({ accountType, intent }: GoogleButtonProps) {
  if (!CLIENT_ID) return null;
  return <GoogleButtonInner accountType={accountType} intent={intent} />;
}

function GoogleButtonInner({ accountType, intent }: GoogleButtonProps) {
  const next = safeNext(useSearchParams().get("next"));
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const dark = useSyncExternalStore(subscribeTheme, isDarkTheme, isDarkOnServer);
  const returned = useGoogleReturn(accountType);
  const error = returned && returned.account === accountType ? returned.error : null;

  useEffect(() => {
    googleReturn.save(accountType, next);
  }, [accountType, next]);

  useEffect(() => {
    const google = window.google;
    const element = container.current;
    if (!ready || !google || !element) return;
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      login_uri: new URL(googleCallbackPath(accountType), window.location.origin).href,
      ux_mode: "redirect",
      context: intent,
    });
    element.replaceChildren();
    google.accounts.id.renderButton(element, {
      type: "standard",
      theme: dark ? "filled_black" : "outline",
      size: "large",
      text: intent === "signup" ? "signup_with" : "continue_with",
      shape: "rectangular",
      logo_alignment: "center",
      width: Math.round(Math.min(400, Math.max(220, element.clientWidth))),
    });
  }, [ready, dark, intent, accountType]);

  return (
    <div className="flex flex-col gap-4">
      <Script src={SCRIPT_SRC} strategy="afterInteractive" onReady={() => setReady(true)} />
      <div className="flex items-center gap-3 text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="transit-label text-xs">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div ref={container} className="flex min-h-11 w-full justify-center [color-scheme:normal]" />
      <p className="text-center text-sm text-muted-foreground">
        Google opens its own page, then brings you back here.
      </p>
      {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
    </div>
  );
}
