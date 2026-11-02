"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { accountParam, accountTypeFrom } from "@/lib/account";
import { safeNext, withQuery } from "@/lib/routes";
import type { AccountType } from "@/types";

export interface AuthParams {
  accountType: AccountType;
  setAccountType: (type: AccountType) => void;
  next: string | null;
  link: (path: string, type?: AccountType) => string;
}

export function useAuthParams(fallback: AccountType = "user"): AuthParams {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get("account");
  const accountType = raw === null ? fallback : accountTypeFrom(raw);
  const next = safeNext(params.get("next"));

  const setAccountType = useCallback(
    (type: AccountType) => {
      const query = new URLSearchParams(params.toString());
      const value = accountParam(type) ?? (fallback === "user" ? null : type);
      if (value) query.set("account", value);
      else query.delete("account");
      const search = query.toString();
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    },
    [params, pathname, router, fallback],
  );

  const link = useCallback(
    (path: string, type: AccountType = accountType) =>
      withQuery(path, { account: accountParam(type), next }),
    [accountType, next],
  );

  return { accountType, setAccountType, next, link };
}
