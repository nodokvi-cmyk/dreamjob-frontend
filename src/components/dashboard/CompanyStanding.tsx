import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { JourneyLine } from "@/components/auth/JourneyTrack";
import { routes } from "@/lib/routes";
import type { CurrentCompany } from "@/types";

const APPROVAL_STATIONS = [
  { name: "Profile", detail: "" },
  { name: "Review", detail: "" },
  { name: "Approved", detail: "" },
];

export function CompanyStanding({ account }: { account: CurrentCompany }) {
  if (account.approved && account.isProfileComplete) return null;
  const incomplete = !account.isProfileComplete;
  const current = incomplete ? 0 : account.approved ? 2 : 1;

  return (
    <section
      aria-labelledby="standing-title"
      className="grid gap-5 rounded-[17px] border border-line-amber/60 bg-card p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)] md:items-center md:gap-10"
    >
      <div className="flex gap-3.5">
        <span aria-hidden className="mt-[7px] size-3 shrink-0 rounded-full bg-line-amber ring-4 ring-line-amber/25" />
        <div className="flex min-w-0 flex-col gap-2">
          <h2 id="standing-title" className="font-display text-xl leading-tight font-bold tracking-[-0.01em] uppercase">
            {account.approved
              ? "Your company profile is incomplete"
              : "Posting and editing are paused"}
          </h2>
          <p className="max-w-[62ch] text-muted-foreground">
            {account.approved
              ? "Add your company name and description so seekers know who is hiring."
              : incomplete
                ? "Our team approves every company before it can post or edit vacancies. Complete your profile first, so we can review it."
                : "Our team approves every company before it can post or edit vacancies. Your profile is complete and waiting for review. You can still preview, close and delete vacancies."}
          </p>
          {incomplete ? (
            <Link
              href={routes.profile}
              className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md transit-label text-sm text-cobalt-ink hover:underline"
            >
              Complete your profile
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>
      <JourneyLine stations={APPROVAL_STATIONS} current={current} label="Company approval" />
    </section>
  );
}
