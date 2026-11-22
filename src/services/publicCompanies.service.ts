import { cacheLife } from "next/cache";
import { COMPANY_PAGE_SIZE, companyApiSearch } from "@/lib/companyQuery";
import { ApiError, api } from "@/services/api";
import { parsePublicCompany, parsePublicCompanyPage } from "@/services/companies.service";
import { OBJECT_ID } from "@/services/vacancies.service";
import type { CompanyQuery, Paginated, PublicCompany, PublicCompanyCard } from "@/types";

async function fetchPublicCompany(id: string): Promise<PublicCompany | null> {
  "use cache";
  cacheLife("minutes");
  try {
    return await api(`/companies/${id}/profile`, parsePublicCompany, { token: null });
  } catch (error: unknown) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

async function fetchCompanyPage(search: string): Promise<Paginated<PublicCompanyCard>> {
  "use cache";
  cacheLife("minutes");
  return api(`/companies/public?${search}`, parsePublicCompanyPage, { token: null });
}

export async function getPublicCompany(id: string): Promise<PublicCompany | null> {
  if (!OBJECT_ID.test(id)) return null;
  return fetchPublicCompany(id.toLowerCase());
}

export function listPublicCompanies(query: CompanyQuery): Promise<Paginated<PublicCompanyCard>> {
  return fetchCompanyPage(companyApiSearch(query, COMPANY_PAGE_SIZE));
}
