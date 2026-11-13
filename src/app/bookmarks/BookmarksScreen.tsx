"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLoad } from "@/components/dashboard/useLoad";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { Button } from "@/components/ui/button";
import { ListMessage, PastLastPage, ResultsError, VacancyListSkeleton } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import { VacancyList } from "@/components/vacancies/VacancyList";
import { ViewerMarksProvider } from "@/components/vacancies/ViewerMarks";
import { BOOKMARKS_PAGE_SIZE, bookmarksHref, parseBookmarksPage } from "@/lib/applicationQuery";
import { formError } from "@/lib/errors";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { listBookmarks } from "@/services/bookmarks.service";

export function BookmarksScreen() {
  const searchParams = useSearchParams();
  const page = parseBookmarksPage(Object.fromEntries(searchParams));
  const { notice, succeed } = useAction();
  const { state, reload } = useLoad(bookmarksHref(page), async (signal) => {
    const result = await listBookmarks(page, BOOKMARKS_PAGE_SIZE, signal);
    return { result, now: Date.now() };
  });
  const busy = state.status !== "loading" && state.refreshing;
  const total = state.status === "ready" ? state.data.result.total : null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 pt-10 pb-8 sm:px-6 md:pt-12 lg:px-8">
          <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
            Bookmarks
          </h1>
          <p className="max-w-[60ch] text-lg text-muted-foreground">
            Vacancies you saved, newest first. Closed and expired ones stay until you remove them.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-4">
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p aria-live="polite" className="text-[1.05rem] text-muted-foreground">
              {total === null ? (
                state.status === "loading" ? "Loading your bookmarks" : "Bookmarks unavailable"
              ) : (
                <>
                  <span className="font-display text-[1.6rem] leading-none font-bold text-foreground tabular">
                    {new Intl.NumberFormat("en-GB").format(total)}
                  </span>{" "}
                  saved {total === 1 ? "vacancy" : "vacancies"}
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
              <ViewerMarksProvider source={{ kind: "none" }}>
                <VacancyList
                  vacancies={state.data.result.items.map((bookmark) => bookmark.vacancy)}
                  now={state.data.now}
                  onBookmarkChange={(_, bookmarked) => {
                    if (bookmarked) return;
                    succeed("Removed from your bookmarks.");
                    reload();
                  }}
                />
                <Pagination
                  href={bookmarksHref}
                  total={state.data.result.total}
                  page={state.data.result.page}
                  take={state.data.result.take}
                />
              </ViewerMarksProvider>
            ) : state.data.result.total > 0 ? (
              <PastLastPage href={bookmarksHref(1)} />
            ) : (
              <ListMessage
                title="No bookmarks yet"
                body="Tap the heart on any vacancy to save it here for later."
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
