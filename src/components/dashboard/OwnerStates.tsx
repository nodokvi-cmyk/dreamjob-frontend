"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useLoad } from "@/components/dashboard/useLoad";
import { LifecycleTrack, StatusBadge } from "@/components/dashboard/VacancyStatus";
import { GateMessage } from "@/components/guards/GateStates";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultsError } from "@/components/vacancies/ListStates";
import { formError } from "@/lib/errors";
import { routes } from "@/lib/routes";
import { ApiError } from "@/services/api";
import { getOwnVacancy } from "@/services/vacancies.service";
import type { OwnVacancy, VacancyStatus } from "@/types";

export function useOwnVacancy(id: string, accountId: string) {
  return useLoad(`${accountId}:${id}`, async (signal) => {
    const vacancy = await getOwnVacancy(id, accountId, signal);
    return { vacancy, now: Date.now() };
  });
}

export function OwnerLoadError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  if (error instanceof ApiError && [400, 403, 404].includes(error.status)) {
    return (
      <GateMessage
        title="Vacancy not found"
        body="It may have been deleted, or it belongs to another account."
        action={{ label: "Back to dashboard", href: routes.dashboard }}
      />
    );
  }
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <ResultsError title="This vacancy didn't load" body={formError(error).message} onRetry={onRetry} />
    </div>
  );
}

interface EditorFrameProps {
  title: string;
  lead: ReactNode;
  back: { href: string; label: string };
  status: VacancyStatus | "draft";
  vacancy?: OwnVacancy;
  children: ReactNode;
}

const REVIEW_NOTES: readonly string[] = [
  "Our team reviews every vacancy before it goes public.",
  "Changing anything except the closing date sends a live or rejected vacancy back to review. Adding or removing photos counts too.",
  "Close a live vacancy from your dashboard once the role is filled.",
];

export function EditorFrame({ title, lead, back, status, vacancy, children }: EditorFrameProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pt-6 pb-8 sm:px-6 md:pt-8 lg:px-8">
          <Link
            href={back.href}
            className="inline-flex w-fit items-center gap-2 rounded-md transit-label text-[0.85rem] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon aria-hidden className="size-4" />
            {back.label}
          </Link>
          <div className="flex max-w-3xl flex-col gap-3">
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[0.95] font-bold tracking-[-0.02em] break-words uppercase">
              {title}
            </h1>
            {vacancy ? <StatusBadge status={vacancy.status} /> : null}
            <div className="max-w-[62ch] text-[1.05rem] text-muted-foreground">{lead}</div>
          </div>
          {vacancy?.status === "rejected" ? (
            <div className="max-w-3xl rounded-[12px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-[0.95rem]">
              <span className="font-semibold">Our team&apos;s note: </span>
              <span className="break-words whitespace-pre-line">
                {vacancy.rejectionReason || "No reason was given."}
              </span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-2 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
        <div className="min-w-0 lg:col-span-8">{children}</div>
        <aside
          aria-label="How review works"
          className="order-first mt-6 flex flex-col gap-5 self-start rounded-[17px] border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-24 lg:order-none lg:col-span-4 lg:mt-8"
        >
          <LifecycleTrack status={status} />
          <ul className="hidden flex-col gap-2.5 text-sm text-muted-foreground lg:flex">
            {REVIEW_NOTES.map((note) => (
              <li key={note} className="flex gap-2.5">
                <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-foreground/40" />
                {note}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div role="status" aria-label="Loading vacancy" className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pt-6 pb-8 sm:px-6 md:pt-8 lg:px-8">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-[min(30rem,85%)]" />
          <Skeleton className="h-5 w-[min(34rem,90%)]" />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-10 pb-20 sm:px-6 lg:px-8">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex max-w-3xl flex-col gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
