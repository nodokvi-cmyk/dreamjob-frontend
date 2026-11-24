import { XIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { FilterBar, SortSelect } from "@/components/vacancies/FilterBar";
import { EmptyResults, PastLastPage, ResultsError } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import { PeriodSwitch } from "@/components/vacancies/PeriodSwitch";
import { VacancyList } from "@/components/vacancies/VacancyList";
import { ViewerMarksProvider } from "@/components/vacancies/ViewerMarks";
import { SearchResultsRegion, VacancySearchProvider } from "@/components/vacancies/VacancySearch";
import {
  PAGE_SIZE,
  clearedQuery,
  hasFilters,
  isPastQuery,
  parseVacancyQuery,
  vacanciesHref,
  withoutCompany,
} from "@/lib/vacancyQuery";
import { canonicalFor, openGraphFor } from "@/lib/site";
import { getPublicCompany } from "@/services/publicCompanies.service";
import { listVacancies } from "@/services/publicVacancies.service";
import type { Paginated, VacancyCard, VacancyQuery } from "@/types";

async function isEmptyCompanyList(query: VacancyQuery): Promise<boolean> {
  try {
    const result = await listVacancies(query, PAGE_SIZE);
    return result.total === 0;
  } catch {
    return false;
  }
}

export async function generateMetadata({ searchParams }: PageProps<"/vacancies">): Promise<Metadata> {
  const { page, companyId, period } = parseVacancyQuery(await searchParams);
  const scoped: VacancyQuery = { page, companyId, period };
  const canonical = vacanciesHref(scoped);
  const empty = companyId ? await isEmptyCompanyList(scoped) : false;
  return {
    title: "Vacancies",
    description:
      "Search published vacancies across Georgia by keyword, city, category, work mode, contract type and pay.",
    alternates: canonicalFor(canonical),
    openGraph: openGraphFor(canonical),
    robots: empty ? { index: false, follow: true } : undefined,
  };
}

interface Loaded {
  result: Paginated<VacancyCard> | null;
  now: number;
}

async function loadPage(query: VacancyQuery): Promise<Loaded> {
  let result: Paginated<VacancyCard> | null = null;
  try {
    result = await listVacancies(query, PAGE_SIZE);
  } catch {
    result = null;
  }
  await connection();
  return { result, now: Date.now() };
}

async function loadCompanyName(companyId: string | undefined): Promise<string | null> {
  if (!companyId) return null;
  try {
    const company = await getPublicCompany(companyId);
    return company?.companyName.trim() || "Company";
  } catch {
    return "Company";
  }
}

export default async function VacanciesPage({ searchParams }: PageProps<"/vacancies">) {
  const query = parseVacancyQuery(await searchParams);
  const [{ result, now }, companyName] = await Promise.all([loadPage(query), loadCompanyName(query.companyId)]);
  const total = result?.total ?? null;
  const past = isPastQuery(query);

  return (
    <VacancySearchProvider query={query}>
      <div className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
          <div className="flex max-w-5xl flex-col gap-6">
            <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              Vacancies
            </h1>
            {query.companyId ? (
              <div className="flex flex-wrap items-center gap-3">
                {companyName ? (
                  <Link
                    href={vacanciesHref(withoutCompany(query))}
                    className="inline-flex h-9 w-fit max-w-full items-center gap-1.5 rounded-full border border-foreground/20 bg-card pr-2 pl-3.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/45 hover:bg-muted"
                  >
                    <span className="truncate">Company: {companyName}</span>
                    <XIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                    <span className="sr-only">Remove company filter</span>
                  </Link>
                ) : null}
                <PeriodSwitch query={query} />
              </div>
            ) : null}
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
                  {past ? (total === 1 ? "past vacancy" : "past vacancies") : total === 1 ? "vacancy" : "vacancies"}
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
                <ViewerMarksProvider source={{ kind: "list", query, take: PAGE_SIZE }}>
                  <VacancyList vacancies={result.items} now={now} />
                </ViewerMarksProvider>
                <Pagination
                  href={(page) => vacanciesHref({ ...query, page })}
                  total={result.total}
                  page={result.page}
                  take={result.take}
                />
              </>
            ) : result.total > 0 ? (
              <PastLastPage href={vacanciesHref({ ...query, page: undefined })} />
            ) : (
              <EmptyResults
                clearHref={vacanciesHref(
                  past && !hasFilters(query) ? { companyId: query.companyId } : clearedQuery(query),
                )}
                filtered={hasFilters(query)}
                past={past}
                pastHref={
                  query.companyId ? vacanciesHref({ companyId: query.companyId, period: "past" }) : undefined
                }
              />
            )}
          </SearchResultsRegion>
        </div>
      </div>
    </VacancySearchProvider>
  );
}
