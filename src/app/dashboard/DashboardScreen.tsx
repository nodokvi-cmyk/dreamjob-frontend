"use client";

import { PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import { CompanyStanding } from "@/components/dashboard/CompanyStanding";
import { OwnVacancyList } from "@/components/dashboard/OwnVacancyList";
import { StatusLine } from "@/components/dashboard/StatusLine";
import { useLoad } from "@/components/dashboard/useLoad";
import { GateSpinner } from "@/components/guards/GateStates";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { ListMessage, PastLastPage, ResultsError, VacancyListSkeleton } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import { useDraft } from "@/components/vacancies/useDraft";
import { useAuth } from "@/context/AuthContext";
import { formError } from "@/lib/errors";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/vacancy";
import {
  PAGE_SIZE,
  QUERY_MAX,
  dashboardHref,
  ownApiSearch,
  parseOwnVacancyQuery,
} from "@/lib/vacancyQuery";
import { listMyVacancies } from "@/services/vacancies.service";
import type { CurrentCompany, OwnVacancyQuery } from "@/types";

export function DashboardScreen() {
  const { session } = useAuth();
  if (!session || session.accountRole !== "company") return <GateSpinner />;
  return <Dashboard account={session.account} />;
}

function Dashboard({ account }: { account: CurrentCompany }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { notice, succeed } = useAction();
  const query = useMemo(() => parseOwnVacancyQuery(Object.fromEntries(searchParams)), [searchParams]);
  const key = ownApiSearch(query, PAGE_SIZE);
  const { state, reload } = useLoad(key, async (signal) => {
    const result = await listMyVacancies(query, PAGE_SIZE, signal);
    return { result, now: Date.now() };
  });

  const navigate = (next: OwnVacancyQuery) => {
    startTransition(() => router.push(dashboardHref(next), { scroll: false }));
  };

  const search = useDraft(query.q ?? "", (value) => navigate({ status: query.status, q: value || undefined }));
  const filtered = query.q !== undefined || query.status !== undefined;
  const approved = account.approved;
  const busy = state.status !== "loading" && state.refreshing;
  const total = state.status === "ready" ? state.data.result.total : null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              Your vacancies
            </h1>
            <PostButton approved={approved} className="w-full sm:w-auto" />
          </div>
          <CompanyStanding account={account} />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <StatusLine
              active={query.status}
              href={(status) => dashboardHref({ q: query.q, status })}
            />
            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                const value = search.draft.trim();
                search.markSent(value);
                navigate({ status: query.status, q: value || undefined });
              }}
              className="flex h-12 w-full items-center gap-3 rounded-xl border-2 border-foreground bg-card px-3 lg:max-w-sm"
            >
              <SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
              <label htmlFor="dashboard-search" className="sr-only">
                Search your vacancies
              </label>
              <input
                id="dashboard-search"
                type="search"
                value={search.draft}
                onChange={(event) => search.setDraft(event.target.value)}
                maxLength={QUERY_MAX}
                placeholder="Search by title or description"
                autoComplete="off"
                className="h-full w-full min-w-0 bg-transparent text-[1.05rem] outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
              />
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-4">
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p aria-live="polite" className="text-[1.05rem] text-muted-foreground">
              {total === null ? (
                state.status === "loading" ? "Loading your vacancies" : "Vacancy list unavailable"
              ) : (
                <>
                  <span className="font-display text-[1.6rem] leading-none font-bold text-foreground tabular">
                    {new Intl.NumberFormat("en-GB").format(total)}
                  </span>{" "}
                  {total === 1 ? "vacancy" : "vacancies"}
                  {query.status ? ` · ${STATUS_LABELS[query.status]}` : null}
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
            ) : state.data.result.items.length > 0 ? (
              <>
                <OwnVacancyList
                  vacancies={state.data.result.items}
                  now={state.data.now}
                  approved={approved}
                  onClosed={(vacancy) => {
                    succeed(`“${vacancy.title}” is closed.`);
                    reload();
                  }}
                  onDeleted={(vacancy) => {
                    succeed(`“${vacancy.title}” is deleted.`);
                    reload();
                  }}
                />
                <Pagination
                  href={(page) => dashboardHref({ ...query, page })}
                  total={state.data.result.total}
                  page={state.data.result.page}
                  take={state.data.result.take}
                />
              </>
            ) : state.data.result.total > 0 ? (
              <PastLastPage href={dashboardHref({ ...query, page: undefined })} />
            ) : filtered ? (
              <ListMessage
                title="Nothing on this line"
                body="None of your vacancies match this status or search. Try another status, or clear the search."
                action={
                  <Button asChild size="lg">
                    <Link href={routes.dashboard}>Show all vacancies</Link>
                  </Button>
                }
              />
            ) : (
              <ListMessage
                title="No vacancies yet"
                body={
                  approved
                    ? "Post your first vacancy. Our team reviews it, then it goes live for seekers across Georgia."
                    : "Once our team approves your company, you can post your first vacancy here."
                }
                action={<PostButton approved={approved} label="Post your first vacancy" size="lg" />}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostButton({
  approved,
  label = "Post a vacancy",
  size = "default",
  className,
}: {
  approved: boolean;
  label?: string;
  size?: "default" | "lg";
  className?: string;
}) {
  if (!approved) {
    return (
      <Button size={size} disabled className={className} title="Posting is paused until your company is approved">
        <PlusIcon aria-hidden />
        {label}
      </Button>
    );
  }
  return (
    <Button asChild size={size} className={className}>
      <Link href={routes.newVacancy}>
        <PlusIcon aria-hidden />
        {label}
      </Link>
    </Button>
  );
}
