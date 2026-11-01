"use client";

import Script from "next/script";
import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { useAuth } from "@/context/AuthContext";
import { formError, problem, type FormError } from "@/lib/errors";
import { signInWithGoogle } from "@/services/auth.service";
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
  const { signIn } = useAuth();
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const dark = useSyncExternalStore(subscribeTheme, isDarkTheme, isDarkOnServer);

  const handleCredential = useEffectEvent(async (response: GoogleCredentialResponse) => {
    const idToken = response.credential;
    if (typeof idToken !== "string" || idToken === "") {
      setError(problem("Google didn't send a sign-in token. Try again."));
      return;
    }
    setPending(true);
    setError(null);
    try {
      const { token } = await signInWithGoogle(accountType, idToken);
      await signIn(token);
    } catch (reason: unknown) {
      setPending(false);
      setError(
        formError(reason, {
          401: "Google sign-in didn't work for this account. Try again, or use your email.",
          409:
            accountType === "company"
              ? "This Google email already belongs to a job seeker account. Switch to Job seeker above."
              : "This Google email already belongs to a company account. Switch to Company above.",
        }),
      );
    }
  });

  useEffect(() => {
    const google = window.google;
    const element = container.current;
    if (!ready || !google || !element) return;
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => {
        void handleCredential(response);
      },
      ux_mode: "popup",
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
  }, [ready, dark, intent]);

  return (
    <div className="flex flex-col gap-4">
      <Script src={SCRIPT_SRC} strategy="afterInteractive" onReady={() => setReady(true)} />
      <div className="flex items-center gap-3 text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="transit-label text-xs">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div
        ref={container}
        aria-busy={pending}
        className="flex min-h-11 w-full justify-center [color-scheme:normal]"
      />
      {pending ? (
        <p role="status" className="text-center text-sm text-muted-foreground">
          Signing you in with Google
        </p>
      ) : null}
      {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
    </div>
  );
}
