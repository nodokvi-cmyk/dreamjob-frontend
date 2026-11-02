import { ADMIN_PAGE_SIZE, adminApiSearch } from "@/lib/adminQuery";
import { array, number, object } from "@/lib/decode";
import { api, ApiError } from "@/services/api";
import { parseCompany } from "@/services/companies.service";
import { OBJECT_ID, parseOwnVacancy, parseOwnVacancyPage } from "@/services/vacancies.service";
import type { AdminVacancyQuery, Company, OwnVacancy, Paginated } from "@/types";

function ignore(): null {
  return null;
}

function vacancyPath(id: string, action?: string): string {
  const base = `/vacancies/${encodeURIComponent(id)}`;
  return action ? `${base}/${action}` : base;
}

function companyPath(id: string, action?: string): string {
  const base = `/companies/${encodeURIComponent(id)}`;
  return action ? `${base}/${action}` : base;
}

export function listAdminVacancies(
  query: AdminVacancyQuery,
  take: number = ADMIN_PAGE_SIZE,
  signal?: AbortSignal,
): Promise<Paginated<OwnVacancy>> {
  return api(`/vacancies/admin?${adminApiSearch(query, take)}`, parseOwnVacancyPage, {
    signal,
    cache: "no-store",
  });
}

export async function countPendingVacancies(signal?: AbortSignal): Promise<number> {
  const page = await listAdminVacancies({ status: "pending" }, 1, signal);
  return page.total;
}

export function getAdminVacancy(id: string, signal?: AbortSignal): Promise<OwnVacancy> {
  if (!OBJECT_ID.test(id)) return Promise.reject(new ApiError("Vacancy not found", 404));
  return api(vacancyPath(id), parseOwnVacancy, { signal, cache: "no-store" });
}

export async function approveVacancy(id: string): Promise<void> {
  await api(vacancyPath(id, "approve"), ignore, { method: "PATCH" });
}

export async function rejectVacancy(id: string, reason: string): Promise<void> {
  const body = reason ? { reason } : {};
  await api(vacancyPath(id, "reject"), ignore, { method: "PATCH", body });
}

export function listCompanies(
  page: number,
  take: number,
  signal?: AbortSignal,
): Promise<Paginated<Company>> {
  const search = new URLSearchParams({ page: String(page), take: String(take) });
  return api(
    `/companies?${search.toString()}`,
    (data) => {
      const source = object(data, "companies");
      return {
        items: array(source.items, "items", parseCompany),
        total: number(source, "total"),
        page: number(source, "page"),
        take: number(source, "take"),
      };
    },
    { signal, cache: "no-store" },
  );
}

export function getCompanyById(id: string, signal?: AbortSignal): Promise<Company> {
  if (!OBJECT_ID.test(id)) return Promise.reject(new ApiError("Company not found", 404));
  return api(companyPath(id), parseCompany, { signal, cache: "no-store" });
}

export async function approveCompany(id: string): Promise<void> {
  await api(companyPath(id, "approve"), ignore, { method: "PATCH" });
}

export async function revokeCompany(id: string): Promise<void> {
  await api(companyPath(id, "revoke"), ignore, { method: "PATCH" });
}
