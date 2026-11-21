import { PLAN_INFO } from "@/lib/billing";
import { ApiError } from "@/services/api";
import type { CurrentCompany, OwnVacancy } from "@/types";

type LifecycleVacancy = Pick<OwnVacancy, "status" | "firstPublishedAt">;

export const NO_CASH_REFUNDS = "Credits and payments are not refunded in cash.";

const PAYMENT_PROCESSING = "Payment is being processed, try again in a moment";

export const PAYMENT_RECHECK_MS = 2000;

export function isPaymentProcessing(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409 && error.message === PAYMENT_PROCESSING;
}

export function wasPublished(vacancy: Pick<OwnVacancy, "firstPublishedAt">): boolean {
  return Boolean(vacancy.firstPublishedAt);
}

export function canEdit(vacancy: LifecycleVacancy): boolean {
  if (vacancy.status === "closed") return false;
  return !(vacancy.status === "expired" && wasPublished(vacancy));
}

export function needsExtendToEdit(vacancy: LifecycleVacancy): boolean {
  return vacancy.status === "expired" && wasPublished(vacancy);
}

export function canSubmit(vacancy: LifecycleVacancy): boolean {
  return vacancy.status === "notSubmitted";
}

export function canExtend(vacancy: LifecycleVacancy): boolean {
  return wasPublished(vacancy) && vacancy.status !== "closed";
}

export type SpendKind = "plan" | "purchased" | "payment";

export interface Spend {
  kind: SpendKind;
  line: string;
}

export function spendFor(account: Pick<CurrentCompany, "plan" | "credits" | "purchasedCredits">): Spend {
  if (account.credits > 0) {
    return { kind: "plan", line: `This uses 1 plan credit. You have ${account.credits}.` };
  }
  if (account.purchasedCredits > 0) {
    return { kind: "purchased", line: `This uses 1 purchased credit. You have ${account.purchasedCredits}.` };
  }
  const price = account.plan ? PLAN_INFO[account.plan].vacancyUsd : PLAN_INFO.payAsYouPublish.vacancyUsd;
  return {
    kind: "payment",
    line: `You have no credits left, so you pay $${price} for this vacancy on a secure Stripe page.`,
  };
}

export function rejectedEditNote(vacancy: Pick<OwnVacancy, "firstPublishedAt">): string {
  return wasPublished(vacancy)
    ? "Editing it sends it back to review for free."
    : "It was never published, so its credit was returned. Editing turns it back into a draft: submit it again afterwards, which uses a credit or a payment.";
}
