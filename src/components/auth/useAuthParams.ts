"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { accountParam, accountTypeFrom } from "@/lib/account";
import { safeNext, withQuery } from "@/lib/routes";
import type { AccountType } from "@/types";

export interface AuthParams {
  accountType: AccountType;
  setAccountType: (type: AccountType) => void;
  email: string;
  next: string | null;
  flag: (name: string) => boolean;
  dropFlag: (name: string) => void;
  link: (path: string, extra?: Record<string, string | null | undefined>) => string;
}

export function useAuthParams(): AuthParams {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const accountType = accountTypeFrom(params.get("account"));
  const email = params.get("email") ?? "";
  const next = safeNext(params.get("next"));

  const replaceParam = useCallback(
    (name: string, value: string | null) => {
      const query = new URLSearchParams(params.toString());
      if (value) query.set(name, value);
      else query.delete(name);
      const search = query.toString();
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const setAccountType = useCallback(
    (type: AccountType) => replaceParam("account", accountParam(type)),
    [replaceParam],
  );

  const dropFlag = useCallback((name: string) => replaceParam(name, null), [replaceParam]);

  const flag = useCallback((name: string) => params.get(name) === "1", [params]);

  const link = useCallback(
    (path: string, extra: Record<string, string | null | undefined> = {}) =>
      withQuery(path, { account: accountParam(accountType), next, ...extra }),
    [accountType, next],
  );

  return { accountType, setAccountType, email, next, flag, dropFlag, link };
}
