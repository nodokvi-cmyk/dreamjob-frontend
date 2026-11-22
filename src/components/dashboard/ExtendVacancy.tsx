"use client";

import { CalendarPlusIcon } from "lucide-react";
import { AlertDialog } from "radix-ui";
import { useId, useState } from "react";
import { usePaymentRecheck } from "@/components/dashboard/usePaymentRecheck";
import { FormAlert } from "@/components/form/FormAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { formError, type FormError } from "@/lib/errors";
import { addDays, endOfTbilisiDay, formatDate, formatDay, tbilisiDay } from "@/lib/vacancy";
import { MAX_DEADLINE_DAYS } from "@/lib/vacancyForm";
import { isPaymentProcessing, NO_CASH_REFUNDS } from "@/lib/vacancyLifecycle";
import { extendVacancy } from "@/services/vacancies.service";
import type { CurrentCompany, OwnVacancy } from "@/types";

interface ExtendVacancyProps {
  vacancy: Pick<OwnVacancy, "id" | "title" | "deadline" | "freeWindowEndsAt">;
  account: Pick<CurrentCompany, "approved">;
  now: number;
  onExtended: (day: string) => void;
  onPaymentProcessing: () => void;
}

export function ExtendVacancy({ vacancy, account, now, onExtended, onPaymentProcessing }: ExtendVacancyProps) {
  const { refresh } = useAuth();
  const id = useId();
  const today = tbilisiDay(now);
  const currentDay = tbilisiDay(Date.parse(vacancy.deadline));
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(currentDay, 1);
  const min = dayAfter > tomorrow ? dayAfter : tomorrow;
  const freeDay = vacancy.freeWindowEndsAt ? tbilisiDay(Date.parse(vacancy.freeWindowEndsAt)) : null;
  const max = addDays(freeDay !== null && freeDay > today ? freeDay : today, MAX_DEADLINE_DAYS);
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState(min);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const pastWindow = freeDay !== null && day > freeDay;
  const recheck = usePaymentRecheck(() => {
    void refresh().catch(() => undefined);
    setOpen(false);
    setError(null);
    onPaymentProcessing();
  });

  if (!account.approved) {
    return (
      <Button variant="outline" size="sm" disabled title="Extending is paused until your company is approved">
        <CalendarPlusIcon aria-hidden />
        Extend
      </Button>
    );
  }

  function handleOpenChange(next: boolean) {
    if (pending) return;
    setOpen(next);
    if (next) {
      setDay(min);
      setError(null);
      setFieldError(null);
    }
  }

  async function confirm() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day < min || day > max) {
      setFieldError(`Choose a date from ${formatDay(min)} to ${formatDay(max)}.`);
      return;
    }
    setFieldError(null);
    setError(null);
    setPending(true);
    try {
      const result = await extendVacancy(vacancy.id, endOfTbilisiDay(day));
      if (result.status === "paymentRequired") {
        window.location.assign(result.checkoutUrl);
        return;
      }
      await refresh();
      setOpen(false);
      onExtended(day);
    } catch (caught: unknown) {
      setError(formError(caught));
      if (isPaymentProcessing(caught)) recheck();
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Trigger asChild>
        <Button variant="outline" size="sm" aria-label={`Extend ${vacancy.title}`}>
          <CalendarPlusIcon aria-hidden />
          Extend
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-enamel/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-[22px] border border-border bg-popover text-popover-foreground shadow-[0_24px_60px_-12px_rgb(7_12_34/0.45)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div aria-hidden className="h-1.5 shrink-0 bg-line-green" />
          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-2">
              <AlertDialog.Title className="font-display text-2xl leading-none font-bold tracking-[-0.01em] uppercase">
                Move the deadline later
              </AlertDialog.Title>
              <AlertDialog.Description asChild>
                <div className="flex flex-col gap-2 text-muted-foreground">
                  <p>
                    It closes on <span className="font-medium text-foreground">{formatDate(vacancy.deadline)}</span>.
                    {freeDay ? ` Extending is free until about ${formatDay(freeDay)}.` : null}
                  </p>
                  <p>A date past that may cost 1 credit or a payment, and adds 60 days to the free window.</p>
                </div>
              </AlertDialog.Description>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-day`}>New closing date</Label>
              <Input
                id={`${id}-day`}
                type="date"
                min={min}
                max={max}
                value={day}
                disabled={pending}
                onChange={(event) => setDay(event.target.value)}
                aria-invalid={fieldError ? true : undefined}
                aria-describedby={`${id}-note`}
                className="tabular sm:max-w-xs"
              />
              {fieldError ? <p className="text-sm font-medium text-destructive">{fieldError}</p> : null}
              <p id={`${id}-note`} className="text-sm text-muted-foreground">
                {pastWindow
                  ? "This date is past the free window, so it may cost 1 credit or a payment. The answer decides; you see a Stripe page only if a payment is needed."
                  : `Closes at the end of this day, Tbilisi time. Choose a date up to ${formatDay(max)}.`}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">A paid extension is never refunded. {NO_CASH_REFUNDS}</p>
            {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialog.Cancel asChild>
                <Button type="button" variant="outline" disabled={pending}>
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <Button type="button" onClick={confirm} disabled={pending} aria-disabled={pending}>
                <CalendarPlusIcon aria-hidden />
                {pending ? "Extending" : "Extend"}
              </Button>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
