import { APPLICATION_STATUS_LABELS } from "@/lib/applications";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

export const APPLICATION_STATUS_DOT: Record<ApplicationStatus, string> = {
  submitted: "border-foreground/40 bg-transparent",
  viewed: "border-line-cobalt bg-transparent",
  interview: "border-line-amber bg-line-amber",
  accepted: "border-line-green bg-line-green",
  rejected: "border-line-scarlet bg-line-scarlet",
  withdrawn: "border-muted-foreground/60 bg-muted-foreground/60",
};

export function ApplicationStatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit shrink-0 items-center gap-2 rounded-full border border-border bg-card pr-3 pl-2 transit-label text-[0.8rem] leading-none text-foreground",
        status === "rejected" && "border-destructive/40 text-destructive",
        className,
      )}
    >
      <span aria-hidden className={cn("size-3 rounded-full border-[3px]", APPLICATION_STATUS_DOT[status])} />
      <span className="sr-only">Application status: </span>
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}
