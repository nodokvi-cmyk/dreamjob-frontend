"use client";

import { ArrowRightIcon, MapPinIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useVacancySearch } from "@/components/vacancies/VacancySearch";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import {
  CURRENCIES,
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  SORT_LABELS,
  VACANCY_SORTS,
  WORK_MODE_LABELS,
  WORK_MODES,
} from "@/lib/vacancy";
import {
  LOCATION_MAX,
  QUERY_MAX,
  SALARY_MAX,
  activeFilters,
  clearedQuery,
  type FilterKey,
} from "@/lib/vacancyQuery";
import type { VacancyQuery } from "@/types";

const ANY = "any";
const TYPING_DELAY = 450;

function useDraft(incoming: string, commit: (value: string) => void) {
  const [draft, setDraft] = useState(incoming);
  const [synced, setSynced] = useState(incoming);
  const [sent, setSent] = useState(incoming);

  if (incoming !== synced) {
    setSynced(incoming);
    if (incoming !== sent) {
      setSent(incoming);
      setDraft(incoming);
    }
  }

  const onCommit = useEffectEvent((value: string) => {
    setSent(value);
    commit(value);
  });

  useEffect(() => {
    const value = draft.trim();
    if (value === sent) return;
    const timer = window.setTimeout(() => onCommit(value), TYPING_DELAY);
    return () => window.clearTimeout(timer);
  }, [draft, sent]);

  return { draft, setDraft, markSent: setSent };
}

function sheetFilterCount(query: VacancyQuery): number {
  return activeFilters(query).filter((filter) => filter.key !== "q" && filter.key !== "location")
    .length;
}

