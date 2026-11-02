"use client";

import { ArrowRightIcon, ExternalLinkIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OwnerLoadError, useOwnVacancy } from "@/components/dashboard/OwnerStates";
import { VacancyActions } from "@/components/dashboard/VacancyActions";
import { LifecycleTrack, StatusBadge } from "@/components/dashboard/VacancyStatus";
import { GateSpinner } from "@/components/guards/GateStates";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { VacancyDetailSkeleton, VacancyDetailView } from "@/components/vacancies/VacancyDetail";
import { vacancyHref } from "@/components/vacancies/VacancyList";
import { useAuth } from "@/context/AuthContext";
import { editVacancyHref, routes } from "@/lib/routes";
import { formatDateTime } from "@/lib/vacancy";
import type { CurrentCompany, OwnVacancy } from "@/types";

const STATUS_COPY: Record<OwnVacancy["status"], string> = {
  pending: "Only you can see this page while our team reviews it.",
  published: "It's live. Seekers find it in the vacancy list and see this page.",
  rejected: "Only you can see this page. Edit it and save to send it back for review.",
  closed: "It's off the vacancy list. Its public page shows it as closed.",
  expired: "Its closing date has passed, so it's off the vacancy list.",
};

export function OwnerPreviewScreen({ id }: { id: string }) {
  const { session } = useAuth();
  if (!session || session.accountRole !== "company") return <GateSpinner />;
  return <OwnerPreview id={id} accountId={session.accountId} account={session.account} />;
}

function OwnerPreview({ id, accountId, account }: { id: string; accountId: string; account: CurrentCompany }) {
  const router = useRouter();
  const { state, reload } = useOwnVacancy(id, accountId);
  const { notice, succeed } = useAction();

  if (state.status === "loading") return <VacancyDetailSkeleton />;
  if (state.status === "failed") return <OwnerLoadError error={state.error} onRetry={reload} />;

  const { vacancy, now } = state.data;
  const publicPage = vacancy.status === "published" || vacancy.status === "closed";

  return (
    <div className="flex flex-1 flex-col">
      <section aria-labelledby="owner-title" className="border-b border-border bg-background">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start lg:gap-12 lg:px-8">
          <div className="flex min-w-0 flex-col gap-3">
            <h2 id="owner-title" className="sr-only">
              Your view of this vacancy
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <StatusBadge status={vacancy.status} />
              <span className="text-sm text-muted-foreground">
                Updated <time dateTime={vacancy.updatedAt}>{formatDateTime(vacancy.updatedAt)}</time>
              </span>
            </div>
            <p className="max-w-[62ch] text-[1.02rem]">
              {STATUS_COPY[vacancy.status]}{" "}
              {publicPage ? (
                <Link
                  href={vacancyHref(vacancy.id)}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1 font-semibold text-cobalt-ink hover:underline"
                >
                  Open public page
                  <ExternalLinkIcon aria-hidden className="size-3.5" />
                  <span className="sr-only">(opens in a new tab)</span>
                </Link>
              ) : null}
            </p>
            {vacancy.status === "rejected" ? (
              <div className="flex max-w-[62ch] flex-col gap-2 rounded-[12px] border border-destructive/30 bg-destructive/5 px-4 py-3">
                <p className="text-[0.95rem]">
                  <span className="font-semibold">Our team&apos;s note: </span>
                  <span className="break-words whitespace-pre-line">
                    {vacancy.rejectionReason || "No reason was given."}
                  </span>
                </p>
                {account.approved ? (
                  <Link
                    href={editVacancyHref(vacancy.id)}
                    className="inline-flex w-fit items-center gap-1.5 rounded-md transit-label text-sm text-cobalt-ink hover:underline"
                  >
                    Edit and resubmit
                    <ArrowRightIcon aria-hidden className="size-4" />
                  </Link>
                ) : null}
              </div>
            ) : null}
            {!account.approved && vacancy.status !== "closed" && vacancy.status !== "expired" ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <PencilIcon aria-hidden className="size-4 shrink-0" />
                Editing is paused until our team approves your company.
              </p>
            ) : null}
            <div className="mt-1 flex flex-col gap-3">
              <VacancyActions
                vacancy={vacancy}
                now={now}
                approved={account.approved}
                showPreview={false}
                onClosed={() => {
                  succeed("Vacancy closed.");
                  reload();
                }}
                onDeleted={() => router.push(routes.dashboard)}
              />
              <Notice message={notice} />
            </div>
          </div>
          <div className="rounded-[17px] border border-border bg-card p-5">
            <LifecycleTrack status={vacancy.status} />
          </div>
        </div>
      </section>
      <VacancyDetailView vacancy={vacancy} now={now} back={{ href: routes.dashboard, label: "Dashboard" }} />
    </div>
  );
}
