import { cacheLife } from "next/cache";
import {
  array,
  isoDate,
  number,
  object,
  oneOf,
  optionalNumber,
  string,
  stringArray,
  stringOr,
} from "@/lib/decode";
import { CURRENCIES, EMPLOYMENT_TYPES, VACANCY_STATUSES, WORK_MODES } from "@/lib/vacancy";
import { apiSearch } from "@/lib/vacancyQuery";
import { ApiError, api } from "@/services/api";
import type { Paginated, Vacancy, VacancyPhoto, VacancyQuery } from "@/types";

const OBJECT_ID = /^[a-f\d]{24}$/i;

function parsePhoto(value: unknown): VacancyPhoto {
  const source = object(value, "photo");
  return { id: string(source, "id"), url: string(source, "url") };
}

export function parseVacancy(data: unknown): Vacancy {
  const source = object(data, "vacancy");
  return {
    id: string(source, "id"),
    title: string(source, "title"),
    description: stringOr(source, "description", ""),
    category: stringOr(source, "category", ""),
    employmentType: oneOf(source, "employmentType", EMPLOYMENT_TYPES),
    workMode: oneOf(source, "workMode", WORK_MODES),
    location: stringOr(source, "location", ""),
    salaryMin: optionalNumber(source, "salaryMin"),
    salaryMax: optionalNumber(source, "salaryMax"),
    currency: oneOf(source, "currency", CURRENCIES),
    requirements: stringArray(source, "requirements"),
    deadline: isoDate(source, "deadline"),
    status: oneOf(source, "status", VACANCY_STATUSES),
    photos: source.photos === undefined ? [] : array(source.photos, "photos", parsePhoto),
    company: string(source, "company"),
    createdAt: isoDate(source, "createdAt"),
  };
}

export function parseVacancyPage(data: unknown): Paginated<Vacancy> {
  const source = object(data, "vacancies");
  return {
    items: array(source.items, "items", parseVacancy),
    total: number(source, "total"),
    page: number(source, "page"),
    take: number(source, "take"),
  };
}

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
