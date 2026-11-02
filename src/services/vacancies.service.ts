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
import { ownApiSearch } from "@/lib/vacancyQuery";
import { ApiError, api } from "@/services/api";
import { uploadWithProgress } from "@/services/upload";
import type {
  OwnVacancy,
  OwnVacancyQuery,
  Paginated,
  Vacancy,
  VacancyInput,
  VacancyPhoto,
  VacancyUpdateInput,
} from "@/types";

export const OBJECT_ID = /^[a-f\d]{24}$/i;

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

export function parseOwnVacancy(data: unknown): OwnVacancy {
  const source = object(data, "vacancy");
  return {
    ...parseVacancy(source),
    rejectionReason: stringOr(source, "rejectionReason", "").trim(),
    updatedAt: isoDate(source, "updatedAt"),
  };
}

function pageParser<T>(item: (value: unknown) => T): (data: unknown) => Paginated<T> {
  return (data) => {
    const source = object(data, "vacancies");
    return {
      items: array(source.items, "items", item),
      total: number(source, "total"),
      page: number(source, "page"),
      take: number(source, "take"),
    };
  };
}

export const parseVacancyPage = pageParser(parseVacancy);

export const parseOwnVacancyPage = pageParser(parseOwnVacancy);

function ignore(): null {
  return null;
}


export function listMyVacancies(
  query: OwnVacancyQuery,
  take: number,
  signal?: AbortSignal,
): Promise<Paginated<OwnVacancy>> {
  return api(`/vacancies/mine?${ownApiSearch(query, take)}`, parseOwnVacancyPage, {
    signal,
    cache: "no-store",
  });
}

export function getOwnVacancy(id: string, accountId: string, signal?: AbortSignal): Promise<OwnVacancy> {
  if (!OBJECT_ID.test(id)) return Promise.reject(new ApiError("Vacancy not found", 404));
  const parseOwned = (data: unknown): OwnVacancy => {
    if (parseVacancy(data).company !== accountId) throw new ApiError("Vacancy not found", 404);
    return parseOwnVacancy(data);
  };
  return api(`/vacancies/${encodeURIComponent(id)}`, parseOwned, { signal, cache: "no-store" });
}

export function createVacancy(input: VacancyInput): Promise<OwnVacancy> {
  return api("/vacancies", parseOwnVacancy, { method: "POST", body: input });
}

export function updateVacancy(id: string, input: VacancyUpdateInput): Promise<OwnVacancy> {
  return api(`/vacancies/${encodeURIComponent(id)}`, parseOwnVacancy, { method: "PATCH", body: input });
}

export function closeVacancy(id: string): Promise<OwnVacancy> {
  return api(`/vacancies/${encodeURIComponent(id)}/close`, parseOwnVacancy, { method: "PATCH" });
}

export async function deleteVacancy(id: string): Promise<void> {
  await api(`/vacancies/${encodeURIComponent(id)}`, ignore, { method: "DELETE" });
}

export function uploadVacancyPhoto(
  id: string,
  file: File,
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<OwnVacancy> {
  const body = new FormData();
  body.append("photos", file);
  return uploadWithProgress(`/vacancies/${encodeURIComponent(id)}/photos`, body, parseOwnVacancy, {
    onProgress,
    signal,
  });
}

export function removeVacancyPhoto(id: string, photoId: string): Promise<OwnVacancy> {
  return api(
    `/vacancies/${encodeURIComponent(id)}/photos/${encodeURIComponent(photoId)}`,
    parseOwnVacancy,
    { method: "DELETE" },
  );
}
