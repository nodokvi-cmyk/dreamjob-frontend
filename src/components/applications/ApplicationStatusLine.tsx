import Link from "next/link";
import { APPLICATION_STATUS_DOT } from "@/components/applications/ApplicationStatusBadge";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS } from "@/lib/applications";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

interface ApplicationStatusLineProps {
  active: ApplicationStatus | undefined;
  href: (status: ApplicationStatus | undefined) => string;
}

const STOPS: readonly (ApplicationStatus | undefined)[] = [undefined, ...APPLICATION_STATUSES];

export function ApplicationStatusLine({ active, href }: ApplicationStatusLineProps) {
  return (
    <nav aria-label="Filter by status" className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <ul className="flex w-max items-center gap-2">
        {STOPS.map((status) => {
          const current = active === status;
          return (
            <li key={status ?? "all"}>
              <Link
                href={href(status)}
                scroll={false}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-full border px-3.5 transit-label text-[0.85rem] whitespace-nowrap transition-colors duration-150",
                  current
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {status ? (
                  <span aria-hidden className={cn("size-3 rounded-full border-[3px]", APPLICATION_STATUS_DOT[status])} />
                ) : null}
                {status ? APPLICATION_STATUS_LABELS[status] : "All"}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
