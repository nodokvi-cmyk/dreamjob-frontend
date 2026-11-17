import { matchCategory } from "@/lib/categories";
import { routes, withQuery } from "@/lib/routes";
import { CURRENCIES, EMPLOYMENT_TYPES, WORK_MODES } from "@/lib/vacancy";
import {
  CATEGORY_MAX,
  LOCATION_MAX,
  PAGE_MAX,
  QUERY_MAX,
  SALARY_MAX,
  pick,
  positiveInt,
  text,
  type RawSearchParams,
} from "@/lib/vacancyQuery";
import type { BoardQuery, BoardSort, InvitationState } from "@/types";

export const BOARD_PAGE_SIZE = 10;

export const BOARD_SORTS: readonly BoardSort[] = ["-date", "date", "-salary", "salary", "-experience", "experience"];

export const BOARD_SORT_LABELS: Record<BoardSort, string> = {
  "-date": "Newest first",
  date: "Oldest first",
  "-salary": "Highest pay",
  salary: "Lowest pay",
  "-experience": "Most experience",
  experience: "Least experience",
};

export const INVITATION_LABELS: Record<Exclude<InvitationState, "none">, string> = {
  invited: "Invited",
  accepted: "Accepted",
  declined: "Declined",
};

export const NOT_APPROVED = "Company is not approved";

export function parseBoardQuery(params: RawSearchParams): BoardQuery {
  const category = text(params.category, CATEGORY_MAX);
  return {
    q: text(params.q, QUERY_MAX),
    category: category ? (matchCategory(category) ?? category) : undefined,
    location: text(params.location, LOCATION_MAX),
    workMode: pick(params.workMode, WORK_MODES),
    employmentType: pick(params.employmentType, EMPLOYMENT_TYPES),
    salaryMin: positiveInt(params.salaryMin, SALARY_MAX),
    salaryMax: positiveInt(params.salaryMax, SALARY_MAX),
    currency: pick(params.currency, CURRENCIES),
    sort: pick(params.sort, BOARD_SORTS),
    page: positiveInt(params.page, PAGE_MAX) ?? 1,
  };
}

function boardParams(query: BoardQuery): Record<string, string | undefined> {
  return {
    q: query.q,
    category: query.category,
    location: query.location,
    workMode: query.workMode,
    employmentType: query.employmentType,
    salaryMin: query.salaryMin === undefined ? undefined : String(query.salaryMin),
    salaryMax: query.salaryMax === undefined ? undefined : String(query.salaryMax),
    currency: query.currency,
    sort: query.sort,
    page: query.page <= 1 ? undefined : String(query.page),
  };
}

export function boardHref(query: BoardQuery): string {
  return withQuery(routes.board, boardParams(query));
}

export function boardApiSearch(query: BoardQuery, take: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(boardParams(query))) {
    if (value) params.set(key, value);
  }
  params.set("page", String(query.page));
  params.set("take", String(take));
  return params.toString();
}

export function hasBoardFilters(query: BoardQuery): boolean {
  return Boolean(
    query.q ||
      query.category ||
      query.location ||
      query.workMode ||
      query.employmentType ||
      query.salaryMin !== undefined ||
      query.salaryMax !== undefined ||
      query.currency,
  );
}

export function authorName(author: { firstName: string; lastName: string } | null): string {
  if (!author) return "Deleted account";
  return [author.firstName, author.lastName].filter(Boolean).join(" ") || "Job seeker";
}
