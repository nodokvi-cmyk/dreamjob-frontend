import { boolean, object, string } from "@/lib/decode";
import { api } from "@/services/api";
import { parseCompany } from "@/services/companies.service";
import { parseUser } from "@/services/users.service";
import type {
  AccountType,
  CompanySignUpInput,
  CurrentCompany,
  CurrentUser,
  MessageResponse,
  ResetPasswordInput,
  Session,
  TokenPayload,
  TokenResponse,
  UserSignUpInput,
} from "@/types";

function authPath(type: AccountType, action: string): string {
  return `/auth/${type === "company" ? "companies" : "users"}/${action}`;
}

export function signUpUser(input: UserSignUpInput): Promise<MessageResponse> {
  return api(authPath("user", "sign-up"), parseMessage, {
    method: "POST",
    body: input,
    token: null,
  });
}

export function signUpCompany(input: CompanySignUpInput): Promise<MessageResponse> {
  return api(authPath("company", "sign-up"), parseMessage, {
    method: "POST",
    body: input,
    token: null,
  });
}

export function verifyEmail(
  type: AccountType,
  email: string,
  code: string,
): Promise<TokenResponse> {
  return api(authPath(type, "verify-email"), parseToken, {
    method: "POST",
    body: { email, code },
    token: null,
  });
}

export function resendCode(type: AccountType, email: string): Promise<MessageResponse> {
  return api(authPath(type, "resend-code"), parseMessage, {
    method: "POST",
    body: { email },
    token: null,
  });
}

export function signInWithPassword(
  type: AccountType,
  email: string,
  password: string,
): Promise<TokenResponse> {
  return api(authPath(type, "sign-in"), parseToken, {
    method: "POST",
    body: { email, password },
    token: null,
  });
}

export function signInWithGoogle(type: AccountType, idToken: string): Promise<TokenResponse> {
  return api(authPath(type, "google"), parseToken, {
    method: "POST",
    body: { idToken },
    token: null,
  });
}

export function forgotPassword(type: AccountType, email: string): Promise<MessageResponse> {
  return api(authPath(type, "forgot-password"), parseMessage, {
    method: "POST",
    body: { email },
    token: null,
  });
}

export function resetPassword(
  type: AccountType,
  input: ResetPasswordInput,
): Promise<MessageResponse> {
  return api(authPath(type, "reset-password"), parseMessage, {
    method: "POST",
    body: input,
    token: null,
  });
}

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
