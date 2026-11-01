import { boolean, object, string } from "@/lib/decode";
import { api } from "@/services/api";
import { parseCompany } from "@/services/companies.service";
import { parseUser } from "@/services/users.service";
import type {
  CurrentCompany,
  CurrentUser,
  MessageResponse,
  Session,
  TokenPayload,
  TokenResponse,
} from "@/types";

export function parseToken(data: unknown): TokenResponse {
  return { token: string(object(data), "token") };
}

export function parseMessage(data: unknown): MessageResponse {
  return { message: string(object(data), "message") };
}

function parseCurrentUser(data: unknown): CurrentUser {
  return {
    ...parseUser(data),
    passwordSetupRequired: boolean(object(data), "passwordSetupRequired"),
  };
}

function parseCurrentCompany(data: unknown): CurrentCompany {
  return {
    ...parseCompany(data),
    passwordSetupRequired: boolean(object(data), "passwordSetupRequired"),
  };
}

export async function getSession(
  payload: TokenPayload,
  token: string,
  signal?: AbortSignal,
): Promise<Session> {
  const { accountId, accountRole } = payload;
  if (accountRole === "company") {
    const account = await api("/auth/me", parseCurrentCompany, { token, signal });
    return { accountId, accountRole, account };
  }
  const account = await api("/auth/me", parseCurrentUser, { token, signal });
  return { accountId, accountRole, account };
}
