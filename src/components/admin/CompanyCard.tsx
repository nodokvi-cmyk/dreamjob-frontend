"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { CompanyFlags } from "@/components/admin/CompanyFlags";
import { shortCompanyId } from "@/components/admin/useCompanyNames";
import { useLoad } from "@/components/dashboard/useLoad";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { Skeleton } from "@/components/ui/skeleton";
import { adminVacanciesHref } from "@/lib/adminQuery";
import { formError } from "@/lib/errors";
import { getCompanyById } from "@/services/admin.service";

export function CompanyCard({ companyId }: { companyId: string }) {
  const { state } = useLoad(`company:${companyId}`, (signal) => getCompanyById(companyId, signal));
  const viewAll = adminVacanciesHref({ status: "all", companyId });

  return (
    <section
      aria-labelledby="company-card-title"
      className="flex flex-col gap-4 rounded-[17px] border border-border bg-card p-5"
    >
      <h2 id="company-card-title" className="transit-label text-[0.85rem] text-muted-foreground">
        Posted by
      </h2>
      {state.status === "loading" ? (
        <div role="status" aria-label="Loading company" className="flex items-center gap-4">
          <Skeleton className="size-[72px] rounded-[14px]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
        </div>
      ) : state.status === "failed" ? (
        <p className="text-[0.95rem] text-muted-foreground">
          <span className="font-semibold text-foreground">{shortCompanyId(companyId)}.</span>{" "}
          {formError(state.error).message}
        </p>
      ) : (
        <>
          <div className="flex min-w-0 items-center gap-4">
            <AccountPhoto
              src={state.data.logoUrl}
              name={state.data.companyName || state.data.email}
              alt={`${state.data.companyName || "Company"} logo`}
              size="md"
              fit="contain"
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="font-display text-[1.5rem] leading-[1.05] font-bold break-words">
                {state.data.companyName || shortCompanyId(companyId)}
              </p>
              <p className="text-[0.95rem] break-all text-muted-foreground">{state.data.email}</p>
              {state.data.location ? (
                <p className="text-[0.95rem] text-muted-foreground">{state.data.location}</p>
              ) : null}
            </div>
          </div>
          <CompanyFlags company={state.data} />
          {!state.data.approved ? (
            <p className="text-sm text-muted-foreground">
              This company isn&apos;t approved right now. You can still review its vacancies.
            </p>
          ) : null}
        </>
      )}
      <Link
        href={viewAll}
        className="inline-flex w-fit items-center gap-1.5 rounded-md transit-label text-sm text-cobalt-ink hover:underline"
      >
        View vacancies
        <ArrowRightIcon aria-hidden className="size-4" />
      </Link>
    </section>
  );
}
