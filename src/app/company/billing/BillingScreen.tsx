"use client";

import { CheckIcon, CreditCardIcon, ExternalLinkIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { FormAlert } from "@/components/form/FormAlert";
import { GateSpinner } from "@/components/guards/GateStates";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { BILLING_PLANS, PLAN_INFO } from "@/lib/billing";
import { formError, type FormError } from "@/lib/errors";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/vacancy";
import { NO_CASH_REFUNDS } from "@/lib/vacancyLifecycle";
import { choosePayAsYouPublish } from "@/services/companies.service";
import { confirmPayment, openBillingPortal, startPlanCheckout } from "@/services/payment.service";
import type { BillingPlan, CurrentCompany, PaidPlan } from "@/types";

const SESSION_ID = /^cs_[A-Za-z0-9_]+$/;

type ReturnNotice = { tone: "success" | "attention" | "info" | "error"; message: string };

export function BillingScreen() {
  const { session } = useAuth();
  if (!session || session.accountRole !== "company") return <GateSpinner />;
  return <Billing accountId={session.accountId} account={session.account} />;
}

function money(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount);
}

function useCheckoutReturn(): ReturnNotice | null {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh } = useAuth();
  const [notice, setNotice] = useState<ReturnNotice | null>(() =>
    searchParams.get("status") === "cancelled"
      ? { tone: "info", message: "Checkout cancelled. Nothing was charged." }
      : null,
  );
  const handled = useRef(false);
  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (handled.current || !status) return;
    handled.current = true;
    if (status === "cancelled") {
      router.replace(routes.billing, { scroll: false });
      return;
    }
    if (status !== "success" || !sessionId || !SESSION_ID.test(sessionId)) {
      router.replace(routes.billing, { scroll: false });
      return;
    }
    confirmPayment(sessionId)
      .then(async (result) => {
        await refresh();
        if (!result.paid) {
          setNotice({ tone: "attention", message: "Payment not completed." });
        } else if (result.kind === "subscription" && result.plan) {
          const info = PLAN_INFO[result.plan];
          setNotice({ tone: "success", message: `Your ${info.label} plan is active. ${result.credits} plan credits are ready.` });
        } else {
          setNotice({ tone: "success", message: "Payment received." });
        }
      })
      .catch((error: unknown) => setNotice({ tone: "error", message: formError(error).message }))
      .finally(() => router.replace(routes.billing, { scroll: false }));
  }, [status, sessionId, router, refresh]);

  return notice;
}

