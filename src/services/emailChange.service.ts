import { api } from "@/services/api";
import { parseMessage } from "@/services/auth.service";
import type { AccountType, MessageResponse } from "@/types";

function emailChangePath(type: AccountType, action: string): string {
  return `/auth/${type === "company" ? "companies" : "users"}/email-change/${action}`;
}

export function requestEmailChange(type: AccountType, newEmail: string): Promise<MessageResponse> {
  return api(emailChangePath(type, "request"), parseMessage, {
    method: "POST",
    body: { newEmail },
  });
}

export function confirmCurrentEmail(type: AccountType, code: string): Promise<MessageResponse> {
  return api(emailChangePath(type, "confirm-current"), parseMessage, {
    method: "POST",
    body: { code },
  });
}

export function resendNewEmailCode(type: AccountType): Promise<MessageResponse> {
  return api(emailChangePath(type, "resend-new"), parseMessage, { method: "POST" });
}

export function confirmNewEmail(type: AccountType, code: string): Promise<MessageResponse> {
  return api(emailChangePath(type, "confirm-new"), parseMessage, {
    method: "POST",
    body: { code },
  });
}
