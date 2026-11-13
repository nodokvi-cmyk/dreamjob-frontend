import { APPLICANT_SORTS, APPLICATION_STATUSES } from "@/lib/applications";
import { applicantsPath, withQuery } from "@/lib/routes";
import { PAGE_MAX, QUERY_MAX, first, pick, positiveInt, text, type RawSearchParams } from "@/lib/vacancyQuery";
import type { ApplicantSort, ApplicantsQuery } from "@/types";

export const APPLICANTS_PAGE_SIZE = 10;

const OBJECT_ID = /^[a-f\d]{24}$/i;

export const APPLICANT_SORT_LABELS: Record<ApplicantSort, string> = {
  "-date": "Newest first",
  date: "Oldest first",
  name: "Name A to Z",
  "-name": "Name Z to A",
  age: "Youngest first",
  "-age": "Oldest first by age",
};

export function parseApplicantsQuery(params: RawSearchParams): ApplicantsQuery {
  const sort = pick(params.sort, APPLICANT_SORTS);
  const page = positiveInt(params.page, PAGE_MAX);
  const focus = first(params.focus).trim();
  return {
    q: text(params.q, QUERY_MAX),
    status: pick(params.status, APPLICATION_STATUSES),
    sort: sort === "-date" ? undefined : sort,
    page: page === 1 ? undefined : page,
    focus: OBJECT_ID.test(focus) ? focus : undefined,
  };
}

export function applicantsHref(vacancyId: string, query: ApplicantsQuery): string {
  return withQuery(applicantsPath(vacancyId), {
    q: query.q,
    status: query.status,
    sort: query.sort === "-date" ? undefined : query.sort,
    page: query.page === undefined || query.page <= 1 ? undefined : String(query.page),
    focus: query.focus,
  });
}
