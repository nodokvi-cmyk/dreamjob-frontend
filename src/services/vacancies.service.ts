import {
  array,
  boolean,
  DecodeError,
  booleanOr,
  isObject,
  isoDate,
  nullableNumber,
  number,
  object,
  oneOf,
  optionalIsoDate,
  optionalNumber,
  pageParser,
  string,
  stringArray,
  stringOr,
  type JsonObject,
} from "@/lib/decode";
import { APPLICATION_STATUSES } from "@/lib/applications";
import {
  ADMIN_VACANCY_STATUSES,
  CURRENCIES,
  EMPLOYMENT_TYPES,
  USER_VACANCY_STATUSES,
  VACANCY_STATUSES,
  WORK_MODES,
} from "@/lib/vacancy";
import { apiSearch, ownApiSearch } from "@/lib/vacancyQuery";
import { ApiError, api } from "@/services/api";
import { uploadWithProgress } from "@/services/upload";
import type {
  AdminVacancy,
  AdminVacancyCard,
  BillingResult,
  CompanyDisplay,
  MyApplicationMark,
  OwnVacancy,
  OwnVacancyCard,
  OwnVacancyQuery,
  Paginated,
  PrivateVacancyFields,
  Vacancy,
  VacancyBase,
  VacancyCard,
  VacancyCardFields,
  VacancyDetail,
  VacancyInput,
  VacancyPhoto,
  VacancyQuery,
  VacancyUpdateInput,
  ViewerMarks,
} from "@/types";

export const OBJECT_ID = /^[a-f\d]{24}$/i;

function parsePhoto(value: unknown): VacancyPhoto {
  const source = object(value, "photo");
  return { id: string(source, "id"), url: string(source, "url") };
}

function parsePhotos(source: JsonObject): VacancyPhoto[] {
  return source.photos === undefined ? [] : array(source.photos, "photos", parsePhoto);
}

function parseBase(source: JsonObject): VacancyBase {
  return {
    id: string(source, "id"),
    title: string(source, "title"),
    category: stringOr(source, "category", ""),
    employmentType: oneOf(source, "employmentType", EMPLOYMENT_TYPES),
    workMode: oneOf(source, "workMode", WORK_MODES),
    location: stringOr(source, "location", ""),
    salaryMin: optionalNumber(source, "salaryMin"),
    salaryMax: optionalNumber(source, "salaryMax"),
    currency: oneOf(source, "currency", CURRENCIES),
    deadline: isoDate(source, "deadline"),
    company: string(source, "company"),
    createdAt: isoDate(source, "createdAt"),
  };
}

function parseCardFields(source: JsonObject): VacancyCardFields {
  return { ...parseBase(source), excerpt: stringOr(source, "excerpt", "") };
}

export function parseCompanyDisplay(source: JsonObject): CompanyDisplay {
  return {
    companyName: stringOr(source, "companyName", ""),
    logoUrl: stringOr(source, "logoUrl", ""),
    rating: nullableNumber(source, "rating"),
  };
}

export function parseApplicationMark(value: unknown): MyApplicationMark | null {
  if (value === null || value === undefined) return null;
  const source = object(value, "myApplication");
  return {
    id: string(source, "id"),
    status: oneOf(source, "status", APPLICATION_STATUSES),
    canReapply: boolean(source, "canReapply"),
    submissions: number(source, "submissions"),
  };
}

function parseViewerMarks(source: JsonObject): ViewerMarks {
  return {
    companyApproved: booleanOr(source, "companyApproved", false),
    myApplication: parseApplicationMark(source.myApplication),
    isBookmarked: booleanOr(source, "isBookmarked", false),
  };
}

function parsePrivate(source: JsonObject): PrivateVacancyFields {
  return {
    rejectionReason: stringOr(source, "rejectionReason", "").trim(),
    submittedAt: optionalIsoDate(source, "submittedAt"),
    firstPublishedAt: optionalIsoDate(source, "firstPublishedAt"),
    freeWindowEndsAt: optionalIsoDate(source, "freeWindowEndsAt"),
    updatedAt: isoDate(source, "updatedAt"),
  };
}

export function parseVacancyCard(data: unknown): VacancyCard {
  const source = object(data, "vacancy");
  return {
    ...parseCardFields(source),
    ...parseCompanyDisplay(source),
    ...parseViewerMarks(source),
    status: oneOf(source, "status", USER_VACANCY_STATUSES),
  };
}

export function parseOwnVacancyCard(data: unknown): OwnVacancyCard {
  const source = object(data, "vacancy");
  return {
    ...parseCardFields(source),
    ...parsePrivate(source),
    status: oneOf(source, "status", VACANCY_STATUSES),
    photos: parsePhotos(source),
  };
}

