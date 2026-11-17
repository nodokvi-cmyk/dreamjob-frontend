import { cacheLife } from "next/cache";
import { ApiError, api } from "@/services/api";
import { parsePublicCompany } from "@/services/companies.service";
import { OBJECT_ID } from "@/services/vacancies.service";
import type { PublicCompany } from "@/types";

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

export async function getPublicCompany(id: string): Promise<PublicCompany | null> {
  if (!OBJECT_ID.test(id)) return null;
  return fetchPublicCompany(id.toLowerCase());
}
