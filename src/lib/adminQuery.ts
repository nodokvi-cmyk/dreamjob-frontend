import { matchCategory } from "@/lib/categories";
import { routes, withQuery } from "@/lib/routes";
import {
  DEFAULT_SORT,
  EMPLOYMENT_TYPES,
  VACANCY_SORTS,
  VACANCY_STATUSES,
  WORK_MODES,
} from "@/lib/vacancy";
import {
  CATEGORY_MAX,
  PAGE_MAX,
  QUERY_MAX,
  first,
  pick,
  positiveInt,
  text,
  type RawSearchParams,
} from "@/lib/vacancyQuery";
import { OBJECT_ID } from "@/services/vacancies.service";
import type { AdminStatusFilter, AdminVacancyQuery } from "@/types";

export const ADMIN_PAGE_SIZE = 10;
export const COMPANY_PAGE_SIZE = 10;
export const DEFAULT_ADMIN_STATUS: AdminStatusFilter = "pending";

export function parseAdminQuery(params: RawSearchParams): AdminVacancyQuery {
  const category = text(params.category, CATEGORY_MAX);
  const sort = pick(params.sort, VACANCY_SORTS);
  const page = positiveInt(params.page, PAGE_MAX);
  const companyId = first(params.companyId).trim();
  const status =
    first(params.status) === "all"
      ? "all"
      : (pick(params.status, VACANCY_STATUSES) ?? DEFAULT_ADMIN_STATUS);
  return {
    q: text(params.q, QUERY_MAX),
    status,
    companyId: OBJECT_ID.test(companyId) ? companyId : undefined,
    category: category ? (matchCategory(category) ?? category) : undefined,
    workMode: pick(params.workMode, WORK_MODES),
    employmentType: pick(params.employmentType, EMPLOYMENT_TYPES),
    sort: sort === DEFAULT_SORT ? undefined : sort,
    page: page === 1 ? undefined : page,
  };
}

function adminParams(query: AdminVacancyQuery): Record<string, string | undefined> {
  return {
    q: query.q,
    status: query.status === DEFAULT_ADMIN_STATUS ? undefined : query.status,
    companyId: query.companyId,
    category: query.category,
    workMode: query.workMode,
    employmentType: query.employmentType,
    sort: query.sort === DEFAULT_SORT ? undefined : query.sort,
    page: query.page === undefined || query.page <= 1 ? undefined : String(query.page),
  };
}

export function adminVacanciesHref(query: AdminVacancyQuery): string {
  return withQuery(routes.adminVacancies, adminParams(query));
}

export function adminApiSearch(query: AdminVacancyQuery, take: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(adminParams(query))) {
    if (value && key !== "status") params.set(key, value);
  }
  if (query.status !== "all") params.set("status", query.status);
  params.set("sort", query.sort ?? DEFAULT_SORT);
  params.set("take", String(take));
  return params.toString();
}

export function hasAdminFilters(query: AdminVacancyQuery): boolean {
  return (
    query.q !== undefined ||
    query.companyId !== undefined ||
    query.category !== undefined ||
    query.workMode !== undefined ||
    query.employmentType !== undefined
  );
}

export function companiesHref(page: number | undefined): string {
  return withQuery(routes.adminCompanies, {
    page: page === undefined || page <= 1 ? undefined : String(page),
  });
}

export function parseCompanyPage(params: RawSearchParams): number | undefined {
  const page = positiveInt(params.page, PAGE_MAX);
  return page === 1 ? undefined : page;
}