function Billing({ accountId, account }: { accountId: string; account: CurrentCompany }) {
  const { refresh } = useAuth();
  const returned = useCheckoutReturn();
  const portal = useAction();
  const free = useAction();
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlan | null>(null);
  const paidPlan = account.plan === "plus" || account.plan === "elite";

  async function goToPortal() {
    await portal.run(async () => {
      const { url } = await openBillingPortal();
      window.location.assign(url);
      return null;
    }, { 400: "You have no billing account yet. It is created the first time you open a Stripe payment page." });
  }

  async function chooseFree() {
    await free.run(async () => {
      await choosePayAsYouPublish(accountId);
      await refresh();
      return "Pay as you publish is your plan.";
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 pt-10 pb-8 sm:px-6 md:pt-12 lg:px-8">
          <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
            Billing
          </h1>
          <p className="max-w-[62ch] text-lg text-muted-foreground">
            One credit pays for one vacancy submit or one paid extension. Plan credits reset every month; purchased
            credits come from refunds and never expire. Plan credits are spent first.
          </p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-7 xl:col-span-8">
          {returned ? <FormAlert tone={returned.tone} message={returned.message} /> : null}
          <section aria-labelledby="plans-title" className="flex flex-col gap-5">
            <h2 id="plans-title" className="font-display text-[1.75rem] leading-none font-bold tracking-[-0.01em] uppercase">
              Plans
            </h2>
            <ul className="grid gap-4 md:grid-cols-3">
              {BILLING_PLANS.map((plan) => (
                <PlanOption
                  key={plan}
                  plan={plan}
                  current={account.plan === plan}
                  account={account}
                  paidPlan={paidPlan}
                  pending={free.pending}
                  onChooseFree={chooseFree}
                  onSubscribe={() => setCheckoutPlan(plan === "payAsYouPublish" ? null : plan)}
                />
              ))}
            </ul>
            {free.error ? <FormAlert tone="error" message={free.error.message} details={free.error.details} /> : null}
            {free.notice ? <FormAlert tone="success" message={free.notice} /> : null}
          </section>

          <section aria-labelledby="refunds-title" className="flex flex-col gap-3">
            <h2 id="refunds-title" className="font-display text-[1.75rem] leading-none font-bold tracking-[-0.01em] uppercase">
              Refunds
            </h2>
            <ul className="flex max-w-[65ch] list-disc flex-col gap-2 pl-5 text-[1.02rem]">
              <li>{NO_CASH_REFUNDS} Nothing is ever paid back to your card.</li>
              <li>If our team rejects a vacancy that was never published, the credit it used comes back.</li>
              <li>A vacancy that was published is never refunded, and neither is a paid extension.</li>
              <li>If a monthly renewal payment fails, the plan ends at once and you move to Pay as you publish.</li>
            </ul>
          </section>
        </div>

        <aside
          aria-label="Your plan"
          className="self-start rounded-2xl bg-enamel p-6 text-on-enamel sm:p-7 lg:sticky lg:top-24 lg:col-span-5 xl:col-span-4 dark:ring-1 dark:ring-enamel-seam"
        >
          <p className="transit-label text-[0.85rem] text-on-enamel-muted">Your plan</p>
          <p className="mt-2 font-display text-[2.2rem] leading-none font-bold tracking-[-0.01em]">
            {account.plan ? PLAN_INFO[account.plan].label : "No plan yet"}
          </p>
          <PlanTiming account={account} />
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-enamel-seam pt-5">
            <div className="flex flex-col gap-1">
              <dt className="transit-label text-[0.78rem] text-on-enamel-muted">Plan credits</dt>
              <dd className="font-display text-[1.8rem] leading-none font-bold tabular">{account.credits}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="transit-label text-[0.78rem] text-on-enamel-muted">Purchased</dt>
              <dd className="font-display text-[1.8rem] leading-none font-bold tabular">{account.purchasedCredits}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-col gap-3 border-t border-enamel-seam pt-5">
            <Button type="button" variant="onEnamel" onClick={goToPortal} disabled={portal.pending} className="w-full">
              <CreditCardIcon aria-hidden />
              {portal.pending ? "Opening portal" : "Open billing portal"}
              <ExternalLinkIcon aria-hidden />
            </Button>
            <p className="text-sm text-on-enamel-muted">Your saved cards can be managed in the billing portal.</p>
            <p className="text-sm text-on-enamel-muted">
              Cancel a plan, change the default card for renewals and see invoices there.
            </p>
            {portal.error ? <PortalError error={portal.error} /> : null}
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={checkoutPlan !== null}
        onOpenChange={(open) => {
          if (!open) setCheckoutPlan(null);
        }}
        title={checkoutPlan ? `Subscribe to ${PLAN_INFO[checkoutPlan].label}?` : "Subscribe"}
        description={
          checkoutPlan ? (
            <div className="flex flex-col gap-2">
              <p>
                You go to a secure Stripe page. {PLAN_INFO[checkoutPlan].label} costs{" "}
                <span className="font-semibold text-foreground">{money(PLAN_INFO[checkoutPlan].monthlyUsd)} a month</span>{" "}
                and gives {PLAN_INFO[checkoutPlan].credits} credits each month. Unused credits don&apos;t roll over.
              </p>
              <p>Your card is saved for the monthly renewal. {NO_CASH_REFUNDS}</p>
            </div>
          ) : null
        }
        confirmLabel="Continue to Stripe"
        pendingLabel="Opening Stripe"
        cancelLabel="Not now"
        onConfirm={async () => {
          if (!checkoutPlan) return;
          const { url } = await startPlanCheckout(checkoutPlan);
          window.location.assign(url);
        }}
      />
    </div>
  );
}

function PortalError({ error }: { error: FormError }) {
  return (
    <p role="alert" className="text-sm font-medium text-on-enamel">
      {error.message}
    </p>
  );
}

function PlanTiming({ account }: { account: CurrentCompany }) {
  if (!account.plan) {
    return <p className="mt-2 text-[0.95rem] text-on-enamel-muted">Choose a plan to finish setting up your company.</p>;
  }
  if (account.plan === "payAsYouPublish") {
    return <p className="mt-2 text-[0.95rem] text-on-enamel-muted">No monthly charge.</p>;
  }
  if (!account.planRenewsAt) return null;
  return (
    <p className={cn("mt-2 text-[0.95rem]", account.planEndsAtPeriodEnd ? "font-medium text-line-amber" : "text-on-enamel-muted")}>
      {account.planEndsAtPeriodEnd ? "Ends on " : "Renews on "}
      <time dateTime={account.planRenewsAt}>{formatDate(account.planRenewsAt)}</time>
    </p>
  );
}

interface PlanOptionProps {
  plan: BillingPlan;
  current: boolean;
  account: CurrentCompany;
  paidPlan: boolean;
  pending: boolean;
  onChooseFree: () => void;
  onSubscribe: () => void;
}

function PlanOption({ plan, current, account, paidPlan, pending, onChooseFree, onSubscribe }: PlanOptionProps) {
  const info = PLAN_INFO[plan];
  const isFree = plan === "payAsYouPublish";

  let action: ReactNode;
  if (current) {
    action = (
      <p className="inline-flex items-center gap-2 transit-label text-sm text-success-ink">
        <CheckIcon aria-hidden className="size-4" />
        Current plan
      </p>
    );
  } else if (isFree) {
    action = account.plan ? (
      <p className="text-sm text-muted-foreground">Cancel your paid plan in the billing portal to move back to this one.</p>
    ) : (
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={onChooseFree}>
        {pending ? "Choosing" : "Choose"}
      </Button>
    );
  } else if (paidPlan) {
    action = (
      <p className="text-sm text-muted-foreground">Cancel your current plan in the billing portal before choosing another one.</p>
    );
  } else {
    action = (
      <Button type="button" size="sm" onClick={onSubscribe}>
        Subscribe
      </Button>
    );
  }

  return (
    <li
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-5",
        current ? "border-foreground/50 bg-card" : "border-border",
      )}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-xl leading-tight font-bold uppercase">{info.label}</h3>
        <p className="font-display text-[1.9rem] leading-none font-bold tabular">
          {info.monthlyUsd === 0 ? "$0" : money(info.monthlyUsd)}
          <span className="ml-1 font-sans text-sm font-normal text-muted-foreground">a month</span>
        </p>
      </div>
      <ul className="flex flex-col gap-1.5 text-[0.95rem] text-muted-foreground">
        <li>{info.credits === 0 ? "No monthly credits" : `${info.credits} credits a month`}</li>
        <li>{money(info.vacancyUsd)} per vacancy without a credit</li>
      </ul>
      <div className="mt-auto">{action}</div>
    </li>
  );
}
