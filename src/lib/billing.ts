import type { BillingPlan, PaidPlan, PaymentPurpose } from "@/types";

export const BILLING_PLANS: readonly BillingPlan[] = ["payAsYouPublish", "plus", "elite"];

export const PAID_PLANS: readonly PaidPlan[] = ["plus", "elite"];

export const PAYMENT_PURPOSES: readonly PaymentPurpose[] = ["submit", "extend"];

export interface PlanInfo {
  label: string;
  monthlyUsd: number;
  credits: number;
  vacancyUsd: number;
}

export const PLAN_INFO: Record<BillingPlan, PlanInfo> = {
  payAsYouPublish: { label: "Pay as you publish", monthlyUsd: 0, credits: 0, vacancyUsd: 5 },
  plus: { label: "Plus", monthlyUsd: 29.99, credits: 15, vacancyUsd: 3 },
  elite: { label: "Elite", monthlyUsd: 44.99, credits: 40, vacancyUsd: 2 },
};
