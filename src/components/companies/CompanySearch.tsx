"use client";

import { ArrowRightIcon, MapPinIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useDraft } from "@/components/vacancies/useDraft";
import { companiesHref } from "@/lib/companyQuery";
import { LOCATION_MAX, QUERY_MAX } from "@/lib/vacancyQuery";
import type { CompanyQuery } from "@/types";

export function CompanySearch({ query }: { query: CompanyQuery }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const target = useRef(query);

  useEffect(() => {
    target.current = query;
  }, [query]);

  const go = (patch: CompanyQuery) => {
    const next: CompanyQuery = { ...target.current, ...patch, page: undefined };
    target.current = next;
    startTransition(() => {
      router.push(companiesHref(next), { scroll: false });
    });
  };

  const keyword = useDraft(query.q ?? "", (value) => go({ q: value || undefined }));
  const place = useDraft(query.location ?? "", (value) => go({ location: value || undefined }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = keyword.draft.trim();
    const location = place.draft.trim();
    keyword.markSent(q);
    place.markSent(location);
    go({ q: q || undefined, location: location || undefined });
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className="flex w-full flex-col gap-1 rounded-xl border-2 border-foreground bg-card p-1.5 has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/40 sm:flex-row sm:items-center sm:gap-0"
    >
      <label className="flex flex-1 items-center gap-3 px-3">
        <SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
        <span className="sr-only">Company name</span>
        <input
          name="q"
          type="search"
          value={keyword.draft}
          onChange={(event) => keyword.setDraft(event.target.value)}
          maxLength={QUERY_MAX}
          placeholder="Company name"
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
  );
}
