"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useId, type ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDraft } from "@/components/vacancies/useDraft";
import { BOARD_SORTS, BOARD_SORT_LABELS, boardHref, hasBoardFilters } from "@/lib/board";
import { CATEGORIES } from "@/lib/categories";
import {
  CURRENCIES,
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  WORK_MODE_LABELS,
  WORK_MODES,
} from "@/lib/vacancy";
import { LOCATION_MAX, QUERY_MAX, SALARY_MAX } from "@/lib/vacancyQuery";
import type { BoardQuery } from "@/types";

const ANY = "any";
const DEFAULT_SORT = "default";

interface BoardFiltersProps {
  query: BoardQuery;
  navigate: (patch: Partial<BoardQuery>) => void;
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

function wholeAmount(value: string): number | undefined {
  const cleaned = value.replace(/[\s,]/g, "");
  if (!/^\d{1,10}$/.test(cleaned)) return undefined;
  const amount = Number(cleaned);
  return amount >= 1 && amount <= SALARY_MAX ? amount : undefined;
}

export function BoardFilters({ query, navigate }: BoardFiltersProps) {
  const id = useId();
  const search = useDraft(query.q ?? "", (value) => navigate({ q: value || undefined }));
  const city = useDraft(query.location ?? "", (value) => navigate({ location: value || undefined }));
  const minPay = useDraft(query.salaryMin === undefined ? "" : String(query.salaryMin), (value) =>
    navigate({ salaryMin: wholeAmount(value) }),
  );
  const maxPay = useDraft(query.salaryMax === undefined ? "" : String(query.salaryMax), (value) =>
    navigate({ salaryMax: wholeAmount(value) }),
  );
  const categories =
    query.category && !CATEGORIES.includes(query.category) ? [query.category, ...CATEGORIES] : CATEGORIES;
  const defaultSortLabel = query.q ? "Best match" : BOARD_SORT_LABELS["-date"];
  const sortOptions = query.q ? BOARD_SORTS : BOARD_SORTS.filter((sort) => sort !== "-date");
  const paying = query.salaryMin !== undefined || query.salaryMax !== undefined;

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
        className="flex h-12 w-full items-center gap-3 rounded-xl border-2 border-foreground bg-card px-3 has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/40 lg:max-w-xl"
      >
        <SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
        <label htmlFor={`${id}-q`} className="sr-only">
          Search publications
        </label>
        <input
          id={`${id}-q`}
          type="search"
          value={search.draft}
          onChange={(event) => search.setDraft(event.target.value)}
          maxLength={QUERY_MAX}
          placeholder="Search titles, skills and about text"
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
        <Field label="City or region" htmlFor={`${id}-location`}>
          <input
            id={`${id}-location`}
            value={city.draft}
            onChange={(event) => city.setDraft(event.target.value)}
            maxLength={LOCATION_MAX}
            placeholder="Any location"
            autoComplete="off"
            className="h-11 w-full min-w-0 rounded-[10px] border border-input bg-card px-3 text-[0.95rem] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
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
        <Field label="Contract" htmlFor={`${id}-type`}>
          <Select
            value={query.employmentType ?? ANY}
            onValueChange={(value) => navigate({ employmentType: EMPLOYMENT_TYPES.find((type) => type === value) })}
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
        <Field label="Pay from" htmlFor={`${id}-min`}>
          <input
            id={`${id}-min`}
            inputMode="numeric"
            value={minPay.draft}
            onChange={(event) => minPay.setDraft(event.target.value.replace(/[^\d\s,]/g, ""))}
            maxLength={13}
            placeholder="Any"
            autoComplete="off"
            className="h-11 w-full min-w-0 rounded-[10px] border border-input bg-card px-3 text-[0.95rem] tabular outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </Field>
        <Field label="Pay up to" htmlFor={`${id}-max`}>
          <input
            id={`${id}-max`}
            inputMode="numeric"
            value={maxPay.draft}
            onChange={(event) => maxPay.setDraft(event.target.value.replace(/[^\d\s,]/g, ""))}
            maxLength={13}
            placeholder="Any"
            autoComplete="off"
            className="h-11 w-full min-w-0 rounded-[10px] border border-input bg-card px-3 text-[0.95rem] tabular outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </Field>
        <Field label="Currency" htmlFor={`${id}-currency`}>
          <Select
            value={query.currency ?? ANY}
            onValueChange={(value) => navigate({ currency: CURRENCIES.find((currency) => currency === value) })}
          >
            <SelectTrigger id={`${id}-currency`} className="h-11 w-full">
              <SelectValue placeholder="Any currency">{query.currency ?? "Any currency"}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value={ANY}>Any currency</SelectItem>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Sort" htmlFor={`${id}-sort`}>
          <Select
            value={query.sort ?? DEFAULT_SORT}
            onValueChange={(value) => navigate({ sort: BOARD_SORTS.find((sort) => sort === value) })}
          >
            <SelectTrigger id={`${id}-sort`} className="h-11 w-full">
              <SelectValue>{query.sort ? BOARD_SORT_LABELS[query.sort] : defaultSortLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              <SelectItem value={DEFAULT_SORT}>{defaultSortLabel}</SelectItem>
              {sortOptions.map((sort) => (
                <SelectItem key={sort} value={sort}>
                  {BOARD_SORT_LABELS[sort]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {paying ? <p>Publications without a desired pay are left out while a pay filter is set.</p> : null}
        {hasBoardFilters(query) || query.sort ? (
          <Link href={boardHref({ page: 1 })} scroll={false} className="font-medium text-cobalt-ink underline-offset-4 hover:underline">
            Clear filters
          </Link>
        ) : null}
      </div>
    </div>
  );
}
