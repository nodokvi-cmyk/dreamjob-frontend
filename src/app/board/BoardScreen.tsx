"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition, type ReactNode } from "react";
import { BoardCard, BoardSkeleton } from "@/components/board/BoardCard";
import { BoardFilters } from "@/components/board/BoardFilters";
import { CompanyStanding } from "@/components/dashboard/CompanyStanding";
import { useLoad } from "@/components/dashboard/useLoad";
import { GateSpinner } from "@/components/guards/GateStates";
import { Button } from "@/components/ui/button";
import { ListMessage, PastLastPage, ResultsError } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import { useAuth } from "@/context/AuthContext";
import { BOARD_PAGE_SIZE, NOT_APPROVED, boardApiSearch, boardHref, hasBoardFilters, parseBoardQuery } from "@/lib/board";
import { formError } from "@/lib/errors";
import { adminPublicationHref, publicationHref, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { listBoard } from "@/services/publications.service";
import type { BoardQuery, CurrentCompany } from "@/types";

const numbers = new Intl.NumberFormat("en-GB");

export function BoardScreen() {
  const { session } = useAuth();
  if (!session) return <GateSpinner />;
  if (session.accountRole === "company" && !session.account.approved) {
    return <BoardLocked account={session.account} />;
  }
  return <Board admin={session.accountRole === "admin"} />;
}

function BoardHeader({ children }: { children?: ReactNode }) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
            Job seekers
          </h1>
          <p className="max-w-[62ch] text-lg text-muted-foreground">
            Publications from people looking for work, reviewed by our team. Contact details stay private until a
            job seeker accepts your invitation.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

function BoardLocked({ account }: { account: CurrentCompany }) {
  return (
    <div className="flex flex-1 flex-col">
      <BoardHeader />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div className="max-w-5xl">
          {account.isProfileComplete ? (
            <WaitingForApproval />
          ) : (
            <CompanyStanding account={account} />
          )}
        </div>
      </div>
    </div>
  );
}

function WaitingForApproval() {
  return (
    <ListMessage
      title="Waiting for admin approval"
      body="Approved companies can browse job seekers' publications and invite them. Our team reviews your company soon."
      action={
        <Button asChild size="lg" variant="outline">
          <Link href={routes.dashboard}>Back to dashboard</Link>
        </Button>
      }
    />
  );
}

function Board({ admin }: { admin: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const query = useMemo(() => parseBoardQuery(Object.fromEntries(searchParams)), [searchParams]);
  const { state, reload } = useLoad(boardApiSearch(query, BOARD_PAGE_SIZE), (signal) =>
    listBoard(query, BOARD_PAGE_SIZE, signal),
  );

  const navigate = (patch: Partial<BoardQuery>) => {
    startTransition(() => router.push(boardHref({ ...query, ...patch, page: 1 }), { scroll: false }));
  };

  const busy = state.status !== "loading" && state.refreshing;
  const total = state.status === "ready" ? state.data.total : null;
  const locked = state.status === "failed" && state.error instanceof ApiError && state.error.status === 403 && state.error.message === NOT_APPROVED;

  return (
    <div className="flex flex-1 flex-col">
      <BoardHeader>
        <BoardFilters query={query} navigate={navigate} />
      </BoardHeader>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-4">
          <p aria-live="polite" className="min-h-9 text-[1.05rem] text-muted-foreground">
            {total === null ? (
              state.status === "loading" ? "Loading publications" : null
            ) : (
              <>
                <span className="font-display text-[1.6rem] leading-none font-bold text-foreground tabular">
                  {numbers.format(total)}
                </span>{" "}
                {total === 1 ? "publication" : "publications"}
                {query.q && !query.sort ? " · best match first" : null}
              </>
            )}
          </p>

          <div
            aria-busy={state.status === "loading" || busy}
            className={cn(
              "flex flex-col gap-6 transition-opacity duration-200",
              busy && "pointer-events-none opacity-55 motion-safe:delay-150",
            )}
          >
            {state.status === "loading" ? (
              <BoardSkeleton />
            ) : locked ? (
              <WaitingForApproval />
            ) : state.status === "failed" ? (
              <ResultsError body={formError(state.error).message} onRetry={reload} />
            ) : state.data.items.length > 0 ? (
              <>
                <div className="flex flex-col gap-4">
                  {state.data.items.map((publication) => (
                    <BoardCard
                      key={publication.id}
                      publication={publication}
                      href={admin ? adminPublicationHref(publication.id) : publicationHref(publication.id)}
                    />
                  ))}
                </div>
                <Pagination
                  href={(page) => boardHref({ ...query, page })}
                  total={state.data.total}
                  page={state.data.page}
                  take={state.data.take}
                />
              </>
            ) : state.data.total > 0 ? (
              <PastLastPage href={boardHref({ ...query, page: 1 })} />
            ) : hasBoardFilters(query) ? (
              <ListMessage
                title="No matches"
                body="No publications match these filters. Try fewer words or clear the filters."
                action={
                  <Button asChild size="lg">
                    <Link href={boardHref({ page: 1 })}>Clear filters</Link>
                  </Button>
                }
              />
            ) : (
              <ListMessage
                title="No publications yet"
                body="When job seekers publish what they are looking for and our team approves it, it shows up here."
                action={
                  <Button asChild size="lg" variant="outline">
                    <Link href={admin ? routes.adminPublications : routes.dashboard}>
                      {admin ? "Review publications" : "Back to dashboard"}
                    </Link>
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
