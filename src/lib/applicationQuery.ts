import { APPLICATION_STATUSES, MY_APPLICATION_SORTS } from "@/lib/applications";
import { routes, withQuery } from "@/lib/routes";
import { PAGE_MAX, QUERY_MAX, pick, positiveInt, text, type RawSearchParams } from "@/lib/vacancyQuery";
import type { MyApplicationsQuery } from "@/types";

export const MY_APPLICATIONS_PAGE_SIZE = 10;

export const BOOKMARKS_PAGE_SIZE = 10;

export function parseMyApplicationsQuery(params: RawSearchParams): MyApplicationsQuery {
  const sort = pick(params.sort, MY_APPLICATION_SORTS);
  const page = positiveInt(params.page, PAGE_MAX);
  return {
    q: text(params.q, QUERY_MAX),
    status: pick(params.status, APPLICATION_STATUSES),
    sort: sort === "-date" ? undefined : sort,
    page: page === 1 ? undefined : page,
  };
}

export function myApplicationsHref(query: MyApplicationsQuery): string {
  return withQuery(routes.myApplications, {
    q: query.q,
    status: query.status,
    sort: query.sort === "-date" ? undefined : query.sort,
    page: query.page === undefined || query.page <= 1 ? undefined : String(query.page),
  });
}

export function bookmarksHref(page: number): string {
  return withQuery(routes.bookmarks, { page: page <= 1 ? undefined : String(page) });
}

export function parseBookmarksPage(params: RawSearchParams): number {
  return positiveInt(params.page, PAGE_MAX) ?? 1;
}
