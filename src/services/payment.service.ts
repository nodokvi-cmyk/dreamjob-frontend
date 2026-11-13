import { BILLING_PLANS, PAYMENT_PURPOSES } from "@/lib/billing";
import {
  boolean,
  booleanOr,
  number,
  object,
  optionalIsoDate,
  optionalOneOf,
  optionalString,
  string,
} from "@/lib/decode";
import { VACANCY_STATUSES } from "@/lib/vacancy";
import { api } from "@/services/api";
import type { CheckoutLink, PaidPlan, PaymentConfirmation } from "@/types";

function parseLink(data: unknown): CheckoutLink {
  return { url: string(object(data, "payment"), "url") };
}

function parseConfirmation(data: unknown): PaymentConfirmation {
  const source = object(data, "payment");
  const paid = boolean(source, "paid");
  const credits = number(source, "credits");
  const purchasedCredits = number(source, "purchasedCredits");
  if (source.kind === "vacancy") {
    return {
      kind: "vacancy",
      paid,
      vacancyId: optionalString(source, "vacancyId"),
      purpose: optionalOneOf(source, "purpose", PAYMENT_PURPOSES),
      vacancyStatus: optionalOneOf(source, "vacancyStatus", VACANCY_STATUSES),
      deadline: optionalIsoDate(source, "deadline"),
      credits,
      purchasedCredits,
    };
  }
  return {
    kind: "subscription",
    paid,
    plan: optionalOneOf(source, "plan", BILLING_PLANS),
    credits,
    purchasedCredits,
    planRenewsAt: optionalIsoDate(source, "planRenewsAt"),
    planEndsAtPeriodEnd: booleanOr(source, "planEndsAtPeriodEnd", false),
  };
}

export function startPlanCheckout(plan: PaidPlan): Promise<CheckoutLink> {
  return api("/payment/checkout", parseLink, { method: "POST", body: { plan } });
}

export function openBillingPortal(): Promise<CheckoutLink> {
  return api("/payment/portal", parseLink, { method: "POST" });
}

export function confirmPayment(sessionId: string, signal?: AbortSignal): Promise<PaymentConfirmation> {
  const search = new URLSearchParams({ sessionId });
  return api(`/payment/confirm?${search.toString()}`, parseConfirmation, { signal, cache: "no-store" });
}
