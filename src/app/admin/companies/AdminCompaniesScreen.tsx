"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { StaleAlert } from "@/components/admin/StaleAlert";
import { CompanyList } from "@/components/admin/CompanyList";
import { useRefocus } from "@/components/admin/useRefocus";
import { useLoad } from "@/components/dashboard/useLoad";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { ListMessage, PastLastPage, ResultsError, VacancyListSkeleton } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import { COMPANY_PAGE_SIZE, companiesHref, parseCompanyPage } from "@/lib/adminQuery";
import { formError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { listCompanies } from "@/services/admin.service";

const numbers = new Intl.NumberFormat("en-GB");

export function AdminCompaniesScreen() {
  const searchParams = useSearchParams();
  const page = useMemo(() => parseCompanyPage(Object.fromEntries(searchParams)) ?? 1, [searchParams]);
  const { state, reload } = useLoad(`companies:${page}`, (signal) =>
    listCompanies(page, COMPANY_PAGE_SIZE, signal),
  );
  const { notice, succeed } = useAction();
  const ready = state.status === "ready" && !state.refreshing;
  const [headingRef, requestRefocus] = useRefocus(ready);
  const busy = state.status !== "loading" && state.refreshing;
  const total = state.status === "ready" ? state.data.total : null;

  const [failure, setFailure] = useState<string | null>(null);

  const stale = (message: string) => {
    setFailure(message);
    reload();
  };

  const done = (message: string) => {
    setFailure(null);
    succeed(message);
    requestRefocus();
    reload();
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase outline-none"
          >
            Companies
          </h1>
          <p className="max-w-[62ch] text-[1.05rem] text-muted-foreground">
            Newest first. A company can post once you approve it and its profile is complete.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-4">
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p aria-live="polite" className="text-[1.05rem] text-muted-foreground">
              {total === null ? (
                state.status === "loading" ? "Loading companies" : "Company list unavailable"
              ) : (
                <>
                  <span className="font-display text-[1.6rem] leading-none font-bold text-foreground tabular">
                    {numbers.format(total)}
                  </span>{" "}
                  {total === 1 ? "company" : "companies"}
                </>
              )}
            </p>
            <Notice message={notice} />
          </div>

          <StaleAlert message={failure} />

          <div
            aria-busy={state.status === "loading" || busy}
            className={cn(
              "flex flex-col gap-6 transition-opacity duration-200",
              busy && "pointer-events-none opacity-55 motion-safe:delay-150",
            )}
          >
            {state.status === "loading" ? (
              <VacancyListSkeleton rows={4} />
            ) : state.status === "failed" ? (
              <ResultsError
                title="The company list didn't load"
                body={formError(state.error).message}
                onRetry={reload}
              />
            ) : state.data.items.length > 0 ? (
              <>
                <CompanyList companies={state.data.items} onDone={done} onStale={stale} />
                <Pagination
                  href={(next) => companiesHref(next)}
                  total={state.data.total}
                  page={state.data.page}
                  take={state.data.take}
                />
              </>
            ) : state.data.total > 0 ? (
              <PastLastPage href={companiesHref(undefined)} />
            ) : (
              <ListMessage
                title="No companies yet"
                body="Companies appear here once they sign up."
                action={null}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
