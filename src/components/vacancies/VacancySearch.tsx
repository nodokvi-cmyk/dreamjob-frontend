"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useTransition, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { vacanciesHref } from "@/lib/vacancyQuery";
import type { VacancyQuery } from "@/types";

interface VacancySearchValue {
  apply: (patch: VacancyQuery) => void;
  replace: (query: VacancyQuery) => void;
  latest: () => VacancyQuery;
  pending: boolean;
}

const VacancySearchContext = createContext<VacancySearchValue | null>(null);

export function useVacancySearch(): VacancySearchValue {
  const value = useContext(VacancySearchContext);
  if (!value) throw new Error("useVacancySearch must be used inside VacancySearchProvider");
  return value;
}

export function VacancySearchProvider({ query, children }: { query: VacancyQuery; children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const target = useRef(query);

  useEffect(() => {
    target.current = query;
  }, [query]);

  const replace = (next: VacancyQuery) => {
    target.current = next;
    startTransition(() => {
      router.push(vacanciesHref(next), { scroll: false });
    });
  };

  const value: VacancySearchValue = {
    apply: (patch) => replace({ ...target.current, ...patch, page: undefined }),
    replace,
    latest: () => target.current,
    pending,
  };

  return <VacancySearchContext value={value}>{children}</VacancySearchContext>;
}

export function SearchResultsRegion({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useVacancySearch();
  return (
    <div
      aria-busy={pending}
      className={cn(
        "transition-opacity duration-200",
        pending && "pointer-events-none opacity-55 motion-safe:delay-150",
        className,
      )}
    >
      {children}
    </div>
  );
}
