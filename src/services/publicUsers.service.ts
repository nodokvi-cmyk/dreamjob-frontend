import { cacheLife } from "next/cache";
import { ApiError, api } from "@/services/api";
import { parsePublicUser } from "@/services/users.service";
import { OBJECT_ID } from "@/services/vacancies.service";
import type { PublicUser } from "@/types";

async function fetchPublicUser(id: string): Promise<PublicUser | null> {
  "use cache";
  cacheLife("minutes");
  try {
    return await api(`/users/${id}/profile`, parsePublicUser, { token: null });
  } catch (error: unknown) {
    if (error instanceof ApiError && [400, 403, 404].includes(error.status)) return null;
    throw error;
  }
}

export async function getPublicUserCard(id: string): Promise<PublicUser | null> {
  if (!OBJECT_ID.test(id)) return null;
  try {
    return await fetchPublicUser(id.toLowerCase());
  } catch {
    return null;
  }
}
