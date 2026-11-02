"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { getCompanyById } from "@/services/admin.service";

export function shortCompanyId(id: string): string {
  return `Company ${id.slice(-6)}`;
}

export function useCompanyNames(ids: readonly string[]) {
  const [names, setNames] = useState<ReadonlyMap<string, string | null>>(() => new Map());
  const unique = [...new Set(ids)].sort();
  const key = unique.join(",");
  const missing = useEffectEvent(() => unique.filter((id) => !names.has(id)));

  useEffect(() => {
    const controller = new AbortController();
    for (const id of missing()) {
      getCompanyById(id, controller.signal).then(
        (company) => {
          const name = company.companyName.trim();
          setNames((current) => new Map(current).set(id, name || null));
        },
        () => {
          if (controller.signal.aborted) return;
          setNames((current) => new Map(current).set(id, null));
        },
      );
    }
    return () => controller.abort();
  }, [key]);

  return (id: string): string => names.get(id) ?? shortCompanyId(id);
}
