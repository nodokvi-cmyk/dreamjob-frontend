import Link from "next/link";
import { STATUS_DOT } from "@/components/dashboard/VacancyStatus";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, VACANCY_STATUSES } from "@/lib/vacancy";
import { dashboardHref } from "@/lib/vacancyQuery";
import type { OwnVacancyQuery, VacancyStatus } from "@/types";

const STOPS: readonly (VacancyStatus | undefined)[] = [undefined, ...VACANCY_STATUSES];

export function StatusLine({ query }: { query: OwnVacancyQuery }) {
  return (
    <nav aria-label="Filter by status" className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <ul className="relative flex w-max items-center gap-2">
        <span aria-hidden className="absolute top-1/2 right-4 left-4 h-1 -translate-y-1/2 rounded-full bg-border" />
        {STOPS.map((status) => {
          const active = query.status === status;
          return (
            <li key={status ?? "all"} className="relative">
              <Link
                href={dashboardHref({ q: query.q, status })}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-full border px-3.5 transit-label text-[0.85rem] whitespace-nowrap transition-colors duration-150",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {status ? (
                  <span aria-hidden className={cn("size-3 rounded-full border-[3px]", STATUS_DOT[status])} />
                ) : null}
                {status ? STATUS_LABELS[status] : "All"}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
