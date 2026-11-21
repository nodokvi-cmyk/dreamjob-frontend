"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FileButtons } from "@/components/applications/ApplicationFiles";
import { InvitationLabel } from "@/components/board/BoardCard";
import { useLoad } from "@/components/dashboard/useLoad";
import { FormAlert } from "@/components/form/FormAlert";
import { GateMessage } from "@/components/guards/GateStates";
import { CancelInvitation } from "@/components/invitations/CancelInvitation";
import { InviteButton } from "@/components/invitations/InviteButton";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { PublicationSkeleton, PublicationView } from "@/components/publications/PublicationView";
import { ResultsError } from "@/components/vacancies/ListStates";
import { applicantsHref } from "@/lib/applicantQuery";
import { NOT_APPROVED, authorName } from "@/lib/board";
import { quotaText } from "@/lib/invitations";
import { formError } from "@/lib/errors";
import { routes, userHref } from "@/lib/routes";
import { formatDate } from "@/lib/vacancy";
import { ApiError } from "@/services/api";
import { getInvitationQuota } from "@/services/invitations.service";
import { getCompanyPublication, getPublicationFile } from "@/services/publications.service";
import type { CurrentCompany } from "@/types";

const BACK = { href: routes.board, label: "Job seekers" };

function NotApproved() {
  return (
    <GateMessage
      title="Waiting for admin approval"
      body="Approved companies can open job seekers' publications and invite them. Our team reviews your company soon."
      action={{ label: "Back to dashboard", href: routes.dashboard }}
    />
  );
}

export function CompanyPublicationView({ id, account }: { id: string; account: CurrentCompany }) {
  if (!account.approved) return <NotApproved />;
  return <CompanyPublication id={id} />;
}

function CompanyPublication({ id }: { id: string }) {
  const { state, reload } = useLoad(`company-publication:${id}`, (signal) => getCompanyPublication(id, signal));
  const quota = useLoad("quota", (signal) => getInvitationQuota(signal));
  const quotaValue = quota.state.status === "ready" ? quota.state.data : null;
  const [problem, setProblem] = useState<string | null>(null);
  const { notice, succeed } = useAction();

  const refresh = (message: string) => {
    succeed(message);
    reload();
    quota.reload();
  };

  if (state.status === "loading") return <PublicationSkeleton />;
  if (state.status === "failed") {
    const { error } = state;
    if (error instanceof ApiError && error.status === 403 && error.message === NOT_APPROVED) return <NotApproved />;
    if (error instanceof ApiError && [400, 403, 404].includes(error.status)) {
      return (
        <GateMessage
          title="Publication not found"
          body="It's no longer on the board. The job seeker may have closed it, hidden it or deleted it."
          action={{ label: "Back to job seekers", href: routes.board }}
        />
      );
    }
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <ResultsError title="This publication didn't load" body={formError(error).message} onRetry={reload} />
      </div>
    );
  }

  const publication = state.data;
  const { author } = publication;

  return (
    <PublicationView
      publication={publication}
      back={BACK}
      status={
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <AccountPhoto src={author?.avatarUrl ?? ""} kind="user" alt="" size="sm" fit="cover" />
            {author ? (
              <Link href={userHref(author.id)} className="min-w-0 truncate font-medium underline-offset-4 hover:underline">
                {authorName(author)}
              </Link>
            ) : (
              <span className="text-muted-foreground">{authorName(null)}</span>
            )}
          </div>
          <InvitationLabel state={publication.invitation} />
        </div>
      }
      panel={
        <div className="flex flex-col gap-3">
          {publication.canInvite ? (
            <>
              <InviteButton
                publication={publication}
                quota={quotaValue}
                size="default"
                excludeVacancyId={publication.invitation === "declined" ? publication.invitedVacancyId : null}
                onInvited={() => refresh("Invitation sent.")}
              />
              {quotaValue ? <p className="text-sm text-on-enamel-muted">{quotaText(quotaValue)}</p> : null}
            </>
          ) : null}
          {publication.invitation === "invited" && publication.invitationId ? (
            <>
              <p className="text-sm text-on-enamel-muted">Waiting for the job seeker to answer.</p>
              <CancelInvitation
                invitationId={publication.invitationId}
                onDone={() => refresh("Invitation cancelled.")}
                onStale={(message) => {
                  setProblem(message);
                  reload();
                }}
              />
            </>
          ) : null}
          {publication.invitation === "accepted" && publication.invitedVacancyId ? (
            <Link
              href={applicantsHref(publication.invitedVacancyId, {})}
              className="inline-flex items-center gap-1.5 font-semibold text-on-enamel underline-offset-4 hover:underline"
            >
              Accepted. Open the applicant list
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
          ) : null}
          {publication.invitation === "accepted" && !publication.invitedVacancyId ? (
            <p className="text-sm text-on-enamel-muted">The job seeker accepted, but you deleted that vacancy and its application.</p>
          ) : null}
          {publication.invitation === "declined" ? (
            <p className="text-sm text-on-enamel-muted">
              {publication.canInvite
                ? "The job seeker declined your invitation. You can invite them once more, to a different vacancy."
                : "The job seeker declined your invitation. You cannot invite this publication again."}
            </p>
          ) : null}
          {publication.invitation === "cancelled" ? (
            <p className="text-sm text-on-enamel-muted">
              {publication.canInvite
                ? "You cancelled your invitation. You can invite them once more."
                : "You cancelled your invitation. You cannot invite this publication again."}
            </p>
          ) : null}
        </div>
      }
      strip={
        <div className="flex max-w-3xl flex-col gap-4">
          <p className="text-[1.02rem] text-muted-foreground">
            {publication.expiresAt ? (
              <>
                Visible until <time dateTime={publication.expiresAt}>{formatDate(publication.expiresAt)}</time>.{" "}
              </>
            ) : null}
            Email and phone stay private until the job seeker accepts an invitation.
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
          <Notice message={notice} />
        </div>
      }
    />
  );
}

