"use client";

import { SendIcon } from "lucide-react";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { usePaymentRecheck } from "@/components/dashboard/usePaymentRecheck";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { isPaymentProcessing, NO_CASH_REFUNDS, spendFor } from "@/lib/vacancyLifecycle";
import { submitVacancy } from "@/services/vacancies.service";
import type { CurrentCompany } from "@/types";

interface SubmitVacancyProps {
  vacancy: { id: string; title: string };
  account: Pick<CurrentCompany, "approved" | "plan" | "credits" | "purchasedCredits">;
  onSubmitted: () => void;
  onPaymentProcessing: () => void;
}

export function SubmitVacancy({ vacancy, account, onSubmitted, onPaymentProcessing }: SubmitVacancyProps) {
  const { refresh } = useAuth();
  const spend = spendFor(account);
  const recheck = usePaymentRecheck(() => {
    void refresh().catch(() => undefined);
    onPaymentProcessing();
  });

  if (!account.approved) {
    return (
      <Button size="sm" disabled title="Submitting is paused until your company is approved">
        <SendIcon aria-hidden />
        Submit for review
      </Button>
    );
  }

  return (
    <ConfirmDialog
      trigger={
        <Button size="sm" aria-label={`Submit ${vacancy.title} for review`}>
          <SendIcon aria-hidden />
          Submit for review
        </Button>
      }
      title="Send it for review?"
      description={
        <div className="flex flex-col gap-3">
          <p>
            <span className="font-semibold text-foreground">{vacancy.title}</span> goes to our team. Once approved,
            it&apos;s live until its closing date.
          </p>
          <p className="text-foreground">{spend.line}</p>
          <p>
            The first approval starts a 60-day window. Moving the deadline later within it is free; past it, an
            extension costs a credit or a payment.
          </p>
          <p>
            {NO_CASH_REFUNDS} If our team rejects it before it was ever published, the credit comes back.
          </p>
        </div>
      }
      confirmLabel={spend.kind === "payment" ? "Continue to payment" : "Submit"}
      pendingLabel={spend.kind === "payment" ? "Opening Stripe" : "Submitting"}
      cancelLabel="Not yet"
      icon={<SendIcon aria-hidden />}
      onConfirm={async () => {
        let result: Awaited<ReturnType<typeof submitVacancy>>;
        try {
          result = await submitVacancy(vacancy.id);
        } catch (caught: unknown) {
          if (isPaymentProcessing(caught)) recheck();
          throw caught;
        }
        if (result.status === "paymentRequired") {
          window.location.assign(result.checkoutUrl);
          return;
        }
        await refresh();
        onSubmitted();
      }}
    />
  );
}
