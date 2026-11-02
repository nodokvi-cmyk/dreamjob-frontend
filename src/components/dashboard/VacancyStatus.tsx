import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/vacancy";
import type { VacancyStatus } from "@/types";

export const STATUS_RING: Record<VacancyStatus, string> = {
  pending: "border-line-amber",
  published: "border-line-green",
  rejected: "border-line-scarlet",
  closed: "border-muted-foreground/45",
  expired: "border-muted-foreground/45",
};

export const STATUS_DOT: Record<VacancyStatus, string> = {
  pending: "border-line-amber bg-transparent",
  published: "border-line-green bg-line-green",
  rejected: "border-line-scarlet bg-line-scarlet",
  closed: "border-muted-foreground/60 bg-muted-foreground/60",
  expired: "border-muted-foreground/60 bg-transparent",
};

export function StatusBadge({ status, className }: { status: VacancyStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit shrink-0 items-center gap-2 rounded-full border border-border bg-card pr-3 pl-2 transit-label text-[0.8rem] leading-none text-foreground",
        status === "rejected" && "border-destructive/40 text-destructive",
        className,
      )}
    >
      <span aria-hidden className={cn("size-3 rounded-full border-[3px]", STATUS_DOT[status])} />
      <span className="sr-only">Status: </span>
      {STATUS_LABELS[status]}
    </span>
  );
}

type StopState = "done" | "here" | "next" | "past";

interface Stop {
  name: string;
  state: StopState;
}

function stopsFor(status: VacancyStatus | "draft"): Stop[] {
  switch (status) {
    case "draft":
      return [
        { name: "In review", state: "next" },
        { name: "Live", state: "next" },
        { name: "Closed", state: "next" },
      ];
    case "pending":
      return [
        { name: "In review", state: "here" },
        { name: "Live", state: "next" },
        { name: "Closed", state: "next" },
      ];
    case "rejected":
      return [
        { name: "Rejected", state: "here" },
        { name: "Live", state: "next" },
        { name: "Closed", state: "next" },
      ];
    case "published":
      return [
        { name: "In review", state: "done" },
        { name: "Live", state: "here" },
        { name: "Closed", state: "next" },
      ];
    case "closed":
      return [
        { name: "In review", state: "done" },
        { name: "Live", state: "done" },
        { name: "Closed", state: "here" },
      ];
    case "expired":
      return [
        { name: "In review", state: "past" },
        { name: "Live", state: "past" },
        { name: "Expired", state: "here" },
      ];
  }
}

const SR_STATE: Record<StopState, string> = {
  done: "Passed",
  here: "Now",
  next: "Ahead",
  past: "Passed",
};

const HERE_NODE: Record<VacancyStatus | "draft", string> = {
  draft: "border-foreground/25 bg-background",
  pending: "border-line-amber bg-background",
  rejected: "border-line-scarlet bg-background",
  published: "border-line-green bg-line-scarlet",
  closed: "border-foreground bg-line-scarlet",
  expired: "border-muted-foreground/60 bg-muted",
};

export function LifecycleTrack({
  status,
  className,
}: {
  status: VacancyStatus | "draft";
  className?: string;
}) {
  const stops = stopsFor(status);
  return (
    <ol aria-label="Vacancy lifecycle" className={cn("grid grid-cols-3", className)}>
      {stops.map((stop, index) => {
        const after = stops[index + 1];
        const travelled = after !== undefined && (after.state === "done" || (after.state === "here" && status !== "expired"));
        const blocked = status === "rejected" && index === 0;
        return (
          <li
            key={stop.name}
            aria-current={stop.state === "here" ? "step" : undefined}
            className="relative flex flex-col gap-2.5 pr-2"
          >
            {after ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-2 right-0 left-4 h-1.5 rounded-full",
                  blocked
                    ? "border-2 border-dashed border-line-scarlet/45 bg-transparent"
                    : travelled
                      ? "bg-line-scarlet"
                      : "bg-foreground/15",
                )}
              />
            ) : null}
            <span
              aria-hidden
              className={cn(
                "relative z-10 size-[22px] rounded-full border-[5px]",
                stop.state === "done" && "border-line-scarlet bg-line-scarlet",
                stop.state === "here" && HERE_NODE[status],
                stop.state === "next" && "border-foreground/25 bg-background",
                stop.state === "past" && "border-muted-foreground/30 bg-muted-foreground/30",
              )}
            />
            <span
              className={cn(
                "transit-label text-xs leading-tight sm:text-sm",
                stop.state === "next" && "text-muted-foreground",
                stop.state === "past" && "text-muted-foreground",
                stop.state === "here" && status === "rejected" && "text-destructive",
              )}
            >
              <span className="sr-only">{SR_STATE[stop.state]}: </span>
              {stop.name}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
