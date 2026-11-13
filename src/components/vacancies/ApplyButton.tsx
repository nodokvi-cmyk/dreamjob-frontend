"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReasonTip } from "@/components/vacancies/ReasonTip";
import { useViewerMarks } from "@/components/vacancies/ViewerMarks";
import { applyState } from "@/lib/applyState";
import { signInWithNext } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { UserVacancyStatus, VacancyStatus, ViewerMarks } from "@/types";

export type ApplyKind = "apply" | "reapply";

interface ApplyButtonProps {
  vacancy: { id: string; title: string; status: VacancyStatus | UserVacancyStatus; deadline: string };
  marks: ViewerMarks;
  now: number;
  detailHref: string;
  onApply: (kind: ApplyKind) => void;
  size?: "sm" | "default";
  className?: string;
}

const TONE = {
  apply:
    "bg-success-ink text-white hover:bg-[color-mix(in_oklab,var(--success-ink),black_14%)] dark:text-enamel dark:hover:bg-[color-mix(in_oklab,var(--success-ink),white_14%)]",
  reapply:
    "bg-cobalt-ink text-white hover:bg-[color-mix(in_oklab,var(--cobalt-ink),black_14%)] dark:text-enamel dark:hover:bg-[color-mix(in_oklab,var(--cobalt-ink),white_14%)]",
  off: "cursor-not-allowed border-border bg-muted text-muted-foreground disabled:opacity-100",
};

export function ApplyButton({ vacancy, marks, now, detailHref, onApply, size = "sm", className }: ApplyButtonProps) {
  const { viewer, ready } = useViewerMarks();
  const base = buttonVariants({ size });
  const suffix = <span className="sr-only"> to {vacancy.title}</span>;

  if (viewer === "other") return null;
  if (!ready) {
    return <Skeleton aria-hidden className={cn(size === "sm" ? "h-8 w-[5.5rem]" : "h-10 w-28", "rounded-md", className)} />;
  }

  const state = applyState(vacancy, marks, now);

  if (state.kind === "apply" && viewer === "anonymous") {
    return (
      <Link href={signInWithNext(detailHref)} className={cn(base, TONE.apply, "relative z-10", className)}>
        Apply
        {suffix}
      </Link>
    );
  }

  if (state.kind === "apply" || state.kind === "reapply") {
    const kind = state.kind;
    return (
      <button
        type="button"
        onClick={() => onApply(kind)}
        className={cn(base, TONE[kind], "relative z-10", className)}
      >
        {kind === "apply" ? "Apply" : "Reapply"}
        {suffix}
      </button>
    );
  }

  return (
    <ReasonTip reason={state.reason} className={className}>
      <button type="button" disabled className={cn(base, TONE.off)}>
        {state.kind === "applied" ? state.label : "Apply"}
        {suffix}
      </button>
    </ReasonTip>
  );
}
