import type { AuthRole, TokenPayload } from "@/types";

const TOKEN_KEY = "token";
const AUTH_ROLES: readonly AuthRole[] = ["user", "admin", "company"];
const OBJECT_ID = /^[a-f0-9]{24}$/i;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function read(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return read();
  },
  set(token: string) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {}
    emit();
  },
  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {}
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY || event.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
};

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeToken(token: string): TokenPayload | null {
  const segment = token.split(".")[1];
  if (!segment) return null;
  try {
    const data: unknown = JSON.parse(base64UrlDecode(segment));
    if (typeof data !== "object" || data === null) return null;
    if (!("accountId" in data) || !("accountRole" in data) || !("exp" in data)) {
      return null;
    }
    const { accountId, accountRole, exp } = data;
    const role = AUTH_ROLES.find((option) => option === accountRole);
    if (typeof accountId !== "string" || !OBJECT_ID.test(accountId)) return null;
    if (role === undefined || typeof exp !== "number") return null;
    return { accountId, accountRole: role, exp };
  } catch {
    return null;
  }
}
