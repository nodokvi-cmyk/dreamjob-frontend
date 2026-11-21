import { BriefcaseIcon, FileTextIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { experienceText } from "@/components/publications/PublicationView";
import { Skeleton } from "@/components/ui/skeleton";
import { Salary } from "@/components/vacancies/Salary";
import { INVITATION_LABELS, authorName } from "@/lib/board";
import { userHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS } from "@/lib/vacancy";
import type { InvitationState, PublicationCard } from "@/types";

const SKILLS_SHOWN = 6;

function anyOr(labels: string[], fallback: string): string {
  return labels.length > 0 ? labels.join(", ") : fallback;
}

export function InvitationLabel({ state, className }: { state: InvitationState; className?: string }) {
  if (state === "none") return null;
  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit items-center gap-2 rounded-full border bg-card px-3 transit-label text-[0.8rem] leading-none",
        state === "accepted" && "border-line-green/60 text-success-ink",
        state === "invited" && "border-line-cobalt/60 text-foreground",
        (state === "declined" || state === "cancelled") && "border-border text-muted-foreground",
        className,
      )}
    >
      {INVITATION_LABELS[state]}
    </span>
  );
}

interface BoardCardProps {
  publication: PublicationCard;
  href: string;
  action?: ReactNode;
}

export function BoardCard({ publication, href, action }: BoardCardProps) {
  const { author } = publication;
  const headingId = `board-${publication.id}`;
  const extraSkills = publication.skills.length - SKILLS_SHOWN;
  const files = [publication.hasCv ? "CV" : null, publication.hasCoverLetter ? "Cover letter" : null].filter(
    (item): item is string => item !== null,
  );

  return (
    <article
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-4 rounded-[17px] border border-border bg-card p-5 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-8 sm:p-6"
    >
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <AccountPhoto src={author?.avatarUrl ?? ""} kind="user" alt="" size="sm" fit="cover" />
          {author ? (
            <Link href={userHref(author.id)} className="min-w-0 truncate text-[0.95rem] font-medium underline-offset-4 hover:underline">
              {authorName(author)}
            </Link>
          ) : (
            <span className="text-[0.95rem] text-muted-foreground">{authorName(null)}</span>
          )}
        </div>
        <h2 id={headingId} className="font-display text-[1.5rem] leading-[1.1] font-semibold tracking-[-0.005em] break-words">
          <Link href={href} className="rounded-sm decoration-line-scarlet decoration-2 underline-offset-4 hover:underline">
            {publication.title}
          </Link>
        </h2>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.95rem] text-muted-foreground">
          {publication.category ? <span className="font-medium text-foreground">{publication.category}</span> : null}
          <span className="inline-flex items-center gap-1.5">
            <BriefcaseIcon aria-hidden className="size-4" />
            {experienceText(publication.experienceYears)}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPinIcon aria-hidden className="size-4 shrink-0" />
            <span className="break-words">{anyOr(publication.locations, "Any location")}</span>
          </span>
        </p>
        <p className="text-[0.95rem] text-muted-foreground">
          {anyOr(publication.workModes.map((mode) => WORK_MODE_LABELS[mode]), "Any work mode")}
          {" · "}
          {anyOr(publication.employmentTypes.map((type) => EMPLOYMENT_TYPE_LABELS[type]), "Any contract")}
        </p>
        {publication.excerpt ? (
          <p className="max-w-[70ch] text-[1rem] leading-relaxed break-words">{publication.excerpt}</p>
        ) : null}
        {publication.skills.length > 0 ? (
          <ul aria-label="Skills" className="flex flex-wrap gap-1.5">
            {publication.skills.slice(0, SKILLS_SHOWN).map((skill) => (
              <li key={skill} className="rounded-full border border-border px-2.5 py-0.5 text-sm break-words">
                {skill}
              </li>
            ))}
            {extraSkills > 0 ? (
              <li className="px-1 py-0.5 text-sm text-muted-foreground">+{extraSkills} more</li>
            ) : null}
          </ul>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:pt-0 sm:text-right">
        <Salary range={publication} className="text-[1.4rem] text-foreground" />
        {files.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileTextIcon aria-hidden className="size-4" />
            {files.join(" · ")}
          </span>
        ) : null}
        <InvitationLabel state={publication.invitation} />
        {action}
      </div>
    </article>
  );
}

export function BoardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-[17px] border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-7 w-[min(26rem,85%)]" />
          <Skeleton className="h-4 w-[min(20rem,70%)]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      ))}
    </div>
  );
}
