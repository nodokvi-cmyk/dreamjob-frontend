import { routes, withQuery } from "@/lib/routes";
import {
  LOCATION_MAX,
  PAGE_MAX,
  QUERY_MAX,
  pick,
  positiveInt,
  text,
  type RawSearchParams,
} from "@/lib/vacancyQuery";
import type { CompanyQuery, CompanySort } from "@/types";

export const COMPANY_PAGE_SIZE = 10;

export const COMPANY_SORTS = ["vacancies", "newest"] as const satisfies readonly CompanySort[];

export const DEFAULT_COMPANY_SORT: CompanySort = "vacancies";

export const COMPANY_SORT_LABELS: Record<CompanySort, string> = {
  vacancies: "Most vacancies",
  newest: "Newest",
};

export function parseCompanyQuery(params: RawSearchParams): CompanyQuery {
  const sort = pick(params.sort, COMPANY_SORTS);
  const page = positiveInt(params.page, PAGE_MAX);
  return {
    q: text(params.q, QUERY_MAX),
    location: text(params.location, LOCATION_MAX),
    sort: sort === DEFAULT_COMPANY_SORT ? undefined : sort,
    page: page === 1 ? undefined : page,
  };
}

function companyParams(query: CompanyQuery): Record<string, string | undefined> {
  return {
    q: query.q,
    location: query.location,
    sort: query.sort === DEFAULT_COMPANY_SORT ? undefined : query.sort,
    page: query.page === undefined || query.page <= 1 ? undefined : String(query.page),
  };
}

export function companiesHref(query: CompanyQuery): string {
  return withQuery(routes.companies, companyParams(query));
}

export function companyApiSearch(query: CompanyQuery, take: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(companyParams(query))) {
    if (value) params.set(key, value);
  }
  params.set("take", String(take));
  return params.toString();
}

export function hasCompanyFilters(query: CompanyQuery): boolean {
  return query.q !== undefined || query.location !== undefined;
}
