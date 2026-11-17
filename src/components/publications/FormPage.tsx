import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/dashboard/VacancyStatus";
import { Skeleton } from "@/components/ui/skeleton";
import type { PublicationStatus } from "@/types";

interface FormPageProps {
  title: string;
  lead: ReactNode;
  back: { href: string; label: string };
  status?: PublicationStatus;
  children: ReactNode;
}

const NOTES: readonly string[] = [
  "Our team reviews every publication before companies see it.",
  "Once approved it stays visible for 60 days. Extending is free.",
  "Editing a live or rejected publication, or adding a file, sends it back to review.",
  "You can have 3 active publications at a time. Closed and expired ones don't count.",
];

export function FormPage({ title, lead, back, status, children }: FormPageProps) {
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
            {status ? <StatusBadge status={status} /> : null}
            <div className="max-w-[62ch] text-[1.05rem] text-muted-foreground">{lead}</div>
          </div>
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
        <div className="min-w-0 lg:col-span-8">{children}</div>
        <aside
          aria-label="How publications work"
          className="order-first flex flex-col gap-3 self-start rounded-[17px] border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-24 lg:order-none lg:col-span-4"
        >
          <p className="transit-label text-[0.85rem] text-muted-foreground">How it works</p>
          <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
            {NOTES.map((note) => (
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

export function FormPageSkeleton({ label = "Loading publication" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-1 flex-col">
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
