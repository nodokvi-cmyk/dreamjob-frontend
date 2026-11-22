"use client";

import { useRouter } from "next/navigation";
import { useId, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  COMPANY_SORTS,
  COMPANY_SORT_LABELS,
  DEFAULT_COMPANY_SORT,
  companiesHref,
} from "@/lib/companyQuery";
import type { CompanyQuery, CompanySort } from "@/types";

export function CompanySortSelect({ query }: { query: CompanyQuery }) {
  const router = useRouter();
  const id = useId();
  const [pending, startTransition] = useTransition();
  const current = query.sort ?? DEFAULT_COMPANY_SORT;

  function change(value: string) {
    const next: CompanySort | undefined = COMPANY_SORTS.find((sort) => sort === value);
    if (!next) return;
    startTransition(() => {
      router.push(companiesHref({ ...query, sort: next, page: undefined }), { scroll: false });
    });
  }

  return (
    <div className="flex items-center gap-2.5">
      <label htmlFor={id} className="transit-label text-[0.8rem] whitespace-nowrap text-muted-foreground">
        Sort
      </label>
      <Select value={current} onValueChange={change} disabled={pending}>
        <SelectTrigger id={id} size="sm" className="min-w-[10.5rem]">
          <SelectValue>{COMPANY_SORT_LABELS[current]}</SelectValue>
        </SelectTrigger>
        <SelectContent position="popper" align="end">
          {COMPANY_SORTS.map((sort) => (
            <SelectItem key={sort} value={sort}>
              {COMPANY_SORT_LABELS[sort]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
