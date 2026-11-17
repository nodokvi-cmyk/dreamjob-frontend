"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { StatusLine } from "@/components/dashboard/StatusLine";
import { useLoad } from "@/components/dashboard/useLoad";
import { MyPublicationRow } from "@/components/publications/MyPublicationRow";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListMessage, PastLastPage, ResultsError } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import { useAuth } from "@/context/AuthContext";
import { formError, isUserGone } from "@/lib/errors";
import {
  CONTACT_NOTE,
  LIMIT_REACHED,
  MAX_ACTIVE_PUBLICATIONS,
  MY_PUBLICATIONS_PAGE_SIZE,
  PUBLICATION_STATUSES,
  myPublicationsHref,
  parseMyPublicationsQuery,
} from "@/lib/publications";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { countActivePublications, listMyPublications } from "@/services/publications.service";

export function MyPublicationsScreen() {
  const searchParams = useSearchParams();
  const { signOut } = useAuth();
  const query = parseMyPublicationsQuery(Object.fromEntries(searchParams));
  const { state, reload } = useLoad(myPublicationsHref(query), async (signal) => {
    const [result, active] = await Promise.all([
      listMyPublications(query, MY_PUBLICATIONS_PAGE_SIZE, signal),
      countActivePublications(signal),
    ]);
    return { result, active };
  });
  const busy = state.status !== "loading" && state.refreshing;
  const active = state.status === "ready" ? state.data.active : null;
  const full = active !== null && active >= MAX_ACTIVE_PUBLICATIONS;
  const gone = state.status === "failed" && isUserGone(state.error);

  useEffect(() => {
    if (gone) signOut();
  }, [gone, signOut]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pt-10 pb-8 sm:px-6 md:pt-12 lg:px-8">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              My publications
            </h1>
            <p className="max-w-[62ch] text-lg text-muted-foreground">
              Tell approved companies what job you are looking for. Our team reviews each publication before
              companies see it. {CONTACT_NOTE}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {full ? (
              <Button size="lg" disabled aria-describedby="publication-limit">
                <PlusIcon aria-hidden />
                New publication
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href={routes.newPublication}>
                  <PlusIcon aria-hidden />
                  New publication
                </Link>
              </Button>
            )}
            <div aria-live="polite" className="text-[1.05rem] text-muted-foreground">
              {active === null ? (
                state.status === "loading" ? (
                  <Skeleton className="h-6 w-28" />
                ) : null
              ) : (
                <>
                  <span className="font-display text-[1.6rem] leading-none font-bold text-foreground tabular">
                    {active}
                  </span>{" "}
                  of {MAX_ACTIVE_PUBLICATIONS} active
                </>
              )}
            </div>
            <Link href={routes.invitations} className="font-medium text-cobalt-ink underline-offset-4 hover:underline">
              Invitations from companies
            </Link>
          </div>
          {full ? (
            <p id="publication-limit" className="max-w-[62ch] text-[0.95rem] text-muted-foreground">
              {LIMIT_REACHED} Closed and expired publications don&apos;t count.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-6">
          <StatusLine
            statuses={PUBLICATION_STATUSES}
            active={query.status}
            href={(status) => myPublicationsHref({ status, page: 1 })}
          />
          <div
            aria-busy={state.status === "loading" || busy}
            className={cn(
              "flex flex-col gap-6 transition-opacity duration-200",
              busy && "pointer-events-none opacity-55 motion-safe:delay-150",
            )}
          >
            {state.status === "loading" ? (
              <RowsSkeleton />
            ) : state.status === "failed" ? (
              <ResultsError body={formError(state.error).message} onRetry={reload} />
            ) : state.data.result.items.length > 0 ? (
              <>
                <div className="flex flex-col">
                  {state.data.result.items.map((publication) => (
                    <MyPublicationRow key={publication.id} publication={publication} />
                  ))}
                </div>
                <Pagination
                  href={(page) => myPublicationsHref({ ...query, page })}
                  total={state.data.result.total}
                  page={state.data.result.page}
                  take={state.data.result.take}
                />
              </>
            ) : state.data.result.total > 0 ? (
              <PastLastPage href={myPublicationsHref({ ...query, page: 1 })} />
            ) : query.status ? (
              <ListMessage
                title="Nothing on this line"
                body="None of your publications has this status."
                action={
                  <Button asChild variant="outline" size="lg">
                    <Link href={routes.publications}>Show all</Link>
                  </Button>
                }
              />
            ) : (
              <ListMessage
                title="No publications yet"
                body="Write what job you are looking for. Approved companies browse publications and can invite you to apply."
                action={
                  <Button asChild size="lg">
                    <Link href={routes.newPublication}>New publication</Link>
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

function RowsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex flex-col gap-3 border-b border-border px-1 pt-4 pb-5 sm:px-2">
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-6 w-[min(24rem,80%)]" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-[min(18rem,70%)]" />
        </div>
      ))}
    </div>
  );
}
