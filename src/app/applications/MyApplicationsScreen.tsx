"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import { ApplicationStatusLine } from "@/components/applications/ApplicationStatusLine";
import { MyApplicationRow } from "@/components/applications/MyApplicationRow";
import { useLoad } from "@/components/dashboard/useLoad";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { ListMessage, PastLastPage, ResultsError, VacancyListSkeleton } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import { useDraft } from "@/components/vacancies/useDraft";
import { MY_APPLICATIONS_PAGE_SIZE, myApplicationsHref, parseMyApplicationsQuery } from "@/lib/applicationQuery";
import { APPLICATION_STATUS_LABELS } from "@/lib/applications";
import { formError } from "@/lib/errors";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { QUERY_MAX } from "@/lib/vacancyQuery";
import { listMyApplications } from "@/services/applications.service";
import type { MyApplicationSort, MyApplicationsQuery } from "@/types";

const SORT_LABELS: Record<MyApplicationSort, string> = { "-date": "Newest first", date: "Oldest first" };

export function MyApplicationsScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { notice, succeed } = useAction();
  const query = useMemo(() => parseMyApplicationsQuery(Object.fromEntries(searchParams)), [searchParams]);
  const key = myApplicationsHref(query);
  const { state, reload } = useLoad(key, (signal) => listMyApplications(query, MY_APPLICATIONS_PAGE_SIZE, signal));

  const navigate = (next: MyApplicationsQuery) => {
    startTransition(() => router.push(myApplicationsHref(next), { scroll: false }));
  };
  const search = useDraft(query.q ?? "", (value) => navigate({ ...query, q: value || undefined, page: undefined }));
  const filtered = query.q !== undefined || query.status !== undefined;
  const busy = state.status !== "loading" && state.refreshing;
  const total = state.status === "ready" ? state.data.total : null;
  const sort = query.sort ?? "-date";

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
          <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
            My applications
          </h1>
          <div className="flex flex-col gap-4">
            <ApplicationStatusLine active={query.status} href={(status) => myApplicationsHref({ ...query, status, page: undefined })} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <form
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  const value = search.draft.trim();
                  search.markSent(value);
                  navigate({ ...query, q: value || undefined, page: undefined });
                }}
                className="flex h-12 w-full items-center gap-3 rounded-xl border-2 border-foreground bg-card px-3 sm:max-w-sm"
              >
                <SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                <label htmlFor="applications-search" className="sr-only">
                  Search by vacancy title
                </label>
                <input
                  id="applications-search"
                  type="search"
                  value={search.draft}
                  onChange={(event) => search.setDraft(event.target.value)}
                  maxLength={QUERY_MAX}
                  placeholder="Search by vacancy title"
                  autoComplete="off"
                  className="h-full w-full min-w-0 bg-transparent text-[1.05rem] outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
                />
              </form>
              <div role="group" aria-label="Sort" className="flex w-fit rounded-lg border border-border p-1">
                {(["-date", "date"] as const).map((value) => (
                  <Link
                    key={value}
                    href={myApplicationsHref({ ...query, sort: value, page: undefined })}
                    scroll={false}
                    aria-current={sort === value ? "true" : undefined}
                    className={cn(
                      "flex h-8 items-center rounded-md px-3 transit-label text-[0.8rem] transition-colors",
                      sort === value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {SORT_LABELS[value]}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-4xl flex-col gap-4">
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p aria-live="polite" className="text-[1.05rem] text-muted-foreground">
              {total === null ? (
                state.status === "loading" ? "Loading your applications" : "Application list unavailable"
              ) : (
                <>
                  <span className="font-display text-[1.6rem] leading-none font-bold text-foreground tabular">
                    {new Intl.NumberFormat("en-GB").format(total)}
                  </span>{" "}
                  {total === 1 ? "application" : "applications"}
                  {query.status ? ` · ${APPLICATION_STATUS_LABELS[query.status]}` : null}
                </>
              )}
            </p>
            <Notice message={notice} />
          </div>

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
              <ResultsError body={formError(state.error).message} onRetry={reload} />
            ) : state.data.items.length > 0 ? (
              <>
                <ul className="flex flex-col gap-3">
                  {state.data.items.map((application) => (
                    <li key={application.id}>
                      <MyApplicationRow
                        application={application}
                        onWithdrawn={(item) => {
                          succeed(`Your application for “${item.vacancy.title}” is withdrawn.`);
                          reload();
                        }}
                      />
                    </li>
                  ))}
                </ul>
                <Pagination
                  href={(page) => myApplicationsHref({ ...query, page })}
                  total={state.data.total}
                  page={state.data.page}
                  take={state.data.take}
                />
              </>
            ) : state.data.total > 0 ? (
              <PastLastPage href={myApplicationsHref({ ...query, page: undefined })} />
            ) : filtered ? (
              <ListMessage
                title="Nothing on this line"
                body="None of your applications match this status or search."
                action={
                  <Button asChild size="lg">
                    <Link href={routes.myApplications}>Show all applications</Link>
                  </Button>
                }
              />
            ) : (
              <ListMessage
                title="No applications yet"
                body="When you apply to a vacancy, it shows up here with its status."
                action={
                  <Button asChild size="lg">
                    <Link href={routes.vacancies}>Browse vacancies</Link>
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
