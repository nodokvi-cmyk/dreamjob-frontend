import { ADMIN_PAGE_SIZE, adminApiSearch } from "@/lib/adminQuery";
import { pageParser } from "@/lib/decode";
import { api, ApiError } from "@/services/api";
import { parseCompany } from "@/services/companies.service";
import { parseUser } from "@/services/users.service";
import { OBJECT_ID, parseAdminVacancy, parseAdminVacancyPage } from "@/services/vacancies.service";
import type { AdminVacancy, AdminVacancyCard, AdminVacancyQuery, Company, Paginated, User } from "@/types";

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

function pageSearch(page: number, take: number): string {
  return new URLSearchParams({ page: String(page), take: String(take) }).toString();
}

const parseCompanyPage = pageParser("companies", parseCompany);

const parseUserPage = pageParser("users", parseUser);

export function listAdminVacancies(
  query: AdminVacancyQuery,
  take: number = ADMIN_PAGE_SIZE,
  signal?: AbortSignal,
): Promise<Paginated<AdminVacancyCard>> {
  return api(`/vacancies/admin?${adminApiSearch(query, take)}`, parseAdminVacancyPage, {
    signal,
    cache: "no-store",
  });
}

export async function countPendingVacancies(signal?: AbortSignal): Promise<number> {
  const page = await listAdminVacancies({ status: "pending" }, 1, signal);
  return page.total;
}

export function getAdminVacancy(id: string, signal?: AbortSignal): Promise<AdminVacancy> {
  if (!OBJECT_ID.test(id)) return Promise.reject(new ApiError("Vacancy not found", 404));
  return api(vacancyPath(id), parseAdminVacancy, { signal, cache: "no-store" });
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
  return api(`/companies?${pageSearch(page, take)}`, parseCompanyPage, { signal, cache: "no-store" });
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

export function listUsers(page: number, take: number, signal?: AbortSignal): Promise<Paginated<User>> {
  return api(`/users?${pageSearch(page, take)}`, parseUserPage, { signal, cache: "no-store" });
}

export async function deleteUserAsAdmin(id: string): Promise<void> {
  await api(`/users/${encodeURIComponent(id)}`, ignore, { method: "DELETE" });
}
