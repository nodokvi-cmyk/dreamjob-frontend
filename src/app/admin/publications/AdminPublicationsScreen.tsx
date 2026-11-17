"use client";

import { XIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminPublicationList } from "@/components/admin/AdminPublicationList";
import { StaleAlert } from "@/components/admin/StaleAlert";
import { useRefocus } from "@/components/admin/useRefocus";
import { StatusLine } from "@/components/dashboard/StatusLine";
import { useLoad } from "@/components/dashboard/useLoad";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { ListMessage, PastLastPage, ResultsError, VacancyListSkeleton } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import { formError } from "@/lib/errors";
import {
  ADMIN_PUBLICATIONS_PAGE_SIZE,
  PUBLICATION_SORTS,
  PUBLICATION_STATUSES,
  adminPublicationsHref,
  parseAdminPublicationsQuery,
  shortUserId,
} from "@/lib/publications";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/vacancy";
import { countPendingPublications, listAdminPublications } from "@/services/publications.service";
import type { PublicationSort } from "@/types";

const numbers = new Intl.NumberFormat("en-GB");

const SORT_LABELS: Record<PublicationSort, string> = { "-date": "Newest first", date: "Oldest first" };

export function AdminPublicationsScreen() {
  const searchParams = useSearchParams();
  const { notice, succeed } = useAction();
  const query = useMemo(() => parseAdminPublicationsQuery(Object.fromEntries(searchParams)), [searchParams]);
  const { state, reload } = useLoad(adminPublicationsHref(query), async (signal) =>
    listAdminPublications(query, ADMIN_PUBLICATIONS_PAGE_SIZE, signal),
  );
  const pendingCount = useLoad("pending-publications", (signal) => countPendingPublications(signal));
  const ready = state.status === "ready" && !state.refreshing;
  const [headingRef, requestRefocus] = useRefocus(ready);
  const [failure, setFailure] = useState<string | null>(null);

  const refresh = () => {
    reload();
    pendingCount.reload();
  };

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
  const total = state.status === "ready" ? state.data.total : null;
  const waiting = pendingCount.state.status === "ready" ? pendingCount.state.data : null;
  const activeSort: PublicationSort = query.sort ?? "-date";

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
              Review publications
            </h1>
            {waiting !== null ? (
              <p className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-line-amber/60 bg-background px-3.5 transit-label text-[0.85rem]">
                <span aria-hidden className="size-3 rounded-full border-[3px] border-line-amber" />
                <span className="tabular">{numbers.format(waiting)}</span> waiting for review
              </p>
            ) : null}
          </div>
          <StatusLine
            statuses={PUBLICATION_STATUSES}
            active={query.status === "all" ? undefined : query.status}
            href={(status) => adminPublicationsHref({ ...query, status: status ?? "all", page: 1 })}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <nav aria-label="Sort" className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
              {PUBLICATION_SORTS.map((sort) => (
                <Link
                  key={sort}
                  href={adminPublicationsHref({ ...query, sort, page: 1 })}
                  scroll={false}
                  aria-current={activeSort === sort ? "page" : undefined}
                  className={cn(
                    "flex h-8 items-center rounded-full px-3 transit-label text-[0.8rem] transition-colors",
                    activeSort === sort ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {SORT_LABELS[sort]}
                </Link>
              ))}
            </nav>
            {query.userId ? (
              <Link
                href={adminPublicationsHref({ ...query, userId: undefined, page: 1 })}
                scroll={false}
                className="inline-flex h-9 max-w-full items-center gap-1.5 rounded-full border border-foreground/20 bg-card pr-2 pl-3.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/45 hover:bg-muted"
              >
                <span className="truncate">{shortUserId(query.userId)}</span>
                <XIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                <span className="sr-only">Remove user filter</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-4">
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p aria-live="polite" className="text-[1.05rem] text-muted-foreground">
              {total === null ? (
                state.status === "loading" ? "Loading publications" : "Publication list unavailable"
              ) : (
                <>
                  <span className="font-display text-[1.6rem] leading-none font-bold text-foreground tabular">
                    {numbers.format(total)}
                  </span>{" "}
                  {total === 1 ? "publication" : "publications"}
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
            ) : state.data.items.length > 0 ? (
              <>
                <AdminPublicationList
                  publications={state.data.items}
                  filteredUser={query.userId}
                  onDone={done}
                  onStale={stale}
                />
                <Pagination
                  href={(page) => adminPublicationsHref({ ...query, page })}
                  total={state.data.total}
                  page={state.data.page}
                  take={state.data.take}
                />
              </>
            ) : state.data.total > 0 ? (
              <PastLastPage href={adminPublicationsHref({ ...query, page: 1 })} />
            ) : query.status === "pending" && !query.userId ? (
              <ListMessage
                title="All clear"
                body="No publications waiting for review."
                action={
                  <Button asChild size="lg" variant="outline">
                    <Link href={adminPublicationsHref({ status: "all" })}>Show all publications</Link>
                  </Button>
                }
              />
            ) : (
              <ListMessage
                title="Nothing on this line"
                body={
                  query.userId
                    ? "This user has no publications with this status."
                    : "No publications have this status. Try another one."
                }
                action={
                  <Button asChild size="lg">
                    <Link href={adminPublicationsHref({ status: "all", userId: query.userId })}>Show all statuses</Link>
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
