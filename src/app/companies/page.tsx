import { ArrowRightIcon, MapPinIcon, SearchIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CompanyListCard } from "@/components/companies/CompanyListCard";
import { Button } from "@/components/ui/button";
import { ListMessage, PastLastPage, ResultsError } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import {
  COMPANY_SORTS,
  COMPANY_SORT_LABELS,
  DEFAULT_COMPANY_SORT,
  companiesHref,
  hasCompanyFilters,
  parseCompanyQuery,
} from "@/lib/companyQuery";
import { routes } from "@/lib/routes";
import { canonicalFor, openGraphFor } from "@/lib/site";
import { LOCATION_MAX, QUERY_MAX } from "@/lib/vacancyQuery";
import { listPublicCompanies } from "@/services/publicCompanies.service";
import type { Paginated, PublicCompanyCard } from "@/types";

export async function generateMetadata({ searchParams }: PageProps<"/companies">): Promise<Metadata> {
  const { page } = parseCompanyQuery(await searchParams);
  const canonical = companiesHref({ page });
  return {
    title: "Companies",
    description: "Approved employers hiring in Georgia, with their open vacancies on GetDreamJob.",
    alternates: canonicalFor(canonical),
    openGraph: openGraphFor(canonical),
  };
}

export default async function CompaniesPage({ searchParams }: PageProps<"/companies">) {
  const query = parseCompanyQuery(await searchParams);
  let result: Paginated<PublicCompanyCard> | null;
  try {
    result = await listPublicCompanies(query);
  } catch {
    result = null;
  }
  const sort = query.sort ?? DEFAULT_COMPANY_SORT;

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
          <div className="flex max-w-5xl flex-col gap-6">
            <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              Companies
            </h1>
            <form
              role="search"
              action={routes.companies}
              className="flex w-full flex-col gap-1 rounded-xl border-2 border-foreground bg-card p-1.5 sm:flex-row sm:items-center sm:gap-0"
            >
              {sort !== DEFAULT_COMPANY_SORT ? <input type="hidden" name="sort" value={sort} /> : null}
              <label className="flex flex-1 items-center gap-3 px-3">
                <SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                <span className="sr-only">Company name</span>
                <input
                  name="q"
                  type="search"
                  defaultValue={query.q ?? ""}
                  maxLength={QUERY_MAX}
                  placeholder="Company name"
                  autoComplete="off"
                  className="h-11 w-full min-w-0 bg-transparent text-[1.05rem] outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
                />
              </label>
              <span aria-hidden className="hidden h-7 w-px bg-border sm:block" />
              <label className="flex items-center gap-3 border-t border-border px-3 sm:w-56 sm:border-t-0">
                <MapPinIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                <span className="sr-only">City</span>
                <input
                  name="location"
                  defaultValue={query.location ?? ""}
                  maxLength={LOCATION_MAX}
                  placeholder="City"
                  autoComplete="address-level2"
                  className="h-11 w-full min-w-0 bg-transparent text-[1.05rem] outline-none placeholder:text-muted-foreground"
                />
              </label>
              <Button type="submit" className="h-11 sm:ml-1">
                Search
                <ArrowRightIcon aria-hidden />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <p aria-live="polite" className="text-[1.05rem] text-muted-foreground">
              {result === null ? (
                "Company list unavailable"
              ) : (
                <>
                  <span className="font-display text-[1.6rem] leading-none font-bold text-foreground tabular">
                    {new Intl.NumberFormat("en-GB").format(result.total)}
                  </span>{" "}
                  {result.total === 1 ? "company" : "companies"}
                </>
              )}
            </p>
            <nav aria-label="Sort companies" className="flex items-center gap-2.5">
              <span className="transit-label text-[0.8rem] text-muted-foreground">Sort</span>
              <ul className="flex gap-1.5">
                {COMPANY_SORTS.map((option) => (
                  <li key={option}>
                    <Link
                      href={companiesHref({ ...query, sort: option, page: undefined })}
                      aria-current={option === sort ? "true" : undefined}
                      className="inline-flex h-9 items-center rounded-full border border-foreground/20 px-3.5 text-sm font-medium transition-colors hover:border-foreground/45 hover:bg-muted aria-[current=true]:border-foreground aria-[current=true]:bg-foreground aria-[current=true]:text-background"
                    >
                      {COMPANY_SORT_LABELS[option]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            {result === null ? (
              <ResultsError title="The company list didn't load" />
            ) : result.items.length > 0 ? (
              <>
                <ul className="flex flex-col gap-3">
                  {result.items.map((company) => (
                    <li key={company.id}>
                      <CompanyListCard company={company} />
                    </li>
                  ))}
                </ul>
                <Pagination
                  href={(page) => companiesHref({ ...query, page })}
                  total={result.total}
                  page={result.page}
                  take={result.take}
                />
              </>
            ) : result.total > 0 ? (
              <PastLastPage href={companiesHref({ ...query, page: undefined })} />
            ) : (
              <ListMessage
                title={hasCompanyFilters(query) ? "No companies on this line" : "No companies yet"}
                body={
                  hasCompanyFilters(query)
                    ? "Nothing matches this search. Try another name or city."
                    : "Approved companies will appear here."
                }
                action={
                  hasCompanyFilters(query) ? (
                    <Button asChild size="lg">
                      <Link href={companiesHref({ sort: query.sort })}>Clear search</Link>
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
