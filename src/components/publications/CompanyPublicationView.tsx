"use client";

import Link from "next/link";
import { useState } from "react";
import { FileButtons } from "@/components/applications/ApplicationFiles";
import { InvitationLabel } from "@/components/board/BoardCard";
import { useLoad } from "@/components/dashboard/useLoad";
import { FormAlert } from "@/components/form/FormAlert";
import { GateMessage } from "@/components/guards/GateStates";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { PublicationSkeleton, PublicationView } from "@/components/publications/PublicationView";
import { ResultsError } from "@/components/vacancies/ListStates";
import { NOT_APPROVED, authorName } from "@/lib/board";
import { formError } from "@/lib/errors";
import { routes, userHref } from "@/lib/routes";
import { formatDate } from "@/lib/vacancy";
import { ApiError } from "@/services/api";
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
  const [problem, setProblem] = useState<string | null>(null);

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
        </div>
      }
    />
  );
}
