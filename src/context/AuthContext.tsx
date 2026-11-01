"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { decodeToken, tokenStore } from "@/lib/token";
import { ApiError } from "@/services/api";
import { getSession } from "@/services/auth.service";
import type { Session } from "@/types";

export type AuthStatus = "loading" | "anonymous" | "authenticated" | "error";

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  error: string | null;
  signIn: (token: string) => Promise<Session>;
  signOut: () => void;
  refresh: () => Promise<Session>;
  retry: () => void;
}

interface Loaded {
  token: string;
  revision: number;
  session: Session | null;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MAX_TIMEOUT = 2_147_483_647;

function getServerToken(): undefined {
  return undefined;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Could not load your account.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(
    tokenStore.subscribe,
    tokenStore.get,
    getServerToken,
  );
  const [revision, setRevision] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  const payload = useMemo(() => (token ? decodeToken(token) : null), [token]);
  const isCurrent =
    loaded !== null && loaded.token === token && loaded.revision === revision;

  useEffect(() => {
    if (token && !payload) tokenStore.clear();
  }, [token, payload]);

  useEffect(() => {
    if (!payload) return;
    const remaining = payload.exp * 1000 - Date.now();
    if (remaining <= 0) {
      tokenStore.clear();
      return;
    }
    const timer = window.setTimeout(
      () => tokenStore.clear(),
      Math.min(remaining, MAX_TIMEOUT),
    );
    return () => window.clearTimeout(timer);
  }, [payload]);

  useEffect(() => {
    if (!token || !payload || isCurrent) return;
    const controller = new AbortController();
    getSession(payload, token, controller.signal)
      .then((session) => {
        setLoaded({ token, revision, session, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
          tokenStore.clear();
          return;
        }
        setLoaded({ token, revision, session: null, error: messageOf(error) });
      });
    return () => controller.abort();
  }, [token, payload, revision, isCurrent]);

  const load = useCallback(
    async (nextToken: string) => {
      const nextPayload = decodeToken(nextToken);
      if (!nextPayload) throw new Error("The server sent an invalid sign-in token.");
      const session = await getSession(nextPayload, nextToken);
      setLoaded({ token: nextToken, revision, session, error: null });
      return session;
    },
    [revision],
  );

  const signIn = useCallback(
    async (nextToken: string) => {
      const session = await load(nextToken);
      tokenStore.set(nextToken);
      return session;
    },
    [load],
  );

  const signOut = useCallback(() => {
    tokenStore.clear();
    window.location.assign(window.location.origin);
  }, []);

  const refresh = useCallback(async () => {
    const current = tokenStore.get();
    if (!current) throw new Error("You're signed out. Sign in again.");
    return load(current);
  }, [load]);

  const retry = useCallback(() => setRevision((value) => value + 1), []);

  const fresh = loaded !== null && loaded.token === token ? loaded : null;

  let status: AuthStatus;
  if (token === undefined) status = "loading";
  else if (token === null || !payload) status = "anonymous";
  else if (fresh?.session) status = "authenticated";
  else if (fresh?.error && isCurrent) status = "error";
  else status = "loading";

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session: status === "authenticated" ? (fresh?.session ?? null) : null,
      error: status === "error" ? (fresh?.error ?? null) : null,
      signIn,
      signOut,
      refresh,
      retry,
    }),
    [status, fresh, signIn, signOut, refresh, retry],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
