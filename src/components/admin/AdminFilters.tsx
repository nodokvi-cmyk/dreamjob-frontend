"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useId, type ReactNode } from "react";
import { useDraft } from "@/components/vacancies/useDraft";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import {
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  SORT_LABELS,
  VACANCY_SORTS,
  WORK_MODE_LABELS,
  WORK_MODES,
} from "@/lib/vacancy";
import { QUERY_MAX } from "@/lib/vacancyQuery";
import type { AdminVacancyQuery } from "@/types";

const ANY = "any";

interface AdminFiltersProps {
  query: AdminVacancyQuery;
  companyLabel: string | null;
  navigate: (patch: Partial<AdminVacancyQuery>) => void;
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={htmlFor} className="transit-label text-[0.8rem] text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export function AdminFilters({ query, companyLabel, navigate }: AdminFiltersProps) {
  const id = useId();
  const search = useDraft(query.q ?? "", (value) => navigate({ q: value || undefined }));
  const categories =
    query.category && !CATEGORIES.includes(query.category)
      ? [query.category, ...CATEGORIES]
      : CATEGORIES;

  return (
    <div className="flex flex-col gap-4">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const value = search.draft.trim();
          search.markSent(value);
          navigate({ q: value || undefined });
        }}
        className="flex h-12 w-full items-center gap-3 rounded-xl border-2 border-foreground bg-card px-3 lg:max-w-md"
      >
        <SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
        <label htmlFor={`${id}-q`} className="sr-only">
          Search vacancies
        </label>
        <input
          id={`${id}-q`}
          type="search"
          value={search.draft}
          onChange={(event) => search.setDraft(event.target.value)}
          maxLength={QUERY_MAX}
          placeholder="Search by title or description"
          autoComplete="off"
          className="h-full w-full min-w-0 bg-transparent text-[1.05rem] outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
      </form>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Category" htmlFor={`${id}-category`}>
          <Select
            value={query.category ?? ANY}
            onValueChange={(value) => navigate({ category: value === ANY ? undefined : value })}
          >
            <SelectTrigger id={`${id}-category`} className="h-11 w-full">
              <SelectValue placeholder="Any category">{query.category ?? "Any category"}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value={ANY}>Any category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Work mode" htmlFor={`${id}-mode`}>
          <Select
            value={query.workMode ?? ANY}
            onValueChange={(value) => navigate({ workMode: WORK_MODES.find((mode) => mode === value) })}
          >
            <SelectTrigger id={`${id}-mode`} className="h-11 w-full">
              <SelectValue placeholder="Any work mode">
                {query.workMode ? WORK_MODE_LABELS[query.workMode] : "Any work mode"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value={ANY}>Any work mode</SelectItem>
              {WORK_MODES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {WORK_MODE_LABELS[mode]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Employment" htmlFor={`${id}-type`}>
          <Select
            value={query.employmentType ?? ANY}
            onValueChange={(value) =>
              navigate({ employmentType: EMPLOYMENT_TYPES.find((type) => type === value) })
            }
          >
            <SelectTrigger id={`${id}-type`} className="h-11 w-full">
              <SelectValue placeholder="Any contract">
                {query.employmentType ? EMPLOYMENT_TYPE_LABELS[query.employmentType] : "Any contract"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value={ANY}>Any contract</SelectItem>
              {EMPLOYMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {EMPLOYMENT_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Sort" htmlFor={`${id}-sort`}>
          <Select
            value={query.sort ?? VACANCY_SORTS[0]}
            onValueChange={(value) => navigate({ sort: VACANCY_SORTS.find((sort) => sort === value) })}
          >
            <SelectTrigger id={`${id}-sort`} className="h-11 w-full">
              <SelectValue>{SORT_LABELS[query.sort ?? VACANCY_SORTS[0]]}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {VACANCY_SORTS.map((sort) => (
                <SelectItem key={sort} value={sort}>
                  {SORT_LABELS[sort]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {companyLabel ? (
        <div>
          <button
            type="button"
            onClick={() => navigate({ companyId: undefined })}
            className="inline-flex h-9 max-w-full items-center gap-1.5 rounded-full border border-foreground/20 bg-card pr-2 pl-3.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/45 hover:bg-muted"
          >
            <span className="truncate">Company: {companyLabel}</span>
            <XIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            <span className="sr-only">Remove company filter</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
