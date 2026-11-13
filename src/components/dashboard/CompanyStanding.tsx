import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { JourneyLine } from "@/components/auth/JourneyTrack";
import { companyGap } from "@/lib/account";
import { routes } from "@/lib/routes";
import type { CurrentCompany } from "@/types";

const APPROVAL_STATIONS = [
  { name: "Profile", detail: "" },
  { name: "Plan", detail: "" },
  { name: "Review", detail: "" },
  { name: "Approved", detail: "" },
];

export function CompanyStanding({ account }: { account: CurrentCompany }) {
  if (account.approved && account.isProfileComplete) return null;
  const gap = companyGap(account);
  const current = gap === "details" ? 0 : gap === "plan" ? 1 : account.approved ? 3 : 2;

  return (
    <section
      aria-labelledby="standing-title"
      className="grid gap-5 rounded-[17px] border border-line-amber/60 bg-card p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(15rem,22rem)] md:items-center md:gap-10"
    >
      <div className="flex gap-3.5">
        <span aria-hidden className="mt-[7px] size-3 shrink-0 rounded-full bg-line-amber ring-4 ring-line-amber/25" />
        <div className="flex min-w-0 flex-col gap-2">
          <h2 id="standing-title" className="font-display text-xl leading-tight font-bold tracking-[-0.01em] uppercase">
            {gap === "plan"
              ? "Choose a plan to finish setting up"
              : account.approved
                ? "Your company profile is incomplete"
                : "Posting and editing are paused"}
          </h2>
          <p className="max-w-[62ch] text-muted-foreground">
            {gap === "details"
              ? "Add your company name and description. Then choose a plan, and our team reviews your company."
              : gap === "plan"
                ? "Choosing a plan is the last step before our team can review your company. Pay as you publish costs nothing a month."
                : "Our team approves every company before it can post, submit or edit vacancies. Your profile is complete and waiting for review. You can still preview, close and delete vacancies."}
          </p>
          {gap ? (
            <Link
              href={gap === "plan" ? routes.billing : routes.profile}
              className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md transit-label text-sm text-cobalt-ink hover:underline"
            >
              {gap === "plan" ? "Choose a plan" : "Complete your profile"}
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>
      <JourneyLine stations={APPROVAL_STATIONS} current={current} label="Company approval" />
    </section>
  );
}
