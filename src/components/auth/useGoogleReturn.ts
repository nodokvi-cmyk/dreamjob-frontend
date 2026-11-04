"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { accountParam } from "@/lib/account";
import { googleReturn } from "@/lib/authDraft";
import { problem, type FormError } from "@/lib/errors";
import { GOOGLE_ERROR_PARAM, googleErrorMessage, parseGoogleErrorCode } from "@/lib/googleRedirect";
import { routes, withQuery } from "@/lib/routes";
import type { AccountType } from "@/types";

interface GoogleReturnError {
  error: FormError;
  account: AccountType;
  target: string;
}

export function useGoogleReturn(fallback: AccountType): GoogleReturnError | null {
  const params = useSearchParams();
  const router = useRouter();
  const [returned] = useState<GoogleReturnError | null>(() => {
    const code = parseGoogleErrorCode(params.get(GOOGLE_ERROR_PARAM));
    if (code === null) return null;
    const saved = googleReturn.read();
    const account = saved?.account ?? fallback;
    return {
      error: problem(googleErrorMessage(code, account)),
      account,
      target: withQuery(routes.signIn, { account: accountParam(account), next: saved?.next ?? null }),
    };
  });

  useEffect(() => {
    if (returned) router.replace(returned.target, { scroll: false });
  }, [returned, router]);

  return returned;
}
