"use client";

import { CheckIcon, InfoIcon, Trash2Icon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CompanyCard } from "@/components/admin/CompanyCard";
import { StaleAlert } from "@/components/admin/StaleAlert";
import { ReviewButtons } from "@/components/admin/ReviewButtons";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { useLoad } from "@/components/dashboard/useLoad";
import { LifecycleTrack, StatusBadge } from "@/components/dashboard/VacancyStatus";
import { GateMessage } from "@/components/guards/GateStates";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { ResultsError } from "@/components/vacancies/ListStates";
import { VacancyDetailSkeleton, VacancyDetailView } from "@/components/vacancies/VacancyDetail";
import { formError } from "@/lib/errors";
import { routes } from "@/lib/routes";
import { STATUS_LABELS, canReview, formatDate, formatDateTime } from "@/lib/vacancy";
import { ApiError } from "@/services/api";
import { getAdminVacancy } from "@/services/admin.service";
import { deleteVacancy } from "@/services/vacancies.service";
import type { OwnVacancy } from "@/types";

const STATUS_COPY: Record<OwnVacancy["status"], string> = {
  pending: "Waiting for review. Seekers can't see it yet.",
  published: "Live. Seekers find it in the vacancy list.",
  rejected: "Rejected. The company can edit it and send it for review again.",
  closed: "Closed by the company. It's off the vacancy list.",
  expired: "Its closing date has passed, so it's off the vacancy list.",
};

function blockedReason(vacancy: OwnVacancy): string {
  if (vacancy.status !== "pending") {
    return `This vacancy is ${STATUS_LABELS[vacancy.status].toLowerCase()}, so it can't be approved or rejected. Only vacancies in review can.`;
  }
  return "The closing date has passed, so this vacancy can't be approved or rejected.";
}

export function AdminReviewScreen({ id }: { id: string }) {
  const router = useRouter();
  const { state, reload } = useLoad(id, async (signal) => {
    const vacancy = await getAdminVacancy(id, signal);
    return { vacancy, now: Date.now() };
  });
  const { notice, succeed } = useAction();
  const [failure, setFailure] = useState<string | null>(null);

  if (state.status === "loading") return <VacancyDetailSkeleton />;
  if (state.status === "failed") {
    if (state.error instanceof ApiError && [400, 404].includes(state.error.status)) {
      return (
        <GateMessage
          title="Vacancy not found"
          body="It may have been deleted."
          action={{ label: "Back to vacancies", href: routes.adminVacancies }}
        />
      );
    }
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <ResultsError
          title="This vacancy didn't load"
          body={formError(state.error).message}
          onRetry={reload}
        />
      </div>
    );
  }

  const { vacancy, now } = state.data;
  const reviewable = canReview(vacancy, now);

  return (
    <div className="flex flex-1 flex-col">
      <section aria-labelledby="review-title" className="border-b border-border bg-background">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start lg:gap-12 lg:px-8">
          <div className="flex min-w-0 flex-col gap-3">
            <h2 id="review-title" className="sr-only">
              Review this vacancy
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <StatusBadge status={vacancy.status} />
              <span className="text-sm text-muted-foreground">
                Submitted <time dateTime={vacancy.createdAt}>{formatDate(vacancy.createdAt)}</time>
                {" · "}Updated <time dateTime={vacancy.updatedAt}>{formatDateTime(vacancy.updatedAt)}</time>
              </span>
            </div>
            <p className="max-w-[62ch] text-[1.02rem]">{STATUS_COPY[vacancy.status]}</p>
            {vacancy.status === "rejected" ? (
              <div className="max-w-[62ch] rounded-[12px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-[0.95rem]">
                <span className="font-semibold">Reason given: </span>
                <span className="break-words whitespace-pre-line">
                  {vacancy.rejectionReason || "No reason was given."}
                </span>
              </div>
            ) : null}
            <div className="mt-1 flex flex-col gap-3">
              {reviewable ? (
                <ReviewButtons
                  vacancy={vacancy}
                  size="default"
                  onDone={(message) => {
                    setFailure(null);
                    succeed(message);
                    reload();
                  }}
                  onStale={(message) => {
                    setFailure(message);
                    reload();
                  }}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" disabled aria-describedby="review-blocked">
                      <CheckIcon aria-hidden />
                      Approve
                    </Button>
                    <Button type="button" variant="outline" disabled aria-describedby="review-blocked">
                      <XIcon aria-hidden />
                      Reject
                    </Button>
                  </div>
                  <p
                    id="review-blocked"
                    className="flex max-w-[62ch] items-start gap-2 text-sm text-muted-foreground"
                  >
                    <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
                    {blockedReason(vacancy)}
                  </p>
                </div>
              )}
              <StaleAlert message={failure} />
              <div className="flex flex-wrap items-center gap-3">
                <ConfirmDialog
                  trigger={
                    <Button type="button" variant="destructive">
                      <Trash2Icon aria-hidden />
                      Delete
                    </Button>
                  }
                  title="Delete this vacancy?"
                  description={
                    <p>
                      <span className="font-semibold text-foreground">{vacancy.title}</span>
                      {vacancy.photos.length > 0
                        ? ` and its ${vacancy.photos.length === 1 ? "photo are" : `${vacancy.photos.length} photos are`} deleted for good.`
                        : " is deleted for good."}{" "}
                      It can&apos;t be undone.
                    </p>
                  }
                  confirmLabel="Delete for good"
                  pendingLabel="Deleting"
                  cancelLabel="Keep it"
                  tone="danger"
                  icon={<Trash2Icon aria-hidden />}
                  onConfirm={async () => {
                    await deleteVacancy(vacancy.id);
                    router.push(routes.adminVacancies);
                  }}
                />
                <Notice message={notice} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <CompanyCard companyId={vacancy.company} />
            <div className="rounded-[17px] border border-border bg-card p-5">
              <LifecycleTrack status={vacancy.status} />
            </div>
          </div>
        </div>
      </section>
      <VacancyDetailView
        vacancy={vacancy}
        now={now}
        back={{ href: routes.adminVacancies, label: "All vacancies" }}
      />
    </div>
  );
}
