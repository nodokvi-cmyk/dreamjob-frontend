"use client";

import { EyeOffIcon, FileTextIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { ReviewButtons } from "@/components/admin/ReviewButtons";
import { StatusBadge } from "@/components/dashboard/VacancyStatus";
import { Salary } from "@/components/vacancies/Salary";
import { adminPublicationsHref, canReviewPublication, publicationTiming } from "@/lib/publications";
import { adminPublicationHref, userHref } from "@/lib/routes";
import { formatDateTime } from "@/lib/vacancy";
import type { Publication } from "@/types";

interface AdminPublicationListProps {
  publications: Publication[];
  filteredUser?: string;
  onDone: (message: string) => void;
  onStale: (message: string) => void;
}

export function AdminPublicationList({ publications, filteredUser, onDone, onStale }: AdminPublicationListProps) {
  return (
    <div className="flex flex-col">
      {publications.map((publication) => (
        <AdminPublicationRow
          key={publication.id}
          publication={publication}
          showUserFilter={filteredUser !== publication.user}
          onDone={onDone}
          onStale={onStale}
        />
      ))}
    </div>
  );
}

function filesText(publication: Pick<Publication, "hasCv" | "hasCoverLetter">): string {
  if (publication.hasCv && publication.hasCoverLetter) return "CV and cover letter";
  if (publication.hasCv) return "CV";
  if (publication.hasCoverLetter) return "Cover letter";
  return "No files";
}

function AdminPublicationRow({
  publication,
  showUserFilter,
  onDone,
  onStale,
}: {
  publication: Publication;
  showUserFilter: boolean;
  onDone: (message: string) => void;
  onStale: (message: string) => void;
}) {
  const headingId = `publication-${publication.id}`;
  return (
    <article
      aria-labelledby={headingId}
      className="relative flex min-w-0 flex-col gap-3 border-b border-border px-1 pt-4 pb-5 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-8 sm:px-2"
    >
      <div className="flex min-w-0 flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusBadge status={publication.status} />
          {publication.acceptingInvites ? null : (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <EyeOffIcon aria-hidden className="size-4" />
              Hidden by the user
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            Updated <time dateTime={publication.updatedAt}>{formatDateTime(publication.updatedAt)}</time>
          </span>
        </div>
        <h2 id={headingId} className="font-display text-[1.45rem] leading-[1.1] font-semibold tracking-[-0.005em] break-words">
          <Link
            href={adminPublicationHref(publication.id)}
            className="rounded-sm decoration-line-scarlet decoration-2 underline-offset-4 hover:underline"
          >
            {publication.title}
          </Link>
        </h2>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.95rem] text-muted-foreground">
          {publication.category ? <span>{publication.category}</span> : null}
          <span className="inline-flex items-center gap-1.5">
            <FileTextIcon aria-hidden className="size-4" />
            {filesText(publication)}
          </span>
          <Link
            href={userHref(publication.user)}
            className="inline-flex items-center gap-1.5 font-medium text-cobalt-ink underline-offset-4 hover:underline"
          >
            <UserIcon aria-hidden className="size-4" />
            Job seeker profile
          </Link>
          {showUserFilter ? (
            <Link
              href={adminPublicationsHref({ status: "all", userId: publication.user })}
              className="font-medium text-cobalt-ink underline-offset-4 hover:underline"
            >
              All by this user
            </Link>
          ) : null}
        </p>
        <p className="text-[0.95rem]">{publicationTiming(publication)}</p>
        {publication.status === "rejected" && publication.rejectionReason ? (
          <p className="max-w-[62ch] text-[0.95rem] break-words text-destructive">
            Reason given: {publication.rejectionReason}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 sm:items-end sm:pt-9 sm:text-right">
        <Salary range={publication} className="text-[1.35rem]" />
        {canReviewPublication(publication) ? (
          <ReviewButtons item={publication} kind="publication" onDone={onDone} onStale={onStale} />
        ) : null}
      </div>
    </article>
  );
}
