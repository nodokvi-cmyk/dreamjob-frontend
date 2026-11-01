"use client";

import { RotateCwIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { Button } from "@/components/ui/button";
import { formError, type FormError } from "@/lib/errors";

export const RESEND_SECONDS = 60;

function useCountdown(initialSeconds: number) {
  const [left, setLeft] = useState(initialSeconds);
  const endsAt = useRef<number | null>(null);
  const running = left > 0;

  useEffect(() => {
    if (!running) return;
    if (endsAt.current === null) endsAt.current = Date.now() + initialSeconds * 1000;
    const timer = window.setInterval(() => {
      const remaining = (endsAt.current ?? 0) - Date.now();
      setLeft(Math.max(0, Math.ceil(remaining / 1000)));
    }, 250);
    return () => window.clearInterval(timer);
  }, [running, initialSeconds]);

  const restart = (seconds: number) => {
    endsAt.current = Date.now() + seconds * 1000;
    setLeft(seconds);
  };

  return { left, restart };
}

function clock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

interface ResendCodeProps {
  email: string;
  onResend: () => Promise<unknown>;
  sendOnMount?: boolean;
  onMountSent?: () => void;
  mountNotice?: string;
}

export function ResendCode({ email, onResend, sendOnMount, onMountSent, mountNotice }: ResendCodeProps) {
  const { left, restart } = useCountdown(RESEND_SECONDS);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<FormError | null>(null);
  const mountSent = useRef(false);

  useEffect(() => {
    if (!sendOnMount || mountSent.current || !email) return;
    mountSent.current = true;
    onResend()
      .then(() => {
        setNotice(mountNotice ?? `We sent a new code to ${email}.`);
        onMountSent?.();
      })
      .catch((reason: unknown) => setError(formError(reason)));
  }, [sendOnMount, email, onResend, onMountSent, mountNotice]);

  async function handleResend() {
    if (!email) {
      setError({ message: "Enter your email first.", details: [] });
      return;
    }
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await onResend();
      restart(RESEND_SECONDS);
      setNotice(`We sent a new code to ${email}.`);
    } catch (reason: unknown) {
      setError(formError(reason));
    } finally {
      setPending(false);
    }
  }

  const waiting = left > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5 text-sm">
          <p className="font-semibold">Use the newest code we sent you.</p>
          <p className="text-muted-foreground">Codes expire after 10 minutes.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={pending || waiting}
          className="shrink-0"
        >
          <RotateCwIcon aria-hidden />
          {pending ? "Sending" : "Send a new code"}
          {waiting && !pending ? (
            <span className="tabular font-sans font-medium tracking-normal normal-case">
              in {clock(left)}
            </span>
          ) : null}
        </Button>
      </div>
      <p aria-live="polite" className="sr-only">
        {waiting ? "" : "You can send a new code now."}
      </p>
      {notice ? <FormAlert tone="success" message={notice} /> : null}
      {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
    </div>
  );
}
