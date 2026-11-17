"use client";

import { CheckIcon, EyeOffIcon, InfoIcon, UserIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FileButtons } from "@/components/applications/ApplicationFiles";
import { ReviewButtons } from "@/components/admin/ReviewButtons";
import { StaleAlert } from "@/components/admin/StaleAlert";
import { useLoad } from "@/components/dashboard/useLoad";
import { StatusBadge } from "@/components/dashboard/VacancyStatus";
import { FormAlert } from "@/components/form/FormAlert";
import { GateMessage } from "@/components/guards/GateStates";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { PublicationSkeleton, PublicationView } from "@/components/publications/PublicationView";
import { Button } from "@/components/ui/button";
import { ResultsError } from "@/components/vacancies/ListStates";
import { formError } from "@/lib/errors";
import { adminPublicationsHref, canReviewPublication, publicationTiming } from "@/lib/publications";
import { userHref } from "@/lib/routes";
import { STATUS_LABELS, formatDate, formatDateTime } from "@/lib/vacancy";
import { ApiError } from "@/services/api";
import { getPublication, getPublicationFile } from "@/services/publications.service";
import type { PublicationStatus } from "@/types";

const STATUS_COPY: Record<PublicationStatus, string> = {
  pending: "Waiting for review. Companies can't see it yet.",
  published: "Live. Approved companies find it on the board.",
  rejected: "Rejected. The job seeker can edit and resend it, or delete it.",
  closed: "Closed by the job seeker. It's off the board for good.",
  expired: "Its 60 days ran out, so it's off the board until the job seeker extends it.",
};

export function AdminPublicationReviewScreen({ id }: { id: string }) {
  const { state, reload } = useLoad(`admin-publication:${id}`, (signal) => getPublication(id, signal));
  const { notice, succeed } = useAction();
  const [failure, setFailure] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const back = { href: adminPublicationsHref({}), label: "Publications" };

  if (state.status === "loading") return <PublicationSkeleton />;
  if (state.status === "failed") {
    if (state.error instanceof ApiError && [400, 404].includes(state.error.status)) {
      return (
        <GateMessage
          title="Publication not found"
          body="It may have been deleted."
          action={{ label: "Back to publications", href: back.href }}
        />
      );
    }
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <ResultsError title="This publication didn't load" body={formError(state.error).message} onRetry={reload} />
      </div>
    );
  }

  const publication = state.data;
  const reviewable = canReviewPublication(publication);

  return (
    <PublicationView
      publication={publication}
      back={back}
      status={
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusBadge status={publication.status} />
          {publication.acceptingInvites ? null : (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <EyeOffIcon aria-hidden className="size-4" />
              Hidden from companies by the user
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            Created <time dateTime={publication.createdAt}>{formatDate(publication.createdAt)}</time>
            {" · "}Updated <time dateTime={publication.updatedAt}>{formatDateTime(publication.updatedAt)}</time>
          </span>
        </div>
      }
      strip={
        <div className="flex max-w-3xl flex-col gap-4">
          <p className="text-[1.02rem]">
            {STATUS_COPY[publication.status]}
            {publication.timerPaused || (publication.expiresAt && publication.status !== "closed") ? (
              <span className="text-muted-foreground"> {publicationTiming(publication)}</span>
            ) : null}
          </p>
          {publication.status === "rejected" ? (
            <div className="rounded-[12px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-[0.95rem]">
              <span className="font-semibold">Reason given: </span>
              <span className="break-words whitespace-pre-line">
                {publication.rejectionReason || "No reason was given."}
              </span>
            </div>
          ) : null}
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.95rem]">
            <Link
              href={userHref(publication.user)}
              className="inline-flex items-center gap-1.5 font-medium text-cobalt-ink underline-offset-4 hover:underline"
            >
              <UserIcon aria-hidden className="size-4" />
              Job seeker profile
            </Link>
            <Link
              href={adminPublicationsHref({ status: "all", userId: publication.user })}
              className="font-medium text-cobalt-ink underline-offset-4 hover:underline"
            >
              All publications by this user
            </Link>
          </p>
          <div className="flex flex-col gap-2">
            <p className="transit-label text-[0.8rem] text-muted-foreground">Files</p>
            <div className="flex flex-wrap items-center gap-2">
              <FileButtons
                hasCv={publication.hasCv}
                hasCoverLetter={publication.hasCoverLetter}
                loadCv={() => getPublicationFile(publication.id, "cv")}
                loadCoverLetter={() => getPublicationFile(publication.id, "coverLetter")}
                onError={setProblem}
              />
              {publication.hasCv || publication.hasCoverLetter ? null : (
                <span className="text-sm text-muted-foreground">No CV or cover letter attached.</span>
              )}
            </div>
            {problem ? <FormAlert tone="error" message={problem} /> : null}
          </div>
          {reviewable ? (
            <ReviewButtons
              item={publication}
              kind="publication"
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
              <p id="review-blocked" className="flex max-w-[62ch] items-start gap-2 text-sm text-muted-foreground">
                <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
                This publication is {STATUS_LABELS[publication.status].toLowerCase()}, so it can&apos;t be approved
                or rejected. Only publications in review can.
              </p>
            </div>
          )}
          <StaleAlert message={failure} />
          <Notice message={notice} />
        </div>
      }
    />
  );
}
