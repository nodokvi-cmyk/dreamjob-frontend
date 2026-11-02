import { matchCategory } from "@/lib/categories";
import { routes, withQuery } from "@/lib/routes";
import {
  CURRENCIES,
  DEFAULT_SORT,
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  VACANCY_SORTS,
  formatMoney,
  VACANCY_STATUSES,
  WORK_MODE_LABELS,
  WORK_MODES,
} from "@/lib/vacancy";
import type { OwnVacancyQuery, VacancyQuery } from "@/types";

export const PAGE_SIZE = 10;
export const QUERY_MAX = 64;
export const CATEGORY_MAX = 64;
export const LOCATION_MAX = 128;
export const SALARY_MAX = 1_000_000_000;
const PAGE_MAX = 10_000;

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function text(value: string | string[] | undefined, max: number): string | undefined {
  const trimmed = first(value).trim().slice(0, max).trim();
  return trimmed || undefined;
}

function pick<T extends string>(value: string | string[] | undefined, allowed: readonly T[]): T | undefined {
  const raw = first(value);
  return allowed.find((option) => option === raw);
}

function positiveInt(value: string | string[] | undefined, max: number): number | undefined {
  const raw = first(value).trim();
  if (!/^\d{1,10}$/.test(raw)) return undefined;
  const parsed = Number(raw);
  return parsed >= 1 && parsed <= max ? parsed : undefined;
}

export function parseVacancyQuery(params: RawSearchParams): VacancyQuery {
  const category = text(params.category, CATEGORY_MAX);
  const sort = pick(params.sort, VACANCY_SORTS);
  const page = positiveInt(params.page, PAGE_MAX);
  return {
    q: text(params.q, QUERY_MAX),
    category: category ? (matchCategory(category) ?? category) : undefined,
    location: text(params.location, LOCATION_MAX),
    workMode: pick(params.workMode, WORK_MODES),
    employmentType: pick(params.employmentType, EMPLOYMENT_TYPES),
    salaryMin: positiveInt(params.salaryMin, SALARY_MAX),
    currency: pick(params.currency, CURRENCIES),
    sort: sort === DEFAULT_SORT ? undefined : sort,
    page: page === 1 ? undefined : page,
  };
}

export function queryParams(query: VacancyQuery): Record<string, string | undefined> {
  return {
    q: query.q,
    location: query.location,
    category: query.category,
    workMode: query.workMode,
    employmentType: query.employmentType,
    salaryMin: query.salaryMin === undefined ? undefined : String(query.salaryMin),
    currency: query.currency,
    sort: query.sort === DEFAULT_SORT ? undefined : query.sort,
    page: query.page === undefined || query.page <= 1 ? undefined : String(query.page),
  };
}

export function vacanciesHref(query: VacancyQuery): string {
  return withQuery(routes.vacancies, queryParams(query));
}

export function apiSearch(query: VacancyQuery, take: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams(query))) {
    if (value) params.set(key, value);
  }
  params.set("sort", query.sort ?? DEFAULT_SORT);
  params.set("take", String(take));
  return params.toString();
}

export function parseOwnVacancyQuery(params: RawSearchParams): OwnVacancyQuery {
  const page = positiveInt(params.page, PAGE_MAX);
  return {
    q: text(params.q, QUERY_MAX),
    status: pick(params.status, VACANCY_STATUSES),
    page: page === 1 ? undefined : page,
  };
}

function ownParams(query: OwnVacancyQuery): Record<string, string | undefined> {
  return {
    q: query.q,
    status: query.status,
    page: query.page === undefined || query.page <= 1 ? undefined : String(query.page),
  };
}

export function dashboardHref(query: OwnVacancyQuery): string {
  return withQuery(routes.dashboard, ownParams(query));
}

export function ownApiSearch(query: OwnVacancyQuery, take: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(ownParams(query))) {
    if (value) params.set(key, value);
  }
  params.set("sort", DEFAULT_SORT);
  params.set("take", String(take));
  return params.toString();
}

export type FilterKey =
  | "q"
  | "location"
  | "category"
  | "workMode"
  | "employmentType"
  | "salaryMin"
  | "currency";

export interface ActiveFilter {
  key: FilterKey;
  label: string;
  clears: FilterKey[];
}

const salaryNumber = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });

export function activeFilters(query: VacancyQuery): ActiveFilter[] {
  const filters: ActiveFilter[] = [];
  if (query.q) filters.push({ key: "q", label: `“${query.q}”`, clears: ["q"] });
  if (query.location) {
    filters.push({ key: "location", label: query.location, clears: ["location"] });
  }
  if (query.category) {
    filters.push({ key: "category", label: query.category, clears: ["category"] });
  }
  if (query.workMode) {
    filters.push({ key: "workMode", label: WORK_MODE_LABELS[query.workMode], clears: ["workMode"] });
  }
  if (query.employmentType) {
    filters.push({
      key: "employmentType",
      label: EMPLOYMENT_TYPE_LABELS[query.employmentType],
      clears: ["employmentType"],
    });
  }
  if (query.salaryMin !== undefined) {
    const amount = query.currency
      ? formatMoney(query.salaryMin, query.currency)
      : salaryNumber.format(query.salaryMin);
    filters.push({
      key: "salaryMin",
      label: `Pay from ${amount}`,
      clears: ["salaryMin", "currency"],
    });
  } else if (query.currency) {
    filters.push({ key: "currency", label: `Paid in ${query.currency}`, clears: ["currency"] });
  }
  return filters;
}

export function hasFilters(query: VacancyQuery): boolean {
  return activeFilters(query).length > 0;
}

export function withoutFilters(query: VacancyQuery, keys: FilterKey[]): VacancyQuery {
  const next: VacancyQuery = { ...query, page: undefined };
  for (const key of keys) next[key] = undefined;
  return next;
}

export function clearedQuery(query: VacancyQuery): VacancyQuery {
  return { sort: query.sort };
}