export function parseAdminVacancyCard(data: unknown): AdminVacancyCard {
  const source = object(data, "vacancy");
  return {
    ...parseCardFields(source),
    ...parsePrivate(source),
    ...parseCompanyDisplay(source),
    status: oneOf(source, "status", ADMIN_VACANCY_STATUSES),
    companyApproved: booleanOr(source, "companyApproved", false),
  };
}

export function parseVacancy(data: unknown): Vacancy {
  const source = object(data, "vacancy");
  return {
    ...parseBase(source),
    description: stringOr(source, "description", ""),
    requirements: stringArray(source, "requirements"),
    status: oneOf(source, "status", VACANCY_STATUSES),
    photos: parsePhotos(source),
  };
}

export function parseOwnVacancy(data: unknown): OwnVacancy {
  const source = object(data, "vacancy");
  return { ...parseVacancy(source), ...parsePrivate(source) };
}

export function parseVacancyDetail(data: unknown): VacancyDetail {
  const source = object(data, "vacancy");
  return { ...parseVacancy(source), ...parseCompanyDisplay(source), ...parseViewerMarks(source) };
}

export function parseAdminVacancy(data: unknown): AdminVacancy {
  const source = object(data, "vacancy");
  return {
    ...parseOwnVacancy(source),
    ...parseCompanyDisplay(source),
    companyApproved: booleanOr(source, "companyApproved", false),
  };
}

export const parseVacancyPage = pageParser("vacancies", parseVacancyCard);

export function parseLatestVacancies(data: unknown): VacancyCard[] {
  const source = object(data, "vacancies");
  return array(source.items, "items", parseVacancyCard);
}

export const parseOwnVacancyPage =pageParser("vacancies", parseOwnVacancyCard);

export const parseAdminVacancyPage = pageParser("vacancies", parseAdminVacancyCard);

function parseBillingResult(data: unknown): BillingResult {
  const source = object(data, "billing");
  if (source.status === "paymentRequired") {
    return { status: "paymentRequired", checkoutUrl: string(source, "checkoutUrl") };
  }
  if (source.status === "done" && isObject(source.vacancy)) {
    return { status: "done", vacancy: parseOwnVacancy(source.vacancy) };
  }
  throw new DecodeError("status");
}

function ignore(): null {
  return null;
}

function vacancyPath(id: string, action?: string): string {
  const base = `/vacancies/${encodeURIComponent(id)}`;
  return action ? `${base}/${action}` : base;
}

export function listVacanciesForViewer(
  query: VacancyQuery,
  take: number,
  signal?: AbortSignal,
): Promise<Paginated<VacancyCard>> {
  return api(`/vacancies?${apiSearch(query, take)}`, parseVacancyPage, { signal, cache: "no-store" });
}

export function getVacancyForViewer(id: string, signal?: AbortSignal): Promise<VacancyDetail> {
  if (!OBJECT_ID.test(id)) return Promise.reject(new ApiError("Vacancy not found", 404));
  return api(vacancyPath(id), parseVacancyDetail, { signal, cache: "no-store" });
}

export function listMyVacancies(
  query: OwnVacancyQuery,
  take: number,
  signal?: AbortSignal,
): Promise<Paginated<OwnVacancyCard>> {
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
  return api(vacancyPath(id), parseOwned, { signal, cache: "no-store" });
}

export function createVacancy(input: VacancyInput): Promise<OwnVacancy> {
  return api("/vacancies", parseOwnVacancy, { method: "POST", body: input });
}

export function updateVacancy(id: string, input: VacancyUpdateInput): Promise<OwnVacancy> {
  return api(vacancyPath(id), parseOwnVacancy, { method: "PATCH", body: input });
}

export function closeVacancy(id: string): Promise<OwnVacancy> {
  return api(vacancyPath(id, "close"), parseOwnVacancy, { method: "PATCH" });
}

export function submitVacancy(id: string): Promise<BillingResult> {
  return api(vacancyPath(id, "submit"), parseBillingResult, { method: "POST" });
}

export function extendVacancy(id: string, deadline: string): Promise<BillingResult> {
  return api(vacancyPath(id, "extend"), parseBillingResult, { method: "POST", body: { deadline } });
}

export async function deleteVacancy(id: string): Promise<void> {
  await api(vacancyPath(id), ignore, { method: "DELETE" });
}

export function uploadVacancyPhoto(
  id: string,
  file: File,
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<OwnVacancy> {
  const body = new FormData();
  body.append("photos", file);
  return uploadWithProgress(vacancyPath(id, "photos"), body, parseOwnVacancy, {
    onProgress,
    signal,
  });
}

export function removeVacancyPhoto(id: string, photoId: string): Promise<OwnVacancy> {
  return api(`${vacancyPath(id, "photos")}/${encodeURIComponent(photoId)}`, parseOwnVacancy, {
    method: "DELETE",
  });
}
