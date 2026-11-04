import { TOO_MANY_MESSAGE, networkError } from "@/services/api";
import type { AccountType } from "@/types";

export const GOOGLE_ERROR_PARAM = "google_error";

const GOOGLE_ERROR_CODES = [
  "csrf",
  "missing",
  "rejected",
  "conflict",
  "busy",
  "unreachable",
  "server",
  "failed",
] as const;

export type GoogleErrorCode = (typeof GOOGLE_ERROR_CODES)[number];

export function parseGoogleErrorCode(value: string | null): GoogleErrorCode | null {
  return GOOGLE_ERROR_CODES.find((code) => code === value) ?? null;
}

export function googleErrorCodeForStatus(status: number): GoogleErrorCode {
  if (status === 401) return "rejected";
  if (status === 409) return "conflict";
  if (status === 429) return "busy";
  if (status === 0) return "unreachable";
  if (status >= 500) return "server";
  return "failed";
}

export function googleErrorMessage(code: GoogleErrorCode, account: AccountType): string {
  switch (code) {
    case "csrf":
      return "Google sign-in couldn't be verified. Try again.";
    case "missing":
      return "Google didn't send a sign-in token. Try again.";
    case "rejected":
      return "Google sign-in didn't work for this account. Try again, or use your email.";
    case "conflict":
      return account === "company"
        ? "This Google email already belongs to a job seeker account. Switch to Job seeker above."
        : "This Google email already belongs to a company account. Switch to Company above.";
    case "busy":
      return TOO_MANY_MESSAGE;
    case "unreachable":
      return networkError().message;
    case "server":
      return "Something went wrong on our side. Try again soon.";
    case "failed":
      return "Google sign-in didn't work. Try again, or use your email.";
  }
}

export function googleCallbackPath(account: AccountType): string {
  return account === "company" ? "/api/google/company" : "/api/google/user";
}

export function tokenFromFragment(hash: string): string | null {
  const token = new URLSearchParams(hash.replace(/^#/, "")).get("token");
  return token ? token : null;
}
