import type { Metadata } from "next";
import { connection } from "next/server";
import { FilterBar, SortSelect } from "@/components/vacancies/FilterBar";
import { EmptyResults, PastLastPage, ResultsError } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import { VacancyList } from "@/components/vacancies/VacancyList";
import { SearchResultsRegion, VacancySearchProvider } from "@/components/vacancies/VacancySearch";
import {
  PAGE_SIZE,
  clearedQuery,
  hasFilters,
  parseVacancyQuery,
  vacanciesHref,
} from "@/lib/vacancyQuery";
import { listVacancies } from "@/services/vacancies.service";
import type { Paginated, Vacancy, VacancyQuery } from "@/types";

export const metadata: Metadata = {
  title: "Vacancies",
  description:
    "Search published vacancies across Georgia by keyword, city, category, work mode, contract type and pay.",
};

interface Loaded {
  result: Paginated<Vacancy> | null;
  now: number;
}

async function loadPage(query: VacancyQuery): Promise<Loaded> {
  let result: Paginated<Vacancy> | null = null;
  try {
    result = await listVacancies(query, PAGE_SIZE);
  } catch {
    result = null;
  }
  await connection();
  return { result, now: Date.now() };
}

export default async function VacanciesPage({ searchParams }: PageProps<"/vacancies">) {
  const query = parseVacancyQuery(await searchParams);
  const { result, now } = await loadPage(query);
  const total = result?.total ?? null;

  return (
    <VacancySearchProvider query={query}>
      <div className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
          <div className="flex max-w-5xl flex-col gap-6">
            <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              Vacancies
            </h1>
            <FilterBar query={query} total={total} />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <p aria-live="polite" className="text-[1.05rem] text-muted-foreground">
              {total === null ? (
                "Vacancy list unavailable"
              ) : (
                <>
                  <span className="font-display text-[1.6rem] leading-none font-bold text-foreground tabular">
                    {new Intl.NumberFormat("en-GB").format(total)}
                  </span>{" "}
                  {total === 1 ? "vacancy" : "vacancies"}
                </>
              )}
            </p>
            <SortSelect query={query} />
          </div>

          <SearchResultsRegion className="flex flex-col gap-6">
            {result === null ? (
              <ResultsError />
            ) : result.items.length > 0 ? (
              <>
                <VacancyList vacancies={result.items} now={now} />
                <Pagination query={query} total={result.total} page={result.page} take={result.take} />
              </>
            ) : result.total > 0 ? (
              <PastLastPage href={vacanciesHref({ ...query, page: undefined })} />
            ) : (
              <EmptyResults clearHref={vacanciesHref(clearedQuery(query))} filtered={hasFilters(query)} />
            )}
          </SearchResultsRegion>
        </div>
      </div>
    </VacancySearchProvider>
  );
}
