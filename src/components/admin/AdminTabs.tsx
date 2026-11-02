"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive } from "@/lib/account";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const TABS = [
  { href: routes.adminVacancies, label: "Vacancies" },
  { href: routes.adminCompanies, label: "Companies" },
] as const;

export function AdminTabs() {
  const pathname = usePathname();
  return (
    <div className="border-b border-border bg-background">
      <nav aria-label="Admin" className="mx-auto flex w-full max-w-7xl gap-1 px-4 sm:px-6 lg:px-8">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-12 items-center px-3 transit-label text-[0.9rem] text-muted-foreground transition-colors hover:text-foreground",
                "after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full after:bg-line-scarlet after:opacity-0 after:transition-opacity",
                active && "text-foreground after:opacity-100",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
