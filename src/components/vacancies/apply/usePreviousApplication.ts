"use client";

import { useEffect, useState } from "react";
import { type SentContent, titleQuery } from "@/lib/applications";
import { listMyApplications } from "@/services/applications.service";

const LOOKUP_TAKE = 30;

type Lookup = { key: string; content: SentContent | null };

export function usePreviousApplication(vacancyId: string, title: string, enabled: boolean) {
  const key = enabled ? `${vacancyId}|${title}` : null;
  const [lookup, setLookup] = useState<Lookup | null>(null);

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    listMyApplications({ q: titleQuery(title) || undefined, status: "rejected" }, LOOKUP_TAKE, controller.signal).then(
      (page) => {
        const match = page.items.find((item) => item.vacancy.id === vacancyId);
        setLookup({
          key,
          content: match
            ? { message: match.message, hasCv: match.hasCv, hasCoverLetter: match.hasCoverLetter }
            : null,
        });
      },
      () => {
        if (!controller.signal.aborted) setLookup({ key, content: null });
      },
    );
    return () => controller.abort();
  }, [key, vacancyId, title]);

  const settled = key !== null && lookup?.key === key;
  return { loading: key !== null && !settled, previous: settled && lookup ? lookup.content : null };
}
