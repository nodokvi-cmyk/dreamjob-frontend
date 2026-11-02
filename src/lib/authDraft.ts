import { isObject } from "@/lib/decode";
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

export function clearAuthDrafts() {
  codeDraft.clear();
  emailPrefill.clear();
}
