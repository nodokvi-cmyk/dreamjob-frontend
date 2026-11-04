import { isObject } from "@/lib/decode";
import { safeNext } from "@/lib/routes";
import type { AccountType } from "@/types";

export type CodeFlow = "verify" | "reset";

export interface CodeDraft {
  flow: CodeFlow;
  email: string;
  account: AccountType;
  resend: boolean;
}

export interface EmailPrefill {
  email: string;
  account: AccountType;
  passwordReset: boolean;
}

const CODE_KEY = "dreamjob.codeDraft";
const PREFILL_KEY = "dreamjob.emailPrefill";

function readJson(key: string): unknown {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw === null) return null;
    const data: unknown = JSON.parse(raw);
    return data;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: object) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function remove(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {}
}

function accountOf(value: unknown): AccountType | null {
  if (value === "user" || value === "company") return value;
  return null;
}

export const codeDraft = {
  read(flow: CodeFlow): CodeDraft | null {
    const data = readJson(CODE_KEY);
    if (!isObject(data) || data.flow !== flow) return null;
    const account = accountOf(data.account);
    if (typeof data.email !== "string" || data.email === "" || account === null) return null;
    return { flow, email: data.email, account, resend: data.resend === true };
  },
  save(draft: CodeDraft) {
    writeJson(CODE_KEY, draft);
  },
  clear() {
    remove(CODE_KEY);
  },
};

export const emailPrefill = {
  read(account: AccountType): EmailPrefill | null {
    const data = readJson(PREFILL_KEY);
    if (!isObject(data) || accountOf(data.account) !== account) return null;
    if (typeof data.email !== "string") return null;
    return { email: data.email, account, passwordReset: data.passwordReset === true };
  },
  peek(): EmailPrefill | null {
    const data = readJson(PREFILL_KEY);
    const account = isObject(data) ? accountOf(data.account) : null;
    return account ? emailPrefill.read(account) : null;
  },
  save(email: string, account: AccountType, passwordReset = false) {
    if (email === "") return;
    writeJson(PREFILL_KEY, { email, account, passwordReset });
  },
  dropNotice(account: AccountType) {
    const current = emailPrefill.read(account);
    if (current?.passwordReset) emailPrefill.save(current.email, account);
  },
  clear() {
    remove(PREFILL_KEY);
  },
};

export type EmailChangeStep = "current" | "new";

export interface EmailChangeDraft {
  accountId: string;
  newEmail: string;
  step: EmailChangeStep;
}

const EMAIL_CHANGE_KEY = "dreamjob.emailChange";

export const emailChangeDraft = {
  read(accountId: string): EmailChangeDraft | null {
    const data = readJson(EMAIL_CHANGE_KEY);
    if (!isObject(data) || data.accountId !== accountId) return null;
    if (typeof data.newEmail !== "string" || data.newEmail === "") return null;
    if (data.step !== "current" && data.step !== "new") return null;
    return { accountId, newEmail: data.newEmail, step: data.step };
  },
  save(draft: EmailChangeDraft) {
    writeJson(EMAIL_CHANGE_KEY, draft);
  },
  clear() {
    remove(EMAIL_CHANGE_KEY);
  },
};

export interface GoogleReturn {
  account: AccountType;
  next: string | null;
}

const GOOGLE_RETURN_KEY = "dreamjob.googleReturn";

export const googleReturn = {
  read(): GoogleReturn | null {
    const data = readJson(GOOGLE_RETURN_KEY);
    const account = isObject(data) ? accountOf(data.account) : null;
    if (!isObject(data) || account === null) return null;
    return { account, next: safeNext(typeof data.next === "string" ? data.next : null) };
  },
  save(account: AccountType, next: string | null) {
    writeJson(GOOGLE_RETURN_KEY, { account, next });
  },
  clear() {
    remove(GOOGLE_RETURN_KEY);
  },
};

export function clearAuthDrafts() {
  codeDraft.clear();
  emailPrefill.clear();
  googleReturn.clear();
}
