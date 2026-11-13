"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { GateSpinner } from "@/components/guards/GateStates";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { formError } from "@/lib/errors";
import { routes } from "@/lib/routes";
import { formatDate } from "@/lib/vacancy";
import { confirmPayment } from "@/services/payment.service";
import type { PaymentConfirmation } from "@/types";

const SESSION_ID = /^cs_[A-Za-z0-9_]+$/;
const REDIRECT_SECONDS = 5;

type Outcome =
  | { kind: "checking" }
  | { kind: "done"; tone: "success" | "attention" | "info"; title: string; body: string }
  | { kind: "failed"; message: string };

function describe(result: PaymentConfirmation): Outcome {
  if (!result.paid) {
    return {
      kind: "done",
      tone: "attention",
      title: "Payment not completed",
      body: "Nothing changed on your vacancy. You can try again from your dashboard.",
    };
  }
  if (result.kind === "vacancy" && result.purpose === "extend") {
    return {
      kind: "done",
      tone: "success",
      title: "Payment received",
      body: result.deadline ? `The vacancy now closes on ${formatDate(result.deadline)}.` : "The deadline is extended.",
    };
  }
  return {
    kind: "done",
    tone: "success",
    title: "Payment received",
    body: "Your vacancy is sent to our team for review.",
  };
}

export function PaymentReturnScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh } = useAuth();
  const payment = searchParams.get("payment");
  const sessionId = searchParams.get("session_id");
  const [outcome, setOutcome] = useState<Outcome>(() =>
    payment === "cancelled"
      ? {
          kind: "done",
          tone: "info",
          title: "Payment cancelled",
          body: "Nothing was charged, and the vacancy stays as it was.",
        }
      : { kind: "checking" },
  );
  const [seconds, setSeconds] = useState(REDIRECT_SECONDS);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (payment === "cancelled") return;
    if (payment !== "success" || !sessionId || !SESSION_ID.test(sessionId)) {
      router.replace(routes.dashboard);
      return;
    }
    confirmPayment(sessionId)
      .then(async (result) => {
        await refresh();
        setOutcome(describe(result));
      })
      .catch((error: unknown) => setOutcome({ kind: "failed", message: formError(error).message }));
  }, [payment, sessionId, router, refresh]);

  useEffect(() => {
    if (outcome.kind !== "done") return;
    if (seconds <= 0) {
      router.replace(routes.dashboard);
      return;
    }
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [outcome.kind, seconds, router]);

  if (outcome.kind === "checking") return <GateSpinner label="Checking your payment" />;

  return (
    <section className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-16 sm:px-6">
      {outcome.kind === "done" ? (
        <>
          <h1 className="font-display text-4xl leading-none font-bold tracking-[-0.02em] uppercase">{outcome.title}</h1>
          <FormAlert tone={outcome.tone} message={outcome.body} />
          <p aria-live="polite" className="text-muted-foreground">
            Taking you to your dashboard in <span className="tabular">{seconds}</span>{" "}
            {seconds === 1 ? "second" : "seconds"}.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-display text-4xl leading-none font-bold tracking-[-0.02em] uppercase">
            We couldn&apos;t check the payment
          </h1>
          <FormAlert tone="error" message={outcome.message} />
          <p className="text-muted-foreground">
            If you paid, the payment is applied automatically within a few minutes. Your dashboard shows the result.
          </p>
        </>
      )}
      <Button asChild size="lg" className="w-fit">
        <Link href={routes.dashboard}>Go to dashboard now</Link>
      </Button>
    </section>
  );
}
