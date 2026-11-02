import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { vacanciesHref } from "@/lib/vacancyQuery";
import type { VacancyQuery } from "@/types";

interface PaginationProps {
  query: VacancyQuery;
  total: number;
  page: number;
  take: number;
}

const STEP =
  "inline-flex h-11 items-center gap-2 rounded-lg border px-4 font-display text-[0.95rem] font-semibold tracking-[0.06em] uppercase transition-colors";

export function pageCount(total: number, take: number): number {
  return Math.max(1, Math.ceil(total / Math.max(1, take)));
}

export function Pagination({ query, total, page, take }: PaginationProps) {
  const pages = pageCount(total, take);
  if (pages <= 1) return null;
  const previous = page > 1 ? vacanciesHref({ ...query, page: Math.min(page - 1, pages) }) : null;
  const next = page < pages ? vacanciesHref({ ...query, page: page + 1 }) : null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 border-t border-border pt-6">
      <StepLink href={previous} label="Previous" direction="back" />
      <p className="text-[0.95rem] text-muted-foreground">
        Page <span className="font-semibold text-foreground tabular">{Math.min(page, pages)}</span> of{" "}
        <span className="tabular">{pages}</span>
      </p>
      <StepLink href={next} label="Next" direction="forward" />
    </nav>
  );
}

function StepLink({ href, label, direction }: { href: string | null; label: string; direction: "back" | "forward" }) {
  const icon =
    direction === "back" ? <ArrowLeftIcon aria-hidden className="size-4" /> : <ArrowRightIcon aria-hidden className="size-4" />;
  if (!href) {
    return (
      <span aria-hidden className={cn(STEP, "pointer-events-none border-border text-muted-foreground/60")}>
        {direction === "back" ? icon : null}
        <span className="max-sm:sr-only">{label}</span>
        {direction === "forward" ? icon : null}
      </span>
    );
  }
  return (
    <Link
      href={href}
      rel={direction === "back" ? "prev" : "next"}
      className={cn(STEP, "border-foreground/25 text-foreground hover:border-foreground/45 hover:bg-muted")}
    >
      {direction === "back" ? icon : null}
      <span className="max-sm:sr-only">{label}</span>
      {direction === "forward" ? icon : null}
    </Link>
  );
}
