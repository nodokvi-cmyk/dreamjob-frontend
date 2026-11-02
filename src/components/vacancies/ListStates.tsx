"use client";

import { RotateCwIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function EndOfLine({ broken = false }: { broken?: boolean }) {
  return (
    <div aria-hidden className="flex items-center">
      <span className="h-1.5 w-14 rounded-full bg-border" />
      <span
        className={
          broken
            ? "size-6 rounded-full border-[5px] border-line-amber bg-background"
            : "size-6 rounded-full border-[5px] border-foreground bg-background"
        }
      />
      <span className="h-1.5 w-14 rounded-full border-2 border-dashed border-muted-foreground/50" />
    </div>
  );
}

export function ListMessage({
  title,
  body,
  action,
  broken,
}: {
  title: string;
  body: ReactNode;
  action: ReactNode;
  broken?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <EndOfLine broken={broken} />
      <h2 className="font-display text-3xl font-bold tracking-[-0.01em] uppercase">{title}</h2>
      <p className="max-w-md text-[1.05rem] text-muted-foreground">{body}</p>
      <div className="mt-1 flex flex-wrap justify-center gap-3">{action}</div>
    </div>
  );
}

export function EmptyResults({ clearHref, filtered }: { clearHref: string; filtered: boolean }) {
  return (
    <ListMessage
      title={filtered ? "No vacancies on this line" : "No vacancies yet"}
      body={
        filtered
          ? "Nothing matches these filters right now. Clear them, or try a broader keyword or another city."
          : "Published vacancies appear here as soon as our team approves them. Check back soon."
      }
      action={
        filtered ? (
          <Button asChild size="lg">
            <Link href={clearHref}>Clear filters</Link>
          </Button>
        ) : null
      }
    />
  );
}

export function PastLastPage({ href }: { href: string }) {
  return (
    <ListMessage
      title="End of the line"
      body="This page is past the last result. The list may have changed since the link was made."
      action={
        <Button asChild size="lg">
          <Link href={href}>Back to page 1</Link>
        </Button>
      }
    />
  );
}

export function ResultsError({
  title = "The list didn't load",
  body = "We couldn't reach DreamJob just now. Check your connection, then try again.",
}: {
  title?: string;
  body?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div role="alert">
      <ListMessage
        broken
        title={title}
        body={body}
        action={
          <Button size="lg" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
            <RotateCwIcon aria-hidden className={pending ? "motion-safe:animate-spin" : undefined} />
            {pending ? "Trying again…" : "Try again"}
          </Button>
        }
      />
    </div>
  );
}

export function VacancyListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden className="relative flex flex-col">
      <span className="absolute top-6 bottom-6 left-[11px] w-1.5 -translate-x-1/2 rounded-full bg-border sm:left-[15px]" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="relative flex gap-4 py-1.5 sm:gap-5">
          <span className="relative z-10 mt-[22px] size-[22px] shrink-0 rounded-full border-[5px] border-border bg-background sm:mt-6 sm:ml-1" />
          <div className="flex flex-1 flex-col gap-3 px-4 py-4 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-8 sm:px-5">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-6 w-[min(22rem,80%)]" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-[min(18rem,70%)]" />
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
