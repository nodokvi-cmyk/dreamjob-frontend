import type { Metadata } from "next";
import Link from "next/link";
import { CompanyListCard } from "@/components/companies/CompanyListCard";
import { CompanySearch } from "@/components/companies/CompanySearch";
import { CompanySortSelect } from "@/components/companies/CompanySortSelect";
import { Button } from "@/components/ui/button";
import { ListMessage, PastLastPage, ResultsError } from "@/components/vacancies/ListStates";
import { Pagination } from "@/components/vacancies/Pagination";
import {
  companiesHref,
  hasCompanyFilters,
  parseCompanyQuery,
} from "@/lib/companyQuery";
import { canonicalFor, openGraphFor } from "@/lib/site";
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

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8">
          <div className="flex max-w-5xl flex-col gap-6">
            <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              Companies
            </h1>
            <CompanySearch query={query} />
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
            <CompanySortSelect query={query} />
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
