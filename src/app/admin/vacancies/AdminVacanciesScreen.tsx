"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { StaleAlert } from "@/components/admin/StaleAlert";
import { AdminVacancyList } from "@/components/admin/AdminVacancyList";
import { useCompanyNames } from "@/components/admin/useCompanyNames";
import { useRefocus } from "@/components/admin/useRefocus";
import { StatusLine } from "@/components/dashboard/StatusLine";
import { useLoad } from "@/components/dashboard/useLoad";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { ListMessage, PastLastPage, ResultsError, VacancyListSkeleton } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import {
  ADMIN_PAGE_SIZE,
  adminApiSearch,
  adminVacanciesHref,
  hasAdminFilters,
  parseAdminQuery,
} from "@/lib/adminQuery";
import { formError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/vacancy";
import { countPendingVacancies, listAdminVacancies } from "@/services/admin.service";
import type { AdminVacancyQuery } from "@/types";

const numbers = new Intl.NumberFormat("en-GB");

export function AdminVacanciesScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { notice, succeed } = useAction();
  const query = useMemo(() => parseAdminQuery(Object.fromEntries(searchParams)), [searchParams]);
  const key = adminApiSearch(query, ADMIN_PAGE_SIZE);
  const { state, reload } = useLoad(key, async (signal) => {
    const result = await listAdminVacancies(query, ADMIN_PAGE_SIZE, signal);
    return { result, now: Date.now() };
  });
  const pendingCount = useLoad("pending-count", (signal) => countPendingVacancies(signal));
  const ready = state.status === "ready" && !state.refreshing;
  const [headingRef, requestRefocus] = useRefocus(ready);

  const companyIds = [
    ...(state.status === "ready" ? state.data.result.items.map((vacancy) => vacancy.company) : []),
    ...(query.companyId ? [query.companyId] : []),
  ];
  const companyName = useCompanyNames(companyIds);

  const navigate = (patch: Partial<AdminVacancyQuery>) => {
    startTransition(() =>
      router.push(adminVacanciesHref({ ...query, ...patch, page: undefined }), { scroll: false }),
    );
  };

  const refresh = () => {
    reload();
    pendingCount.reload();
  };

  const [failure, setFailure] = useState<string | null>(null);

  const stale = (message: string) => {
    setFailure(message);
    refresh();
  };

  const done = (message: string) => {
    setFailure(null);
    succeed(message);
    requestRefocus();
    refresh();
  };

  const busy = state.status !== "loading" && state.refreshing;
  const total = state.status === "ready" ? state.data.result.total : null;
  const filtered = hasAdminFilters(query);
  const waiting = pendingCount.state.status === "ready" ? pendingCount.state.data : null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase outline-none"
            >
              Review vacancies
            </h1>
            {waiting !== null ? (
              <p className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-line-amber/60 bg-background px-3.5 transit-label text-[0.85rem]">
                <span aria-hidden className="size-3 rounded-full border-[3px] border-line-amber" />
                <span className="tabular">{numbers.format(waiting)}</span> waiting for review
              </p>
            ) : null}
          </div>
          <StatusLine
            active={query.status === "all" ? undefined : query.status}
            href={(status) => adminVacanciesHref({ ...query, status: status ?? "all", page: undefined })}
          />
          <AdminFilters
            query={query}
            companyLabel={query.companyId ? companyName(query.companyId) : null}
            navigate={navigate}
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-4">
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p aria-live="polite" className="text-[1.05rem] text-muted-foreground">
              {total === null ? (
                state.status === "loading" ? "Loading vacancies" : "Vacancy list unavailable"
              ) : (
                <>
                  <span className="font-display text-[1.6rem] leading-none font-bold text-foreground tabular">
                    {numbers.format(total)}
                  </span>{" "}
                  {total === 1 ? "vacancy" : "vacancies"}
                  {query.status !== "all" ? ` · ${STATUS_LABELS[query.status]}` : null}
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
              <ResultsError body={formError(state.error).message} onRetry={refresh} />
            ) : state.data.result.items.length > 0 ? (
              <>
                <AdminVacancyList
                  vacancies={state.data.result.items}
                  now={state.data.now}
                  companyName={companyName}
                  onDone={done}
                  onStale={stale}
                />
                <Pagination
                  href={(page) => adminVacanciesHref({ ...query, page })}
                  total={state.data.result.total}
                  page={state.data.result.page}
                  take={state.data.result.take}
                />
              </>
            ) : state.data.result.total > 0 ? (
              <PastLastPage href={adminVacanciesHref({ ...query, page: undefined })} />
            ) : query.status === "pending" && !filtered ? (
              <ListMessage
                title="All clear"
                body="No vacancies waiting for review."
                action={
                  <Button asChild size="lg" variant="outline">
                    <Link href={adminVacanciesHref({ status: "all" })}>Show all vacancies</Link>
                  </Button>
                }
              />
            ) : (
              <ListMessage
                title="Nothing on this line"
                body="No vacancies match this status and these filters. Try another status or clear the filters."
                action={
                  <Button asChild size="lg">
                    <Link href={adminVacanciesHref({ status: "all" })}>Show all vacancies</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
