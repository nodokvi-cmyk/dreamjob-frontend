"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { UserList } from "@/components/admin/UserList";
import { useRefocus } from "@/components/admin/useRefocus";
import { useLoad } from "@/components/dashboard/useLoad";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { Skeleton } from "@/components/ui/skeleton";
import { ListMessage, PastLastPage, ResultsError } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import { useAuth } from "@/context/AuthContext";
import { USER_PAGE_SIZE, parseCompanyPage, usersHref } from "@/lib/adminQuery";
import { formError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { listUsers } from "@/services/admin.service";

const numbers = new Intl.NumberFormat("en-GB");

export function AdminUsersScreen() {
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const page = useMemo(() => parseCompanyPage(Object.fromEntries(searchParams)) ?? 1, [searchParams]);
  const { state, reload } = useLoad(`users:${page}`, (signal) => listUsers(page, USER_PAGE_SIZE, signal));
  const { notice, succeed } = useAction();
  const ready = state.status === "ready" && !state.refreshing;
  const [headingRef, requestRefocus] = useRefocus(ready);
  const busy = state.status !== "loading" && state.refreshing;
  const total = state.status === "ready" ? state.data.total : null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase outline-none"
          >
            Users
          </h1>
          <p className="max-w-[62ch] text-[1.05rem] text-muted-foreground">
            Job seekers and admins. Companies have their own tab.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-4">
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p aria-live="polite" className="text-[1.05rem] text-muted-foreground">
              {total === null ? (
                state.status === "loading" ? "Loading users" : "User list unavailable"
              ) : (
                <>
                  <span className="font-display text-[1.6rem] leading-none font-bold text-foreground tabular">
                    {numbers.format(total)}
                  </span>{" "}
                  {total === 1 ? "user" : "users"}
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
              <UserListSkeleton />
            ) : state.status === "failed" ? (
              <ResultsError title="The user list didn't load" body={formError(state.error).message} onRetry={reload} />
            ) : state.data.items.length > 0 ? (
              <>
                <UserList
                  users={state.data.items}
                  selfId={session?.accountId ?? ""}
                  onDeleted={(name) => {
                    succeed(`${name} is deleted.`);
                    requestRefocus();
                    reload();
                  }}
                />
                <Pagination
                  href={(next) => usersHref(next)}
                  total={state.data.total}
                  page={state.data.page}
                  take={state.data.take}
                />
              </>
            ) : state.data.total > 0 ? (
              <PastLastPage href={usersHref(undefined)} />
            ) : (
              <ListMessage title="No users yet" body="Job seekers appear here once they sign up." action={null} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserListSkeleton() {
  return (
    <ul role="status" aria-label="Loading users" className="flex flex-col divide-y divide-border rounded-xl border border-border">
      {[0, 1, 2, 3].map((row) => (
        <li key={row} className="flex items-center gap-4 px-4 py-4 sm:px-5">
          <Skeleton className="size-12 rounded-[10px]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-48 max-w-full" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="hidden h-8 w-20 rounded-md sm:block" />
        </li>
      ))}
    </ul>
  );
}
