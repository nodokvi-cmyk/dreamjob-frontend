"use client";

import { Google_Sans } from "next/font/google";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useGoogleReturn } from "@/components/auth/useGoogleReturn";
import { FormAlert } from "@/components/form/FormAlert";
import { googleReturn } from "@/lib/authDraft";
import { googleStartHref } from "@/lib/googleRedirect";
import { safeNext } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/types";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

const googleSans = Google_Sans({ subsets: ["latin"], weight: ["500"], display: "swap", adjustFontFallback: false });

interface GoogleButtonProps {
  accountType: AccountType;
}

export function GoogleButton({ accountType }: GoogleButtonProps) {
  if (!CLIENT_ID) return null;
  return <GoogleButtonInner accountType={accountType} />;
}

function GoogleButtonInner({ accountType }: GoogleButtonProps) {
  const next = safeNext(useSearchParams().get("next"));
  const returned = useGoogleReturn(accountType);
  const error = returned && returned.account === accountType ? returned.error : null;

  useEffect(() => {
    googleReturn.save(accountType, next);
  }, [accountType, next]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="transit-label text-xs">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <a
        href={googleStartHref(accountType)}
        className={cn(
          googleSans.className,
          "flex h-12 w-full items-center justify-center gap-2.5 rounded-[4px] border border-[#747775] bg-white px-3 text-sm leading-5 font-medium text-[#1F1F1F] transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:border-[#8E918F] dark:bg-[#131314] dark:text-[#E3E3E3] dark:hover:brightness-125",
        )}
      >
        <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-[2px] bg-white">
          <span className="block size-5 bg-[url('/google-g.png')] bg-contain bg-center bg-no-repeat" />
        </span>
        <span>Continue with Google</span>
      </a>
      <p className="text-center text-sm text-muted-foreground">
        Google opens its own page, then brings you back here.
      </p>
      {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
    </div>
  );
}
