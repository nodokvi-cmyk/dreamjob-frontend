"use client";

import { ArrowLeftIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ApplicantRow, applicantRowId } from "@/components/applications/ApplicantRow";
import { ApplicationStatusLine } from "@/components/applications/ApplicationStatusLine";
import { StaleAlert } from "@/components/admin/StaleAlert";
import { useLoad } from "@/components/dashboard/useLoad";
import { GateSpinner } from "@/components/guards/GateStates";
import { ResultCount } from "@/components/layout/ResultCount";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ListMessage, PastLastPage, ResultsError } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import { useDraft } from "@/components/vacancies/useDraft";
import { useAuth } from "@/context/AuthContext";
import { APPLICANTS_PAGE_SIZE, APPLICANT_SORT_LABELS, applicantsHref, parseApplicantsQuery } from "@/lib/applicantQuery";
import { APPLICANT_SORTS, APPLICATION_STATUS_LABELS } from "@/lib/applications";
import { formError } from "@/lib/errors";
import { ownVacancyHref, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { QUERY_MAX } from "@/lib/vacancyQuery";
import { ApiError } from "@/services/api";
import { listApplicants } from "@/services/applications.service";
import { getOwnVacancy } from "@/services/vacancies.service";
import type { ApplicantItem, ApplicantsQuery, ApplicationStatus } from "@/types";

const NOT_APPROVED = "Your company must be approved to manage applications";

export function ApplicantsScreen({ id }: { id: string }) {
  const { session } = useAuth();
  if (!session || session.accountRole !== "company") return <GateSpinner />;
  return <Applicants id={id} accountId={session.accountId} />;
}

function Applicants({ id, accountId }: { id: string; accountId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const query = useMemo(() => parseApplicantsQuery(Object.fromEntries(searchParams)), [searchParams]);
  const key = applicantsHref(id, query);
  const vacancy = useLoad(`${accountId}:${id}`, (signal) => getOwnVacancy(id, accountId, signal));
  const { state, reload } = useLoad(key, (signal) => listApplicants(id, query, APPLICANTS_PAGE_SIZE, signal));
  const [changed, setChanged] = useState<{ key: string; statuses: ReadonlyMap<string, ApplicationStatus> }>({
    key,
    statuses: new Map(),
  });
  const [stale, setStale] = useState<string | null>(null);
  const scrolled = useRef<string | null>(null);

  const navigate = (next: ApplicantsQuery) => {
    startTransition(() => router.push(applicantsHref(id, next), { scroll: false }));
  };
  const search = useDraft(query.q ?? "", (value) =>
    navigate({ ...query, q: value || undefined, page: undefined, focus: undefined }),
  );

  const statuses = changed.key === key ? changed.statuses : null;
  const items: ApplicantItem[] =
    state.status === "ready"
      ? state.data.items.map((item) => {
          const status = statuses?.get(item.id);
          return status ? { ...item, status } : item;
        })
      : [];

  useEffect(() => {
    if (state.status !== "ready" || !query.focus || scrolled.current === key) return;
    scrolled.current = key;
    const row = document.getElementById(applicantRowId(query.focus));
    if (!row) return;
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    row.focus({ preventScroll: true });
  }, [state.status, query.focus, key]);

  const title = vacancy.state.status === "ready" ? vacancy.state.data.title : null;
  const filtered = query.q !== undefined || query.status !== undefined;
  const busy = state.status !== "loading" && state.refreshing;
  const total = state.status === "ready" ? state.data.total : null;
  const sort = query.sort ?? "-date";
  const pageQuery = { ...query, focus: undefined };

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 pb-6 sm:px-6 md:pt-8 lg:px-8">
          <Link
            href={ownVacancyHref(id)}
            className="inline-flex w-fit items-center gap-2 rounded-md transit-label text-[0.85rem] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon aria-hidden className="size-4" />
            Back to vacancy
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[clamp(2.25rem,5.5vw,3.5rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              Applicants
            </h1>
            {title ? <p className="text-lg break-words text-muted-foreground">{title}</p> : null}
          </div>
          <div className="flex flex-col gap-4">
            <ApplicationStatusLine
              active={query.status}
              href={(status) => applicantsHref(id, { ...query, status, page: undefined, focus: undefined })}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <form
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  const value = search.draft.trim();
                  search.markSent(value);
                  navigate({ ...query, q: value || undefined, page: undefined, focus: undefined });
                }}
                className="flex h-12 w-full items-center gap-3 rounded-xl border-2 border-foreground bg-card px-3 sm:max-w-sm"
              >
                <SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                <label htmlFor="applicants-search" className="sr-only">
                  Search applicants by name
                </label>
                <input
                  id="applicants-search"
                  type="search"
                  value={search.draft}
                  onChange={(event) => search.setDraft(event.target.value)}
                  maxLength={QUERY_MAX}
                  placeholder="Search by first or last name"
                  autoComplete="off"
                  className="h-full w-full min-w-0 bg-transparent text-[1.05rem] outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
                />
              </form>
              <div className="flex items-center gap-2">
                <label htmlFor="applicants-sort" className="text-sm text-muted-foreground">
                  Sort
                </label>
                <Select
                  value={sort}
                  onValueChange={(value) => {
                    const next = APPLICANT_SORTS.find((option) => option === value);
                    if (next) navigate({ ...query, sort: next, page: undefined, focus: undefined });
                  }}
                >
                  <SelectTrigger id="applicants-sort" className="h-11 w-52">
                    <SelectValue>{APPLICANT_SORT_LABELS[sort]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {APPLICANT_SORTS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {APPLICANT_SORT_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-4xl flex-col gap-4">
          <p aria-live="polite" className="min-h-9 text-[1.05rem] text-muted-foreground">
            {total === null ? (
              state.status === "loading" ? "Loading applicants" : null
            ) : (
              <ResultCount
                total={total}
                singular="applicant"
                plural="applicants"
                filter={query.status ? APPLICATION_STATUS_LABELS[query.status] : undefined}
              />
            )}
          </p>
          <StaleAlert message={stale} />

          <div
            aria-busy={state.status === "loading" || busy}
            className={cn(
              "flex flex-col gap-6 transition-opacity duration-200",
              busy && "pointer-events-none opacity-55 motion-safe:delay-150",
            )}
          >
            {state.status === "loading" ? (
              <ApplicantSkeleton />
            ) : state.status === "failed" ? (
              <LoadProblem error={state.error} onRetry={reload} />
            ) : items.length > 0 ? (
              <>
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <li key={item.id}>
                      <ApplicantRow
                        item={item}
                        focused={item.id === query.focus}
                        onStatusChanged={(itemId, status) =>
                          setChanged((current) => {
                            const base = current.key === key ? current.statuses : new Map<string, ApplicationStatus>();
                            return { key, statuses: new Map(base).set(itemId, status) };
                          })
                        }
                        onStale={(message) => {
                          setStale(message);
                          reload();
                        }}
                      />
                    </li>
                  ))}
                </ul>
                <Pagination
                  href={(page) => applicantsHref(id, { ...pageQuery, page })}
                  total={state.data.total}
                  page={state.data.page}
                  take={state.data.take}
                />
              </>
            ) : state.data.total > 0 ? (
              <PastLastPage href={applicantsHref(id, { ...pageQuery, page: undefined })} />
            ) : filtered ? (
              <ListMessage
                title="Nothing on this line"
                body="No applicants match this status or name. Withdrawn and deleted-user rows never match a name search."
                action={
                  <Button asChild size="lg">
                    <Link href={applicantsHref(id, {})}>Show all applicants</Link>
                  </Button>
                }
              />
            ) : (
              <ListMessage
                title="No applicants yet"
                body="When job seekers apply to this vacancy, they show up here."
                action={
                  <Button asChild size="lg" variant="outline">
                    <Link href={ownVacancyHref(id)}>Back to vacancy</Link>
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

function LoadProblem({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  if (error instanceof ApiError && error.status === 403 && error.message === NOT_APPROVED) {
    return (
      <ListMessage
        title="Waiting for admin approval"
        body="Your company must be approved to manage applications. The applications are kept and show here again once our team approves your company."
        action={
          <Button asChild size="lg">
            <Link href={routes.dashboard}>Back to dashboard</Link>
          </Button>
        }
      />
    );
  }
  if (error instanceof ApiError && (error.status === 404 || error.status === 403 || error.status === 400)) {
    return (
      <ListMessage
        broken
        title="Vacancy not found"
        body="It may have been deleted, or it belongs to another account."
        action={
          <Button asChild size="lg">
            <Link href={routes.dashboard}>Back to dashboard</Link>
          </Button>
        }
      />
    );
  }
  return <ResultsError title="Applicants didn't load" body={formError(error).message} onRetry={onRetry} />;
}

function ApplicantSkeleton() {
  return (
    <div role="status" aria-label="Loading applicants" className="flex flex-col gap-3">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex flex-col gap-4 rounded-xl border border-border px-4 py-5 sm:px-5">
          <div className="flex gap-4">
            <Skeleton className="size-12 rounded-[10px]" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-6 w-56 max-w-full" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
          </div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
}
