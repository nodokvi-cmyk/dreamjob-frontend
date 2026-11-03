"use client";

import { ArrowRightIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { STATUS_RING, StatusBadge } from "@/components/dashboard/VacancyStatus";
import { VacancyActions } from "@/components/dashboard/VacancyActions";
import { DeadlineStop } from "@/components/vacancies/VacancyList";
import { editVacancyHref, ownVacancyHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { formatDateTime, formatSalary, placeLabel } from "@/lib/vacancy";
import type { OwnVacancy } from "@/types";

interface OwnVacancyListProps {
  vacancies: OwnVacancy[];
  now: number;
  approved: boolean;
  onClosed: (vacancy: OwnVacancy) => void;
  onDeleted: (vacancy: OwnVacancy) => void;
}

export function OwnVacancyList({ vacancies, now, approved, onClosed, onDeleted }: OwnVacancyListProps) {
  return (
    <ol className="relative flex flex-col gap-1">
      <span
        aria-hidden
        className="absolute top-8 bottom-8 left-[11px] w-1.5 -translate-x-1/2 rounded-full bg-border sm:left-[15px]"
      />
      {vacancies.map((vacancy) => (
        <li key={vacancy.id} className="relative flex gap-4 sm:gap-5">
          <span
            aria-hidden
            className={cn(
              "relative z-10 mt-[26px] size-[22px] shrink-0 rounded-full border-[5px] bg-background sm:mt-7 sm:ml-1",
              STATUS_RING[vacancy.status],
              vacancy.status === "published" && "bg-line-scarlet",
            )}
          />
          <OwnVacancyRow
            vacancy={vacancy}
            now={now}
            approved={approved}
            onClosed={() => onClosed(vacancy)}
            onDeleted={() => onDeleted(vacancy)}
          />
        </li>
      ))}
    </ol>
  );
}

function OwnVacancyRow({
  vacancy,
  now,
  approved,
  onClosed,
  onDeleted,
}: {
  vacancy: OwnVacancy;
  now: number;
  approved: boolean;
  onClosed: () => void;
  onDeleted: () => void;
}) {
  const salary = formatSalary(vacancy);
  const rejected = vacancy.status === "rejected";

  return (
    <article
      aria-labelledby={`vacancy-${vacancy.id}`}
      className="flex min-w-0 flex-1 flex-col gap-4 border-b border-border px-1 pt-4 pb-5 sm:px-2"
    >
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-8">
        <div className="flex min-w-0 flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <StatusBadge status={vacancy.status} />
            <span className="text-sm text-muted-foreground">
              Updated <time dateTime={vacancy.updatedAt}>{formatDateTime(vacancy.updatedAt)}</time>
            </span>
          </div>
          <h2
            id={`vacancy-${vacancy.id}`}
            className="font-display text-[1.45rem] leading-[1.1] font-semibold tracking-[-0.005em] break-words"
          >
            <Link
              href={ownVacancyHref(vacancy.id)}
              className="rounded-sm decoration-line-scarlet decoration-2 underline-offset-4 hover:underline"
            >
              {vacancy.title}
            </Link>
          </h2>
          <span className="inline-flex items-center gap-1.5 text-[0.95rem] text-muted-foreground">
            <MapPinIcon aria-hidden className="size-4 shrink-0" />
            {placeLabel(vacancy)}
          </span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 sm:flex-col sm:items-end sm:justify-start sm:gap-2 sm:pt-9 sm:text-right">
          {salary ? (
            <span className="font-display text-[1.35rem] leading-none font-bold tabular">{salary}</span>
          ) : (
            <span className="text-[0.95rem] text-muted-foreground">Salary by agreement</span>
          )}
          <DeadlineStop vacancy={vacancy} now={now} />
        </div>
      </div>

      {rejected ? (
        <div className="flex flex-col gap-2 rounded-[12px] border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-[0.95rem]">
            <span className="font-semibold">Our team&apos;s note: </span>
            <span className="break-words whitespace-pre-line">
              {vacancy.rejectionReason || "No reason was given."}
            </span>
          </p>
          {approved ? (
            <Link
              href={editVacancyHref(vacancy.id)}
              className="inline-flex w-fit items-center gap-1.5 rounded-md transit-label text-sm text-cobalt-ink hover:underline"
            >
              Edit and resubmit
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">
              You can edit and resubmit it once your company is approved.
            </p>
          )}
        </div>
      ) : null}

      <VacancyActions
        vacancy={vacancy}
        now={now}
        approved={approved}
        onClosed={onClosed}
        onDeleted={onDeleted}
      />
    </article>
  );
}
