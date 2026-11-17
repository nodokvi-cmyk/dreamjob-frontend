"use client";

import { BriefcaseBusinessIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ApplyConfirm } from "@/components/vacancies/apply/ApplyConfirm";
import { ApplyButton, type ApplyKind } from "@/components/vacancies/ApplyButton";
import { BookmarkHeart } from "@/components/vacancies/BookmarkHeart";
import { DeadlineStop, TONE_RING } from "@/components/vacancies/DeadlineStop";
import { VacancyEmployer } from "@/components/vacancies/VacancyEmployer";
import { useViewerMarks } from "@/components/vacancies/ViewerMarks";
import { companyHref, vacancyHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Salary } from "@/components/vacancies/Salary";
import { EMPLOYMENT_TYPE_LABELS, deadlineInfo, placeLabel } from "@/lib/vacancy";
import type { VacancyCard } from "@/types";

interface VacancyCardRowProps {
  vacancy: VacancyCard;
  now: number;
  headingLevel: "h2" | "h3";
  onBookmarkChange?: (vacancyId: string, bookmarked: boolean) => void;
}


export function VacancyCardRow({ vacancy, now, headingLevel, onBookmarkChange }: VacancyCardRowProps) {
  const [confirm, setConfirm] = useState<ApplyKind | null>(null);
  const { marksFor } = useViewerMarks();
  const marks = marksFor(vacancy.id, {
    companyApproved: vacancy.companyApproved,
    myApplication: vacancy.myApplication,
    isBookmarked: vacancy.isBookmarked,
  });
  const Heading = headingLevel;
  const tone = deadlineInfo(vacancy, now).tone;
  const href = vacancyHref(vacancy.id);
  const unavailable = vacancy.status === "unavailable";

  return (
    <article className="group/row relative flex gap-4 py-1.5 sm:gap-5">
      <span
        aria-hidden
        className={cn(
          "relative z-[1] mt-[22px] size-[22px] shrink-0 rounded-full border-[5px] bg-background transition-colors duration-200 sm:mt-6 sm:ml-1",
          unavailable ? "border-dashed border-muted-foreground/45" : TONE_RING[tone],
          !unavailable && "group-hover/row:bg-line-scarlet group-has-[[data-stretch]:focus-visible]/row:bg-line-scarlet",
        )}
      />
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-3 rounded-xl border border-transparent px-4 py-4 transition-[background-color,border-color] duration-200 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-8 sm:px-5",
          !unavailable && "group-hover/row:border-border group-hover/row:bg-card",
          "has-[[data-stretch]:focus-visible]:border-ring has-[[data-stretch]:focus-visible]:bg-card has-[[data-stretch]:focus-visible]:ring-3 has-[[data-stretch]:focus-visible]:ring-ring/30",
        )}
      >
        <div className="flex min-w-0 flex-col gap-2.5">
          <Heading className="font-display text-[1.5rem] leading-[1.1] font-semibold tracking-[-0.005em] break-words text-foreground">
            {unavailable ? (
              <span className="text-muted-foreground">{vacancy.title}</span>
            ) : (
              <Link
                href={href}
                data-stretch
                className="outline-none group-hover/row:underline group-hover/row:decoration-line-scarlet group-hover/row:decoration-2 group-hover/row:underline-offset-4 after:absolute after:inset-0 after:rounded-xl after:content-['']"
              >
                {vacancy.title}
              </Link>
            )}
          </Heading>
          {unavailable ? (
            <p className="transit-label text-[0.8rem] text-muted-foreground">Temporarily unavailable</p>
          ) : null}
          <VacancyEmployer
            employer={{
              companyName: vacancy.companyName,
              logoUrl: vacancy.logoUrl,
              approved: marks.companyApproved,
              href: companyHref(vacancy.company),
            }}
            size="sm"
          />
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.95rem] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon aria-hidden className="size-4 shrink-0" />
              {placeLabel(vacancy)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusinessIcon aria-hidden className="size-4 shrink-0" />
              {EMPLOYMENT_TYPE_LABELS[vacancy.employmentType]}
            </span>
            {vacancy.category ? <span>{vacancy.category}</span> : null}
          </p>
          {vacancy.excerpt ? (
            <p className="line-clamp-2 max-w-[65ch] text-[0.95rem] leading-relaxed text-muted-foreground">
              {vacancy.excerpt}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border pt-3 sm:flex-col sm:flex-nowrap sm:items-end sm:justify-start sm:gap-2 sm:border-t-0 sm:pt-0.5 sm:text-right">
          <div className="flex flex-col gap-1.5 sm:items-end">
            <Salary range={vacancy} className="text-[1.45rem] text-foreground" />
            <DeadlineStop vacancy={vacancy} now={now} />
          </div>
          <div className="flex items-center gap-2 sm:mt-auto sm:pt-2">
            <BookmarkHeart
              vacancyId={vacancy.id}
              title={vacancy.title}
              bookmarked={marks.isBookmarked}
              onChange={onBookmarkChange ? (bookmarked) => onBookmarkChange(vacancy.id, bookmarked) : undefined}
            />
            <ApplyButton
              vacancy={vacancy}
              marks={marks}
              now={now}
              detailHref={href}
              onApply={setConfirm}
            />
          </div>
        </div>
      </div>
      {confirm ? (
        <ApplyConfirm
          open
          onOpenChange={(open) => {
            if (!open) setConfirm(null);
          }}
          vacancy={vacancy}
          kind={confirm}
          previousStatus={marks.myApplication?.status ?? null}
          detailHref={href}
        />
      ) : null}
    </article>
  );
}
