"use client";

import { useVacancySearch } from "@/components/vacancies/VacancySearch";
import { cn } from "@/lib/utils";
import { isPastQuery } from "@/lib/vacancyQuery";
import type { VacancyQuery } from "@/types";

const OPTIONS = [
  { value: undefined, label: "Open" },
  { value: "past", label: "Past" },
] as const;

export function PeriodSwitch({ query }: { query: VacancyQuery }) {
  const { apply } = useVacancySearch();
  if (!query.companyId) return null;
  const past = isPastQuery(query);

  return (
    <div role="group" aria-label="Vacancy period" className="inline-flex w-fit rounded-full border border-foreground/20 bg-card p-1">
      {OPTIONS.map((option) => {
        const active = (option.value === "past") === past;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (!active) apply({ period: option.value, sort: undefined });
            }}
            className={cn(
              "transit-label h-8 min-w-20 rounded-full px-4 text-[0.85rem] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
              active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
