"use client";

import { BuildingIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { ReviewButtons } from "@/components/admin/ReviewButtons";
import { STATUS_RING, StatusBadge } from "@/components/dashboard/VacancyStatus";
import { DeadlineStop } from "@/components/vacancies/VacancyList";
import { adminVacancyHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { canReview, formatDate, formatSalary, placeLabel } from "@/lib/vacancy";
import type { OwnVacancy } from "@/types";

interface AdminVacancyListProps {
  vacancies: OwnVacancy[];
  now: number;
  companyName: (id: string) => string;
  onDone: (message: string) => void;
  onStale: (message: string) => void;
}

export function AdminVacancyList({ vacancies, now, companyName, onDone, onStale }: AdminVacancyListProps) {
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
          <AdminVacancyRow
            vacancy={vacancy}
            now={now}
            company={companyName(vacancy.company)}
            onDone={onDone}
            onStale={onStale}
          />
        </li>
      ))}
    </ol>
  );
}

function AdminVacancyRow({
  vacancy,
  now,
  company,
  onDone,
  onStale,
}: {
  vacancy: OwnVacancy;
  now: number;
  company: string;
  onDone: (message: string) => void;
  onStale: (message: string) => void;
}) {
  const salary = formatSalary(vacancy);

  return (
    <article
      aria-labelledby={`admin-vacancy-${vacancy.id}`}
      className="relative flex min-w-0 flex-1 flex-col gap-4 border-b border-border px-1 pt-4 pb-5 transition-colors hover:bg-muted/40 sm:px-2"
    >
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-8">
        <div className="flex min-w-0 flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <StatusBadge status={vacancy.status} />
            <span className="text-sm text-muted-foreground">
              Submitted <time dateTime={vacancy.createdAt}>{formatDate(vacancy.createdAt)}</time>
            </span>
          </div>
          <h2
            id={`admin-vacancy-${vacancy.id}`}
            className="font-display text-[1.45rem] leading-[1.1] font-semibold tracking-[-0.005em] break-words"
          >
            <Link
              href={adminVacancyHref(vacancy.id)}
              className="rounded-sm decoration-line-scarlet decoration-2 underline-offset-4 after:absolute after:inset-0 hover:underline"
            >
              {vacancy.title}
            </Link>
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.95rem] text-muted-foreground">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <BuildingIcon aria-hidden className="size-4 shrink-0" />
              <span className="sr-only">Company: </span>
              <span className="truncate">{company}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon aria-hidden className="size-4 shrink-0" />
              {placeLabel(vacancy)}
            </span>
          </div>
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
      {canReview(vacancy, now) ? (
        <div className="relative z-10">
          <ReviewButtons vacancy={vacancy} onDone={onDone} onStale={onStale} />
        </div>
      ) : null}
    </article>
  );
}
