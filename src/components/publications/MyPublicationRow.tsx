import { EyeOffIcon, FileTextIcon } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/VacancyStatus";
import { Salary } from "@/components/vacancies/Salary";
import { publicationTiming } from "@/lib/publications";
import { publicationHref } from "@/lib/routes";
import { formatDateTime } from "@/lib/vacancy";
import type { Publication } from "@/types";

function filesText(publication: Pick<Publication, "hasCv" | "hasCoverLetter">): string | null {
  if (publication.hasCv && publication.hasCoverLetter) return "CV and cover letter";
  if (publication.hasCv) return "CV";
  if (publication.hasCoverLetter) return "Cover letter";
  return null;
}

export function MyPublicationRow({ publication }: { publication: Publication }) {
  const files = filesText(publication);
  const ended = publication.status === "closed" || publication.status === "expired";
  return (
    <article
      aria-labelledby={`publication-${publication.id}`}
      className="flex min-w-0 flex-col gap-3 border-b border-border px-1 pt-4 pb-5 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-8 sm:px-2"
    >
      <div className="flex min-w-0 flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusBadge status={publication.status} />
          {publication.acceptingInvites || ended ? null : (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <EyeOffIcon aria-hidden className="size-4" />
              Hidden from companies
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            Updated <time dateTime={publication.updatedAt}>{formatDateTime(publication.updatedAt)}</time>
          </span>
        </div>
        <h2
          id={`publication-${publication.id}`}
          className="font-display text-[1.45rem] leading-[1.1] font-semibold tracking-[-0.005em] break-words"
        >
          <Link
            href={publicationHref(publication.id)}
            className="rounded-sm decoration-line-scarlet decoration-2 underline-offset-4 hover:underline"
          >
            {publication.title}
          </Link>
        </h2>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.95rem] text-muted-foreground">
          {publication.category ? <span>{publication.category}</span> : null}
          {files ? (
            <span className="inline-flex items-center gap-1.5">
              <FileTextIcon aria-hidden className="size-4" />
              {files}
            </span>
          ) : null}
        </p>
        <p className="text-[0.95rem]">{publicationTiming(publication)}</p>
        {publication.status === "rejected" && publication.rejectionReason ? (
          <p className="max-w-[62ch] text-[0.95rem] break-words text-destructive">
            Our team&apos;s note: {publication.rejectionReason}
          </p>
        ) : null}
      </div>
      <div className="sm:pt-9 sm:text-right">
        <Salary range={publication} className="text-[1.35rem]" />
      </div>
    </article>
  );
}