export function FilterBar({ query, total }: { query: VacancyQuery; total: number | null }) {
  const { apply, pending } = useVacancySearch();
  const [sheetOpen, setSheetOpen] = useState(false);
  const keyword = useDraft(query.q ?? "", (value) => apply({ q: value || undefined }));
  const place = useDraft(query.location ?? "", (value) => apply({ location: value || undefined }));
  const extraCount = sheetFilterCount(query);

  useLayoutEffect(() => () => setSheetOpen(false), []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = keyword.draft.trim();
    const location = place.draft.trim();
    keyword.markSent(q);
    place.markSent(location);
    apply({ q: q || undefined, location: location || undefined });
  };

  return (
    <div className="flex flex-col gap-4">
      <form
        role="search"
        onSubmit={submit}
        className="flex w-full flex-col gap-1 rounded-xl border-2 border-foreground bg-card p-1.5 sm:flex-row sm:items-center sm:gap-0"
      >
        <label className="flex flex-1 items-center gap-3 px-3">
          <SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
          <span className="sr-only">Job title or keyword</span>
          <input
            name="q"
            type="search"
            value={keyword.draft}
            onChange={(event) => keyword.setDraft(event.target.value)}
            maxLength={QUERY_MAX}
            placeholder="Job title or keyword"
            autoComplete="off"
            className="h-11 w-full min-w-0 bg-transparent text-[1.05rem] outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
        <span aria-hidden className="hidden h-7 w-px bg-border sm:block" />
        <label className="flex items-center gap-3 border-t border-border px-3 sm:w-56 sm:border-t-0">
          <MapPinIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
          <span className="sr-only">City</span>
          <input
            name="location"
            value={place.draft}
            onChange={(event) => place.setDraft(event.target.value)}
            maxLength={LOCATION_MAX}
            placeholder="City"
            autoComplete="address-level2"
            className="h-11 w-full min-w-0 bg-transparent text-[1.05rem] outline-none placeholder:text-muted-foreground"
          />
        </label>
        <Button type="submit" className="h-11 sm:ml-1">
          Search
          <ArrowRightIcon aria-hidden />
        </Button>
      </form>

      <div className="hidden md:block">
        <FilterControls query={query} layout="row" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden">
              <SlidersHorizontalIcon aria-hidden />
              Filters
              {extraCount > 0 ? (
                <span className="grid size-5 place-items-center rounded-full bg-foreground text-xs font-semibold tracking-normal text-background tabular">
                  {extraCount}
                </span>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[88dvh] gap-0 rounded-t-[22px] border-border bg-background p-0"
          >
            <SheetHeader className="border-b border-border px-5 pt-5 pb-4">
              <SheetTitle className="font-display text-2xl font-bold tracking-[-0.01em] uppercase">
                Filters
              </SheetTitle>
              <SheetDescription>Every change updates the list right away.</SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto px-5 py-5">
              <FilterControls query={query} layout="stack" />
            </div>
            <SheetFooter className="flex-row gap-3 border-t border-border px-5 py-4">
              <ClearAll query={query} className="flex-1" variant="outline" size="lg" />
              <Button size="lg" className="flex-[2]" onClick={() => setSheetOpen(false)}>
                {pending ? "Updating…" : total === null ? "Show vacancies" : `Show ${total} ${total === 1 ? "vacancy" : "vacancies"}`}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <FilterChips query={query} />
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children, className }: { label: string; htmlFor: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="transit-label text-[0.8rem] text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function FilterControls({ query, layout }: { query: VacancyQuery; layout: "row" | "stack" }) {
  const { apply } = useVacancySearch();
  const id = useId();
  const categories =
    query.category && !CATEGORIES.includes(query.category)
      ? [...CATEGORIES, query.category]
      : CATEGORIES;
  const salary = useDraft(query.salaryMin === undefined ? "" : String(query.salaryMin), (value) => {
    const amount = Number(value);
    apply({ salaryMin: value && amount >= 1 && amount <= SALARY_MAX ? amount : undefined });
  });
  const trigger = "w-full";

  return (
    <div
      className={cn(
        "grid gap-4",
        layout === "row"
          ? "grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.35fr)] gap-3"
          : "grid-cols-1",
      )}
    >
      <Field label="Category" htmlFor={`${id}-category`}>
        <Select
          value={query.category ?? ANY}
          onValueChange={(value) => apply({ category: value === ANY ? undefined : value })}
        >
          <SelectTrigger id={`${id}-category`} className={trigger}>
            <SelectValue>{query.category ?? "All categories"}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={ANY}>All categories</SelectItem>
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
          onValueChange={(value) =>
            apply({ workMode: WORK_MODES.find((mode) => mode === value) })
          }
        >
          <SelectTrigger id={`${id}-mode`} className={trigger}>
            <SelectValue>{query.workMode ? WORK_MODE_LABELS[query.workMode] : "Any work mode"}</SelectValue>
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
            apply({ employmentType: EMPLOYMENT_TYPES.find((type) => type === value) })
          }
        >
          <SelectTrigger id={`${id}-type`} className={trigger}>
            <SelectValue>
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

      <Field label="Minimum pay" htmlFor={`${id}-salary`}>
        <div className="flex gap-2">
          <input
            id={`${id}-salary`}
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            placeholder="Any amount"
            value={salary.draft}
            onChange={(event) => salary.setDraft(event.target.value.replace(/\D/g, ""))}
            className="h-11 w-full min-w-0 rounded-[10px] border border-input bg-card px-3 text-base text-foreground tabular transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground hover:border-foreground/35 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
          />
          <Select
            value={query.currency ?? ANY}
            onValueChange={(value) =>
              apply({ currency: CURRENCIES.find((currency) => currency === value) })
            }
          >
            <SelectTrigger aria-label="Currency" className="w-[6.5rem] shrink-0">
              <SelectValue>{query.currency ?? "Any"}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              <SelectItem value={ANY}>Any</SelectItem>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Field>
    </div>
  );
}

function FilterChips({ query }: { query: VacancyQuery }) {
  const { apply } = useVacancySearch();
  const filters = activeFilters(query);
  if (filters.length === 0) return null;

  const remove = (keys: FilterKey[]) => {
    const patch: VacancyQuery = {};
    for (const key of keys) patch[key] = undefined;
    apply(patch);
  };

  return (
    <>
      <ul aria-label="Active filters" className="contents">
        {filters.map((filter) => (
          <li key={filter.key}>
            <button
              type="button"
              onClick={() => remove(filter.clears)}
              className="inline-flex h-9 max-w-[16rem] items-center gap-1.5 rounded-full border border-foreground/20 bg-card pr-2 pl-3.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/45 hover:bg-muted"
            >
              <span className="truncate">{filter.label}</span>
              <XIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              <span className="sr-only">Remove filter</span>
            </button>
          </li>
        ))}
      </ul>
      <ClearAll query={query} variant="link" size="sm" className="px-1.5" />
    </>
  );
}

function ClearAll({
  query,
  className,
  variant,
  size,
}: {
  query: VacancyQuery;
  className?: string;
  variant: "outline" | "link";
  size: "sm" | "lg";
}) {
  const { replace, latest } = useVacancySearch();
  const disabled = activeFilters(query).length === 0;
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={() => replace(clearedQuery(latest()))}
      className={className}
    >
      Clear all
    </Button>
  );
}

export function SortSelect({ query }: { query: VacancyQuery }) {
  const { apply } = useVacancySearch();
  const id = useId();
  return (
    <div className="flex items-center gap-2.5">
      <label htmlFor={id} className="transit-label text-[0.8rem] whitespace-nowrap text-muted-foreground">
        Sort
      </label>
      <Select
        value={query.sort ?? VACANCY_SORTS[0]}
        onValueChange={(value) => apply({ sort: VACANCY_SORTS.find((sort) => sort === value) })}
      >
        <SelectTrigger id={id} size="sm" className="min-w-[10.5rem]">
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
    </div>
  );
}
