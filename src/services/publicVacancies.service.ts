import { cacheLife } from "next/cache";
import { apiSearch } from "@/lib/vacancyQuery";
import { ApiError, api } from "@/services/api";
import { OBJECT_ID, parseVacancy, parseVacancyPage } from "@/services/vacancies.service";
import type { Paginated, Vacancy, VacancyQuery } from "@/types";

async function fetchVacancyPage(search: string): Promise<Paginated<Vacancy>> {
  "use cache";
  cacheLife("minutes");
  return api(`/vacancies?${search}`, parseVacancyPage, { token: null });
}

async function fetchVacancy(id: string): Promise<Vacancy | null> {
  "use cache";
  cacheLife("minutes");
  try {
    return await api(`/vacancies/${id}`, parseVacancy, { token: null });
  } catch (error: unknown) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export function listVacancies(query: VacancyQuery, take: number): Promise<Paginated<Vacancy>> {
  return fetchVacancyPage(apiSearch(query, take));
}

export async function getVacancy(id: string): Promise<Vacancy | null> {
  if (!OBJECT_ID.test(id)) return null;
  return fetchVacancy(id.toLowerCase());
}
