import { BriefcaseBusinessIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { VacancyEmployer } from "@/components/vacancies/VacancyEmployer";
import { cn } from "@/lib/utils";
import {
  EMPLOYMENT_TYPE_LABELS,
  type DeadlineTone,
  deadlineInfo,
  formatSalary,
  placeLabel,
} from "@/lib/vacancy";
import type { Vacancy } from "@/types";

export const TONE_RING: Record<DeadlineTone, string> = {
  open: "border-line-green",
  soon: "border-line-amber",
  ended: "border-muted-foreground/45",
};

export const TONE_DOT: Record<DeadlineTone, string> = {
  open: "bg-line-green",
  soon: "bg-line-amber",
  ended: "bg-muted-foreground/45",
};

export function vacancyHref(id: string): string {
  return `/vacancies/${encodeURIComponent(id)}`;
}

export function DeadlineStop({ vacancy, now, className }: { vacancy: Vacancy; now: number; className?: string }) {
  const deadline = deadlineInfo(vacancy, now);
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", TONE_DOT[deadline.tone])} />
      <time dateTime={vacancy.deadline} className={cn(deadline.tone === "soon" && "font-medium text-foreground")}>
        {deadline.label}
      </time>
    </span>
  );
}

interface VacancyListProps {
  vacancies: Vacancy[];
  now: number;
  headingLevel?: "h2" | "h3";
}

export function VacancyList({ vacancies, now, headingLevel = "h2" }: VacancyListProps) {
  return (
    <ol className="relative flex flex-col">
      <span
        aria-hidden
        className="absolute top-6 bottom-6 left-[11px] w-1.5 -translate-x-1/2 rounded-full bg-border sm:left-[15px]"
      />
      {vacancies.map((vacancy) => (
        <li key={vacancy.id} className="relative">
          <VacancyRow vacancy={vacancy} now={now} headingLevel={headingLevel} />
        </li>
      ))}
    </ol>
  );
}

function VacancyRow({ vacancy, now, headingLevel }: { vacancy: Vacancy; now: number; headingLevel: "h2" | "h3" }) {
  const Heading = headingLevel;
  const salary = formatSalary(vacancy);
  const tone = deadlineInfo(vacancy, now).tone;

  return (
    <Link
      href={vacancyHref(vacancy.id)}
      className="group/row relative flex gap-4 rounded-xl py-1.5 outline-none sm:gap-5 focus-visible:outline-none"
    >
      <span
        aria-hidden
        className={cn(
          "relative z-10 mt-[22px] size-[22px] shrink-0 rounded-full border-[5px] bg-background transition-colors duration-200 sm:mt-6 sm:ml-1",
          TONE_RING[tone],
          "group-hover/row:bg-line-scarlet group-focus-visible/row:bg-line-scarlet",
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-3 rounded-xl border border-transparent px-4 py-4 transition-[background-color,border-color] duration-200 group-hover/row:border-border group-hover/row:bg-card group-focus-visible/row:border-ring group-focus-visible/row:bg-card group-focus-visible/row:ring-3 group-focus-visible/row:ring-ring/30 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-8 sm:px-5">
        <span className="flex min-w-0 flex-col gap-2.5">
          <Heading className="font-display text-[1.5rem] leading-[1.1] font-semibold tracking-[-0.005em] text-foreground group-hover/row:underline group-hover/row:decoration-2 group-hover/row:decoration-line-scarlet group-hover/row:underline-offset-4">
            {vacancy.title}
          </Heading>
          <VacancyEmployer company={vacancy.company} size="sm" />
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.95rem] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon aria-hidden className="size-4 shrink-0" />
              {placeLabel(vacancy)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusinessIcon aria-hidden className="size-4 shrink-0" />
              {EMPLOYMENT_TYPE_LABELS[vacancy.employmentType]}
            </span>
            {vacancy.category ? <span>{vacancy.category}</span> : null}
          </span>
        </span>
        <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-border pt-3 sm:flex-col sm:items-end sm:justify-start sm:gap-2 sm:border-t-0 sm:pt-0.5 sm:text-right">
          {salary ? (
            <span className="font-display text-[1.45rem] leading-none font-bold tabular text-foreground">
              {salary}
            </span>
          ) : (
            <span className="text-[0.95rem] text-muted-foreground">Salary not specified</span>
          )}
          <DeadlineStop vacancy={vacancy} now={now} />
        </span>
      </span>
    </Link>
  );
}
