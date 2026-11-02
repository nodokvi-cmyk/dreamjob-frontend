"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { isActive } from "@/lib/account";
import { routes } from "@/lib/routes";

export function CompanyNotice() {
  return (
    <Suspense fallback={null}>
      <NoticeBar />
    </Suspense>
  );
}

function NoticeBar() {
  const pathname = usePathname();
  const { session } = useAuth();
  if (!session || session.accountRole !== "company") return null;
  if (isActive(pathname, routes.dashboard)) return null;
  const { account } = session;
  if (account.passwordSetupRequired) return null;
  if (account.isProfileComplete && account.approved) return null;

  const incomplete = !account.isProfileComplete;

  return (
    <section aria-label="Company account notice" className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6 lg:px-8">
        <p className="flex flex-1 items-start gap-3 text-[0.95rem]">
          <span
            aria-hidden
            className="mt-[5px] size-3 shrink-0 rounded-full bg-line-amber ring-4 ring-line-amber/25"
          />
          <span>
            <span className="font-semibold">
              {incomplete ? "Complete your company profile." : "Awaiting admin approval."}
            </span>{" "}
            <span className="text-muted-foreground">
              {incomplete
                ? "Add your company name and description so our team can review your account."
                : "You can publish vacancies once our team approves your company."}
            </span>
          </span>
        </p>
        {incomplete ? (
          <Link
            href={routes.profile}
            className="transit-label ml-6 inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-cobalt-ink hover:underline sm:ml-0"
          >
            Open profile
            <ArrowRightIcon aria-hidden className="size-4" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
