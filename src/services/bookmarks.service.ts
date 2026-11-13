import { array, boolean, isObject, isoDate, object, pageShape, string } from "@/lib/decode";
import { api } from "@/services/api";
import { parseVacancyCard } from "@/services/vacancies.service";
import type { Bookmark, Paginated } from "@/types";

function bookmarkPath(vacancyId: string): string {
  return `/vacancies/${encodeURIComponent(vacancyId)}/bookmark`;
}

function parseBookmarked(data: unknown): boolean {
  return boolean(object(data, "bookmark"), "bookmarked");
}

function parseBookmark(value: unknown): Bookmark | null {
  const source = object(value, "bookmark");
  if (!isObject(source.vacancy)) return null;
  return {
    id: string(source, "id"),
    createdAt: isoDate(source, "createdAt"),
    vacancy: parseVacancyCard(source.vacancy),
  };
}

function parseBookmarkPage(data: unknown): Paginated<Bookmark> {
  const source = object(data, "bookmarks");
  const items = array(source.items, "items", parseBookmark).filter(
    (item): item is Bookmark => item !== null,
  );
  return { items, ...pageShape(source) };
}

export function addBookmark(vacancyId: string): Promise<boolean> {
  return api(bookmarkPath(vacancyId), parseBookmarked, { method: "POST" });
}

export function removeBookmark(vacancyId: string): Promise<boolean> {
  return api(bookmarkPath(vacancyId), parseBookmarked, { method: "DELETE" });
}

export function listBookmarks(page: number, take: number, signal?: AbortSignal): Promise<Paginated<Bookmark>> {
  const search = new URLSearchParams({ page: String(page), take: String(take) });
  return api(`/bookmarks?${search.toString()}`, parseBookmarkPage, { signal, cache: "no-store" });
}
