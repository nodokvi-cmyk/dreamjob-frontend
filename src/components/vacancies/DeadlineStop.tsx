import { cn } from "@/lib/utils";
import { type DeadlineTone, deadlineInfo } from "@/lib/vacancy";

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

export function DeadlineStop({
  vacancy,
  now,
  className,
}: {
  vacancy: Parameters<typeof deadlineInfo>[0];
  now: number;
  className?: string;
}) {
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
