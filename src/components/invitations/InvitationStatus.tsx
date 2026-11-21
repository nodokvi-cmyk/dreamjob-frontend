import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { INVITATION_STATUS_LABELS } from "@/lib/invitations";
import { cn } from "@/lib/utils";
import type { InvitationStatus } from "@/types";

const DOT: Record<InvitationStatus, string> = {
  invited: "border-line-cobalt bg-transparent",
  accepted: "border-line-green bg-line-green",
  declined: "border-muted-foreground/60 bg-muted-foreground/60",
  cancelled: "border-muted-foreground/60 bg-transparent",
};

export function InvitationStatusBadge({ status }: { status: InvitationStatus }) {
  return (
    <span className="inline-flex h-7 w-fit shrink-0 items-center gap-2 rounded-full border border-border bg-card pr-3 pl-2 transit-label text-[0.8rem] leading-none text-foreground">
      <span aria-hidden className={cn("size-3 rounded-full border-[3px]", DOT[status])} />
      <span className="sr-only">Invitation status: </span>
      {INVITATION_STATUS_LABELS[status]}
    </span>
  );
}

export function InvitationStatusLine<S extends InvitationStatus>({
  statuses,
  active,
  href,
}: {
  statuses: readonly S[];
  active: S | undefined;
  href: (status: S | undefined) => string;
}) {
  const stops: readonly (S | undefined)[] = [undefined, ...statuses];
  return (
    <nav aria-label="Filter by status" className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <ul className="relative flex w-max items-center gap-2">
        <span aria-hidden className="absolute top-1/2 right-4 left-4 h-1 -translate-y-1/2 rounded-full bg-border" />
        {stops.map((status) => {
          const current = active === status;
          return (
            <li key={status ?? "all"} className="relative">
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
                {status ? <span aria-hidden className={cn("size-3 rounded-full border-[3px]", DOT[status])} /> : null}
                {status ? INVITATION_STATUS_LABELS[status] : "All"}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function ListSkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-hidden className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-5 sm:px-5">
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-6 w-[min(24rem,80%)]" />
          <Skeleton className="h-4 w-[min(18rem,70%)]" />
        </div>
      ))}
    </div>
  );
}
