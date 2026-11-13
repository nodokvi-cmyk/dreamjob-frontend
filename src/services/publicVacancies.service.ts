import { cacheLife } from "next/cache";
import { apiSearch } from "@/lib/vacancyQuery";
import { ApiError, api } from "@/services/api";
import { OBJECT_ID, parseVacancyDetail, parseVacancyPage } from "@/services/vacancies.service";
import type { Paginated, VacancyCard, VacancyDetail, VacancyQuery } from "@/types";

async function fetchVacancyPage(search: string): Promise<Paginated<VacancyCard>> {
  "use cache";
  cacheLife("minutes");
  return api(`/vacancies?${search}`, parseVacancyPage, { token: null });
}

async function fetchVacancy(id: string): Promise<VacancyDetail | null> {
  "use cache";
  cacheLife("minutes");
  try {
    return await api(`/vacancies/${id}`, parseVacancyDetail, { token: null });
  } catch (error: unknown) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export function listVacancies(query: VacancyQuery, take: number): Promise<Paginated<VacancyCard>> {
  return fetchVacancyPage(apiSearch(query, take));
}

export async function getVacancy(id: string): Promise<VacancyDetail | null> {
  if (!OBJECT_ID.test(id)) return null;
  return fetchVacancy(id.toLowerCase());
}
